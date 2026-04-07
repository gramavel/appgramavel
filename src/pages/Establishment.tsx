import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Star, Navigation, Info, Bookmark, BookmarkCheck, Share,
  MapPin, Clock, Phone, Globe, Copy, MessageSquarePlus, Heart, User
} from "lucide-react";
import MapSheet from "@/components/map/MapSheet";
import { useLocation } from "@/contexts/LocationContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { CANONICAL_REACTIONS } from "@/lib/constants";
import { SaveSheet } from "@/components/SaveSheet";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getEstablishmentBySlug } from "@/services/establishments";
import { getReviewsByEstablishment } from "@/services/reviews";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EstablishmentPhoto {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export default function Establishment() {
  const { slug } = useParams();
  const [showDetails, setShowDetails] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [est, setEst] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<EstablishmentPhoto[]>([]);
  const [showMapSheet, setShowMapSheet] = useState(false);

  const { isPlaceSaved, toggleSavedPlace } = useFavorites();

  useEffect(() => {
    if (!slug) return;
    getEstablishmentBySlug(slug).then(({ data }) => {
      if (data) {
        setEst({
          ...data,
          city: "Gramado",
          is_active: true,
          is_verified: true,
          gallery: data.gallery || [],
          sunday_hours: data.sunday_hours || null,
        } as unknown as Establishment);
        // Load reviews
        getReviewsByEstablishment(data.id).then(({ data: revs }) => {
          if (revs) setReviews(revs);
        });
      } else {
        // Fallback to mock
        const mock = MOCK_ESTABLISHMENTS.find((e) => e.slug === slug);
        setEst(mock || null);
      }
      setLoading(false);
    });
  }, [slug]);

  // Fetch photos from establishment_photos
  useEffect(() => {
    if (!est?.id) return;
    supabase
      .from("establishment_photos")
      .select("id, url, caption, sort_order")
      .eq("establishment_id", est.id)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setPhotos(data);
      });
  }, [est?.id]);

  // Calculate open/closed dynamically from hours
  const isOpen = useMemo(() => {
    if (!est) return false;
    const now = new Date();
    const day = now.getDay();
    const fields = ['sunday_hours','hours_monday','hours_tuesday',
      'hours_wednesday','hours_thursday','hours_friday','hours_saturday'] as const;
    const fieldKey = fields[day];
    const hours = (est as any)[fieldKey] as string | null | undefined;
    if (!hours) {
      if (day >= 1 && day <= 6 && est.opening_hours) {
        const match = est.opening_hours.match(/(\d{2}:\d{2})\s*(?:às|a|-)\s*(\d{2}:\d{2})/);
        if (match) {
          const current = now.getHours() * 60 + now.getMinutes();
          const [oh, om] = match[1].split(':').map(Number);
          const [ch, cm] = match[2].split(':').map(Number);
          return current >= oh * 60 + om && current <= ch * 60 + cm;
        }
      }
      return false;
    }
    const match = hours.match(/(\d{2}:\d{2})\s*(?:às|a|-)\s*(\d{2}:\d{2})/);
    if (!match) return false;
    const current = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = match[1].split(':').map(Number);
    const [ch, cm] = match[2].split(':').map(Number);
    return current >= oh * 60 + om && current <= ch * 60 + cm;
  }, [est]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader showBack />
        <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-4">
          <Skeleton className="w-full aspect-[2/1] rounded-lg" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!est) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Estabelecimento não encontrado</div>;


  const isSaved = isPlaceSaved(est.id);

  // Fallback: use est.gallery if no photos from admin
  const displayPhotos: EstablishmentPhoto[] = photos.length > 0
    ? photos
    : (est.gallery || []).map((url, i) => ({
        id: `gallery-${i}`,
        url,
        caption: null,
        sort_order: i,
      }));

  const lightboxImages = [est.image_url, ...displayPhotos.map(p => p.url)].filter(Boolean) as string[];
  const lightboxTitles = [est.name, ...displayPhotos.map((_, i) => `Foto ${i + 1}`)];
  const lightboxCaptions = [est.description || "", ...displayPhotos.map(p => p.caption || "")];

  const allReactions = lightboxImages.map((_, idx) =>
    CANONICAL_REACTIONS.map((r, ri) => ({
      emoji: r.emoji,
      label: r.label,
      count: [45, 22, 15, 8, 5][ri] + idx * 3,
    }))
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const [showMapSheet, setShowMapSheet] = useState(false);

  const handleNavigate = () => {
    setShowMapSheet(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/estabelecimento/${est.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: est.name, text: est.description, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const ACTION_BUTTONS = [
    { icon: Navigation, label: "Como chegar", action: handleNavigate },
    { icon: Info, label: "Informações", action: () => setShowDetails(true) },
    { icon: Share, label: "Compartilhar", action: handleShare },
    { icon: isSaved ? BookmarkCheck : Bookmark, label: "Salvar", action: () => isSaved ? toggleSavedPlace(est.id) : setShowSave(true), active: isSaved },
  ];

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title={est.name} />

      <main className="max-w-2xl mx-auto px-4 pb-20 space-y-4 pt-20">
        {/* Banner */}
        <div className="relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
          <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="text-center px-4 pt-4 space-y-1">
          <h1 className="text-xl font-bold text-foreground">{est.name}</h1>
          <Badge variant="secondary">{est.category}</Badge>
          <p className="text-sm text-muted-foreground">{est.description}</p>
        </div>

        {/* Rating pill centered */}
        <div className="flex items-center justify-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <span className="text-sm font-semibold text-foreground">{est.rating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3 w-3 ${s <= Math.round(est.rating) ? "fill-primary text-primary" : "fill-primary/40 text-primary/40"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({est.total_reviews} avaliações)</span>
          </div>
        </div>

        {/* 4 Action buttons */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {ACTION_BUTTONS.map(({ icon: Icon, label, action, active }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                active ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/30"
              }`}>
                <Icon className={`h-4 w-4 ${active ? "text-primary fill-primary" : "text-foreground"}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <Tabs defaultValue="fotos">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
              <TabsTrigger value="cupons">Cupons</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="fotos" className="p-2">
              {displayPhotos.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma foto cadastrada ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {displayPhotos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="aspect-[4/5] rounded-lg overflow-hidden group cursor-pointer relative"
                      onClick={() => openLightbox(i + 1)}
                    >
                      <img src={photo.url} alt={photo.caption || `Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center">
                        <Heart className="h-4 w-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cupons" className="p-4">
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum cupom disponível</p>
            </TabsContent>

            <TabsContent value="avaliacoes" className="p-4 space-y-4">
              <Button variant="outline" className="w-full gap-2 rounded-full">
                <MessageSquarePlus className="h-4 w-4" /> Deixar avaliação
              </Button>
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="flex gap-4 p-4 border rounded-xl">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Usuário</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-rating text-rating" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{rev.comment || "Sem comentário"}</p>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-xl">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Usuário {i}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= 5 - i + 1 ? "fill-rating text-rating" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Lugar incrível! Adorei a experiência. Recomendo muito.</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Details Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold text-center">Detalhes do local</SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground flex-1">{est.address}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { navigator.clipboard.writeText(est.address); toast.success("Endereço copiado!"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">Horários</span>
                <Badge className={isOpen ? "bg-success/10 text-success border-0 text-xs" : "bg-destructive/10 text-destructive border-0 text-xs"}>
                  {isOpen ? "Aberto" : "Fechado"}
                </Badge>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 pl-8 text-sm">
                {[
                  { day: "Segunda", hours: (est as any).hours_monday || est.opening_hours },
                  { day: "Terça", hours: (est as any).hours_tuesday || est.opening_hours },
                  { day: "Quarta", hours: (est as any).hours_wednesday || est.opening_hours },
                  { day: "Quinta", hours: (est as any).hours_thursday || est.opening_hours },
                  { day: "Sexta", hours: (est as any).hours_friday || est.opening_hours },
                  { day: "Sábado", hours: (est as any).hours_saturday || est.opening_hours },
                  { day: "Domingo", hours: (est as any).sunday_hours },
                ].map(({ day, hours }) => (
                  <div key={day} className="contents">
                    <span className="font-medium text-foreground">{day}:</span>
                    <span className="text-muted-foreground">
                      {hours || "Fechado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2 rounded-full" onClick={() => window.open(`tel:${est.phone}`)}>
                <Phone className="h-4 w-4" /> Ligar
              </Button>
              <Button variant="outline" className="gap-2 rounded-full text-success border-success/30" onClick={() => window.open(`https://wa.me/${est.whatsapp}`)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                WhatsApp
              </Button>
            </div>
            <div className="flex items-center justify-evenly pt-2">
              {est.website && (
                <a href={est.website} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <Globe className="h-5 w-5 text-foreground" />
                </a>
              )}
              {est.instagram && (
                <a href={`https://instagram.com/${est.instagram}`} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              )}
              {est.facebook && (
                <a href={`https://facebook.com/${est.facebook}`} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              )}
              {est.tiktok && (
                <a href={`https://tiktok.com/@${est.tiktok}`} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                </a>
              )}
              {(est as any).youtube && (
                <a href={(est as any).youtube} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              )}
              {(est as any).twitter && (
                <a href={`https://x.com/${(est as any).twitter}`} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SaveSheet
        open={showSave}
        onOpenChange={setShowSave}
        itemName={est.name}
        onSaved={() => toggleSavedPlace(est.id)}
      />

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        aspectRatio="4/5"
        titles={lightboxTitles}
        captions={lightboxCaptions}
        reactions={allReactions}
      />

      <BottomNav />
    </div>
  );
}

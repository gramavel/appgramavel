import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Share2, Bookmark, Star, Navigation, Info,
  MapPin, Clock, Phone, Globe, Copy, MessageSquarePlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MOCK_ESTABLISHMENTS } from "@/data/mock";
import { BottomNav } from "@/components/layout/BottomNav";

export default function Establishment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const est = MOCK_ESTABLISHMENTS.find((e) => e.slug === slug);
  if (!est) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Estabelecimento não encontrado</div>;

  const isOpen = true; // mock

  const postImages = [est.image_url, est.logo_url, est.image_url, est.logo_url, est.image_url, est.image_url];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-secondary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gradient-primary truncate max-w-[50%]">{est.name}</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-secondary"><Share2 className="w-5 h-5" /></button>
            <button className="p-2 rounded-full hover:bg-secondary"><Bookmark className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20 space-y-4 pt-4">
        {/* Banner */}
        <div className="aspect-[2/1] rounded-xl overflow-hidden">
          <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">{est.name}</h2>
          <Badge variant="secondary">{est.category}</Badge>
          <p className="text-sm text-muted-foreground">{est.description}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-secondary/50 border border-border mx-auto w-fit">
          <span className="font-semibold">{est.rating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(est.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({est.total_reviews} avaliações)</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="rounded-full" onClick={() => window.open(`https://maps.google.com/?q=${est.latitude},${est.longitude}`)}>
            <Navigation className="w-4 h-4 mr-1" /> Como chegar
          </Button>
          <Button className="rounded-full" onClick={() => setShowDetails(true)}>
            <Info className="w-4 h-4 mr-1" /> Detalhes do local
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-3 gap-1.5">
              {postImages.map((src, i) => (
                <div key={i} className="aspect-square rounded-md overflow-hidden group cursor-pointer relative">
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                    <Star className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum cupom disponível</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            <Button variant="outline" className="w-full">
              <MessageSquarePlus className="w-4 h-4 mr-2" /> Deixar avaliação
            </Button>

            {/* Mock reviews */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <img src={`https://i.pravatar.cc/40?img=${i + 30}`} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Usuário {i}</span>
                    <span className="text-xs text-muted-foreground">há {i} dia(s)</span>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 5 - i + 1 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Lugar incrível! Adorei a experiência. Recomendo muito.</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">Detalhes do local</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-2">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{est.address}</p>
              </div>
              <button className="p-1.5 hover:bg-secondary rounded-md" onClick={() => navigator.clipboard.writeText(est.address)}>
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm flex-1">{est.opening_hours}</p>
              <Badge className={isOpen ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"} variant="outline">
                {isOpen ? "Aberto" : "Fechado"}
              </Badge>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`tel:${est.phone}`)}>
                <Phone className="w-4 h-4 mr-1" /> Ligar
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(`https://wa.me/${est.whatsapp}`)}
              >
                WhatsApp
              </Button>
            </div>

            {/* Social */}
            <div className="flex justify-evenly pt-2">
              {est.website && (
                <a href={est.website} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {est.instagram && (
                <a href={`https://instagram.com/${est.instagram}`} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {est.facebook && (
                <a href={`https://facebook.com/${est.facebook}`} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {est.tiktok && (
                <a href={`https://tiktok.com/@${est.tiktok}`} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

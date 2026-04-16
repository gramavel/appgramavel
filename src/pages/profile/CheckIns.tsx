import { useState, useEffect } from "react";
import { MapPin, Calendar, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCheckIns } from "@/services/checkIns";

interface CheckInItem {
  id: string;
  created_at: string;
  establishment: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCheckIns().then(({ data }) => {
      setCheckIns((data as any[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = checkIns.filter((ci) =>
    ci.establishment?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const grouped = filtered.reduce<Record<string, CheckInItem[]>>((acc, ci) => {
    const date = new Date(ci.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    (acc[date] ??= []).push(ci);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meus Check-ins" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar check-ins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 bg-card border-border/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50">
                <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhum check-in ainda"
            description="Visite estabelecimentos e faça check-in para registrar sua presença."
            actionLabel="Explorar lugares"
            onAction={() => navigate("/map")}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">{date}</p>
                </div>
                <div className="space-y-2">
                  {items.map((ci, i) => (
                    <div
                      key={ci.id}
                      onClick={() => {
                        if (ci.establishment?.id) {
                          // Navigate to establishment - need slug, but we have id
                          // For now just show toast
                        }
                      }}
                      className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer animate-fade-in-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                        {ci.establishment?.logo_url ? (
                          <img
                            src={ci.establishment.logo_url}
                            alt={ci.establishment.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {ci.establishment?.name || "Estabelecimento"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ci.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-success" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

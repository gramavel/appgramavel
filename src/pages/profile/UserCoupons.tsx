import { Ticket, Tag, CheckCircle2 } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MOCK_COUPONS } from "@/data/mock";

const savedCoupons = MOCK_COUPONS.filter((c) => c.status === "active");
const usedCoupons = MOCK_COUPONS.filter((c) => c.status === "used" || c.status === "expired");

function CouponItem({ coupon, used }: { coupon: typeof MOCK_COUPONS[0]; used?: boolean }) {
  return (
    <div
      className={`flex gap-4 p-4 rounded-lg border transition-all ${used ? "border-border/30 opacity-70" : "border-border bg-card shadow-card hover:shadow-card-hover active:scale-[0.98]"}`}
      style={{ animation: "fadeInUp 0.4s ease-out both" }}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight">{coupon.title}</p>
          {used ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
              <Tag className="w-3 h-3 mr-0.5" />
              {coupon.code}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{coupon.establishment_name}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {used ? "Utilizado" : `Válido até ${new Date(coupon.expires_at).toLocaleDateString("pt-BR")}`}
        </p>
      </div>
    </div>
  );
}

export default function UserCoupons() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meus Cupons" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4">
        <Tabs defaultValue="salvos">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="salvos" className="gap-1.5">
              <Ticket className="w-4 h-4" />
              Salvos ({savedCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="usados" className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Usados ({usedCoupons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salvos" className="space-y-4">
            {savedCoupons.length === 0 ? (
              <div className="py-12 text-center">
                <Ticket className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum cupom salvo ainda</p>
              </div>
            ) : (
              savedCoupons.map((c) => <CouponItem key={c.id} coupon={c} />)
            )}
          </TabsContent>

          <TabsContent value="usados" className="space-y-4">
            {usedCoupons.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum cupom utilizado ainda</p>
              </div>
            ) : (
              usedCoupons.map((c) => <CouponItem key={c.id} coupon={c} used />)
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

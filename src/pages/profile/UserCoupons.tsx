import { useState } from "react";
import { Ticket, Tag, CheckCircle2 } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MOCK_COUPONS, type Coupon } from "@/data/mock";
import { useCoupons } from "@/contexts/CouponsContext";

function isExpired(c: Coupon) {
  return new Date(c.expires_at) < new Date();
}

function daysLeft(c: Coupon) {
  return Math.max(0, Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / 86_400_000));
}

function ExpiryBadge({ coupon }: { coupon: Coupon }) {
  if (isExpired(coupon)) return <Badge variant="secondary" className="text-xs">Expirado</Badge>;
  const days = daysLeft(coupon);
  if (days === 0) return <Badge variant="destructive" className="text-xs">Vence hoje</Badge>;
  if (days <= 3) return <Badge className="bg-warning text-warning-foreground border-0 text-xs">Vence em {days} dias</Badge>;
  return null;
}

function CouponItem({ coupon, used, onUse }: { coupon: Coupon; used?: boolean; onUse?: () => void }) {
  const expired = isExpired(coupon);

  return (
    <div
      className={`flex gap-4 p-4 rounded-xl border transition-all ${used ? "border-border/30 opacity-60" : "border-border bg-card shadow-card hover:shadow-card-hover active:scale-[0.98]"}`}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight">{coupon.title}</p>
          {used ? (
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ExpiryBadge coupon={coupon} />
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <Tag className="w-3 h-3 mr-0.5" />
                {coupon.code}
              </Badge>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{coupon.establishment_name}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {used ? "Cupom utilizado" : `Válido até ${new Date(coupon.expires_at).toLocaleDateString("pt-BR")}`}
        </p>
        {!used && onUse && (
          <button
            onClick={onUse}
            disabled={expired}
            className={`mt-2 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              expired
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {expired ? "Expirado" : "Usar cupom"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function UserCoupons() {
  const { savedCoupons, usedCoupons, useCoupon, isCouponUsed } = useCoupons();
  const [confirmCoupon, setConfirmCoupon] = useState<Coupon | null>(null);

  const activeCoupons = MOCK_COUPONS.filter((c) => savedCoupons.includes(c.id) && !isCouponUsed(c.id));
  const usedList = MOCK_COUPONS.filter((c) => isCouponUsed(c.id));

  const handleConfirmUse = () => {
    if (confirmCoupon) {
      useCoupon(confirmCoupon.id);
      setConfirmCoupon(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meus Cupons" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-16">
        <Tabs defaultValue="salvos">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="salvos" className="gap-1.5">
              <Ticket className="w-4 h-4" />
              Salvos ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="usados" className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Usados ({usedList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salvos" className="space-y-4">
            {activeCoupons.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Nenhum cupom salvo ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Salve cupons para usá-los depois</p>
              </div>
            ) : (
              activeCoupons.map((c) => (
                <CouponItem
                  key={c.id}
                  coupon={c}
                  onUse={() => setConfirmCoupon(c)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="usados" className="space-y-4">
            {usedList.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Nenhum cupom utilizado ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Seus cupons usados aparecerão aqui</p>
              </div>
            ) : (
              usedList.map((c) => <CouponItem key={c.id} coupon={c} used />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!confirmCoupon} onOpenChange={(open) => !open && setConfirmCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usar cupom?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja usar o cupom "{confirmCoupon?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUse}>Confirmar uso</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}

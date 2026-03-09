import { Calendar } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import type { Coupon } from "@/data/mock";

const STATUS_BADGE = {
  active: { label: "Ativo", variant: "default" as const, buttonText: "Ativar Cupom" },
  used: { label: "Usado", variant: "secondary" as const, buttonText: "Cupom Usado" },
  expired: { label: "Expirado", variant: "destructive" as const, buttonText: "Cupom Expirado" },
};

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [showQR, setShowQR] = useState(false);
  const badge = STATUS_BADGE[coupon.status];

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video">
          <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" loading="lazy" />
          <Badge className="absolute top-2 right-2" variant={badge.variant}>
            {badge.label}
          </Badge>
        </div>

        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <img src={coupon.establishment_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{coupon.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{coupon.establishment_name}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{coupon.description}</p>

          {/* Expiry */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Válido até {new Date(coupon.expires_at).toLocaleDateString("pt-BR")}
          </div>

          <Button
            className="w-full"
            disabled={coupon.status !== "active"}
            onClick={() => setShowQR(true)}
          >
            {badge.buttonText}
          </Button>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{coupon.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={`GRAMAVEL:${coupon.code}:${coupon.id}:${coupon.establishment_id}`}
                size={200}
              />
            </div>
            <p className="font-mono text-2xl font-bold tracking-wider">{coupon.code}</p>
            <p className="text-sm text-muted-foreground text-center">
              Apresente este QR Code no estabelecimento
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

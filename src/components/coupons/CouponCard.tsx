import { Calendar } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video">
          <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute top-2 right-2">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start gap-2">
            <img src={coupon.establishment_avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{coupon.title}</p>
              <p className="text-xs text-muted-foreground">{coupon.establishment_name}</p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">{coupon.description}</p>

          {/* Expiry */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Válido até {new Date(coupon.expires_at).toLocaleDateString("pt-BR")}</span>
          </div>

          <Button
            size="sm"
            className="w-full text-xs"
            disabled={coupon.status !== "active"}
            onClick={() => setShowQR(true)}
          >
            {badge.buttonText}
          </Button>
        </CardContent>
      </Card>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">{coupon.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <QRCode
                value={`GRAMAVEL:${coupon.code}:${coupon.id}:${coupon.establishment_id}`}
                size={140}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Código do cupom:</p>
              <p className="text-2xl font-bold font-mono text-foreground">{coupon.code}</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Apresente este QR Code no estabelecimento para utilizar o cupom
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Ticket, Award, MapPin, TrendingUp, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ComponentType } from "react";

interface Notification {
  id: string;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: Ticket,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Novo cupom disponível!",
    description: "20% OFF no Bella Gramado Ristorante. Válido até 30/04.",
    time: "Há 2 horas",
    read: false,
  },
  {
    id: "n2",
    icon: Award,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Quase lá! 🏆",
    description: "Falta 1 vinícola para conquistar a badge Sommelier.",
    time: "Há 5 horas",
    read: false,
  },
  {
    id: "n3",
    icon: MapPin,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Lugar novo perto de você",
    description: "Chocolate Lugano está a apenas 800m de distância.",
    time: "Ontem",
    read: true,
  },
  {
    id: "n4",
    icon: TrendingUp,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    title: "Em alta esta semana",
    description: "Vinícola Ravanello recebeu 50+ reações nos últimos 7 dias.",
    time: "Há 2 dias",
    read: true,
  },
  {
    id: "n5",
    icon: Bell,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Bem-vindo ao Gramável!",
    description: "Explore os melhores lugares de Gramado e Canela.",
    time: "Há 3 dias",
    read: true,
  },
];

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-6 pb-3 border-b border-border/50">
          <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            Notificações
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
          {MOCK_NOTIFICATIONS.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-4 py-4 border-b border-border/30 transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.iconBg}`}>
                  <Icon className={`w-5 h-5 ${notification.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.description}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5">{notification.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

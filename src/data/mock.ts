import { UtensilsCrossed, Coffee, Hotel, FerrisWheel, ShoppingBag, Wine, Sun, Heart, Baby, Navigation, Compass, Mountain, Snowflake, Calendar, MapPin } from "lucide-react";
import type { ComponentType } from "react";

export interface Establishment {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  description: string;
  logo_url: string;
  image_url: string;
  gallery: string[];
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  opening_hours: string;
  is_open: boolean;
  is_popular: boolean;
  pet_friendly: boolean;
  distance_km: number;
  sunday_hours: string | null;
}

export interface Post {
  id: string;
  image: string;
  caption: string;
  establishment_id: string;
  establishment_name: string;
  establishment_slug: string;
  establishment_category: string;
  establishment_avatar: string;
  likes: number;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  total_reviews: number;
  distance_km: number;
  is_popular: boolean;
  reactions: { emoji: string; count: number }[];
  recent_users: { avatar: string }[];
  created_at: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  image: string;
  establishment_id: string;
  establishment_name: string;
  establishment_avatar: string;
  status: "active" | "used" | "expired";
  expires_at: string;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

export interface RouteItem {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  duration: string;
  difficulty: string;
  stops: { name: string; category: string; image: string }[];
  image: string;
}

export const CATEGORIES: { label: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Restaurantes", icon: UtensilsCrossed },
  { label: "Cafés", icon: Coffee },
  { label: "Hotéis", icon: Hotel },
  { label: "Atrações", icon: FerrisWheel },
  { label: "Compras", icon: ShoppingBag },
  { label: "Bares & Vinícolas", icon: Wine },
];

export const CITIES = {
  gramado: { name: "Gramado", latitude: -29.3733, longitude: -50.8767 },
  canela: { name: "Canela", latitude: -29.3617, longitude: -50.8114 },
};

export const MOCK_ESTABLISHMENTS: Establishment[] = [
  {
    id: "1",
    name: "Bella Gramado Ristorante",
    slug: "bella-gramado-ristorante-1",
    category: "Restaurantes",
    city: "Gramado",
    description: "Autêntica culinária italiana com vista para o Vale do Quilombo. Massa fresca feita diariamente.",
    logo_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    ],
    latitude: -29.3750,
    longitude: -50.8780,
    address: "Rua Coberta, 123 - Centro, Gramado",
    phone: "(54) 3286-1234",
    whatsapp: "5554932861234",
    website: "https://bellagramado.com.br",
    instagram: "bellagramado",
    facebook: "bellagramado",
    tiktok: "bellagramado",
    is_active: true,
    is_verified: true,
    rating: 4.8,
    total_reviews: 342,
    opening_hours: "11:30 - 23:00",
    is_open: true,
    is_popular: true,
    pet_friendly: true,
    distance_km: 0.3,
    sunday_hours: null,
  },
  {
    id: "2",
    name: "Café Colonial Bela Vista",
    slug: "cafe-colonial-bela-vista-2",
    category: "Cafés",
    city: "Gramado",
    description: "O melhor café colonial da Serra Gaúcha. Mais de 80 itens entre doces e salgados.",
    logo_url: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    ],
    latitude: -29.3720,
    longitude: -50.8750,
    address: "Av. das Hortênsias, 456 - Planalto, Gramado",
    phone: "(54) 3286-5678",
    whatsapp: "5554932865678",
    website: "https://cafebelavista.com.br",
    instagram: "cafebelavista",
    facebook: "cafebelavista",
    tiktok: "",
    is_active: true,
    is_verified: true,
    rating: 4.6,
    total_reviews: 218,
    opening_hours: "08:00 - 18:00",
    is_open: false,
    is_popular: true,
    pet_friendly: false,
    distance_km: 0.8,
    sunday_hours: null,
  },
  {
    id: "3",
    name: "Vinícola Ravanello",
    slug: "vinicola-ravanello-3",
    category: "Bares & Vinícolas",
    city: "Gramado",
    description: "Degustação de vinhos premiados com tour pela vinícola. Experiência única na Serra.",
    logo_url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
    ],
    latitude: -29.3690,
    longitude: -50.8810,
    address: "RS-235, Km 22 - Gramado",
    phone: "(54) 3286-9012",
    whatsapp: "5554932869012",
    website: "https://ravanello.com.br",
    instagram: "ravanello",
    facebook: "ravanello",
    tiktok: "ravanello",
    is_active: true,
    is_verified: true,
    rating: 4.9,
    total_reviews: 567,
    opening_hours: "10:00 - 19:00",
    is_open: true,
    is_popular: true,
    pet_friendly: false,
    distance_km: 1.2,
    sunday_hours: "10:00 - 16:00",
  },
  {
    id: "4",
    name: "Mini Mundo",
    slug: "mini-mundo-4",
    category: "Atrações",
    city: "Gramado",
    description: "Parque temático com réplicas em miniatura de construções famosas do mundo todo.",
    logo_url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
    ],
    latitude: -29.3780,
    longitude: -50.8730,
    address: "Rua Horácio Cardoso, 291 - Centro, Gramado",
    phone: "(54) 3286-3456",
    whatsapp: "5554932863456",
    website: "https://minimundo.com.br",
    instagram: "minimundo",
    facebook: "minimundo",
    tiktok: "minimundo",
    is_active: true,
    is_verified: true,
    rating: 4.5,
    total_reviews: 892,
    opening_hours: "09:00 - 17:00",
    is_open: true,
    is_popular: false,
    pet_friendly: true,
    distance_km: 1.5,
    sunday_hours: "09:00 - 14:00",
  },
  {
    id: "5",
    name: "Chocolate Lugano",
    slug: "chocolate-lugano-5",
    category: "Compras",
    city: "Canela",
    description: "Fábrica de chocolates artesanais. Degustação gratuita e loja com produtos exclusivos.",
    logo_url: "https://images.unsplash.com/photo-1549007994-cb92caefdbd1?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549007994-cb92caefdbd1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=600&fit=crop",
    ],
    latitude: -29.3630,
    longitude: -50.8130,
    address: "Av. Júlio de Castilhos, 1580 - Centro, Canela",
    phone: "(54) 3282-1111",
    whatsapp: "5554932821111",
    website: "https://lugano.com.br",
    instagram: "chocolatelugano",
    facebook: "chocolatelugano",
    tiktok: "",
    is_active: true,
    is_verified: true,
    rating: 4.7,
    total_reviews: 445,
    opening_hours: "09:00 - 19:00",
    is_open: false,
    is_popular: false,
    pet_friendly: false,
    distance_km: 3.2,
    sunday_hours: null,
  },
  {
    id: "6",
    name: "Hotel Casa da Montanha",
    slug: "hotel-casa-da-montanha-6",
    category: "Hotéis",
    city: "Gramado",
    description: "Hotel boutique aconchegante com lareira, café da manhã colonial e vista panorâmica.",
    logo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
    ],
    latitude: -29.3740,
    longitude: -50.8760,
    address: "Rua Garibaldi, 80 - Centro, Gramado",
    phone: "(54) 3286-7890",
    whatsapp: "5554932867890",
    website: "https://casadamontanha.com.br",
    instagram: "casadamontanha",
    facebook: "casadamontanha",
    tiktok: "",
    is_active: true,
    is_verified: true,
    rating: 4.8,
    total_reviews: 156,
    opening_hours: "24 horas",
    is_open: true,
    is_popular: false,
    pet_friendly: true,
    distance_km: 0.5,
    sunday_hours: "24 horas",
  },
];

export const MOCK_POSTS: Post[] = MOCK_ESTABLISHMENTS.map((est, i) => ({
  id: `post-${i + 1}`,
  image: est.image_url,
  caption: est.description,
  establishment_id: est.id,
  establishment_name: est.name,
  establishment_slug: est.slug,
  establishment_category: est.category,
  establishment_avatar: est.logo_url,
  likes: [120, 85, 200, 67, 145, 92][i],
  user_id: `user-${i}`,
  user_name: ["Ana Silva", "Pedro Santos", "Maria Oliveira", "João Costa", "Laura Mendes", "Carlos Ramos"][i],
  user_avatar: `https://i.pravatar.cc/100?img=${i + 10}`,
  rating: est.rating,
  total_reviews: est.total_reviews,
  distance_km: est.distance_km,
  is_popular: i < 3,
  reactions: [
    { emoji: "❤️", count: [89, 45, 112, 32, 67, 54][i] },
    { emoji: "⭐", count: [42, 28, 56, 18, 35, 22][i] },
    { emoji: "😋", count: [23, 15, 34, 9, 19, 12][i] },
    { emoji: "😍", count: [15, 8, 22, 5, 11, 7][i] },
    { emoji: "📌", count: [10, 6, 17, 3, 8, 5][i] },
  ],
  recent_users: [
    { avatar: `https://i.pravatar.cc/40?img=${i + 20}` },
    { avatar: `https://i.pravatar.cc/40?img=${i + 21}` },
    { avatar: `https://i.pravatar.cc/40?img=${i + 22}` },
  ],
  created_at: new Date(2026, 2, 8 - i).toISOString(),
}));

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "c1",
    title: "20% OFF no almoço",
    description: "Válido para pratos principais de segunda a sexta",
    code: "GRAM20",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=340&fit=crop",
    establishment_id: "1",
    establishment_name: "Bella Gramado Ristorante",
    establishment_avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop",
    status: "active",
    expires_at: "2026-04-30",
    category: "Restaurantes",
  },
  {
    id: "c2",
    title: "Café grátis na compra de torta",
    description: "Ganhe um café expresso na compra de qualquer fatia de torta",
    code: "CAFETORTA",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=340&fit=crop",
    establishment_id: "2",
    establishment_name: "Café Colonial Bela Vista",
    establishment_avatar: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=100&h=100&fit=crop",
    status: "active",
    expires_at: "2026-05-15",
    category: "Cafés",
  },
  {
    id: "c3",
    title: "Degustação premium",
    description: "Upgrade grátis para degustação premium de vinhos",
    code: "VINHOVIP",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=340&fit=crop",
    establishment_id: "3",
    establishment_name: "Vinícola Ravanello",
    establishment_avatar: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=100&h=100&fit=crop",
    status: "used",
    expires_at: "2026-03-01",
    category: "Bares & Vinícolas",
  },
  {
    id: "c4",
    title: "Ingresso criança grátis",
    description: "Na compra de 2 ingressos adultos, ganhe 1 infantil",
    code: "MINI2POR1",
    image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=600&h=340&fit=crop",
    establishment_id: "4",
    establishment_name: "Mini Mundo",
    establishment_avatar: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=100&h=100&fit=crop",
    status: "expired",
    expires_at: "2026-02-15",
    category: "Atrações",
  },
];

export const MOCK_BADGES: Badge[] = [
  { id: "b1", name: "Explorador", description: "Visitou 5 lugares", iconName: "compass", color: "hsl(233, 100%, 69%)", earned: true },
  { id: "b2", name: "Gourmet", description: "Visitou 3 restaurantes", iconName: "utensils-crossed", color: "hsl(25, 95%, 53%)", earned: true },
  { id: "b3", name: "Sommelier", description: "Visitou 2 vinícolas", iconName: "wine", color: "hsl(340, 82%, 52%)", earned: false, progress: 1, total: 2 },
  { id: "b4", name: "Fotógrafo", description: "Postou 10 fotos", iconName: "camera", color: "hsl(198, 93%, 60%)", earned: false, progress: 4, total: 10 },
  { id: "b5", name: "Aventureiro", description: "Visitou 10 atrações", iconName: "ferris-wheel", color: "hsl(142, 76%, 36%)", earned: false, progress: 3, total: 10 },
  { id: "b6", name: "Cuponeiro", description: "Usou 5 cupons", iconName: "ticket", color: "hsl(45, 93%, 47%)", earned: true },
];

export const MOCK_TIMELINE = [
  { id: "t1", type: "visit" as const, action: "Visitou", place: "Bella Gramado Ristorante", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop", date: "2026-03-08" },
  { id: "t2", type: "coupon" as const, action: "Usou cupom em", place: "Café Colonial Bela Vista", image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=100&h=100&fit=crop", date: "2026-03-07" },
  { id: "t3", type: "review" as const, action: "Avaliou", place: "Vinícola Ravanello", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=100&h=100&fit=crop", date: "2026-03-06" },
  { id: "t4", type: "visit" as const, action: "Visitou", place: "Mini Mundo", image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=100&h=100&fit=crop", date: "2026-03-05" },
];

export const MOCK_ROUTES: RouteItem[] = [
  {
    id: "r1",
    title: "1 dia em Gramado",
    subtitle: "6 locais · 8 horas",
    icon: Sun,
    description: "O roteiro perfeito para conhecer o melhor de Gramado em apenas um dia. Inclui os pontos turísticos mais icônicos e experiências gastronômicas imperdíveis.",
    duration: "8 horas",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop",
    stops: [
      { name: "Rua Coberta", category: "Atrações", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop" },
      { name: "Lago Negro", category: "Natureza", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" },
      { name: "Mini Mundo", category: "Atrações", image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=200&h=200&fit=crop" },
      { name: "Café Colonial Bela Vista", category: "Cafés", image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200&h=200&fit=crop" },
      { name: "Bella Gramado Ristorante", category: "Restaurantes", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" },
      { name: "Vinícola Ravanello", category: "Bares & Vinícolas", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "r2",
    title: "Fim de semana romântico",
    subtitle: "8 locais · 2 dias",
    icon: Heart,
    description: "Um roteiro especial para casais que querem viver uma experiência inesquecível na Serra Gaúcha com fondue, vinícolas e passeios encantadores.",
    duration: "2 dias",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
    stops: [
      { name: "Hotel Casa da Montanha", category: "Hotéis", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=200&fit=crop" },
      { name: "Vinícola Ravanello", category: "Bares & Vinícolas", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=200&h=200&fit=crop" },
      { name: "Lago Negro", category: "Natureza", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" },
      { name: "Bella Gramado Ristorante", category: "Restaurantes", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "r3",
    title: "Com crianças",
    subtitle: "5 locais · 6 horas",
    icon: Baby,
    description: "Diversão garantida para toda a família! Roteiro com atrações interativas, parques temáticos e doces irresistíveis.",
    duration: "6 horas",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&h=400&fit=crop",
    stops: [
      { name: "Mini Mundo", category: "Atrações", image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=200&h=200&fit=crop" },
      { name: "Chocolate Lugano", category: "Compras", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200&h=200&fit=crop" },
      { name: "Lago Negro", category: "Natureza", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "r4",
    title: "Experiência gastronômica",
    subtitle: "4 locais · 5 horas",
    icon: UtensilsCrossed,
    description: "Para os amantes da boa gastronomia: uma jornada pelos melhores restaurantes, cafés e vinícolas da região.",
    duration: "5 horas",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
    stops: [
      { name: "Café Colonial Bela Vista", category: "Cafés", image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200&h=200&fit=crop" },
      { name: "Bella Gramado Ristorante", category: "Restaurantes", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" },
      { name: "Vinícola Ravanello", category: "Bares & Vinícolas", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=200&h=200&fit=crop" },
      { name: "Chocolate Lugano", category: "Compras", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "r5",
    title: "Aventura na natureza",
    subtitle: "5 locais · 1 dia",
    icon: Mountain,
    description: "Trilhas, mirantes e contato com a natureza exuberante da Serra Gaúcha. Ideal para quem busca aventura e tranquilidade.",
    duration: "1 dia",
    difficulty: "Moderado",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    stops: [
      { name: "Lago Negro", category: "Natureza", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" },
      { name: "Rua Coberta", category: "Atrações", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "r6",
    title: "Natal Luz",
    subtitle: "6 locais · 2 dias",
    icon: Snowflake,
    description: "Viva a magia do Natal Luz de Gramado! Roteiro especial com os melhores eventos, decorações e espetáculos natalinos.",
    duration: "2 dias",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&h=400&fit=crop",
    stops: [
      { name: "Rua Coberta", category: "Atrações", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop" },
      { name: "Mini Mundo", category: "Atrações", image: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=200&h=200&fit=crop" },
      { name: "Hotel Casa da Montanha", category: "Hotéis", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=200&fit=crop" },
    ],
  },
];

export const EXPERIENCES = [
  { id: "e1", title: "Café Colonial", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
  { id: "e2", title: "Fondue", image: "https://images.unsplash.com/photo-1530016555861-07e0bcd59d83?w=600&h=400&fit=crop" },
  { id: "e3", title: "Passeios Românticos", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop" },
  { id: "e4", title: "Gramado à Noite", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop" },
  { id: "e5", title: "Lugares Instagramáveis", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop" },
];

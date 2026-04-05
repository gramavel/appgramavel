import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Establishments = lazy(() => import("./pages/Establishments"));
const EstablishmentForm = lazy(() => import("./pages/EstablishmentForm"));
const Users = lazy(() => import("./pages/Users"));
const Feed = lazy(() => import("./pages/Feed"));
const Explore = lazy(() => import("./pages/Explore"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Coupons = lazy(() => import("./pages/Coupons"));

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="estabelecimentos" element={<Establishments />} />
        <Route path="estabelecimentos/novo" element={<EstablishmentForm />} />
        <Route path="estabelecimentos/:id" element={<EstablishmentForm />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="feed" element={<Feed />} />
        <Route path="explorar" element={<Explore />} />
        <Route path="roteiros" element={<RoutesPage />} />
        <Route path="notificacoes" element={<Notifications />} />
        <Route path="cupons" element={<Coupons />} />
      </Routes>
    </Suspense>
  );
}

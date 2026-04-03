import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { safeParse, safeSave } from "@/lib/storage";

type State = { savedCoupons: string[]; usedCoupons: string[] };

type Action =
  | { type: "TOGGLE_COUPON"; id: string }
  | { type: "USE_COUPON"; id: string };

function couponsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_COUPON": {
      const isUsed = state.usedCoupons.includes(action.id);
      const isSaved = state.savedCoupons.includes(action.id);
      if (isUsed) return state;
      return {
        ...state,
        savedCoupons: isSaved
          ? state.savedCoupons.filter((i) => i !== action.id)
          : [...state.savedCoupons, action.id],
      };
    }
    case "USE_COUPON": {
      const isUsed = state.usedCoupons.includes(action.id);
      const isSaved = state.savedCoupons.includes(action.id);
      if (isUsed || !isSaved) return state;
      return {
        ...state,
        usedCoupons: [...state.usedCoupons, action.id],
      };
    }
    default:
      return state;
  }
}

interface CouponsContextType {
  savedCoupons: string[];
  usedCoupons: string[];
  toggleCoupon: (id: string) => void;
  useCoupon: (id: string) => void;
  isCouponSaved: (id: string) => boolean;
  isCouponUsed: (id: string) => boolean;
}

const CouponsContext = createContext<CouponsContextType | null>(null);

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    couponsReducer,
    null,
    () => safeParse<State>("coupons", { savedCoupons: [], usedCoupons: [] })
  );

  const savedSet = useMemo(() => new Set(state.savedCoupons), [state.savedCoupons]);
  const usedSet = useMemo(() => new Set(state.usedCoupons), [state.usedCoupons]);

  useEffect(() => {
    const handler = setTimeout(() => safeSave("coupons", state), 300);
    return () => clearTimeout(handler);
  }, [state]);

  const value = useMemo(() => ({
    savedCoupons: state.savedCoupons,
    usedCoupons: state.usedCoupons,
    toggleCoupon: (id: string) => dispatch({ type: "TOGGLE_COUPON", id }),
    useCoupon: (id: string) => dispatch({ type: "USE_COUPON", id }),
    isCouponSaved: (id: string) => savedSet.has(id),
    isCouponUsed: (id: string) => usedSet.has(id),
  }), [state, savedSet, usedSet]);

  return (
    <CouponsContext.Provider value={value}>
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponsProvider");
  return ctx;
}

import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { getUserCoupons, saveCoupon, unsaveCoupon, useCouponService } from "@/services/coupons";

type State = { savedCoupons: string[]; usedCoupons: string[]; loaded: boolean };

type Action =
  | { type: "INIT"; savedCoupons: string[]; usedCoupons: string[] }
  | { type: "TOGGLE_COUPON"; id: string }
  | { type: "USE_COUPON"; id: string }
  | { type: "REVERT_COUPON"; id: string };

function couponsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { savedCoupons: action.savedCoupons, usedCoupons: action.usedCoupons, loaded: true };
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
    case "REVERT_COUPON": {
      return {
        ...state,
        savedCoupons: state.savedCoupons.includes(action.id)
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
        savedCoupons: state.savedCoupons.filter(i => i !== action.id),
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
  loaded: boolean;
}

const CouponsContext = createContext<CouponsContextType | null>(null);

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(couponsReducer, {
    savedCoupons: [],
    usedCoupons: [],
    loaded: false,
  });

  const savedSet = useMemo(() => new Set(state.savedCoupons), [state.savedCoupons]);
  const usedSet = useMemo(() => new Set(state.usedCoupons), [state.usedCoupons]);

  useEffect(() => {
    async function load() {
      const { data } = await getUserCoupons();
      const saved: string[] = [];
      const used: string[] = [];
      data?.forEach((uc) => {
        if (uc.status === "used") used.push(uc.coupon_id);
        else saved.push(uc.coupon_id);
      });
      dispatch({ type: "INIT", savedCoupons: saved, usedCoupons: used });
    }
    load();
  }, []);

  const toggleCoupon = useCallback(async (id: string) => {
    const wasSaved = savedSet.has(id);
    dispatch({ type: "TOGGLE_COUPON", id });
    const result = wasSaved ? await unsaveCoupon(id) : await saveCoupon(id);
    if (result.error) {
      dispatch({ type: "REVERT_COUPON", id }); // safer revert
      console.error("Failed to sync coupon", result.error);
    }
  }, [savedSet]);

  const useCoupon = useCallback(async (id: string) => {
    dispatch({ type: "USE_COUPON", id });
    const result = await useCouponService(id);
    if (result.error) {
      console.error("Failed to use coupon", result.error);
      // Optional: Revert if critical
    }
  }, []);

  const isCouponSaved = useCallback((id: string) => savedSet.has(id), [savedSet]);
  const isCouponUsed = useCallback((id: string) => usedSet.has(id), [usedSet]);

  const value = useMemo(() => ({
    savedCoupons: state.savedCoupons,
    usedCoupons: state.usedCoupons,
    loaded: state.loaded,
    toggleCoupon,
    useCoupon,
    isCouponSaved,
    isCouponUsed,
  }), [state.savedCoupons, state.usedCoupons, state.loaded, toggleCoupon, useCoupon, isCouponSaved, isCouponUsed]);

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

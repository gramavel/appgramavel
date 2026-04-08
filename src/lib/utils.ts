import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOpenNow(est: {
  hours_monday?: string | null;
  hours_tuesday?: string | null;
  hours_wednesday?: string | null;
  hours_thursday?: string | null;
  hours_friday?: string | null;
  hours_saturday?: string | null;
  sunday_hours?: string | null;
  opening_hours?: string | null;
  is_open?: boolean;
}): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=dom,1=seg,2=ter,3=qua,4=qui,5=sex,6=sáb
  const fields = [
    est.sunday_hours,
    est.hours_monday,
    est.hours_tuesday,
    est.hours_wednesday,
    est.hours_thursday,
    est.hours_friday,
    est.hours_saturday,
  ];

  let hours = fields[day];

  if (!hours && est.opening_hours) hours = est.opening_hours;

  if (!hours) return est.is_open ?? false;

  const match = hours.match(/(\d{1,2}):(\d{2})\s*às\s*(\d{1,2}):(\d{2})/);
  if (!match) return est.is_open ?? false;

  const openMin  = parseInt(match[1]) * 60 + parseInt(match[2]);
  const closeMin = parseInt(match[3]) * 60 + parseInt(match[4]);
  const nowMin   = now.getHours() * 60 + now.getMinutes();

  return nowMin >= openMin && nowMin < closeMin;
}

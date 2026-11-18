import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges conditional Tailwind classes without allowing conflicting utilities to leak. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

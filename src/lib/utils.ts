import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Agrupa Tailwind por “tiras” cortas en varios argumentos para respetar `printWidth` (~120).
 * Equivalente a `cn`, pensado sobre todo para layouts con muchas variantes (`hover:`, dark, etc.).
 */
export function cnLines(...parts: ClassValue[]) {
  return twMerge(clsx(parts))
}

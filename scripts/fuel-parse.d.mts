export interface ParsedFuelItem {
  name: string
  region1: number
  region2: number | null
  unit: string
}
export function htmlToText(html: string): string
export function parseGxhnText(text: string): { priceDate: string | null; items: ParsedFuelItem[] }

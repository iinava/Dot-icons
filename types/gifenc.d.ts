declare module "gifenc" {
  export function GIFEncoder(): any;
  export function quantize(data: Uint8ClampedArray, maxColors: number, options?: any): any;
  export function applyPalette(data: Uint8ClampedArray, palette: any, format?: string): any;
}

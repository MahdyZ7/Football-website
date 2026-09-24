// Ambient module types for the declaration build (tsconfig.dts.json) only.
declare module '*.png' {
  const img: { src: string; width?: number; height?: number };
  export default img;
}

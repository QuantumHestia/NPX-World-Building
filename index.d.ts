declare module "*.scss" {
  const content: string
  export = content
}

// micromorph 0.4.5 publishes declarations but does not expose them in its package exports.
declare module "micromorph" {
  export default function micromorph(from: Node, to: Node): Promise<void>
}

// dom custom event
interface CustomEventMap {
  prenav: CustomEvent<{}>
  nav: CustomEvent<{ url: FullSlug }>
  themechange: CustomEvent<{ theme: "light" | "dark" }>
  readermodechange: CustomEvent<{ mode: "on" | "off" }>
}

type ContentIndex = Record<FullSlug, ContentDetails>
declare const fetchData: Promise<ContentIndex>

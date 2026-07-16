import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return <footer class={`${displayClass ?? ""}`}></footer>
  }

  return Footer
}) satisfies QuartzComponentConstructor
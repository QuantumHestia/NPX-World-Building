// quartz.layout.ts
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import WorldAnvilMenu from "./quartz/components/Menu"
import MenuScript from "./quartz/components/MenuScript"
import CustomHead from "./quartz/components/CustomHead"  // Add this import

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: CustomHead(),  // Changed from Component.Head()
  header: [],
  afterBody: [MenuScript()],
  footer: Component.Footer(),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      // Logic: Show title ONLY if slug is NOT index AND NOT a map page
      condition: (page) => 
        page.fileData.slug !== "index" && 
        !page.fileData.slug?.includes("world-navigation") &&
        !page.fileData.slug?.includes("summer-isles"),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      // Logic: Show meta ONLY if slug is NOT index AND NOT a map page
      condition: (page) => 
        page.fileData.slug !== "index" &&
        !page.fileData.slug?.includes("world-navigation") &&
        !page.fileData.slug?.includes("summer-isles"),
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [WorldAnvilMenu()],
  right: [],
}
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [WorldAnvilMenu()],
  right: [],
}
// quartz.config.ts
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { MapInjector } from "./quartz/plugins/transformers/MapInjector"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "World Codex",  // Changed from "Eldoria" to match your menu
    pageTitleSuffix: " | Eldoria Lore Wiki",
    enableSPA: true,
    enablePopovers: false,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "lore.hestia.best",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: {
          name: "Caudex",
          weights: [400, 700],
          includeItalic: true,
        },
        body: {
          name: "Caudex",
          weights: [400, 700],
          includeItalic: true,
        },
        code: {
          name: "Ms Madi", // Quartz will fetch this font
          weights: [400],
        },
      },
colors: {
  lightMode: {
    light: "#e8e0d0",        // Warm parchment
    lightgray: "#d4c9b5",    
    gray: "#8b8177",         
    darkgray: "#3d3530",     
    dark: "#1a1512",         
    secondary: "#8b4513",    // Saddle Brown
    tertiary: "#c9956c",     // Muted Gold
    highlight: "rgba(139, 69, 19, 0.12)",
    textHighlight: "#ffd70066", // Gold leaf
  },
  darkMode: {
    light: "#0d0c0a",
    lightgray: "#1a1816",
    gray: "#5c5650",
    darkgray: "#b8a88a",
    dark: "#e5dfd3",
    secondary: "#d4a857",    // Deep Gold for dark mode
    tertiary: "#c9956c",
    highlight: "rgba(212, 168, 87, 0.15)",
    textHighlight: "#ffd70066",
  },
},
  },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      MapInjector, // Add your MapInjector here
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
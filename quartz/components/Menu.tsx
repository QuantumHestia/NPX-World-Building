// quartz/components/Menu.tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { menuConfig } from "./menu-config"

const WorldAnvilMenu: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
  return (
    <div class="world-anvil-menu">
      <h2>{menuConfig.title}</h2>
      <ul>
        {/* Home button at the top */}
        <li key="home" class="home-button">
          <a href="/">🏠 Home</a>
        </li>
        
        {/* Chapters in the middle */}
        {menuConfig.chapters.map((chapter, chapterIndex) => (
          <div key={`chapter-group-${chapterIndex}`} class="chapter-container">
            <li key={`chapter-${chapterIndex}`} class="section-title">{chapter.title}</li>
            {chapter.items.map((item, itemIndex) => (
              <li key={`item-${chapterIndex}-${itemIndex}`} class="menu-item">
                <a href={`/${item.slug}`}>{item.title}</a>
              </li>
            ))}
          </div>
        ))}

        {/* Play Game button at the bottom */}
        <li key="play-game" class="game-button">
          <a href="https://play.hestia.best" target="_blank" rel="noopener noreferrer">🎮 Play The Game</a>
        </li>
      </ul>
    </div>
  )
}

export default (() => WorldAnvilMenu) satisfies QuartzComponentConstructor
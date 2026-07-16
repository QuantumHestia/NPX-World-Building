// quartz/components/MenuScript.tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const MenuScript: QuartzComponent = ({}: QuartzComponentProps) => {
  const script = `
    document.addEventListener('DOMContentLoaded', function() {
      if (window.innerWidth <= 850) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Toggle menu');
        document.body.appendChild(menuToggle);
        
        const sidebar = document.querySelector('.sidebar.left');
        if (sidebar) {
          const closeButton = document.createElement('button');
          closeButton.className = 'menu-close';
          closeButton.innerHTML = '×';
          closeButton.setAttribute('aria-label', 'Close menu');
          sidebar.insertBefore(closeButton, sidebar.firstChild);
          
          menuToggle.addEventListener('click', function() {
            sidebar.classList.add('menu-open');
          });
          
          closeButton.addEventListener('click', function() {
            sidebar.classList.remove('menu-open');
          });
          
          document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
              sidebar.classList.remove('menu-open');
            }
          });
        }
      }
    });
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default (() => MenuScript) satisfies QuartzComponentConstructor
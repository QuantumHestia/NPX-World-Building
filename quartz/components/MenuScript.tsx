import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const MenuScript: QuartzComponent = ({}: QuartzComponentProps) => {
  const script = `
    (() => {
      if (window.__eldoriaMobileMenuInstalled) return;
      window.__eldoriaMobileMenuInstalled = true;
      const isMobile = () => window.matchMedia('(max-width: 850px)').matches;
      const sidebar = () => document.querySelector('.sidebar.left');
      const setOpen = (open) => {
        const currentSidebar = sidebar();
        const toggle = document.querySelector('.menu-toggle');
        const shouldOpen = Boolean(open && isMobile());
        currentSidebar?.classList.toggle('menu-open', shouldOpen);
        document.body.classList.toggle('mobile-menu-open', shouldOpen);
        if (toggle) {
          toggle.innerHTML = shouldOpen ? '&times;' : '&#9776;';
          toggle.setAttribute('aria-expanded', String(shouldOpen));
          toggle.setAttribute('aria-label', shouldOpen ? 'Close menu' : 'Open menu');
        }
      };
      const install = () => {
        let toggle = document.querySelector('.menu-toggle');
        if (!toggle) {
          toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'menu-toggle';
          toggle.setAttribute('aria-controls', 'eldoria-sidebar-menu');
          document.body.appendChild(toggle);
        }
        const currentSidebar = sidebar();
        if (currentSidebar) {
          currentSidebar.id = 'eldoria-sidebar-menu';
          if (!currentSidebar.querySelector('.menu-close')) {
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'menu-close';
            close.innerHTML = '&times;';
            close.setAttribute('aria-label', 'Close menu');
            currentSidebar.insertBefore(close, currentSidebar.firstChild);
          }
        }
        setOpen(false);
      };
      document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;
        if (target.closest('.menu-toggle')) {
          setOpen(!sidebar()?.classList.contains('menu-open'));
          return;
        }
        if (target.closest('.menu-close') || target.closest('.sidebar.left a')) {
          setOpen(false);
          return;
        }
        if (sidebar()?.classList.contains('menu-open') && !target.closest('.sidebar.left')) setOpen(false);
      });
      window.addEventListener('resize', () => {
        if (!isMobile()) setOpen(false);
      }, { passive: true });
      document.addEventListener('nav', install);
      install();
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export default (() => MenuScript) satisfies QuartzComponentConstructor

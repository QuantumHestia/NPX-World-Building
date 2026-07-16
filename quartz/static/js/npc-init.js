function initNpcDossier() {
  const root = document.querySelector('[data-npc-dossier]');
  if (!root) return;
  if (root.classList.contains('npc-loaded')) return;
  root.classList.add('npc-loaded');

  // Build tabs from sections marked with data-tab
  const tabs = Array.from(root.querySelectorAll('[data-tab]'));
  if (tabs.length === 0) return;

  // Create tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'npc-tabbar';

  const panels = [];
  tabs.forEach((panel, idx) => {
    panel.classList.add('npc-panel');
    const name = panel.getAttribute('data-tab') || `Tab ${idx + 1}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'npc-tab';
    btn.textContent = name;

    btn.addEventListener('click', () => {
      panels.forEach(p => p.classList.remove('is-active'));
      tabBar.querySelectorAll('.npc-tab').forEach(b => b.classList.remove('is-active'));
      panel.classList.add('is-active');
      btn.classList.add('is-active');
    });

    tabBar.appendChild(btn);
    panels.push(panel);
  });

  // Insert tab bar after the dossier header (or at top)
  const header = root.querySelector('.npc-header');
  if (header) header.insertAdjacentElement('afterend', tabBar);
  else root.insertAdjacentElement('afterbegin', tabBar);

  // Activate first tab by default
  const firstBtn = tabBar.querySelector('.npc-tab');
  if (firstBtn) firstBtn.click();

  // Redaction toggle
  const sealBtn = root.querySelector('[data-unseal]');
  if (sealBtn) {
    sealBtn.addEventListener('click', () => {
      root.classList.toggle('npc-unsealed');
      const nowUnsealed = root.classList.contains('npc-unsealed');
      sealBtn.textContent = nowUnsealed ? 'SEAL RECORD' : 'UNSEAL RECORD';
    });
  }

  // Turn relationship list items into cards (optional)
  const relList = root.querySelector('[data-relations]');
  if (relList) {
    const items = Array.from(relList.querySelectorAll('li'));
    const grid = document.createElement('div');
    grid.className = 'npc-relgrid';

    items.forEach(li => {
      const a = li.querySelector('a');
      const card = document.createElement(a ? 'a' : 'div');
      card.className = 'npc-relcard';
      if (a) card.href = a.getAttribute('href');

      const title = document.createElement('div');
      title.className = 'npc-relname';
      title.textContent = (a ? a.textContent : li.textContent).trim();

      const note = document.createElement('div');
      note.className = 'npc-relnote';
      note.textContent = li.getAttribute('data-note') || '';

      card.appendChild(title);
      if (note.textContent) card.appendChild(note);
      grid.appendChild(card);
    });

    relList.replaceWith(grid);
  }
}

document.addEventListener('DOMContentLoaded', initNpcDossier);
document.addEventListener('nav', initNpcDossier);

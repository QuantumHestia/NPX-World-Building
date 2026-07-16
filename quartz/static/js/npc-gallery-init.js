async function initNpcGallery() {
  const el = document.querySelector('[data-npc-gallery]');
  if (!el) return;
  if (el.classList.contains('npc-gallery-loaded')) return;
  el.classList.add('npc-gallery-loaded');

  const src = el.getAttribute('data-source') || '/static/data/npcs.json';

  let npcs = [];
  try {
    const res = await fetch(src, { cache: 'no-store' });
    npcs = await res.json();
  } catch (e) {
    console.warn('NPC gallery: could not load registry', e);
    el.innerHTML = '<p>Could not load NPC registry.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'npc-gallery';

  for (const npc of npcs) {
    const card = document.createElement('div');
    card.className = 'npc-card';

    const link = document.createElement('a');
    link.href = npc.slug;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    const img = document.createElement('img');
    img.className = 'npc-portrait';
    img.src = npc.portrait;
    img.alt = npc.name;

    const name = document.createElement('div');
    name.className = 'npc-name';
    name.textContent = npc.name;

    link.appendChild(img);
    link.appendChild(name);

    const icons = document.createElement('div');
    icons.className = 'npc-icons';

    // Dossier icon (opens NPC page)
    const dossier = document.createElement('a');
    dossier.className = 'npc-icon';
    dossier.href = npc.slug;
    dossier.title = 'Open dossier';
    dossier.textContent = '📄';

    // Map icon
    const map = document.createElement('a');
    map.className = 'npc-icon';
    map.title = 'Show on map';
    if (npc.map && typeof npc.map.lat === 'number') {
      map.href = `/world-navigation?lat=${npc.map.lat}&lng=${npc.map.lng}&z=${npc.map.z ?? -2.0}`;
      map.textContent = '🧭';
    } else {
      map.href = '/world-navigation';
      map.textContent = '🧭';
    }

    // Timeline icon
    const time = document.createElement('a');
    time.className = 'npc-icon';
    time.href = npc.timeline || '/timeline';
    time.title = 'Timeline';
    time.textContent = '⏳';

    icons.appendChild(dossier);
    icons.appendChild(map);
    icons.appendChild(time);

    card.appendChild(link);
    card.appendChild(icons);

    grid.appendChild(card);
  }

  el.replaceWith(grid);
}

async function initFilteredGallery() {
  const el = document.querySelector('#filtered-gallery');
  if (!el) return;

  // 1. Get the faction from the URL
  const params = new URLSearchParams(window.location.search);
  const targetFaction =
    params.get('faction') ||
    el.getAttribute('data-faction') ||
    null;

  const filteredNpcs = targetFaction
  ? allNpcs.filter(npc =>
      norm(npc.faction_id) === norm(targetFaction) ||
      norm(npc.faction) === norm(targetFaction)
    )
  : allNpcs;

  const norm = (s) => String(s || '').trim().toLowerCase();  
  try {
    const res = await fetch(src);
    const allNpcs = await res.json();

    // 2. Filter the NPCs based on the URL parameter
    const filteredNpcs = targetFaction 
      ? allNpcs.filter(npc => npc.faction_id === targetFaction)
      : allNpcs;

    // 3. Render the cards (re-using your existing card logic)
    renderNpcGrid(el, filteredNpcs); 
  } catch (e) {
    console.error("Gallery filter failed", e);
  }
}

document.addEventListener('DOMContentLoaded', initNpcGallery);
document.addEventListener('nav', initNpcGallery);

// Function to render cards that look exactly like your Manual "Notable Figures"
function renderNpcGrid(container, npcs) {
  // Clear "Loading..." text
  container.innerHTML = '';
  
  // Create the main grid wrapper
  const grid = document.createElement('div');
  grid.className = 'character-grid'; // Triggers your CSS grid layout

  npcs.forEach(npc => {
    // 1. Create the Card Container (The Callout)
    const card = document.createElement('div');
    card.className = 'callout';
    card.setAttribute('data-callout', 'abstract'); // Matches your CSS selectors
    
    // 2. Create the Title (The Header with Name)
    const titleDiv = document.createElement('div');
    titleDiv.className = 'callout-title';
    
    const titleInner = document.createElement('div');
    titleInner.className = 'callout-title-inner';
    
    const link = document.createElement('a');
    link.href = npc.slug || '#';
    link.textContent = npc.name;
    link.className = 'internal'; // Quartz style link
    
    titleInner.appendChild(link);
    titleDiv.appendChild(titleInner);
    
    // 3. Create the Body (Image + Info)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'callout-content';
    
    // Portrait
    if (npc.portrait) {
      const img = document.createElement('img');
      img.src = npc.portrait;
      img.alt = npc.name;
      // Your CSS targets .character-grid .callout img
      contentDiv.appendChild(img);
    }
    
    // Affiliation Line
    if (npc.affiliation) {
      const affP = document.createElement('p');
      affP.innerHTML = `<strong>Affiliation:</strong> ${npc.affiliation}`;
      contentDiv.appendChild(affP);
    }
    
    // Status Row (The complex HTML you perfected earlier)
    if (npc.status || npc.life) {
      const statusRow = document.createElement('div');
      statusRow.className = 'status-row';
      
      let statusHtml = '';
      
      // Status Badge (Active/Wanted)
      if (npc.status) {
        // Determine color class based on status text
        const statusClass = npc.status.toLowerCase() === 'active' ? 'status-active' : 'status-wanted';
        statusHtml += `
          <div class="status-group">
            <span class="status-label">Status:</span> 
            <span class="badge ${statusClass}">${npc.status}</span>
          </div>`;
      }
      
      // Life Badge (Alive/Deceased)
      if (npc.life) {
        const lifeClass = npc.life.toLowerCase() === 'alive' ? 'status-alive' : 'status-deceased';
        statusHtml += `
          <div class="status-group">
            <span class="status-label">Life:</span> 
            <span class="badge ${lifeClass}">${npc.life}</span>
          </div>`;
      }
      
      statusRow.innerHTML = statusHtml;
      contentDiv.appendChild(statusRow);
    }

    // Assemble the card
    card.appendChild(titleDiv);
    card.appendChild(contentDiv);
    
    // Make whole card clickable (optional, matches your faction logic)
    card.onclick = (e) => {
        if(e.target.tagName !== 'A') window.location.href = link.href;
    };

    grid.appendChild(card);
  });

  container.appendChild(grid);
}
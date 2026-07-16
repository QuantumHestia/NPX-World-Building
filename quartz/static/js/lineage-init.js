// lineage-init.js - For Quartz Integration
// Place this in: quartz/static/scripts/lineage-init.js

(function() {
    // Only run on the lineage page
    if (!document.body.getAttribute('data-slug')?.includes('lineage')) return;

    const container = document.getElementById('lineage-container');
    if (!container) return;

    // Configuration
    const YAML_DATA_PATH = '/divine-lineage-data.yaml';  // Adjust path as needed
    
    const mythologyColors = {
        greek: "#d4a574",
        norse: "#7fa4c9",
        egyptian: "#c97f7f",
        celtic: "#7fc97f"
    };

    const relationshipStyles = {
        parent: { color: "#d4a574", width: 3, dashes: false },
        married: { color: "#c97fa4", width: 2, dashes: [5, 5] },
        affair: { color: "#c97f7f", width: 2, dashes: [2, 2] },
        spawned: { color: "#9f7fc9", width: 2, dashes: false },
        sibling: { color: "#7fc9a4", width: 1, dashes: [5, 5] }
    };

    // Load YAML data
    async function loadYAMLData() {
        try {
            const response = await fetch(YAML_DATA_PATH);
            const yamlText = await response.text();
            
            // If jsyaml is available
            if (typeof jsyaml !== 'undefined') {
                return jsyaml.load(yamlText);
            }
            
            // Fallback: parse simple YAML manually (basic support)
            console.warn('jsyaml not found, using basic YAML parser');
            return parseBasicYAML(yamlText);
        } catch (error) {
            console.error('Error loading YAML data:', error);
            return null;
        }
    }

    // Basic YAML parser for simple structures
    function parseBasicYAML(yamlText) {
        // This is a simplified parser - for production, use js-yaml library
        const lines = yamlText.split('\n');
        const data = { entities: [], relationships: [] };
        let currentSection = null;
        let currentItem = null;

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line === 'entities:') {
                currentSection = 'entities';
                continue;
            } else if (line === 'relationships:') {
                currentSection = 'relationships';
                continue;
            }

            if (line.startsWith('- ')) {
                if (currentItem) {
                    data[currentSection].push(currentItem);
                }
                currentItem = {};
            } else if (currentItem) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                currentItem[key.trim()] = isNaN(value) ? value : parseInt(value);
            }
        }

        if (currentItem) {
            data[currentSection].push(currentItem);
        }

        return data;
    }

    // Initialize network
    function initializeNetwork(data) {
        if (!data || !data.entities || !data.relationships) {
            console.error('Invalid data structure');
            return;
        }

        // Prepare nodes
        const nodes = new vis.DataSet(data.entities.map(entity => ({
            id: entity.id,
            label: entity.name,
            title: `<b>${entity.name}</b><br>${entity.title}<br><i>${entity.mythology} mythology</i>`,
            group: entity.mythology,
            level: entity.generation || 0,
            color: {
                background: mythologyColors[entity.mythology] || '#cccccc',
                border: 'rgba(0, 0, 0, 0.8)',
                highlight: {
                    background: mythologyColors[entity.mythology] || '#cccccc',
                    border: 'rgba(255, 255, 255, 0.8)'
                }
            },
            font: {
                color: '#1a1612',
                size: 14,
                face: 'Cinzel, Times New Roman, serif',
                bold: { weight: 700 }
            },
            shape: 'dot',
            size: 20,
            entity: entity
        })));

        // Prepare edges
        const edges = new vis.DataSet(data.relationships.map((rel, index) => {
            const style = relationshipStyles[rel.type] || relationshipStyles.parent;
            return {
                id: `edge-${index}`,
                from: rel.from,
                to: rel.to,
                color: { color: style.color, opacity: 0.6 },
                width: style.width,
                dashes: style.dashes,
                smooth: { type: 'curvedCW', roundness: 0.2 },
                relType: rel.type,
                label: rel.label || ''
            };
        }));

        const options = {
            layout: {
                hierarchical: {
                    enabled: false
                }
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -8000,
                    centralGravity: 0.3,
                    springLength: 150,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.5
                },
                stabilization: {
                    iterations: 200
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 100,
                zoomView: true,
                dragView: true
            },
            nodes: {
                borderWidth: 3,
                borderWidthSelected: 4,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.5)',
                    size: 10,
                    x: 2,
                    y: 2
                }
            },
            edges: {
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.3)',
                    size: 5,
                    x: 1,
                    y: 1
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5
                    }
                }
            }
        };

        const network = new vis.Network(container, { nodes, edges }, options);

        // Click to navigate to wiki page
        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                if (node.entity.wiki_link) {
                    // Adjust path based on your Quartz structure
                    window.location.href = `./${node.entity.wiki_link}`;
                }
            }
        });

        // Add hover effect
        network.on('hoverNode', function(params) {
            container.style.cursor = 'pointer';
        });

        network.on('blurNode', function(params) {
            container.style.cursor = 'default';
        });

        return network;
    }

    // Add loading indicator
    container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #d4a574;">Loading divine lineage...</div>';

    // Load data and initialize
    loadYAMLData().then(data => {
        if (data) {
            container.innerHTML = '';
            initializeNetwork(data);
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 4rem; color: #c97f7f;">Failed to load lineage data. Please check the console for errors.</div>';
        }
    });

    // Handle Quartz SPA transitions
    document.addEventListener('nav', function() {
        if (document.body.getAttribute('data-slug')?.includes('lineage')) {
            loadYAMLData().then(data => {
                if (data) {
                    container.innerHTML = '';
                    initializeNetwork(data);
                }
            });
        }
    });
})();
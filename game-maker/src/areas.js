import { scenes, currentScene } from './scenes.js';
import { clearClickableAreas, createClickableArea } from './utils.js';
import { editor } from './main.js';
import { displayScene } from './scenes.js';

export function initializeAreas() {
    fetch(`/areas/${currentScene}`)
        .then(response => response.json())
        .then(areas => {
            console.log('Loaded areas for scene:', currentScene, areas); // Debug log
            if (scenes[currentScene]) {
                scenes[currentScene].areas = areas;
                displayScene(currentScene);
            }
        });
}

export function saveSceneAreas() {
    if (!currentScene || !scenes[currentScene]) return;
    
    const areas = Array.from(editor.querySelectorAll('.clickable-area'))
        .map(area => ({
            scene_id: currentScene,
            top: area.style.top || '0%',
            left: area.style.left || '0%',
            width: area.style.width || '20%',
            height: area.style.height || '20%',
            target: area.dataset.target || '',
            new_tab: area.dataset.newTab === 'true',
            transition_gif: area.dataset.transitionGif || '',
            transition_duration: area.dataset.transitionDuration || 0
        }));
    
    // Save to database
    fetch('/areas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areas })
    });
    
    scenes[currentScene].areas = areas;
}

export function addClickableArea() {
    if (!currentScene) {
        alert('Please select a scene first');
        return;
    }

    const area = createClickableArea({
        top: '10%',
        left: '10%',
        width: '20%',
        height: '20%',
        target: '',
        newTab: false
    });
    
    editor.appendChild(area);
}

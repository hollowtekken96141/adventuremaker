import { scenes, currentScene } from './scenes.js';
import { saveSceneAreas } from './areas.js';
import { sceneSelector, targetState, editor, targetType } from './main.js';

export function updateSceneSelector() {
    sceneSelector.innerHTML = '';
    for (const scene in scenes) {
        const option = document.createElement('option');
        option.value = scene;
        option.textContent = scene;
        sceneSelector.appendChild(option);
    }
    updateTargetStateOptions();
}

export function updateTargetStateOptions() {
    targetState.innerHTML = '';
    Object.keys(scenes).forEach(sceneName => {
        const option = document.createElement('option');
        option.value = sceneName;
        option.textContent = sceneName;
        targetState.appendChild(option);
    });
}

export function selectScene(sceneName) {
    if (currentScene && scenes[currentScene]) {
        saveSceneAreas();
    }
    
    // Update currentScene using a let variable
    let updatedCurrentScene = sceneName;
    sceneSelector.value = sceneName;
    loadAreasForScene(sceneName);
    displayScene(sceneName);
}

export function clearClickableAreas() {
    editor.querySelectorAll('.clickable-area').forEach(area => area.remove());
}

export function createClickableArea(areaData) {
    const area = document.createElement('div');
    area.classList.add('clickable-area');
    area.style.top = areaData.top;
    area.style.left = areaData.left;
    area.style.width = areaData.width;
    area.style.height = areaData.height;
    area.dataset.target = areaData.target;
    area.dataset.newTab = areaData.newTab;

    area.addEventListener('mousedown', initDrag);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', () => editArea(area));
    area.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => area.remove());
    area.appendChild(deleteButton);

    return area;
}

export function toggleTargetInput() {
    const isExternal = targetType.value === 'external';
    document.getElementById('state-target').style.display = isExternal ? 'none' : 'block';
    document.getElementById('external-target').style.display = isExternal ? 'block' : 'none';
}

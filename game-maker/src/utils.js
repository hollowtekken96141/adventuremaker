import { scenes, currentScene, displayScene } from './scenes.js';
import { saveSceneAreas, loadAreasForScene, editArea } from './areas.js';
import { sceneSelector, targetState, editor, targetType, areaForm } from './main.js';

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
    
    let updatedCurrentScene = sceneName;
    sceneSelector.value = sceneName;
    loadAreasForScene(sceneName);
    displayScene(sceneName);
}

export function clearClickableAreas() {
    editor.querySelectorAll('.clickable-area').forEach(area => area.remove());
}

export function toggleTargetInput() {
    const isExternal = targetType.value === 'external';
    document.getElementById('state-target').style.display = isExternal ? 'none' : 'block';
    document.getElementById('external-target').style.display = isExternal ? 'block' : 'none';
}

// Add createClickableArea function
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
    editButton.addEventListener('click', () => {
        editArea(area);
    });
    area.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => area.remove());
    area.appendChild(deleteButton);

    return area;
}

// Drag functionality
function initDrag(event) {
    if (event.target.classList.contains('edit-button') || event.target.classList.contains('delete-button')) return;

    const area = event.target.closest('.clickable-area');
    if (!area) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const startTop = parseFloat(area.style.top);
    const startLeft = parseFloat(area.style.left);

    function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        area.style.top = `${startTop + deltaY}px`;
        area.style.left = `${startLeft + deltaX}px`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Add clearStorage function
export function clearStorage() {
    if (confirm('Are you sure you want to clear all storage and saved work? This action cannot be undone.')) {
        fetch('/clear-storage', {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to clear storage');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('All storage and saved work have been cleared.');
                location.reload(); // Refresh the page
            } else {
                alert('Failed to clear storage.');
            }
        })
        .catch(error => {
            console.error('Error clearing storage:', error);
            alert('An error occurred while clearing storage.');
        });
    }
}

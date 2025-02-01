import { initializeScenes } from './scenes.js';
import { initializeAreas } from './areas.js';
import { initializeEventListeners } from './events.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeScenes();
    initializeAreas();
    initializeEventListeners();
});

export const sceneSelector = document.getElementById('scene-selector');
export const editor = document.getElementById('editor');
export const areaForm = document.querySelector('.area-form');
export const targetType = document.getElementById('target-type');
export const targetState = document.getElementById('target-state');
export const targetLink = document.getElementById('target-link');
export const newTabCheckbox = document.getElementById('new-tab');
export const transitionGifInput = document.getElementById('transition-gif');

let scenes = {};
let currentScene = "1";
let currentArea = null;

function addScene() {
    const sceneName = prompt("Enter new scene name:");
    if (sceneName && !scenes[sceneName]) {
        scenes[sceneName] = { gif: '', areas: [] };
        updateSceneSelector();
        selectScene(sceneName);
    } else {
        alert("Scene name already exists or is invalid.");
    }
}

function deleteScene() {
    if (currentScene) {
        delete scenes[currentScene];
        updateSceneSelector();
        selectScene(Object.keys(scenes)[0]);
    }
}

function renameScene() {
    if (currentScene) {
        const newName = prompt("Enter new scene name:", currentScene);
        if (newName && !scenes[newName]) {
            scenes[newName] = scenes[currentScene];
            delete scenes[currentScene];
            updateSceneSelector();
            selectScene(newName);
        } else {
            alert("Scene name already exists or is invalid.");
        }
    }
}

function uploadGif(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (currentScene) {
                const gifData = e.target.result;  // This is already base64
                
                // Save to database
                fetch('/scenes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: currentScene,
                        gif: gifData
                    })
                }).then(() => {
                    // Update local state only after successful save
                    scenes[currentScene].gif = gifData;
                    displayScene(currentScene);
                });
            }
        };
        reader.readAsDataURL(file);
    }
}

function saveProject() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function updateSceneSelector() {
    sceneSelector.innerHTML = '';
    for (const scene in scenes) {
        const option = document.createElement('option');
        option.value = scene;
        option.textContent = scene;
        sceneSelector.appendChild(option);
    }
    updateTargetStateOptions();
}

function updateTargetStateOptions() {
    targetState.innerHTML = '';
    Object.keys(scenes).forEach(sceneName => {
        const option = document.createElement('option');
        option.value = sceneName;
        option.textContent = sceneName;
        targetState.appendChild(option);
    });
}

function selectScene(sceneName) {
    if (currentScene && scenes[currentScene]) {
        saveSceneAreas();
    }
    
    currentScene = sceneName;
    sceneSelector.value = sceneName;
    loadAreasForScene(sceneName);
    displayScene(sceneName);
}

function loadAreasForScene(sceneName) {
    fetch(`/areas/${sceneName}`)
        .then(response => response.json())
        .then(areas => {
            console.log('Loaded areas for scene:', sceneName, areas); // Debug log
            if (scenes[sceneName]) {
                scenes[sceneName].areas = areas;
                displayScene(sceneName);
            }
        });
}

function saveSceneAreas() {
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

function displayScene(sceneName) {
    const scene = scenes[sceneName];
    clearClickableAreas();
    
    if (scene) {
        const gifData = scene.gif;
        console.log('Displaying scene:', sceneName, gifData); // Debug log
        if (gifData) {
            const img = new Image();
            img.onload = function() {
                editor.style.backgroundImage = `url('${gifData}')`;
                editor.style.backgroundSize = 'cover'; // Ensure the background covers the entire editor
                editor.style.backgroundPosition = 'center'; // Center the background image
            };
            img.src = gifData;
        } else {
            editor.style.backgroundImage = 'none';
        }
        
        if (scene.areas && Array.isArray(scene.areas)) {
            scene.areas.forEach(areaData => {
                const area = createClickableArea(areaData);
                editor.appendChild(area);
            });
        }
    }
}

function clearClickableAreas() {
    editor.querySelectorAll('.clickable-area').forEach(area => area.remove());
}

function addClickableAreas(areas) {
    areas.forEach(areaData => {
        const area = createClickableArea(areaData);
        editor.appendChild(area);
    });
}

function createClickableArea(areaData) {
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

function initDrag(e) {
    const area = e.target.closest('.clickable-area');
    if (!area) return;

    // Don't initiate drag if clicking on buttons or resize handle
    if (e.target.tagName === 'BUTTON' || 
        // Check if click is in the resize handle area (bottom-right 20x20 pixels)
        (e.offsetX > area.offsetWidth - 20 && e.offsetY > area.offsetHeight - 20)) {
        return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = parseFloat(area.style.top) || 0;
    const startLeft = parseFloat(area.style.left) || 0;

    function doDrag(e) {
        const deltaX = ((e.clientX - startX) / editor.clientWidth) * 100;
        const deltaY = ((e.clientY - startY) / editor.clientHeight) * 100;
        area.style.top = `${startTop + deltaY}%`;
        area.style.left = `${startLeft + deltaX}%`;
    }

    function stopDrag() {
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
}

function editArea(area) {
    currentArea = area;
    const isExternal = area.dataset.target.startsWith('http');
    targetType.value = isExternal ? 'external' : 'state';
    if (isExternal) {
        targetLink.value = area.dataset.target;
    } else {
        targetState.value = area.dataset.target || '';
    }
    newTabCheckbox.checked = area.dataset.newTab === 'true';
    transitionGifInput.value = ''; // Clear the transition GIF input
    document.getElementById('transition-duration').value = area.dataset.transitionDuration || '';
    toggleTargetInput();
    areaForm.style.display = 'block';
}

function saveArea() {
    if (currentArea) {
        const target = targetType.value === 'external' ? targetLink.value : targetState.value;
        currentArea.dataset.target = target;
        currentArea.dataset.newTab = newTabCheckbox.checked;
        currentArea.dataset.transitionDuration = document.getElementById('transition-duration').value;

        const transitionGifFile = transitionGifInput.files[0];
        if (transitionGifFile) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const gifData = e.target.result;
                currentArea.dataset.transitionGif = gifData;

                // Calculate the duration of the transition GIF
                const gifArrayBuffer = await fetch(gifData).then(res => res.arrayBuffer());
                const gif = gifuct.parseGIF(gifArrayBuffer);
                const frames = gifuct.decompressFrames(gif, true);
                const duration = frames.reduce((sum, frame) => sum + frame.delay, 0) * 10; // delay is in 1/100th of a second
                currentArea.dataset.transitionDuration = duration;

                saveSceneAreas();
                areaForm.style.display = 'none';
                currentArea = null;
            };
            reader.readAsDataURL(transitionGifFile);
        } else {
            saveSceneAreas();
            areaForm.style.display = 'none';
            currentArea = null;
        }
    }
}

function addClickableArea() {
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

function toggleTargetInput() {
    const isExternal = targetType.value === 'external';
    document.getElementById('state-target').style.display = isExternal ? 'none' : 'block';
    document.getElementById('external-target').style.display = isExternal ? 'block' : 'none';
}
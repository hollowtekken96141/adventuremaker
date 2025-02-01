import { scenes, currentScene } from './scenes.js';
import { editor, areaForm, targetType, targetState, targetLink, newTabCheckbox, transitionGifInput } from './main.js';
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

    const areas = Array.from(editor.querySelectorAll('.clickable-area')).map(area => ({
        scene_id: currentScene,
        top: area.style.top || '0%',
        left: area.style.left || '0%',
        width: area.style.width || '20%',
        height: area.style.height || '20%',
        target: area.dataset.target || '',
        new_tab: area.dataset.newTab === 'true',
        transition_gif: area.dataset.transitionGif || '',
        transition_duration: area.dataset.transitionDuration || 0,
        target_type: area.dataset.targetType || 'state' // Save target type
    }));

    console.log('Saving areas:', areas); // Debug log

    // Validate areas before sending
    if (!areas || !Array.isArray(areas) || areas.length === 0) {
        console.error('Invalid areas data:', areas);
        return;
    }

    // Save to database
    fetch('/areas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areas })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        console.log('Areas saved successfully:', data);
        scenes[currentScene].areas = areas;
    })
    .catch(error => {
        console.error('Error saving areas:', error);
    });
}

export function addClickableArea() {
    if (!currentScene) {
        alert('Please select a scene first');
        return;
    }

    const area = document.createElement('div');
    area.classList.add('clickable-area');
    area.style.top = '10%';
    area.style.left = '10%';
    area.style.width = '20%';
    area.style.height = '20%';
    area.dataset.target = '';
    area.dataset.newTab = false;
    area.dataset.targetType = 'state'; // Default target type

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

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.addEventListener('mousedown', initResize);
    area.appendChild(resizeHandle);

    editor.appendChild(area);
}

export function loadAreasForScene(sceneName) {
    fetch(`/areas/${sceneName}`)
        .then(response => response.json())
        .then(areas => {
            console.log('Loaded areas for scene:', sceneName, areas); // Debug log
            if (scenes[sceneName]) {
                scenes[sceneName].areas = areas;
                displayScene(sceneName);
            }
        })
        .catch(error => console.error('Error loading areas:', error));
}

export function editArea(area) {
    // Display the area form
    areaForm.style.display = 'block';

    // Populate the form with the area's data
    targetType.value = area.dataset.targetType || 'state';
    targetState.value = targetType.value === 'state' ? area.dataset.target : '';
    targetLink.value = targetType.value === 'external' ? area.dataset.target : '';
    newTabCheckbox.checked = area.dataset.newTab === 'true';
    transitionGifInput.value = ''; // Ensure the value is set to an empty string

    // Display the transition GIF text
    const transitionGifText = document.getElementById('transition-gif-text');
    transitionGifText.textContent = area.dataset.transitionGif ? 'Current GIF: ' + area.dataset.transitionGif : 'No GIF set';

    // Save changes to the area
    document.getElementById('save-area').onclick = () => {
        area.dataset.targetType = targetType.value;
        area.dataset.target = targetType.value === 'external' ? targetLink.value : targetState.value;
        area.dataset.newTab = newTabCheckbox.checked;
        area.dataset.transitionGif = transitionGifInput.value;
        areaForm.style.display = 'none';
        saveSceneAreas();
    };

    // Logic to edit the area
    console.log('Editing area:', area);
}

function initDrag(event) {
    if (event.target.classList.contains('edit-button') || event.target.classList.contains('delete-button') || event.target.classList.contains('resize-handle')) return;

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

function initResize(event) {
    const area = event.target.closest('.clickable-area');
    if (!area) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = parseFloat(area.style.width);
    const startHeight = parseFloat(area.style.height);

    function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        area.style.width = `${startWidth + deltaX}px`;
        area.style.height = `${startHeight + deltaY}px`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
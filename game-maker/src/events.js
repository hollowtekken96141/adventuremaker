import { addScene, deleteScene, renameScene, uploadGif, displayScene, currentScene } from './scenes.js';
import { saveSceneAreas, addClickableArea } from './areas.js';
import { toggleTargetInput } from './utils.js';
import { areaForm, targetType, sceneSelector } from './main.js';

export function initializeEventListeners() {
    const addSceneButton = document.getElementById('add-scene-button');
    if (addSceneButton) addSceneButton.addEventListener('click', addScene);

    const deleteSceneButton = document.getElementById('delete-scene-button');
    if (deleteSceneButton) deleteSceneButton.addEventListener('click', deleteScene);

    const renameSceneButton = document.getElementById('rename-scene-button');
    if (renameSceneButton) renameSceneButton.addEventListener('click', renameScene);

    const uploadGifButton = document.getElementById('upload-gif');
    if (uploadGifButton) {
        uploadGifButton.addEventListener('change', function(event) {
            if (currentScene) {
                uploadGif(event);
            } else {
                alert('Please select or create a scene first');
            }
        });
    }

    const saveButton = document.getElementById('save-button');
    if (saveButton) saveButton.addEventListener('click', saveProject);

    const saveAreaButton = document.getElementById('save-area');
    if (saveAreaButton) saveAreaButton.addEventListener('click', saveArea);

    const closeAreaFormButton = document.getElementById('close-area-form');
    if (closeAreaFormButton) closeAreaFormButton.addEventListener('click', () => areaForm.style.display = 'none');

    const addClickableAreaButton = document.getElementById('add-clickable-area');
    if (addClickableAreaButton) {
        addClickableAreaButton.addEventListener('click', addClickableArea);
    }

    targetType.addEventListener('change', toggleTargetInput);

    // Add scene selector change event listener
    sceneSelector.addEventListener('change', function() {
        selectScene(this.value);
    });
}

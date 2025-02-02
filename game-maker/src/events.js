import { addScene, deleteScene, renameScene, uploadGif, displayScene, currentScene, selectScene } from './scenes.js';
import { saveSceneAreas, addClickableArea } from './areas.js';
import { toggleTargetInput, clearStorage } from './utils.js'; // Import clearStorage
import { areaForm, targetType, sceneSelector } from './main.js';
import { exportGame } from './export.js'; // Import exportGame

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
    if (saveAreaButton) saveAreaButton.addEventListener('click', saveSceneAreas);

    const closeAreaFormButton = document.getElementById('close-area-form');
    if (closeAreaFormButton) closeAreaFormButton.addEventListener('click', () => areaForm.style.display = 'none');

    const addClickableAreaButton = document.getElementById('add-clickable-area');
    if (addClickableAreaButton) {
        addClickableAreaButton.addEventListener('click', addClickableArea);
    }

    const clearStorageButton = document.getElementById('clear-storage-button');
    if (clearStorageButton) {
        clearStorageButton.addEventListener('click', clearStorage); // Ensure clear button event listener is set up
    }

    const exportGameButton = document.getElementById('export-game-button');
    if (exportGameButton) {
        exportGameButton.addEventListener('click', () => {
            const exportOptions = document.getElementById('export-options');
            exportOptions.style.display = 'block'; // Show export options
        });
    }

    const confirmExportButton = document.getElementById('confirm-export-button');
    if (confirmExportButton) {
        confirmExportButton.addEventListener('click', () => {
            const title = document.getElementById('export-title').value;
            const backgroundInput = document.getElementById('export-background');
            const backgroundFile = backgroundInput.files[0];
            const exportOptions = document.getElementById('export-options');
            exportOptions.style.display = 'none'; // Hide export options after confirming

            if (backgroundFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const backgroundData = e.target.result;
                    exportGame(title, backgroundData);
                };
                reader.readAsDataURL(backgroundFile);
            } else {
                exportGame(title, null);
            }
        });
    }

    const cancelExportButton = document.getElementById('cancel-export-button');
    if (cancelExportButton) {
        cancelExportButton.addEventListener('click', () => {
            const exportOptions = document.getElementById('export-options');
            exportOptions.style.display = 'none'; // Hide export options when cancel is pressed
        });
    }

    targetType.addEventListener('change', toggleTargetInput);

    // Add scene selector change event listener
    sceneSelector.addEventListener('change', function() {
        selectScene(this.value);
    });
}

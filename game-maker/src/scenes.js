import { updateSceneSelector, selectScene, clearClickableAreas, createClickableArea } from './utils.js';
import { editor } from './main.js';

export let scenes = {};
export let currentScene = "1";

export function initializeScenes() {
    fetch('/scenes')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded scenes:', data); // Debug log
            scenes = data.reduce((acc, scene) => {
                acc[scene.name] = {
                    gif: scene.gif,
                    areas: []
                };
                return acc;
            }, {});
            
            if (Object.keys(scenes).length === 0) {
                scenes = { "1": { gif: '', areas: [] } };
            }
            
            updateSceneSelector();
            selectScene("1");
        })
        .catch(error => console.error('Error loading scenes:', error));
}

export function addScene() {
    const sceneName = prompt("Enter new scene name:");
    if (sceneName && !scenes[sceneName]) {
        scenes[sceneName] = { gif: '', areas: [] };
        updateSceneSelector();
        selectScene(sceneName);
    } else {
        alert("Scene name already exists or is invalid.");
    }
}

export function deleteScene() {
    if (currentScene) {
        delete scenes[currentScene];
        updateSceneSelector();
        selectScene(Object.keys(scenes)[0]);
    }
}

export function renameScene() {
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

export function uploadGif(event) {
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

export function displayScene(sceneName) {
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

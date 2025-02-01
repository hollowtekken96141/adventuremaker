import { scenes } from './scenes.js';

export async function exportGame(title, backgroundData) {
    const scenesData = await fetchScenesData();
    const htmlContent = generateHtmlContent(scenesData, title, backgroundData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function fetchScenesData() {
    const response = await fetch('/scenes');
    const scenes = await response.json();
    const scenesData = {};

    for (const scene of scenes) {
        const areasResponse = await fetch(`/areas/${scene.id}`);
        const areas = await areasResponse.json();
        scenesData[scene.name] = {
            gif: scene.gif,
            areas: areas.map(area => ({
                top: area.top,
                left: area.left,
                width: area.width,
                height: area.height,
                target: area.target,
                newTab: area.new_tab,
                transitionGif: area.transition_gif,
                transitionDuration: area.transition_duration,
                targetType: area.target_type // Ensure targetType is included
            }))
        };
    }

    return scenesData;
}

function generateHtmlContent(scenesData, title, backgroundData) {
    const scenesJson = JSON.stringify(scenesData);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${title || 'Exported Game'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            ${backgroundData ? `background-image: url('${backgroundData}'); background-size: cover; background-position: center;` : ''}
        }
        .editor-container {
            position: relative;
            width: 100%;
            max-width: 375px; /* Mobile size width */
            height: 667px; /* Mobile size height */
            overflow: hidden;
            background-color: white;
            z-index: 1;
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .editor {
            width: 100%;
            height: 100%;
            background-color: white;
            z-index: 1;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat; /* Ensure the background does not repeat */
        }
        .clickable-area {
            position: absolute;
            cursor: pointer;
            min-width: 50px;
            min-height: 50px;
        }
    </style>
</head>
<body>
    <div class="editor-container">
        <div class="editor" id="editor"></div>
    </div>
    <script>
        const scenes = ${scenesJson};
        let currentScene = "1";

        function displayScene(sceneName) {
            console.log('Loading scene:', sceneName); // Debug log
            const scene = scenes[sceneName];
            const editor = document.getElementById('editor');
            editor.innerHTML = '';
            if (scene) {
                const gifData = scene.gif;
                if (gifData) {
                    console.log('Setting background image for scene:', sceneName); // Debug log
                    editor.style.backgroundImage = \`url('\${gifData}')\`;
                    editor.style.backgroundSize = 'cover';
                    editor.style.backgroundPosition = 'center';
                } else {
                    console.log('No background image for scene:', sceneName); // Debug log
                    editor.style.backgroundImage = 'none';
                }
                if (scene.areas && Array.isArray(scene.areas)) {
                    console.log('Loading areas for scene:', sceneName); // Debug log
                    scene.areas.forEach(areaData => {
                        const area = document.createElement('div');
                        area.classList.add('clickable-area');
                        area.style.top = areaData.top;
                        area.style.left = areaData.left;
                        area.style.width = areaData.width;
                        area.style.height = areaData.height;
                        area.dataset.target = areaData.target;
                        area.dataset.newTab = areaData.newTab;
                        area.dataset.transitionGif = areaData.transitionGif;
                        area.dataset.transitionDuration = areaData.transitionDuration;
                        area.dataset.targetType = areaData.targetType;
                        area.addEventListener('click', () => {
                            console.log('Clickable area clicked:', areaData); // Debug log
                            if (area.dataset.transitionGif) {
                                playTransition(area.dataset.transitionGif, area.dataset.transitionDuration, area.dataset.target, area.dataset.targetType);
                            } else {
                                navigateToTarget(area.dataset.target, area.dataset.targetType);
                            }
                        });
                        editor.appendChild(area);
                    });
                } else {
                    console.log('No areas to load for scene:', sceneName); // Debug log
                }
            } else {
                console.error('Scene not found:', sceneName); // Debug log
            }
        }

        function playTransition(transitionGif, duration, target, targetType) {
            console.log('Playing transition:', transitionGif); // Debug log
            const editor = document.getElementById('editor');
            editor.style.backgroundImage = \`url('\${transitionGif}')\`;
            setTimeout(() => {
                navigateToTarget(target, targetType);
            }, parseInt(duration, 10));
        }

        function navigateToTarget(target, targetType) {
            console.log('Navigating to target:', target, 'with type:', targetType); // Debug log
            if (targetType === 'state') {
                displayScene(target);
            } else if (targetType === 'external') {
                window.open(target, '_self');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            console.log('Document loaded, displaying initial scene'); // Debug log
            displayScene(currentScene);
        });
    </script>
</body>
</html>
    `;
}
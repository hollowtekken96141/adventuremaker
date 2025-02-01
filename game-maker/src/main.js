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
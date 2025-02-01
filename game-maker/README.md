# Point-and-Click Game Maker

## Overview
The Point-and-Click Game Maker is a single-page interactive application that allows users to create HTML webpages that string together GIFs with transition GIFs in between. Users can upload GIFs for each scene, manage scenes, and create clickable areas that link to different scenes.

## Project Structure
```
point-and-click-game-maker
├── src
│   ├── assets
│   │   └── gifs
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── package.json
└── README.md
```

## Features
- **Upload GIFs**: Users can upload GIFs for each scene.
- **Scene Management**: Add, delete, and rename scenes easily.
- **Clickable Areas**: Create resizable clickable areas with settings to determine scene links and transitions.
- **Mobile Optimization**: The application is optimized for mobile devices, with double-tap to zoom turned off and all GIFs stretching to fill the screen.

## Getting Started
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd point-and-click-game-maker
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Run the Application**: 
   ```
   npm start
   ```

4. **Open in Browser**: Navigate to `http://localhost:3000` to access the game maker.

## Usage
- Use the controls to upload GIFs for each scene.
- Manage scenes using the palette at the bottom of the application.
- Click on the canvas to create clickable areas and set their properties.
- Save your project to generate a static HTML file named `index.html` in the project directory.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
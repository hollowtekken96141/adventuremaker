const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.json({ limit: '50mb' })); // Increase payload size limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase payload size limit for URL-encoded data

// Serve files from the src directory
app.use(express.static(path.join(__dirname)));
// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

db.serialize(() => {
    db.run(`CREATE TABLE scenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        gif BLOB
    )`);

    db.run(`CREATE TABLE areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scene_id INTEGER,
        top TEXT,
        left TEXT,
        width TEXT,
        height TEXT,
        target TEXT,
        new_tab BOOLEAN,
        transition_gif BLOB,
        transition_duration INTEGER,
        target_type TEXT, -- Ensure target_type is included
        FOREIGN KEY(scene_id) REFERENCES scenes(id)
    )`);
});

app.get('/scenes', (req, res) => {
    db.all('SELECT * FROM scenes', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const scenes = rows.map(row => ({
                id: row.id,
                name: row.name,
                gif: row.gif ? `data:image/gif;base64,${row.gif.toString('base64')}` : ''
            }));
            res.json(scenes);
        }
    });
});

app.post('/scenes', (req, res) => {
    const { name, gif } = req.body;
    let gifBuffer = null;
    
    if (gif && gif.includes('base64')) {
        const base64Data = gif.split(',')[1];
        gifBuffer = Buffer.from(base64Data, 'base64');
    }
    
    db.run('INSERT OR REPLACE INTO scenes (name, gif) VALUES (?, ?)', 
        [name, gifBuffer], 
        function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ 
                    id: this.lastID, 
                    name, 
                    gif: gif || '' 
                });
            }
    });
});

app.put('/scenes/:id', (req, res) => {
    const { id } = req.params;
    const { name, gif } = req.body;
    let gifBuffer = null;
    
    if (gif && gif.includes('base64')) {
        const base64Data = gif.split(',')[1];
        gifBuffer = Buffer.from(base64Data, 'base64');
    }
    
    db.run('UPDATE scenes SET name = ?, gif = ? WHERE id = ?', [name, gifBuffer, id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.delete('/scenes/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM scenes WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.get('/areas/:scene_id', (req, res) => {
    const { scene_id } = req.params;
    db.all('SELECT * FROM areas WHERE scene_id = ?', [scene_id], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.post('/areas', (req, res) => {
    const { areas } = req.body;
    
    console.log('Received areas:', areas); // Debug log

    if (!areas || !Array.isArray(areas) || areas.length === 0) {
        return res.status(400).send('Invalid areas data');
    }

    // First delete existing areas for this scene
    db.run('DELETE FROM areas WHERE scene_id = ?', [areas[0].scene_id], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        
        // Then insert new areas
        const stmt = db.prepare('INSERT INTO areas (scene_id, top, left, width, height, target, new_tab, transition_gif, transition_duration, target_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

        areas.forEach(area => {
            let transitionGifBuffer = null;
            if (area.transition_gif && area.transition_gif.includes('base64')) {
                const base64Data = area.transition_gif.split(',')[1];
                transitionGifBuffer = Buffer.from(base64Data, 'base64');
            }
            stmt.run([area.scene_id, area.top, area.left, area.width, area.height, area.target, area.new_tab, transitionGifBuffer, area.transition_duration, area.target_type]);
        });
        
        stmt.finalize();
        res.json({ success: true });
    });
});

app.put('/areas/:id', (req, res) => {
    const { id } = req.params;
    const { top, left, width, height, target, new_tab, target_type } = req.body;
    db.run('UPDATE areas SET top = ?, left = ?, width = ?, height = ?, target = ?, new_tab = ?, target_type = ? WHERE id = ?', 
        [top, left, width, height, target, new_tab, target_type, id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.delete('/areas/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM areas WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

// Add endpoint to clear all storage and saved work
app.post('/clear-storage', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM scenes');
        db.run('DELETE FROM areas');
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
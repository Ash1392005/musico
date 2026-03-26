const express = require('express');
const YTMusic = require('@codyduong/ytmusicapi').default;
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

// Initialize YTMusic (no need for .initialize() in this version)
const ytmusic = new YTMusic();

// 1. Search Songs
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        // 'SONGS' filter ensures we get high quality audio tracks
        const results = await ytmusic.search(query, 'SONGS');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Streaming URL
app.get('/api/stream', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Video ID required' });

    try {
        const info = await ytdl.getInfo(id);
        const format = ytdl.chooseFormat(info.formats, { 
            quality: 'highestaudio',
            filter: 'audioonly' 
        });
        
        if (format && format.url) {
            res.redirect(format.url);
        } else {
            res.status(404).json({ error: 'Stream not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Stream error. YouTube might be rate-limiting." });
    }
});

app.get('/', (req, res) => res.send('YT Music API (Cody Duong version) is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;
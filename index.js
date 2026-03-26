const express = require('express');
const YTMusic = require('@codyduong/ytmusicapi');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

// Use the class directly
const ytmusic = new YTMusic();

// 1. Search Songs
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        // Try searching without filters first to ensure it works
        const results = await ytmusic.search(query);
        res.json(results);
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ 
            error: err.message,
            tip: "If this is a 404, YouTube might be blocking Vercel. Try deploying to Render.com or Railway.app which have better success rates with YT Music."
        });
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
        console.error('Stream Error:', err);
        res.status(500).json({ error: "Stream error. YouTube is likely blocking the request." });
    }
});

app.get('/', (req, res) => res.send('YT Music API is running! Try /api/search?query=Bairan'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;

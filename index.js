const express = require('express');
const YTMusic = require('ytmusic-api').default;
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

let ytmusic;

// Initialize YTMusic
const init = async () => {
    if (!ytmusic) {
        ytmusic = new YTMusic();
        await ytmusic.initialize();
    }
};

// 1. Search Songs
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        await init();
        const results = await ytmusic.search(query);
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
        res.status(500).json({ error: "YouTube is blocking Vercel. Consider using Render.com" });
    }
});

// Root check
app.get('/', (req, res) => res.send('YT Music API is Live!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;
const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

/**
 * Music Player Command
 * Downloads YouTube videos as MP3 audio
 */
cmd({ 
    pattern: "play", 
    alias: ["song", "music"], 
    react: "🎵", 
    desc: "Download YouTube music", 
    category: "media", 
    use: '.play <song name>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, text, reply }) => { 
    try {
        if (!text) {
            return await reply('🎵 *Music Player*\nPlease provide a song name to play.');
        }

        const search = await yts(text);
        const video = search.videos[0];

        if (!video) {
            return await reply('❌ No songs found for your query.');
        }

        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp3`;
        const BASE_URL = 'https://apis-keith.vercel.app';
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

        const response = await axios.get(apiURL);
        const data = response.data;

        if (!data.downloadLink) {
            console.log('API Response:', data);
            return await reply('❌ *Download Failed*\nNo download link found in API response.');
        }

        // Send only audio
        await conn.sendMessage(from, {
            audio: { url: data.downloadLink },
            mimetype: 'audio/mpeg',
            fileName: fileName
        }, { quoted: mek });

    } catch (error) {
        console.error('[PLAY ERROR]', error);
        await reply('❌ Failed to process your song request: ' + error.message);
    }
});

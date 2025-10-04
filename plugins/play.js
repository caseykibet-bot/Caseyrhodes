const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

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
        if (!text) return await reply('🎵 Please provide a song name.');

        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await reply('❌ No songs found.');

        // Try different API endpoints
        const apiURL = `https://apis-keith.vercel.app/download/ytmp3?url=https://youtu.be/${video.videoId}`;
        
        const response = await axios.get(apiURL);
        const data = response.data;

        let audioUrl = data.downloadUrl || data.url || data.result?.url;

        if (!audioUrl) {
            return await reply('❌ Could not get audio URL from API.');
        }

        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`.replace(/[\\/:*?"<>|]/g, '')
        }, { quoted: mek });

    } catch (error) {
        console.error('[PLAY ERROR]', error);
        await reply('❌ Error: ' + error.message);
    }
});

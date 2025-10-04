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

        await reply('🔍 Searching...');
        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await reply('❌ No results.');

        await reply('⬇️ Downloading...');
        
        const apiURL = `https://apis-keith.vercel.app/download/ytmp3?url=https://youtu.be/${video.videoId}`;
        const response = await axios.get(apiURL);
        const data = response.data;

        const downloadLink = data.downloadUrl || data.url;

        if (!downloadLink) {
            return await reply('❌ No audio link found.');
        }

        // Simple audio send
        await conn.sendMessage(from, {
            audio: { url: downloadLink },
            mimetype: 'audio/mpeg'
        }, { quoted: mek });

        await reply(`✅ Done! ${video.title}`);

    } catch (error) {
        console.error(error);
        await reply('❌ Error: ' + error.message);
    }
});

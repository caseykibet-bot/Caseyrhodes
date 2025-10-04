const config = require('../config');
const { cmd } = require('../command');
const BASE_URL = 'https://apis-keith.vercel.app';
const yts = require('yt-search');
const axios = require('axios');

/**
 * Music Player Command
 * Downloads YouTube videos as MP3 audio using specified API
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

        // Create newsletter-style description
        const songInfo = `
🎧 *MUSIC NEWSLETTER* 🎧

📀 *Title:* ${video.title}
👤 *Channel:* ${video.author?.name || 'Unknown'}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube URL:* https://youtu.be/${video.videoId}

📝 *Description:*
${video.description ? (video.description.length > 200 ? video.description.substring(0, 200) + '...' : video.description) : 'No description available.'}
        `.trim();

        // Send song info with thumbnail
        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: songInfo
        }, { quoted: mek });

        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp3`;
        const BASE_URL = 'https://apis-keith.vercel.app';
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

        const response = await axios.get(apiURL);
        const data = response.data;

        if (!data.downloadLink) {
            return await reply('❌ *Download Failed*\nFailed to retrieve the MP3 download link. Please try again later.');
        }

        // Send audio with externalAdReply
        await conn.sendMessage(from, {
            audio: { url: data.downloadLink },
            mimetype: 'audio/mpeg',
            fileName: fileName,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: video.title.substring(0, 30),
                    body: `${video.author?.name || 'Unknown'} • ${video.timestamp}`,
                    mediaType: 2,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: `https://youtu.be/${video.videoId}`,
                    mediaUrl: `https://youtu.be/${video.videoId}`
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error('[PLAY ERROR]', error);
        await reply('❌ Failed to process your song request.');
    }
});

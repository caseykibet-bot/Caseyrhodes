const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const BASE_URL = 'https://noobs-api.top';

cmd({
    pattern: "video",
    alias: ["ytvideo", "download"],
    desc: "Download YouTube videos",
    react: "🎬",
    category: "download",
    filename: __filename,
},
async (conn, mek, m, { from, reply, text }) => {
    if (!text) {
        return reply('🎬 *Video Downloader*\nPlease provide a video name to download.');
    }

    try {
        const search = await yts(text);
        const video = search.videos[0];

        if (!video) {
            return reply('❌ *No Results Found*\nNo videos found for your query. Please try different keywords.');
        }

        // Create fancy video description with emojis and formatting
        const videoInfo = `
🎬 *NOW DOWNLOADING* 🎬

📹 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube ID:* ${video.videoId}

⬇️ *Downloading your video... Please wait* ⬇️
        `.trim();

        // Send video info with thumbnail first
        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: videoInfo
        }, { quoted: mek });

        // API PART UNCHANGED
        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp4`;
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

        const response = await axios.get(apiURL);
        const data = response.data;

        if (!data.downloadLink) {
            return reply('❌ *Download Failed*\nFailed to retrieve the MP4 download link. Please try again later.');
        }

        // Send video with newsletter context
        await conn.sendMessage(from, {
            video: { url: data.downloadLink },
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n📥 Downloaded by CASEYRHODES-XMD`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: 'CASEYRHODES TECH 👑',
                    serverMessageId: -1
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error('[VIDEO] Error:', err);
        reply('❌ *Error Occurred*\nFailed to process your video request. Please try again later.');
    }
});

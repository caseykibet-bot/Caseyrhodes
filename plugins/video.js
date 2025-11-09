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
        console.log(`[VIDEO] Searching for: ${text}`); // Debug log
        
        const search = await yts(text);
        const video = search.videos[0];

        if (!video) {
            return reply('❌ *No Results Found*\nNo videos found for your query.');
        }

        console.log(`[VIDEO] Found: ${video.title}`); // Debug log

        const videoInfo = `🎬 *NOW DOWNLOADING* 🎬

📹 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube ID:* ${video.videoId}

⬇️ *Downloading... Please wait* ⬇️`.trim();

        // Send video info
        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: videoInfo
        }, { quoted: mek });

        // Enhanced API request with timeout
        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp4`;
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

        console.log(`[VIDEO] Fetching from API: ${apiURL}`); // Debug log

        const response = await axios.get(apiURL, { 
            timeout: 30000, // 30 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const data = response.data;
        console.log(`[VIDEO] API Response:`, data); // Debug log

        if (!data.downloadLink) {
            return reply('❌ *Download Failed*\nNo download link received from API.');
        }

        // Send video
        await conn.sendMessage(from, {
            video: { url: data.downloadLink },
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}`,
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
        console.error('[VIDEO] Full Error:', err);
        
        if (err.code === 'ECONNABORTED') {
            reply('❌ *Timeout Error*\nThe request took too long. Please try again.');
        } else if (err.response) {
            reply('❌ *API Error*\nThe download service is currently unavailable.');
        } else {
            reply('❌ *Unexpected Error*\nPlease try again later.');
        }
    }
});

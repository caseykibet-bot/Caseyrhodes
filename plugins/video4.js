const config = require('../config');
const { cmd } = require('../command');
const ytsr = require('yt-search');
const fetch = require('node-fetch'); // Make sure to install node-fetch if not already present

cmd({ 
    pattern: "vid", 
    alias: ["video", "ytv"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.video <YT url or search term>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("*Please provide a YouTube URL or video name*");
        
        // Search for videos if it's not a direct URL
        let video;
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            // If it's a direct URL, extract video ID
            const videoId = q.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            if (!videoId) return reply("❌ Invalid YouTube URL");
            
            const videoInfo = await ytsr({ videoId });
            if (!videoInfo) return reply("❌ Could not fetch video details.");
            
            video = {
                title: videoInfo.title,
                timestamp: videoInfo.timestamp,
                views: videoInfo.views,
                author: { name: videoInfo.author.name },
                url: `https://youtu.be/${videoId}`,
                thumbnail: videoInfo.thumbnail
            };
        } else {
            // Search for videos
            const searchResults = await ytsr(q);
            if (!searchResults.videos || searchResults.videos.length < 1) {
                return reply("❌ No results found!");
            }
            video = searchResults.videos[0];
        }
        
        // Use the API to fetch download URL
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(video.url)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data || !data.downloadUrl) {
            return reply("❌ Failed to fetch video. Try again later.");
        }
        
        const infoMsg = `╔═══〔 *VIDEO DOWNLOADER* 〕═══❒
║╭───────────────◆  
║│ *Title:* ${video.title}
║│ *Duration:* ${video.timestamp}
║│ *Views:* ${video.views}
║│ *Author:* ${video.author.name}
║│ *Link:* ${video.url}
╚══════════════════❒`;

        // Send video info with thumbnail
        await conn.sendMessage(from, { 
            image: { url: video.thumbnail }, 
            caption: infoMsg 
        }, { quoted: mek });
        
        // Send the video file
        await conn.sendMessage(from, { 
            video: { url: data.downloadUrl }, 
            mimetype: "video/mp4",
            caption: `📥 *${video.title}*\n⬇️ Downloaded via YouTube API`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in video command:", e);
        reply("❌ An error occurred. Please try again later.");
    }
});

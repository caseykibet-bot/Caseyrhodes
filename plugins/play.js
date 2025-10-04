const config = require('../config');
const { cmd } = require('../command');
const BASE_URL = 'https://noobs-api.top';
const yts = require('yt-search');

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

        // Send searching message
        await reply('🔍 *Searching for your song...*');

        const search = await yts(text);
        const video = search.videos[0];

        if (!video) {
            return await reply('❌ *No Results Found*\nNo songs found for your query. Please try different keywords.');
        }

        // Create enhanced newsletter-style description
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

⬇️ *Downloading your audio... Please wait* ⬇️
        `.trim();

        // Send song info with thumbnail first
        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: songInfo
        }, { quoted: mek });

        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp3`;
        const BASE_URL = 'https://apis-keith.vercel.app'; // Define BASE_URL
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

        // Send processing message
        await reply('🎵 *Fetching audio from YouTube...*');

        try {
            // Fetch from your API endpoint
            const response = await fetch(apiURL);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const data = await response.json();

            // Check for downloadLink in response
            if (!data.downloadLink) {
                console.log('API Response structure:', data);
                return await reply('❌ *Download Failed*\nThe API did not return a valid download link. Response structure may have changed.');
            }

            const downloadLink = data.downloadLink;

            // Validate download link
            if (!downloadLink.startsWith('http')) {
                return await reply('❌ *Invalid Download Link*\nThe returned download link is not valid.');
            }

            // Send audio with metadata
            await conn.sendMessage(from, {
                audio: { url: downloadLink },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                ptt: false
            }, { quoted: mek });

            // Send success message
            await reply(`✅ *Download Complete!*\n\n🎶 "${video.title}"\n📁 Saved as: ${fileName}\n\nEnjoy your music! 🎧`);

        } catch (apiError) {
            console.error('[API ERROR]', apiError);
            await reply('❌ *API Error*\nFailed to fetch audio from the download service. Please try again later.');
        }

    } catch (error) {
        console.error('[PLAY ERROR]', error);
        await reply('❌ *Error Occurred*\nFailed to process your song request. Please try again later.');
    }
});

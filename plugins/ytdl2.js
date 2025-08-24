const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js'); 

// Store user choices temporarily
const userChoices = new Map();

cmd({ 
    pattern: "video", 
    alias: ["video", "ytv"], 
    react: "🎥", 
    desc: "Download Youtube video", 
    category: "main", 
    use: '.video <Yt url or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply, sender }) => { 
    try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐕ιɖє๏ 𝐍αмє..*");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.download_url) {
            return reply("Failed to fetch the video. Please try again later.");
        }
        
        // Store video data for this user
        userChoices.set(sender, {
            downloadUrl: data.result.download_url,
            title: yts.title,
            thumbnail: data.result.thumbnail || ''
        });
        
        // Format message like in the image
        let ytmsg = `*Vievo channel*\n\n` +
                   `*Video ${yts.title}*\n` +
                   `${yts.timestamp}\n\n` +
                   `_Forwarded many times_\n` +
                   `Get more info about this message. Search on web\n` +
                   `*CASEYRHODES-TECH*\n` +
                   `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\n` +
                   `*casey*\n` +
                   `- video ${yts.title}\n` +
                   `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\n` +
                   `*Video Details*\n` +
                   `*Title:* ${yts.title}\n` +
                   `*Duration:* ${yts.timestamp}\n\n` +
                   `*Views:* ${yts.views}\n` +
                   `*Author:* ${yts.author.name}\n` +
                   `*Link:* ${yts.url}\n\n` +
                   `*Choose download format:*\n` +
                   `1. *Document* (no preview)\n` +
                   `2. *Normal Video* (with preview)\n\n` +
                   `Reply to this message with 1 or 2 to download.`;
        
        // Send video details with format options
        await conn.sendMessage(from, { 
            image: { url: data.result.thumbnail || '' }, 
            caption: ytmsg 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

// Handle user format selection
cmd({
    on: "text",
    fromMe: false,
    dontAddCommandList: true
}, async (conn, mek, m, { from, sender, reply, quotedMsg }) => {
    try {
        // Check if this is a response to a video request
        if (userChoices.has(sender) && quotedMsg) {
            const choice = mek.text.trim();
            const videoData = userChoices.get(sender);
            
            if (choice === '1' || choice === '2') {
                // Remove user choice to prevent re-triggering
                userChoices.delete(sender);
                
                if (choice === '1') {
                    // Send as document
                    await conn.sendMessage(from, { 
                        document: { url: videoData.downloadUrl }, 
                        mimetype: "video/mp4", 
                        fileName: `${videoData.title.replace(/[^\w\s]/gi, '')}.mp4`, 
                        caption: `📁 ${videoData.title}\n_© ᴘᴏᴡᴇʀᴇᴅ ʙʏ caseyrjodes_`
                    }, { quoted: mek });
                } else if (choice === '2') {
                    // Send as normal video
                    await conn.sendMessage(from, { 
                        video: { url: videoData.downloadUrl }, 
                        mimetype: "video/mp4",
                        caption: `🎥 ${videoData.title}\n_© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇɪᴛʜ-ᴛᴇᴄʜ_`
                    }, { quoted: mek });
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
});

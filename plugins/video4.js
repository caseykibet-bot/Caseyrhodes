const config = require('../config');
const { cmd } = require('../command');
const ytsr = require('yt-search');
const fetch = require('node-fetch'); // Make sure to install node-fetch if not already present

// Video download command
cmd({ 
    pattern: "vid", 
    alias: ["ytdl", "vid"], 
    react: "🎬", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.video < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or video name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the video. Please try again later.");
        }
        
        let ytmsg = `🎬 *Video Details*
📹 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

*Choose download format:*
1. 📁 Video as Document (High Quality)
2. � Video as Normal Message
3. 🎧 Audio Only (MP3)

_Reply with 1, 2 or 3 to this message to download the format you prefer._`;
        
        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363302677217436@newsletter',
                newsletterName: 'CASEYRHODES-TECH',
                serverMessageId: 143
            }
        };
        
        // Send thumbnail with caption only
        const vidmsg = await conn.sendMessage(from, { image: { url: yts.thumbnail }, caption: ytmsg, contextInfo }, { quoted: mek });

        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const vidChoice = msgUpdate.messages[0];
            if (!vidChoice.message || !vidChoice.message.extendedTextMessage) return;

            const selectedOption = vidChoice.message.extendedTextMessage.text.trim();

            if (
                vidChoice.message.extendedTextMessage.contextInfo &&
                vidChoice.message.extendedTextMessage.contextInfo.stanzaId === vidmsg.key.id
            ) {
                await conn.sendMessage(from, { react: { text: "⬇️", key: vidChoice.key } });

                switch (selectedOption) {
                    case "1":   
                        // Video as document
                        await conn.sendMessage(
                            from, 
                            { 
                                document: { url: data.result.downloadUrl }, 
                                mimetype: "video/mp4", 
                                fileName: `${yts.title}.mp4`, 
                                contextInfo 
                            }, 
                            { quoted: vidChoice }
                        );
                        break;
                        
                    case "2":   
                        // Normal video message
                        await conn.sendMessage(
                            from, 
                            { 
                                video: { url: data.result.downloadUrl }, 
                                caption: `📹 *${yts.title}*`, 
                                contextInfo 
                            }, 
                            { quoted: vidChoice }
                        );
                        break;
                        
                    case "3":   
                        // Audio only
                        await conn.sendMessage(
                            from, 
                            { 
                                audio: { url: data.result.downloadUrl }, 
                                mimetype: "audio/mpeg", 
                                fileName: `${yts.title}.mp3`,
                                contextInfo 
                            }, 
                            { quoted: vidChoice }
                        );
                        break;

                    default:
                        await conn.sendMessage(
                            from,
                            {
                                text: "*Invalid selection! Please reply with 1, 2 or 3* 🔴",
                            },
                            { quoted: vidChoice }
                        );
                }
            }
        });
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

async function ytsearch(query) {
    try {
        const res = await ytsr(query);
        return res;
    } catch (error) {
        console.error('YouTube search error:', error);
        return { results: [] };
    }
}

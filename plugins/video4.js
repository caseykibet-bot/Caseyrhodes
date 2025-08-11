const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// Video download command
cmd({ 
    pattern: "vid", 
    alias: ["ytdlv", "playvideo"], 
    react: "🎬", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.video <Yt url or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or video name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(yts.url)}`;
        
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
1. 📄 Video as Document
2. 🎥 Video as Normal Video

_Reply with 1 or 2 to this message to download the format you prefer._`;
        
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
        const videomsg = await conn.sendMessage(from, { image: { url: yts.thumbnail }, caption: ytmsg, contextInfo }, { quoted: mek });

        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const vidmsg = msgUpdate.messages[0];
            if (!vidmsg.message || !vidmsg.message.extendedTextMessage) return;

            const selectedOption = vidmsg.message.extendedTextMessage.text.trim();

            if (
                vidmsg.message.extendedTextMessage.contextInfo &&
                vidmsg.message.extendedTextMessage.contextInfo.stanzaId === videomsg.key.id
            ) {
                await conn.sendMessage(from, { react: { text: "⬇️", key: vidmsg.key } });

                switch (selectedOption) {
                    case "1":   
                        await conn.sendMessage(from, { 
                            document: { url: data.result.downloadUrl }, 
                            mimetype: "video/mp4", 
                            fileName: `${yts.title}.mp4`, 
                            contextInfo 
                        }, { quoted: vidmsg });   
                        break;
                    case "2":   
                        await conn.sendMessage(from, { 
                            video: { url: data.result.downloadUrl }, 
                            mimetype: "video/mp4", 
                            caption: yts.title,
                            contextInfo 
                        }, { quoted: vidmsg });
                        break;
                    default:
                        await conn.sendMessage(
                            from,
                            {
                                text: "*Invalid selection please select between (1 or 2) 🔴*",
                            },
                            { quoted: vidmsg }
                        );
                }
            }
        });
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

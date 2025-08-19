const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// MP3 song download
cmd({ 
    pattern: "song2", 
    alias: ["ytdl3", "play"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Please try again later.");
        }
        
        let ytmsg = `🎵 *Song Details*
🎶 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

*Choose download format:*`;
        
        // Create buttons for format selection
        const buttons = [
            {buttonId: '1', buttonText: {displayText: '📄 MP3 Document'}, type: 1},
            {buttonId: '2', buttonText: {displayText: '🎧 MP3 Audio'}, type: 1},
            {buttonId: '3', buttonText: {displayText: '🎙️ MP3 Voice Note'}, type: 1}
        ];
        
        const buttonMessage = {
            image: { url: yts.thumbnail },
            caption: ytmsg,
            footer: 'Select a format',
            buttons: buttons,
            headerType: 4, // 4 means image message with buttons
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        };
        
        // Send message with buttons
        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        
        // Create a function to handle button responses
        const buttonHandler = async (msg) => {
            // Check if this is a response to our button message
            if (msg.key && msg.key.remoteJid === from && msg.message && msg.message.buttonsResponseMessage) {
                const selectedOption = msg.message.buttonsResponseMessage.selectedButtonId;
                
                // Add a reaction to show processing
                await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });
                
                // Remove the event listener to prevent multiple handlers
                conn.ev.off('messages.upsert', buttonHandler);
                
                switch (selectedOption) {
                    case "1":   
                        await conn.sendMessage(from, { 
                            document: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            fileName: `${yts.title}.mp3`
                        }, { quoted: msg });
                        break;
                    case "2":   
                        await conn.sendMessage(from, { 
                            audio: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg"
                        }, { quoted: msg });
                        break;
                    case "3":   
                        await conn.sendMessage(from, { 
                            audio: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            ptt: true
                        }, { quoted: msg });
                        break;
                    default:
                        await conn.sendMessage(
                            from,
                            {
                                text: "*Invalid selection. Please try again.*",
                            },
                            { quoted: msg }
                        );
                }
            }
        };
        
        // Add event listener for button responses
        conn.ev.on('messages.upsert', buttonHandler);
        
        // Set a timeout to remove the event listener after some time
        setTimeout(() => {
            conn.ev.off('messages.upsert', buttonHandler);
        }, 60000); // Remove after 60 seconds
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

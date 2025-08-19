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
        
        // Create buttons for format selection using latest Baileys format
        const buttons = [
            {
                buttonId: 'mp3_document',
                buttonText: { displayText: '📄 MP3 Document' },
                type: 1
            },
            {
                buttonId: 'mp3_audio',
                buttonText: { displayText: '🎧 MP3 Audio' },
                type: 1
            },
            {
                buttonId: 'mp3_voice',
                buttonText: { displayText: '🎙️ MP3 Voice Note' },
                type: 1
            }
        ];
        
        const buttonMessage = {
            image: { url: yts.thumbnail },
            caption: ytmsg,
            footer: config.exif.footer,
            buttons: buttons,
            headerType: 4,
            viewOnce: true
        };
        
        // Send message with buttons
        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        
        // Generate a unique ID for this button interaction
        const interactionId = `song_dl_${Date.now()}`;
        
        // Create a function to handle button responses
        const buttonHandler = async (msg) => {
            try {
                // Check if this is a response to our button message
                if (msg.key && msg.key.remoteJid === from && 
                    msg.message && msg.message.buttonsResponseMessage &&
                    msg.message.buttonsResponseMessage.contextInfo.stanzaId === mek.key.id) {
                    
                    const selectedOption = msg.message.buttonsResponseMessage.selectedButtonId;
                    
                    // Add a reaction to show processing
                    await conn.sendMessage(from, { 
                        react: { text: "⬇️", key: msg.key } 
                    });
                    
                    // Remove the event listener to prevent multiple handlers
                    conn.ev.off('messages.upsert', buttonHandler);
                    
                    switch (selectedOption) {
                        case "mp3_document":   
                            await conn.sendMessage(from, { 
                                document: { url: data.result.downloadUrl }, 
                                mimetype: "audio/mpeg", 
                                fileName: `${yts.title.replace(/[^\w\s]/gi, '')}.mp3`
                            }, { quoted: msg });
                            break;
                        case "mp3_audio":   
                            await conn.sendMessage(from, { 
                                audio: { url: data.result.downloadUrl }, 
                                mimetype: "audio/mpeg",
                                fileName: `${yts.title.replace(/[^\w\s]/gi, '')}.mp3`
                            }, { quoted: msg });
                            break;
                        case "mp3_voice":   
                            await conn.sendMessage(from, { 
                                audio: { url: data.result.downloadUrl }, 
                                mimetype: "audio/mpeg; codecs=opus", 
                                ptt: true,
                                fileName: `${yts.title.replace(/[^\w\s]/gi, '')}.mp3`
                            }, { quoted: msg });
                            break;
                        default:
                            await conn.sendMessage(
                                from,
                                { text: "*Invalid selection. Please try again.*" },
                                { quoted: msg }
                            );
                    }
                }
            } catch (error) {
                console.error("Error in button handler:", error);
                await conn.sendMessage(
                    from,
                    { text: "An error occurred while processing your request." },
                    { quoted: msg }
                );
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

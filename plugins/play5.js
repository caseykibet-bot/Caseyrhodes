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
        
        // Create buttons for format selection
        const buttons = [
            {buttonId: 'format1', buttonText: {displayText: '📄 MP3 Document'}, type: 1},
            {buttonId: 'format2', buttonText: {displayText: '🎧 MP3 Audio'}, type: 1},
            {buttonId: 'format3', buttonText: {displayText: '🎙️ MP3 Voice Note'}, type: 1}
        ];
        
        const buttonMessage = {
            image: { url: yts.thumbnail },
            caption: ytmsg,
            footer: 'Select a format',
            buttons: buttons,
            headerType: 4,
            contextInfo: contextInfo
        };
        
        // Send message with buttons
        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        
        // Handle button responses
        conn.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            
            if (msg.message?.buttonsResponseMessage && 
                msg.message.buttonsResponseMessage.contextInfo?.stanzaId === mek.key.id) {
                
                const selectedFormat = msg.message.buttonsResponseMessage.selectedButtonId;
                
                await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });
                
                switch (selectedFormat) {
                    case 'format1':
                        await conn.sendMessage(from, { 
                            document: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            fileName: `${yts.title}.mp3`, 
                            contextInfo 
                        }, { quoted: msg });
                        break;
                        
                    case 'format2':
                        await conn.sendMessage(from, { 
                            audio: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            contextInfo 
                        }, { quoted: msg });
                        break;
                        
                    case 'format3':
                        await conn.sendMessage(from, { 
                            audio: { url: data.result.downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            ptt: true, 
                            contextInfo 
                        }, { quoted: msg });
                        break;
                }
            }
        });
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

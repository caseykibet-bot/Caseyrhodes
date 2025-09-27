const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

/**
 * MP3 Audio Download Command (Play)
 * Downloads YouTube videos as MP3 audio with multiple format options
 * 
 * Features:
 * - Search YouTube videos by name or URL
 * - Provide audio details (title, duration, views, author)
 * - Three download formats: Document, Audio, Voice Note (PTT)
 * - Interactive selection via reply system
 * 
 * Usage: .play <YouTube URL or search query>
 */
cmd({ 
    pattern: "play", 
    alias: ["ytdl3", "song"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.play <YouTube URL or search query>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        // Validate input
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        // Search YouTube
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        // Get first result
        let yts = yt.results[0];  
        let apiUrl = `https://casper-tech-apis.vercel.app/api/ytmp4?url=${encodeURIComponent(yts.url)}`;
        
        // Fetch audio data from API
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        // Debug: Log the actual response structure
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        // Validate API response - check multiple possible structures
        let downloadUrl = null;
        if (data.status === 'success' && data.data && data.data.downloads) {
            // Find audio download from the downloads array
            const audioDownload = data.data.downloads.find(d => d.quality && d.downloadUrl);
            if (audioDownload) {
                downloadUrl = audioDownload.downloadUrl;
            }
        } else if (data.success && data.result && data.result.downloadUrl) {
            // Alternative structure
            downloadUrl = data.result.downloadUrl;
        } else if (data.success && data.result && data.result.download_url) {
            // Another possible structure
            downloadUrl = data.result.download_url;
        }
        
        if (!downloadUrl) {
            console.log('No download URL found in response:', data);
            return reply("Failed to fetch the audio. Please try again later.");
        }
        
        // Format audio details message
        let ytmsg = `🎵 *Song Details*
🎶 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

*Choose download format:*
1. 📄 MP3 as Document
2. 🎧 MP3 as Audio (Play)
3. 🎙️ MP3 as Voice Note (PTT)

_Reply with 1, 2 or 3 to this message to download the format you prefer._`;
        
        // Context info with newsletter reference for description message
        let contextInfo = {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363302677217436@newsletter',
                newsletterName: 'POWERED BY CASEYRHODES TECH',
                serverMessageId: -1
            }
        };
        
        // Send thumbnail with caption and newsletter context
        const songmsg = await conn.sendMessage(from, { 
            image: { url: yts.thumbnail }, 
            caption: ytmsg, 
            contextInfo 
        }, { quoted: mek });

        // Handle user selection
        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const mp3msg = msgUpdate.messages[0];
            if (!mp3msg.message || !mp3msg.message.extendedTextMessage) return;

            const selectedOption = mp3msg.message.extendedTextMessage.text.trim();

            // Verify this is a reply to our song message
            if (
                mp3msg.message.extendedTextMessage.contextInfo &&
                mp3msg.message.extendedTextMessage.contextInfo.stanzaId === songmsg.key.id
            ) {
                await conn.sendMessage(from, { react: { text: "⬇️", key: mp3msg.key } });

                // Clean context for download messages (no newsletter)
                let downloadContextInfo = {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                };

                // Handle format selection
                switch (selectedOption) {
                    case "1": // Document format
                        await conn.sendMessage(from, { 
                            document: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            fileName: `${yts.title}.mp3`, 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });   
                        break;
                        
                    case "2": // Audio format
                        await conn.sendMessage(from, { 
                            audio: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });
                        break;
                        
                    case "3": // Voice note format (PTT)
                        await conn.sendMessage(from, { 
                            audio: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            ptt: true, 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });
                        break;

                    default: // Invalid selection
                        await conn.sendMessage(
                            from,
                            { text: "*Invalid selection. Please choose 1, 2 or 3 🔴*" },
                            { quoted: mp3msg }
                        );
                }
            }
        });
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

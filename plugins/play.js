const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

/**
 * MP3 Audio Download Command (Play)
 * Downloads YouTube videos as compressed MP3 audio
 * 
 * Features:
 * - Search YouTube videos by name or URL
 * - Provide audio details (title, duration, views, author)
 * - Three download formats with compressed audio
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
        
        // Use audio-specific API endpoint for smaller file sizes
        let apiUrl = `https://casper-tech-apis.vercel.app/api/ytmp3?url=${encodeURIComponent(yts.url)}`;
        
        // Alternative APIs if the above fails
        // let apiUrl = `https://api.heckerman06.repl.co/api/yta?url=${encodeURIComponent(yts.url)}`;
        // let apiUrl = `https://yt-downloader.qtcloud.workers.dev/audio?url=${encodeURIComponent(yts.url)}`;
        
        // Fetch audio data from API
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        // Debug: Log the actual response structure
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        // Validate API response - check multiple possible structures
        let downloadUrl = null;
        let fileSize = null;
        
        if (data.status === 'success' && data.data) {
            // Structure 1: Direct audio link
            if (data.data.downloadUrl) downloadUrl = data.data.downloadUrl;
            // Structure 2: Downloads array
            else if (data.data.downloads && data.data.downloads.length > 0) {
                const audioDownload = data.data.downloads.find(d => d.quality && d.downloadUrl);
                if (audioDownload) downloadUrl = audioDownload.downloadUrl;
            }
            // Structure 3: Result object
            else if (data.data.result && data.data.result.downloadUrl) {
                downloadUrl = data.data.result.downloadUrl;
            }
        } else if (data.success && data.result) {
            // Alternative structure
            if (data.result.downloadUrl) downloadUrl = data.result.downloadUrl;
            else if (data.result.url) downloadUrl = data.result.url;
            else if (data.result.audio) downloadUrl = data.result.audio;
        } else if (data.url) {
            // Simple URL response
            downloadUrl = data.url;
        }
        
        if (!downloadUrl) {
            console.log('No download URL found in response:', data);
            return reply("Failed to fetch the audio. Please try again later.");
        }
        
        // Add compression parameters to URL if possible
        if (downloadUrl.includes('?')) {
            downloadUrl += '&quality=low&format=mp3';
        } else {
            downloadUrl += '?quality=low&format=mp3';
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

        // Store download info for this message
        const downloadInfo = {
            url: downloadUrl,
            title: yts.title,
            timestamp: Date.now()
        };
        
        // Simple storage for message context (you might want to use a proper cache)
        if (!conn.playCache) conn.playCache = new Map();
        conn.playCache.set(songmsg.key.id, downloadInfo);
        
        // Set timeout to clear cache (5 minutes)
        setTimeout(() => {
            if (conn.playCache.has(songmsg.key.id)) {
                conn.playCache.delete(songmsg.key.id);
            }
        }, 5 * 60 * 1000);

        // Handle user selection
        const messageHandler = async (msgUpdate) => {
            try {
                const mp3msg = msgUpdate.messages[0];
                if (!mp3msg || !mp3msg.message || !mp3msg.message.extendedTextMessage) return;

                const selectedOption = mp3msg.message.extendedTextMessage.text.trim();

                // Verify this is a reply to our song message
                if (
                    mp3msg.message.extendedTextMessage.contextInfo &&
                    mp3msg.message.extendedTextMessage.contextInfo.stanzaId === songmsg.key.id
                ) {
                    // Remove listener to prevent multiple triggers
                    conn.ev.off("messages.upsert", messageHandler);
                    
                    await conn.sendMessage(from, { react: { text: "⬇️", key: mp3msg.key } });

                    // Get download info from cache
                    const info = conn.playCache.get(songmsg.key.id);
                    if (!info) {
                        return await conn.sendMessage(from, 
                            { text: "Download session expired. Please search again." }, 
                            { quoted: mp3msg }
                        );
                    }

                    // Clean context for download messages
                    let downloadContextInfo = {
                        mentionedJid: [mp3msg.participant || mp3msg.key.remoteJid],
                        forwardingScore: 999,
                        isForwarded: true
                    };

                    // Handle format selection with file size optimization
                    const audioMessageOptions = {
                        mimetype: "audio/mpeg",
                        contextInfo: downloadContextInfo
                    };

                    switch (selectedOption) {
                        case "1": // Document format
                            await conn.sendMessage(from, { 
                                document: { url: info.url }, 
                                mimetype: "audio/mpeg", 
                                fileName: `${info.title.substring(0, 100)}.mp3`, 
                                contextInfo: downloadContextInfo 
                            }, { quoted: mp3msg });   
                            break;
                            
                        case "2": // Audio format
                            await conn.sendMessage(from, { 
                                audio: { url: info.url }, 
                                ...audioMessageOptions
                            }, { quoted: mp3msg });
                            break;
                            
                        case "3": // Voice note format (PTT)
                            await conn.sendMessage(from, { 
                                audio: { url: info.url }, 
                                ...audioMessageOptions,
                                ptt: true
                            }, { quoted: mp3msg });
                            break;

                        default: // Invalid selection
                            await conn.sendMessage(
                                from,
                                { text: "*Invalid selection. Please choose 1, 2 or 3 🔴*" },
                                { quoted: mp3msg }
                            );
                            // Re-add listener for new attempts
                            conn.ev.on("messages.upsert", messageHandler);
                    }
                    
                    // Clear cache after successful download
                    conn.playCache.delete(songmsg.key.id);
                }
            } catch (error) {
                console.log("Error in message handler:", error);
                // Re-add listener on error
                conn.ev.on("messages.upsert", messageHandler);
            }
        };

        // Add the message listener
        conn.ev.on("messages.upsert", messageHandler);
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

const { cmd } = require('../command');
const converter = require("../data/play-converter");
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

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
}, async (conn, mek, m, { from, prefix, quoted, q, reply, externaladreply }) => { 
    try { 
        // Validate input
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        // Search YouTube
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        // Get first video result
        const videoData = yt.results[0];
        
        // Fetch audio download URL
        const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(videoData.title)}`;
        const apiResponse = await fetch(apiUrl);
        const apiData = await apiResponse.json();

        // Debug: Log the actual response structure
        console.log('API Response:', JSON.stringify(apiData, null, 2));
        
        // Validate API response - check multiple possible structures
        let downloadUrl = null;
        if (apiData.status === 'success' && apiData.data && apiData.data.downloads) {
            // Find audio download from the downloads array
            const audioDownload = apiData.data.downloads.find(d => d.quality && d.downloadUrl);
            if (audioDownload) {
                downloadUrl = audioDownload.downloadUrl;
            }
        } else if (apiData.success && apiData.result && apiData.result.downloadUrl) {
            // Alternative structure
            downloadUrl = apiData.result.downloadUrl;
        } else if (apiData.success && apiData.result && apiData.result.download_url) {
            // Another possible structure
            downloadUrl = apiData.result.download_url;
        } else if (apiData?.result?.download_url || apiData?.result?.downloadUrl) {
            // Direct access structure
            downloadUrl = apiData.result.download_url || apiData.result.downloadUrl;
        }
        
        if (!downloadUrl) {
            console.log('No download URL found in response:', apiData);
            return reply("Failed to fetch the audio. Please try again later.");
        }
        
        // Format audio details message with song description
        let ytmsg = `🎵 *Song Details*
🎶 *Title:* ${videoData.title}
⏳ *Duration:* ${videoData.timestamp || videoData.duration}
👀 *Views:* ${videoData.views || 'N/A'}
👤 *Author:* ${videoData.author?.name || videoData.channel || 'Unknown'}
🔗 *Link:* ${videoData.url}

${videoData.description ? `📝 *Description:* ${videoData.description.length > 200 ? videoData.description.substring(0, 200) + '...' : videoData.description}\n\n` : ''}
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
        
        // Use externaladreply if available, otherwise use regular sendMessage
        if (externaladreply) {
            await externaladreply(conn, from, {
                image: { url: videoData.thumbnail },
                caption: ytmsg,
                contextInfo
            }, mek);
        } else {
            // Fallback to regular sendMessage
            await conn.sendMessage(from, { 
                image: { url: videoData.thumbnail }, 
                caption: ytmsg, 
                contextInfo 
            }, { quoted: mek });
        }

        // Store the message info for reply handling
        const sentMessage = await conn.sendMessage(from, { 
            text: "Please reply to the song details message with 1, 2, or 3 to select download format." 
        }, { quoted: mek });

        // Store download data for reply handling
        const downloadData = {
            downloadUrl,
            title: videoData.title,
            thumbnail: videoData.thumbnail
        };

        // Store in a global object or use a proper message tracking system
        if (!global.playCommands) global.playCommands = {};
        global.playCommands[sentMessage.key.id] = downloadData;

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

// Add message reply handler separately (this should be in your main bot file)
// This is an example of how to handle the replies
if (!global.playReplyHandler) {
    global.playReplyHandler = true;
    
    // Assuming you have access to the connection object
    const setupPlayReplyHandler = (conn) => {
        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const mp3msg = msgUpdate.messages[0];
            if (!mp3msg.message || !mp3msg.message.extendedTextMessage) return;

            const selectedOption = mp3msg.message.extendedTextMessage.text.trim();
            const contextInfo = mp3msg.message.extendedTextMessage.contextInfo;
            
            if (!contextInfo || !contextInfo.stanzaId) return;

            const repliedToId = contextInfo.stanzaId;
            const downloadData = global.playCommands?.[repliedToId];

            if (downloadData && ["1", "2", "3"].includes(selectedOption)) {
                const { downloadUrl, title } = downloadData;
                
                await conn.sendMessage(mp3msg.key.remoteJid, { 
                    react: { text: "⬇️", key: mp3msg.key } 
                });

                // Clean context for download messages (no newsletter)
                let downloadContextInfo = {
                    mentionedJid: [mp3msg.participant || mp3msg.key.remoteJid],
                    forwardingScore: 999,
                    isForwarded: true
                };

                // Handle format selection
                switch (selectedOption) {
                    case "1": // Document format
                        await conn.sendMessage(mp3msg.key.remoteJid, { 
                            document: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`, 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });   
                        break;
                        
                    case "2": // Audio format
                        await conn.sendMessage(mp3msg.key.remoteJid, { 
                            audio: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });
                        break;
                        
                    case "3": // Voice note format (PTT)
                        await conn.sendMessage(mp3msg.key.remoteJid, { 
                            audio: { url: downloadUrl }, 
                            mimetype: "audio/mpeg", 
                            ptt: true, 
                            contextInfo: downloadContextInfo 
                        }, { quoted: mp3msg });
                        break;
                }

                // Clean up stored data
                delete global.playCommands[repliedToId];
            }
        });
    };

    // Call this function with your connection object when bot starts
    // setupPlayReplyHandler(conn);
}

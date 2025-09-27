const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Optimized axios instance
const axiosInstance = axios.create({
    timeout: 15000,
    maxRedirects: 5,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

// API configuration
const KAIZ_API_KEY = 'cf2ca612-296f-45ba-abbc-473f18f991eb';
const KAIZ_API_URL = 'https://kaiz-apis.gleeze.com/api/ytdown-mp3';

// Utility function to fetch YouTube video info
async function fetchVideoInfo(text) {
    const isYtUrl = text.match(/(youtube\.com|youtu\.be)/i);
    if (isYtUrl) {
        const videoId = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
        if (!videoId) throw new Error('Invalid YouTube URL format');
        const videoInfo = await yts({ videoId });
        if (!videoInfo) throw new Error('Could not fetch video info');
        return { url: `https://youtu.be/${videoId}`, info: videoInfo };
    } else {
        const searchResults = await yts(text);
        if (!searchResults?.videos?.length) throw new Error('No results found');
        const validVideos = searchResults.videos.filter(v => !v.live && v.seconds < 7200 && v.views > 10000);
        if (!validVideos.length) throw new Error('Only found live streams/unpopular videos');
        return { url: validVideos[0].url, info: validVideos[0] };
    }
}

// Utility function to fetch audio from Kaiz-API
async function fetchAudioData(videoUrl) {
    const apiUrl = `${KAIZ_API_URL}?url=${encodeURIComponent(videoUrl)}&apikey=${KAIZ_API_KEY}`;
    const response = await axiosInstance.get(apiUrl);
    if (!response.data?.download_url) throw new Error('Invalid API response');
    return response.data;
}

// Utility function to fetch thumbnail
async function fetchThumbnail(thumbnailUrl) {
    if (!thumbnailUrl) return null;
    try {
        const response = await axiosInstance.get(thumbnailUrl, { responseType: 'arraybuffer', timeout: 8000 });
        return Buffer.from(response.data, 'binary');
    } catch (e) {
        console.error('Thumbnail error:', e);
        return null;
    }
}

// Utility function to send audio
async function sendAudio(conn, chat, audioBuffer, fileName, type, caption, quoted) {
    if (type === 'audio') {
        return await conn.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            fileName: fileName,
            caption: caption
        }, { quoted });
    } else if (type === 'voice') {
        return await conn.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            ptt: true,
            fileName: fileName,
            caption: caption
        }, { quoted });
    } else {
        return await conn.sendMessage(chat, { 
            document: audioBuffer, 
            mimetype: 'audio/mpeg', 
            fileName: fileName,
            caption: caption
        }, { quoted });
    }
}

/**
 * MP3 Audio Download Command (Play)
 * Downloads YouTube videos as MP3 audio with button selection
 * 
 * Features:
 * - Search YouTube videos by name or URL
 * - Provide audio details (title, duration, views, author)
 * - Three download formats via buttons: Document, Audio, Voice Note
 * - Interactive selection via buttons
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
        if (!q) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: mek.key } });
            return await reply("🎵 *Usage:* .play <query/url>\nExample: .play https://youtu.be/ox4tmEV6-QU\n.play Alan Walker faded");
        }

        // Send processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Fetch video info
        const { url: videoUrl, info: videoInfo } = await fetchVideoInfo(q);

        // Fetch audio data
        const songData = await fetchAudioData(videoUrl);

        // Fetch thumbnail
        const thumbnailBuffer = await fetchThumbnail(videoInfo.thumbnail);

        // Prepare caption message
        const caption = `🎵 *Song Details*

🎶 *Title:* ${songData.title || videoInfo.title || 'Unknown'}
⏳ *Duration:* ${videoInfo.timestamp || 'Unknown'}
👀 *Views:* ${videoInfo.views ? videoInfo.views.toLocaleString() : 'Unknown'}
👤 *Author:* ${videoInfo.author ? videoInfo.author.name : 'Unknown'}
🔗 *Link:* ${videoUrl}

*Choose download format:*`;

        // Generate unique session ID
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create buttons message
        const buttonsMessage = {
            image: thumbnailBuffer,
            caption: caption,
            footer: config.FOOTER || '> Powered by CASEYRHODES TECH',
            buttons: [
                {
                    buttonId: `play-document-${sessionId}-${videoUrl}`,
                    buttonText: { displayText: '📄 Document' },
                    type: 1
                },
                {
                    buttonId: `play-audio-${sessionId}-${videoUrl}`,
                    buttonText: { displayText: '🎧 Audio' },
                    type: 1
                },
                {
                    buttonId: `play-voice-${sessionId}-${videoUrl}`,
                    buttonText: { displayText: '🎙️ Voice Note' },
                    type: 1
                }
            ],
            headerType: 1,
            contextInfo: {
                externalAdReply: {
                    title: songData.title || videoInfo.title || 'YouTube Audio',
                    body: `Duration: ${videoInfo.timestamp || 'N/A'}`,
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    mediaUrl: videoUrl,
                    sourceUrl: videoUrl
                }
            }
        };

        // Send message with buttons
        const finalMsg = await conn.sendMessage(from, buttonsMessage, { quoted: mek });
        const messageId = finalMsg.key.id;

        // Button handler
        const buttonHandler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg.message?.buttonsResponseMessage) return;

                const buttonId = receivedMsg.message.buttonsResponseMessage.selectedButtonId;
                const senderId = receivedMsg.key.remoteJid;
                const isReplyToBot = receivedMsg.message.buttonsResponseMessage.contextInfo?.stanzaId === messageId;

                if (isReplyToBot && senderId === from && buttonId.includes(sessionId)) {
                    // Remove listener to prevent multiple handlers
                    conn.ev.off('messages.upsert', buttonHandler);

                    await conn.sendMessage(from, { react: { text: '⏳', key: receivedMsg.key } });

                    // Determine download type
                    let type = 'document';
                    if (buttonId.startsWith(`play-audio-${sessionId}`)) type = 'audio';
                    if (buttonId.startsWith(`play-voice-${sessionId}`)) type = 'voice';

                    // Fetch fresh audio data
                    const freshSongData = await fetchAudioData(videoUrl);

                    // Download audio
                    const audioResponse = await axiosInstance.get(freshSongData.download_url, {
                        responseType: 'arraybuffer',
                        headers: { 
                            Referer: 'https://www.youtube.com/', 
                            'Accept-Encoding': 'identity' 
                        },
                        timeout: 30000
                    });

                    const audioBuffer = Buffer.from(audioResponse.data, 'binary');
                    const fileName = `${(freshSongData.title || videoInfo.title || 'audio').replace(/[<>:"\/\\|?*]+/g, '')}.mp3`;

                    // Prepare download caption
                    const downloadCaption = `✅ *Download Complete*

🎶 *Title:* ${freshSongData.title || videoInfo.title || 'Unknown'}
⏳ *Duration:* ${videoInfo.timestamp || 'Unknown'}
👤 *Author:* ${videoInfo.author ? videoInfo.author.name : 'Unknown'}

📥 *Format:* ${type === 'document' ? 'Document' : type === 'audio' ? 'Audio' : 'Voice Note'}`;

                    // Send audio
                    await sendAudio(conn, from, audioBuffer, fileName, type, downloadCaption, receivedMsg);
                    await conn.sendMessage(from, { react: { text: '✅', key: receivedMsg.key } });
                }
            } catch (error) {
                console.error('Button Handler Error:', error);
                const receivedMsg = msgData.messages[0];
                await conn.sendMessage(from, { react: { text: '❌', key: receivedMsg.key } });
                await conn.sendMessage(from, 
                    { text: `❌ *Download Failed*\nError: ${error.message || 'Unknown error'}` }, 
                    { quoted: receivedMsg }
                );
            }
        };

        // Add listener for button responses
        conn.ev.on('messages.upsert', buttonHandler);

        // Remove listener after 2 minutes to prevent memory leaks
        setTimeout(() => {
            conn.ev.off('messages.upsert', buttonHandler);
        }, 120000);

    } catch (error) {
        console.error('Play Command Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || 'An unexpected error occurred'}`);
    }
});

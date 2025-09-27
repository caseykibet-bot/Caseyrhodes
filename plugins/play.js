const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Optimized axios instance with longer timeouts
const axiosInstance = axios.create({
    timeout: 30000, // Increased from 15000 to 30000ms
    maxRedirects: 5,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

// Multiple API endpoints as fallback
const API_ENDPOINTS = [
    {
        name: 'kaiz',
        url: 'https://kaiz-apis.gleeze.com/api/ytdown-mp3',
        key: 'cf2ca612-296f-45ba-abbc-473f18f991eb'
    },
    {
        name: 'casper',
        url: 'https://casper-tech-apis.vercel.app/api/ytmp3',
        key: null
    },
    {
        name: 'ditz',
        url: 'https://api.ditz.rest/api/youtube/mp3',
        key: null
    }
];

// Utility function to fetch YouTube video info with better error handling
async function fetchVideoInfo(text) {
    try {
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
            
            const validVideos = searchResults.videos.filter(v => !v.live && v.seconds < 7200);
            if (!validVideos.length) throw new Error('No suitable videos found');
            
            return { url: validVideos[0].url, info: validVideos[0] };
        }
    } catch (error) {
        console.error('Video info error:', error);
        throw new Error(`Failed to get video info: ${error.message}`);
    }
}

// Utility function to fetch audio from multiple API endpoints
async function fetchAudioData(videoUrl) {
    let lastError = null;
    
    for (const api of API_ENDPOINTS) {
        try {
            console.log(`Trying API: ${api.name}`);
            
            let apiUrl = api.url;
            if (api.key) {
                apiUrl += `?url=${encodeURIComponent(videoUrl)}&apikey=${api.key}`;
            } else {
                apiUrl += `?url=${encodeURIComponent(videoUrl)}`;
            }
            
            const response = await axiosInstance.get(apiUrl, { timeout: 25000 });
            
            if (api.name === 'kaiz' && response.data?.download_url) {
                return response.data;
            } else if (api.name === 'casper' && response.data?.status === 'success' && response.data.data?.downloads) {
                const audioDownload = response.data.data.downloads.find(d => d.quality && d.downloadUrl);
                if (audioDownload) return { download_url: audioDownload.downloadUrl, title: response.data.data.title };
            } else if (api.name === 'ditz' && response.data?.success && response.data.result?.download_url) {
                return { download_url: response.data.result.download_url, title: response.data.result.title };
            }
        } catch (error) {
            lastError = error;
            console.log(`API ${api.name} failed:`, error.message);
            continue; // Try next API
        }
    }
    
    throw new Error(`All APIs failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Utility function to fetch thumbnail with timeout handling
async function fetchThumbnail(thumbnailUrl) {
    if (!thumbnailUrl) return null;
    try {
        const response = await axiosInstance.get(thumbnailUrl, { 
            responseType: 'arraybuffer', 
            timeout: 10000 
        });
        return Buffer.from(response.data, 'binary');
    } catch (e) {
        console.error('Thumbnail error:', e);
        return null;
    }
}

// Utility function to send audio
async function sendAudio(conn, chat, audioBuffer, fileName, type, caption, quoted) {
    const baseMessage = {
        mimetype: 'audio/mpeg',
        fileName: fileName,
        caption: caption
    };

    if (type === 'audio') {
        return await conn.sendMessage(chat, { 
            ...baseMessage,
            audio: audioBuffer
        }, { quoted });
    } else if (type === 'voice') {
        return await conn.sendMessage(chat, { 
            ...baseMessage,
            audio: audioBuffer,
            ptt: true
        }, { quoted });
    } else {
        return await conn.sendMessage(chat, { 
            ...baseMessage,
            document: audioBuffer
        }, { quoted });
    }
}

// Download audio directly from buffer
async function downloadAudioBuffer(downloadUrl) {
    try {
        const response = await axiosInstance.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 45000, // 45 seconds for audio download
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'audio/mpeg,audio/*',
                'Referer': 'https://www.youtube.com/'
            }
        });
        
        if (!response.data || response.data.length === 0) {
            throw new Error('Empty audio response');
        }
        
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Audio download error:', error);
        throw new Error(`Failed to download audio: ${error.message}`);
    }
}

/**
 * MP3 Audio Download Command (Play)
 * Downloads YouTube videos as MP3 audio with button selection
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
        if (!q) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: mek.key } });
            return await reply("🎵 *Usage:* .play <query/url>\nExample: .play https://youtu.be/ox4tmEV6-QU\n.play Alan Walker faded");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Step 1: Fetch video info
        let videoInfo;
        try {
            const result = await fetchVideoInfo(q);
            videoInfo = result.info;
            q = result.url; // Use the actual URL for API calls
        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await reply(`❌ *Search Error:* ${error.message}`);
        }

        // Step 2: Fetch audio data from APIs
        let songData;
        try {
            songData = await fetchAudioData(q);
        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await reply(`❌ *API Error:* ${error.message}\n\nPlease try again later or use a different song.`);
        }

        // Step 3: Fetch thumbnail
        const thumbnailBuffer = await fetchThumbnail(videoInfo.thumbnail);

        // Prepare caption message
        const caption = `🎵 *Song Details*

🎶 *Title:* ${songData.title || videoInfo.title || 'Unknown'}
⏳ *Duration:* ${videoInfo.timestamp || 'Unknown'}
👀 *Views:* ${videoInfo.views ? videoInfo.views.toLocaleString() : 'Unknown'}
👤 *Author:* ${videoInfo.author ? videoInfo.author.name : 'Unknown'}
🔗 *Link:* ${q}

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
                    buttonId: `play-document-${sessionId}`,
                    buttonText: { displayText: '📄 Document' },
                    type: 1
                },
                {
                    buttonId: `play-audio-${sessionId}`,
                    buttonText: { displayText: '🎧 Audio' },
                    type: 1
                },
                {
                    buttonId: `play-voice-${sessionId}`,
                    buttonText: { displayText: '🎙️ Voice Note' },
                    type: 1
                }
            ],
            headerType: 1
        };

        // Add context info if thumbnail is available
        if (thumbnailBuffer) {
            buttonsMessage.contextInfo = {
                externalAdReply: {
                    title: songData.title || videoInfo.title || 'YouTube Audio',
                    body: `Duration: ${videoInfo.timestamp || 'N/A'} | Views: ${videoInfo.views ? videoInfo.views.toLocaleString() : 'N/A'}`,
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    mediaUrl: q,
                    sourceUrl: q
                }
            };
        }

        // Send message with buttons
        const finalMsg = await conn.sendMessage(from, buttonsMessage, { quoted: mek });
        const messageId = finalMsg.key.id;

        // Store video data for button handler
        const videoData = {
            url: q,
            info: videoInfo,
            sessionId: sessionId
        };

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

                    await conn.sendMessage(from, { react: { text: '⬇️', key: receivedMsg.key } });

                    // Determine download type
                    let type = 'document';
                    if (buttonId.startsWith(`play-audio-${sessionId}`)) type = 'audio';
                    if (buttonId.startsWith(`play-voice-${sessionId}`)) type = 'voice';

                    try {
                        // Fetch fresh audio data
                        const freshSongData = await fetchAudioData(videoData.url);

                        // Download audio with progress indication
                        await conn.sendMessage(from, { 
                            text: `📥 *Downloading audio...*\nTitle: ${freshSongData.title || videoData.info.title}\nThis may take a while for longer videos.` 
                        }, { quoted: receivedMsg });

                        const audioBuffer = await downloadAudioBuffer(freshSongData.download_url);

                        const fileName = `${(freshSongData.title || videoData.info.title || 'audio').replace(/[<>:"\/\\|?*]+/g, '')}.mp3`;

                        // Prepare download caption
                        const downloadCaption = `✅ *Download Complete*

🎶 *Title:* ${freshSongData.title || videoData.info.title}
⏳ *Duration:* ${videoData.info.timestamp}
👤 *Author:* ${videoData.info.author ? videoData.info.author.name : 'Unknown'}

📥 *Format:* ${type === 'document' ? 'Document' : type === 'audio' ? 'Audio' : 'Voice Note'}`;

                        // Send audio
                        await sendAudio(conn, from, audioBuffer, fileName, type, downloadCaption, receivedMsg);
                        await conn.sendMessage(from, { react: { text: '✅', key: receivedMsg.key } });

                    } catch (downloadError) {
                        console.error('Download error:', downloadError);
                        await conn.sendMessage(from, { react: { text: '❌', key: receivedMsg.key } });
                        await conn.sendMessage(from, 
                            { text: `❌ *Download Failed*\nError: ${downloadError.message}\n\nPlease try a different song or try again later.` }, 
                            { quoted: receivedMsg }
                        );
                    }
                }
            } catch (error) {
                console.error('Button Handler Error:', error);
            }
        };

        // Add listener for button responses
        conn.ev.on('messages.upsert', buttonHandler);

        // Remove listener after 3 minutes to prevent memory leaks
        setTimeout(() => {
            conn.ev.off('messages.upsert', buttonHandler);
        }, 180000);

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('Play Command Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || 'An unexpected error occurred'}`);
    }
});

const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Fast axios instance with optimized timeouts
const axiosInstance = axios.create({
    timeout: 10000, // Reduced timeout for faster failures
    maxRedirects: 3,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'identity' // Faster processing
    }
});

// Fast API endpoints (priority order) - Added your API
const API_ENDPOINTS = [
    {
        name: 'malvin', // Your API - added as first priority
        url: 'https://apis-malvin.vercel.app/download/dlmp3',
        fast: true
    },
    {
        name: 'ditz',
        url: 'https://api.ditz.rest/api/youtube/mp3',
        fast: true
    },
    {
        name: 'kaiz',
        url: 'https://kaiz-apis.gleeze.com/api/ytdown-mp3',
        fast: true,
        key: 'cf2ca612-296f-45ba-abbc-473f18f991eb'
    },
    {
        name: 'casper',
        url: 'https://casper-tech-apis.vercel.app/api/ytmp3',
        fast: false
    }
];

// Fast video info fetch with cache
let videoCache = new Map();
async function fetchVideoInfoFast(text) {
    const cacheKey = text.toLowerCase().trim();
    if (videoCache.has(cacheKey)) {
        return videoCache.get(cacheKey);
    }

    const isYtUrl = text.match(/(youtube\.com|youtu\.be)/i);
    
    if (isYtUrl) {
        const videoId = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
        if (!videoId) throw new Error('Invalid YouTube URL');
        
        const videoInfo = await yts({ videoId });
        if (!videoInfo) throw new Error('Video not found');
        
        const result = { url: `https://youtu.be/${videoId}`, info: videoInfo };
        videoCache.set(cacheKey, result);
        return result;
    } else {
        // Fast search - limit results
        const searchResults = await yts(text);
        if (!searchResults?.videos?.length) throw new Error('No results found');
        
        // Get first valid video quickly
        const video = searchResults.videos.find(v => !v.live && v.seconds < 3600);
        if (!video) throw new Error('No suitable videos found');
        
        const result = { url: video.url, info: video };
        videoCache.set(cacheKey, result);
        return result;
    }
}

// Ultra-fast audio fetch with race conditions - Updated with malvin API support
async function fetchAudioUrlFast(videoUrl) {
    const fastApis = API_ENDPOINTS.filter(api => api.fast);
    
    // Try fast APIs simultaneously
    const promises = fastApis.map(api => 
        axiosInstance.get(api.key ? 
            `${api.url}?url=${encodeURIComponent(videoUrl)}&apikey=${api.key}` :
            `${api.url}?url=${encodeURIComponent(videoUrl)}`, 
            { timeout: 8000 }
        ).then(response => ({ api: api.name, data: response.data, success: true }))
         .catch(error => ({ api: api.name, error: error.message, success: false }))
    );

    // Wait for first successful response
    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
            const { api, data } = result.value;
            
            switch(api) {
                case 'malvin': // Your API handler
                    if (data?.download_url || data?.url) {
                        console.log(`✅ Using ${api} API`);
                        return { 
                            download_url: data.download_url || data.url, 
                            title: data.title || data.filename 
                        };
                    }
                    // Also support direct URL in response
                    if (typeof data === 'string' && data.includes('http')) {
                        console.log(`✅ Using ${api} API (direct URL)`);
                        return { download_url: data, title: 'YouTube Audio' };
                    }
                    break;
                    
                case 'ditz':
                    if (data?.success && data.result?.download_url) {
                        console.log(`✅ Using ${api} API`);
                        return { download_url: data.result.download_url, title: data.result.title };
                    }
                    break;
                    
                case 'kaiz':
                    if (data?.download_url) {
                        console.log(`✅ Using ${api} API`);
                        return data;
                    }
                    break;
                    
                case 'casper':
                    if (data?.status === 'success' && data.data?.downloads) {
                        const audio = data.data.downloads.find(d => d.quality && d.downloadUrl);
                        if (audio) {
                            console.log(`✅ Using ${api} API`);
                            return { download_url: audio.downloadUrl, title: data.data.title };
                        }
                    }
                    break;
            }
        }
    }
    
    // If fast APIs fail, try slower ones sequentially with malvin first
    for (const api of API_ENDPOINTS.filter(api => !api.fast)) {
        try {
            const response = await axiosInstance.get(
                `${api.url}?url=${encodeURIComponent(videoUrl)}`, 
                { timeout: 12000 }
            );
            
            if (api.name === 'malvin') {
                if (response.data?.download_url || response.data?.url) {
                    console.log(`✅ Using ${api} API (fallback)`);
                    return { 
                        download_url: response.data.download_url || response.data.url, 
                        title: response.data.title || 'YouTube Audio' 
                    };
                }
            } else if (api.name === 'casper' && response.data?.status === 'success' && response.data.data?.downloads) {
                const audio = response.data.data.downloads.find(d => d.quality && d.downloadUrl);
                if (audio) {
                    console.log(`✅ Using ${api} API (fallback)`);
                    return { download_url: audio.downloadUrl, title: response.data.data.title };
                }
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('All audio APIs failed');
}

// Fast audio download with stream
async function downloadAudioFast(downloadUrl) {
    const response = await axiosInstance.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 25000, // 25 seconds max for audio
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.youtube.com/',
            'Accept': 'audio/mpeg,audio/*',
            'Accept-Encoding': 'identity' // Faster processing
        },
        maxContentLength: 50 * 1024 * 1024, // 50MB max
    });

    if (!response.data || response.data.length === 0) {
        throw new Error('Empty audio file');
    }

    return Buffer.from(response.data);
}

// Fast audio sender
async function sendAudioFast(conn, chat, audioBuffer, title, quoted) {
    const fileName = `${title.replace(/[<>:"\/\\|?*]+/g, '')}.mp3`.substring(0, 100); // Limit filename length
    
    return await conn.sendMessage(chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: fileName,
        ptt: false // Regular audio, not voice note
    }, { quoted });
}

/**
 * Ultra-Fast MP3 Audio Download Command (Play)
 * Downloads and sends YouTube audio directly without buttons
 * Now with malvin API as primary fallback
 */
cmd({ 
    pattern: "play", 
    alias: ["song", "music", "audio"], 
    react: "🎶", 
    desc: "Download YouTube audio instantly", 
    category: "main", 
    use: '.play <song name or YouTube URL>', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) {
            await conn.sendMessage(from, { react: { text: '❓', key: mek.key } });
            return await reply(`🎵 *Usage:* .play <song name or YouTube URL>\n\n*Examples:*\n• .play older\n• .play https://youtu.be/abc123\n• .play Sasha Alex Sloan - Older`);
        }

        // Step 1: Quick processing reaction
        await conn.sendMessage(from, { react: { text: '⚡', key: mek.key } });

        // Step 2: Fast video search
        const searchPromise = fetchVideoInfoFast(q);
        await conn.sendMessage(from, { text: `🔍 *Searching for:* ${q.substring(0, 50)}...` });

        const { url: videoUrl, info: videoInfo } = await searchPromise;

        // Step 3: Get audio URL quickly (malvin API will be tried first)
        await conn.sendMessage(from, { text: `📥 *Fetching audio...*\n🔄 *Trying APIs: malvin, ditz, kaiz, casper*` });
        const audioData = await fetchAudioUrlFast(videoUrl);

        // Step 4: Download and send audio with progress
        await conn.sendMessage(from, { text: `🎧 *Downloading:* ${audioData.title || videoInfo.title}\n⏳ *This will take a moment...*` });

        const audioBuffer = await downloadAudioFast(audioData.download_url);

        // Step 5: Send audio immediately
        const songTitle = audioData.title || videoInfo.title || 'YouTube Audio';
        await sendAudioFast(conn, from, audioBuffer, songTitle, mek);

        // Step 6: Send info message
        const infoMsg = `✅ *Download Complete!*

🎶 *Title:* ${songTitle}
⏳ *Duration:* ${videoInfo.timestamp || 'Unknown'}
👀 *Views:* ${videoInfo.views ? videoInfo.views.toLocaleString() : 'Unknown'}
👤 *Artist:* ${videoInfo.author ? videoInfo.author.name : 'Unknown'}
🔗 *Source:* YouTube

💡 *Powered by malvin API + fallbacks*`;

        await conn.sendMessage(from, { text: infoMsg });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('Play Command Error:', error);
        
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        
        const errorMsg = `❌ *Download Failed*

*Reason:* ${error.message || 'Unknown error'}

*Tried APIs:* malvin, ditz, kaiz, casper

*Possible solutions:*
• Check your internet connection
• Try a different song name
• Use a direct YouTube URL
• Try again in a few minutes

*Example:* .play https://youtu.be/dQw4w9WgXcQ`;

        await reply(errorMsg);
    }
});

// Cache cleanup every 10 minutes
setInterval(() => {
    videoCache.clear();
    console.log('🔄 Video cache cleared');
}, 10 * 60 * 1000);

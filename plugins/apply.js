// Required dependencies - you would need to install these in your project
// npm install node-fetch yt-search fluent-ffmpeg ffmpeg-static

const fetch = require('node-fetch');
const ytSearch = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set the path to ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// MP3 song download command
cmd({ 
    pattern: "song2", 
    alias: ["playx", "mp3"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song <query>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("Please provide a song name or YouTube link.");

        // Search for the song on YouTube
        const yt = await ytSearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const videoUrl = song.url;
        const videoInfo = {
            title: song.title,
            thumbnail: song.thumbnail,
            duration: song.duration
        };

        // Define API endpoints for MP3 download
        const apis = [
            `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`,
            `https://iamtkm.vercel.app/downloaders/ytmp3?url=${encodeURIComponent(videoUrl)}`
        ];

        // Function to fetch download data from an API
        const getDownloadData = async (apiUrl) => {
            try {
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error(`API responded with status ${res.status}`);
                return await res.json();
            } catch (error) {
                console.error(`Error fetching from ${apiUrl}:`, error.message);
                return null;
            }
        };

        let downloadUrl = null;
        let apiUsed = '';

        // Try each API in order until we get a successful response
        for (const api of apis) {
            const data = await getDownloadData(api);
            
            if (data && data.status) {
                // Extract download URL based on API response structure
                if (api.includes('ytmp3')) {
                    downloadUrl = data.result?.url || data.result?.downloadUrl;
                } else if (api.includes('mp3')) {
                    downloadUrl = data.result?.downloadUrl || data.result?.url;
                } else if (api.includes('dlmp3')) {
                    downloadUrl = data.result?.data?.downloadUrl || data.result?.url;
                } else if (api.includes('audio')) {
                    downloadUrl = data.result || data.result?.url;
                }
                
                if (downloadUrl) {
                    apiUsed = api;
                    break;
                }
            }
        }

        // If no download URL was found from APIs, try to convert using ffmpeg
        if (!downloadUrl) {
            reply("Converting audio using fallback method...");
            
            // This is a simplified example - in a real implementation you would
            // need to handle the actual video download and conversion
            try {
                // Create a temporary file path for the converted audio
                const outputPath = `./temp/${Date.now()}_${videoInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
                
                // Convert video to MP3 using ffmpeg
                await new Promise((resolve, reject) => {
                    ffmpeg(videoUrl)
                        .audioBitrate(128)
                        .save(outputPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                downloadUrl = outputPath;
                apiUsed = 'ffmpeg';
            } catch (convertError) {
                console.error('Audio conversion failed:', convertError);
                return reply('Failed to retrieve or convert audio. Please try again later.');
            }
        }

        // Send the audio message
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: videoInfo.title || 'Audio Download',
                    body: `Powered by ${apiUsed.split('/')[2]}`,
                    mediaType: 1,
                    sourceUrl: videoUrl,
                    thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

        reply(`✅ Successfully sent "${videoInfo.title}"`);

    } catch (error) {
        console.error('Song download error:', error);
        reply("An error occurred. Please try again.");
    }
});

// Additional utility function to handle YouTube URL validation
function isYoutubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(url);
}

// If you need to handle direct YouTube URLs differently
cmd({ 
    pattern: "ytmp3", 
    desc: "Download MP3 from YouTube URL", 
    category: "main", 
    use: '.ytmp3 <youtube_url>', 
    filename: __filename 
}, async (conn, mek, m, { from, reply, q }) => { 
    if (!q) return reply("Please provide a YouTube URL.");
    if (!isYoutubeUrl(q)) return reply("Please provide a valid YouTube URL.");
    
    // Reuse the same logic as the song command
    await module.exports.song(conn, mek, m, { from, reply, q });
});

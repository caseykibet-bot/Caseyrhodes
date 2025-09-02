// MP3 song download 
cmd({ 
    pattern: "song", 
    alias: ["play", "mp3"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song <query>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("Please provide a song name or YouTube link.");

        const yt = await ytsearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const videoUrl = song.url;
        const videoInfo = {
            title: song.title,
            thumbnail: song.thumbnail
        };

        const apis = [
            `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`,
            `https://iamtkm.vercel.app/downloaders/ytmp3?url=${encodeURIComponent(videoUrl)}`
        ];

        // Function to fetch download data
        const getDownloadData = async (apiUrl) => {
            try {
                const res = await fetch(apiUrl);
                return await res.json();
            } catch (error) {
                return null;
            }
        };

        let downloadUrl = null;

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
                
                if (downloadUrl) break;
            }
        }

        // If no download URL was found
        if (!downloadUrl) {
            return reply('Failed to retrieve download URL from all sources. Please try again later.');
        }

        // Send the audio message
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: videoInfo.title || 'Audio Download',
                    body: 'Powered by API Services',
                    mediaType: 1,
                    sourceUrl: videoUrl,
                    thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});

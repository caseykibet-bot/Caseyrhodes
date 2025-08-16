const {
  cmd
} = require("../command");
const {
  ytsearch
} = require("@dark-yasiya/yt-dl.js");

cmd({
  'pattern': "videomp4",
  'alias': ["mp4v", "videomp4"],
  'react': '🎬',
  'desc': "Download YouTube video",
  'category': "main",
  'use': ".video <query>",
  'filename': __filename
}, async (message, match, client, { from, sender, reply, q }) => {
  try {
    if (!q) {
      return reply("Please provide a video name or YouTube link.");
    }
    
    const searchResults = await ytsearch(q);
    if (!searchResults.results.length) {
      return reply("No results found!");
    }
    
    const video = searchResults.results[0];
    const videoUrl = video.url;
    
    // List of API endpoints for video download
    const apis = [
      `https://xploader-api.vercel.app/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadUrl;
    let lastError;

    // Try each API endpoint until one succeeds
    for (const api of apis) {
      try {
        const response = await fetch(api);
        const data = await response.json();
        
        if (data?.result?.downloadUrl || data?.downloadUrl || data?.url) {
          downloadUrl = data.result?.downloadUrl || data.downloadUrl || data.url;
          break;
        }
      } catch (error) {
        lastError = error;
        console.error(`API ${api} failed:`, error);
        continue;
      }
    }

    if (!downloadUrl) {
      console.error('All APIs failed', lastError);
      return reply("Download failed. All servers are busy, please try again later.");
    }
    
    let caption = `\n╭━━━━━━━━━━━━━━━━⊷
┊ ┏────────────⊷
┊ ┊ 🎬 Title: *${video.title}*
┊ ┊ ⏱️ Duration: ${video.duration || 'N/A'}
┊ ┊ 👁️ Views: ${video.views || 'N/A'}
┊ ┗────────────⊷
╰┬━━━━━━━━━━━━⊷⳹
┌┤ *📥(Automatic video download)*
┊╰─────────────⊷
*╰━━━━━━━━━━━━━━━━⊷*`;
    
    // Send video info with thumbnail
    await message.sendMessage(from, {
      'image': {
        'url': video.thumbnail.replace("default.jpg", "hqdefault.jpg")
      },
      'caption': caption
    }, {
      'quoted': message
    });
    
    // Send the video
    await message.sendMessage(from, {
      'video': {
        'url': downloadUrl
      },
      'mimetype': "video/mp4",
      'caption': video.title
    }, {
      'quoted': message
    });
    
  } catch (error) {
    console.error(error);
    reply("An error occurred. Please try again.");
  }
});

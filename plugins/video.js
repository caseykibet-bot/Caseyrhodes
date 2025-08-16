const {
  cmd
} = require("../command");
const {
  ytsearch
} = require("@dark-yasiya/yt-dl.js");

cmd({
  'pattern': "videomp4",
  'alias': ["mp4v", "videomp4"],
  'react': '🎬',  // Changed from music note to video camera emoji
  'desc': "Download YouTube video",
  'category': "main",
  'use': ".video <query>",  // Changed from .song to .video
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
    const apiUrl = "https://apis.davidcyriltech.my.id/youtube/mp4?url=" + encodeURIComponent(video.url);  // Changed from mp3 to mp4
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data?.result?.downloadUrl) {
      return reply("Download failed. Try again later.");
    }
    
    let caption = `\n╭━━━━━━━━━━━━━━━━⊷
┊ ┏────────────⊷
┊ ┊ 🎬 Title: *${video.title}*
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
        'url': data.result.downloadUrl
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

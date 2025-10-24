const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");
const converter = require("../data/play-converter");
const fetch = require('node-fetch');

cmd({
  'pattern': "play",
  'alias': ["play2", "song"],
  'react': '🎵',
  'desc': "Download high quality YouTube audio",
  'category': "media",
  'use': "<song name>",
  'filename': __filename
}, async (message, client, context, {
  from: sender,
  q: query,
  reply: replyFunction
}) => {
  try {
    if (!query) {
      return replyFunction("❌ Please provide a song name\n\nExample: .play Alone");
    }

    // Send searching message
    await message.sendMessage(sender, {
      'text': "🔍 Searching for your song..."
    }, {
      'quoted': client
    });

    // Search for the song
    const searchResults = await ytsearch(query);
    
    if (!searchResults?.results?.length) {
      return replyFunction("❌ No results found. Try a different search term.");
    }

    const videoData = searchResults.results[0];
    
    // Create info caption
    const infoCaption = `
╭───❮ *CASEYRHODES XMD* ❯────⊷
┃ 🎵 *Title:* ${videoData.title}
┃ ⏱️ *Duration:* ${videoData.timestamp}
┃ 👀 *Views:* ${videoData.views}
┃ 👤 *Author:* ${videoData.author.name}
╰──────────────────────⊷
> *Powered by Caseyrhodes tech♡*
    `.trim();

    // Send video info with thumbnail
    await message.sendMessage(sender, {
      'image': {
        'url': videoData.thumbnail
      },
      'caption': infoCaption
    }, {
      'quoted': client
    });

    // Fetch audio download URL
    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(videoData.title)}`;
    const apiResponse = await fetch(apiUrl);
    const apiData = await apiResponse.json();

    const downloadUrl = apiData?.result?.download_url || apiData?.result?.downloadUrl;
    
    if (!downloadUrl) {
      return replyFunction("❌ Failed to fetch audio. Try again later.");
    }

    // Download and convert audio
    const audioResponse = await fetch(downloadUrl);
    const audioBuffer = await audioResponse.buffer();

    let convertedAudio;
    try {
      convertedAudio = await converter.toAudio(audioBuffer, "mp4");
    } catch (conversionError) {
      console.error("Audio conversion failed:", conversionError);
      return replyFunction("❌ Audio conversion failed. Please try another song.");
    }

    // Sanitize filename
    const sanitizedFileName = `${videoData.title}.mp3`.replace(/[^\w\s.-]/gi, '');

    // Send audio file
    await message.sendMessage(sender, {
      'audio': convertedAudio,
      'mimetype': "audio/mpeg",
      'ptt': false,
      'fileName': sanitizedFileName,
      'caption': "*© Created by  Caseyrhodes tech ❦*"
    }, {
      'quoted': client
    });

    // Send success reaction
    await message.sendMessage(sender, {
      'react': {
        'text': '✅',
        'key': client.key
      }
    });

  } catch (error) {
    console.error("Play command error:", error);
    replyFunction("⚠️ An unexpected error occurred. Please try again.");
    
    // Send error reaction
    await message.sendMessage(sender, {
      'react': {
        'text': '❌',
        'key': client.key
      }
    });
  }
});

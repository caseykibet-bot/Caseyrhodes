// Alternative approach: Send as image with audio document
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

    // Search for the song
    const searchResults = await ytsearch(query);
    
    if (!searchResults?.results?.length) {
      return replyFunction("❌ No results found. Try a different search term.");
    }

    const videoData = searchResults.results[0];

    // Fixed verification contact
    const verifiedContact = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: "CASEYRHODES VERIFIED ✅",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:CASEYRHODES VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 313-555-0002\nEND:VCARD`
            }
        }
    };

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

    // Create image caption with song details
    const imageCaption = ` 
🎵 *${videoData.title}*

📊 *Song Details:*
⏱️ Duration: ${videoData.timestamp}
👀 Views: ${videoData.views}
👤 Artist: ${videoData.author.name}
🔗 YouTube ID: ${videoData.videoId}

━━━━━━━━━━━━━━━━━━
🎧 *Powered by Caseyrhodes tech* ♡
━━━━━━━━━━━━━━━━━━

⬇️ *Audio file attached below*
    `.trim();

    // First: Send image with song details
    await message.sendMessage(sender, {
      image: { url: videoData.thumbnail },
      caption: imageCaption,
      contextInfo: {
        externalAdReply: {
            title: "🎵 Music Player",
            body: "Click to play audio",
            mediaType: 1,
            thumbnailUrl: videoData.thumbnail,
            sourceUrl: `https://youtu.be/${videoData.videoId}`
        }
      }
    }, { quoted: verifiedContact });

    // Second: Send audio as a document (this shows filename in caption)
    await message.sendMessage(sender, {
      document: convertedAudio,
      mimetype: 'audio/mpeg',
      fileName: sanitizedFileName,
      caption: `🔊 ${videoData.title} - ${videoData.author.name}`
    });

    // Send success reaction
    await message.sendMessage(sender, {
      react: {
        text: '✅',
        key: message.key
      }
    });

  } catch (error) {
    console.error("Play command error:", error);
    replyFunction("⚠️ An unexpected error occurred. Please try again.");
    
    // Send error reaction
    await message.sendMessage(sender, {
      react: {
        text: '❌',
        key: message.key
      }
    });
  }
});

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

    // Context info with newsletter reference for description message
    let contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'POWERED BY CASEYRHODES TECH',
            serverMessageId: -1
        },
        externalAdReply: {
            title: "CASEYRHODES VERIFIED ✅",
            body: "Powered by Caseyrhodes Tech",
            mediaType: 1,
            thumbnailUrl: videoData.thumbnail,
            sourceUrl: "https://whatsapp.com/channel/0029Va9aJNY6LtL5wM5pY3z",
            mediaUrl: ""
        }
    };

    // Create info caption
    const infoCaption = ` 
 *⇆ㅤ ||◁     ㅤ❚❚   ㅤ▷||ㅤ ↻*
╭───❮ *CASEYRHODES XMD* ❯────⊷
┃ 🎵 *Title:* ${videoData.title}
┃ ⏱️ *Duration:* ${videoData.timestamp}─〇───── 
┃ 👀 *Views:* ${videoData.views}
┃ 👤 *Author:* ${videoData.author.name}
╰──────────────────────⊷
> *Powered by Caseyrhodes tech♡*
    `.trim();

    // Send video info with thumbnail and context info
    await message.sendMessage(sender, {
      'image': {
        'url': videoData.thumbnail
      },
      'caption': infoCaption,
      'contextInfo': contextInfo
    }, {
      'quoted': verifiedContact
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

    // Send audio file with verification contact as quoted
    await message.sendMessage(sender, {
      'audio': convertedAudio,
      'mimetype': "audio/mpeg",
      'ptt': false,
      'fileName': sanitizedFileName,
      'caption': "*© Created by Caseyrhodes tech ❦*"
    }, {
      'quoted': verifiedContact
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

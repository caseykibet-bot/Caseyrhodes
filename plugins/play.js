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

    // Create combined caption with song description
    const combinedCaption = ` 
    *⇆ㅤ ||◁     ㅤ❚❚   ㅤ▷||ㅤ ↻*
╭───❮ *CASEYRHODES XMD* ❯────⊷
┃ 🎵 *Title:* ${videoData.title}
┃ ⏱️ *Duration:* ${videoData.timestamp}
┃ 👀 *Views:* ${videoData.views}
┃ 👤 *Author:* ${videoData.author.name}
┃ 🔗 *Video ID:* ${videoData.videoId}
╰──────────────────────⊷
> *Powered by Caseyrhodes tech ♡*
    `.trim();

    // Enhanced context info with thumbnail image for audio message
    // REMOVED newsletter info and simplified
    const audioContextInfo = {
        externalAdReply: {
            title: videoData.title.substring(0, 40) + (videoData.title.length > 40 ? "..." : ""),
            body: `Duration: ${videoData.timestamp} | Views: ${videoData.views}`,
            mediaType: 1, // 1 for image
            thumbnailUrl: videoData.thumbnail,
            thumbnail: await (async () => {
              try {
                const thumbResponse = await fetch(videoData.thumbnail);
                const thumbBuffer = await thumbResponse.buffer();
                return thumbBuffer;
              } catch (e) {
                console.error("Failed to fetch thumbnail:", e);
                return null;
              }
            })(),
            sourceUrl: `https://youtu.be/${videoData.videoId}`,
            renderLargerThumbnail: true,
            showAdAttribution: false, // Set to false for cleaner look
            mediaUrl: ""
        },
        forwardingScore: 1,
        isForwarded: true
        // REMOVED: forwardedNewsletterMessageInfo completely
    };

    // Send audio with combined caption, thumbnail image, and context info in ONE message
    await message.sendMessage(sender, {
      audio: convertedAudio,
      mimetype: 'audio/mpeg',
      fileName: sanitizedFileName,
      ptt: false,
      caption: combinedCaption, // This caption will be visible
      contextInfo: audioContextInfo,
      // Alternative method: Include thumbnail directly (some WhatsApp APIs support this)
      thumbnail: await (async () => {
        try {
          const thumbResponse = await fetch(videoData.thumbnail);
          return await thumbResponse.buffer();
        } catch (e) {
          console.error("Failed to fetch thumbnail for direct attachment:", e);
          return null;
        }
      })()
    }, { 
      quoted: verifiedContact,
      // Add to ensure caption is visible
      captionOptions: {
        showAlways: true,
        parseMode: true
      }
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

const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");
const converter = require("../data/play-converter");
const fetch = require('node-fetch');

// Store active sessions to handle replies
const activePlaySessions = new Map();

cmd({
  'pattern': "play",
  'alias': ["play2", "song"],
  'react': '🎵',
  'desc': "Download high quality YouTube audio with confirmation",
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
    
    // Create info caption with download options
    const infoCaption = `
╭───❮ *CASEYRHODES XMD* ❯────⊷
┃ 🎵 *Title:* ${videoData.title}
┃ ⏱️ *Duration:* ${videoData.timestamp}
┃ 👀 *Views:* ${videoData.views}
┃ 👤 *Author:* ${videoData.author.name}
╰──────────────────────⊷

*Choose download format:*
1️⃣ *MP3 as Document* 📄
2️⃣ *MP3 as Audio* 🎧  
3️⃣ *MP3 as Voice Note* 🎙️

*Reply with 1, 2 or 3 to download the format you prefer.*

> *Powered by Caseyrhodes tech♡*`.trim();

    // Newsletter context info
    const newsletterContextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363302677217436@newsletter',
        newsletterName: 'POWERED BY CASEYRHODES TECH',
        serverMessageId: -1
      }
    };

    // Store song data for this session
    const sessionId = `${sender}_${Date.now()}`;
    const songData = {
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      timestamp: videoData.timestamp,
      views: videoData.views,
      author: videoData.author.name,
      query: query,
      sessionId: sessionId,
      startTime: Date.now()
    };

    // Send video info with thumbnail
    const infoMessage = await message.sendMessage(sender, {
      'image': {
        'url': videoData.thumbnail
      },
      'caption': infoCaption,
      'contextInfo': newsletterContextInfo
    }, {
      'quoted': client
    });

    // Store the trigger message ID
    const triggerMessageId = infoMessage.key?.id;
    songData.triggerMessageId = triggerMessageId;

    // Store session data
    activePlaySessions.set(sessionId, songData);

    // Set timeout to clean up session after 2 minutes
    setTimeout(() => {
      if (activePlaySessions.has(sessionId)) {
        activePlaySessions.delete(sessionId);
        console.log(`Cleaned up session: ${sessionId}`);
      }
    }, 120000);

  } catch (error) {
    console.error("Play command error:", error);
    replyFunction("⚠️ An unexpected error occurred. Please try again.");
    
    await message.sendMessage(sender, {
      'react': {
        'text': '❌',
        'key': client.key
      }
    });
  }
});

// Global message handler for play command replies
if (typeof global.playReplyHandler === 'undefined') {
  global.playReplyHandler = async (mek, conn) => {
    try {
      // Check if message has extended text (reply)
      if (!mek.message?.extendedTextMessage?.text) return;
      
      const messageText = mek.message.extendedTextMessage.text.trim();
      const sender = mek.key.remoteJid;
      const quotedMessageId = mek.message.extendedTextMessage.contextInfo?.stanzaId;
      
      // Only process replies with numbers 1, 2, or 3
      if (!['1', '2', '3'].includes(messageText)) return;
      
      // Find active session that matches this reply
      let targetSession = null;
      let sessionIdToDelete = null;
      
      for (const [sessionId, sessionData] of activePlaySessions.entries()) {
        if (sessionData.sender === sender && sessionData.triggerMessageId === quotedMessageId) {
          targetSession = sessionData;
          sessionIdToDelete = sessionId;
          break;
        }
      }
      
      // Also check by sender only (fallback)
      if (!targetSession) {
        for (const [sessionId, sessionData] of activePlaySessions.entries()) {
          if (sessionData.sender === sender) {
            targetSession = sessionData;
            sessionIdToDelete = sessionId;
            break;
          }
        }
      }
      
      if (!targetSession) {
        console.log('No active session found for this reply');
        return;
      }
      
      // Remove session to prevent multiple processing
      activePlaySessions.delete(sessionIdToDelete);
      
      // Send processing reaction
      await conn.sendMessage(sender, {
        react: {
          text: '⬇️',
          key: mek.key
        }
      });
      
      // Send processing message
      await conn.sendMessage(sender, {
        text: "⏳ Downloading your audio... Please wait."
      }, {
        quoted: mek
      });
      
      // Fetch audio download URL
      const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(targetSession.title)}`;
      const apiResponse = await fetch(apiUrl);
      const apiData = await apiResponse.json();

      const downloadUrl = apiData?.result?.download_url || apiData?.result?.downloadUrl;
      
      if (!downloadUrl) {
        return await conn.sendMessage(sender, {
          text: "❌ Failed to fetch audio download URL. Please try again later."
        }, {
          quoted: mek
        });
      }

      // Download audio
      const audioResponse = await fetch(downloadUrl);
      if (!audioResponse.ok) {
        throw new Error(`HTTP error! status: ${audioResponse.status}`);
      }
      const audioBuffer = await audioResponse.buffer();

      let convertedAudio;
      try {
        convertedAudio = await converter.toAudio(audioBuffer, "mp4");
      } catch (conversionError) {
        console.error("Audio conversion failed:", conversionError);
        return await conn.sendMessage(sender, {
          text: "❌ Audio conversion failed. Please try another song."
        }, {
          quoted: mek
        });
      }

      // Sanitize filename
      const sanitizedFileName = `${targetSession.title}.mp3`.replace(/[^\w\s.-]/gi, '');

      // Send audio based on selected format
      switch (messageText) {
        case '1': // Document format
          await conn.sendMessage(sender, {
            document: convertedAudio,
            mimetype: "audio/mpeg",
            fileName: sanitizedFileName,
            caption: "*📄 MP3 Document • © Created by Caseyrhodes tech ❦*"
          }, {
            quoted: mek
          });
          break;

        case '2': // Audio format
          await conn.sendMessage(sender, {
            audio: convertedAudio,
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: sanitizedFileName,
            caption: "*🎧 MP3 Audio • © Created by Caseyrhodes tech ❦*"
          }, {
            quoted: mek
          });
          break;

        case '3': // Voice note format
          await conn.sendMessage(sender, {
            audio: convertedAudio,
            mimetype: "audio/mpeg",
            ptt: true,
            fileName: sanitizedFileName,
            caption: "*🎙️ Voice Note • © Created by Caseyrhodes tech ❦*"
          }, {
            quoted: mek
          });
          break;
      }

      // Send success reaction
      await conn.sendMessage(sender, {
        react: {
          text: '✅',
          key: mek.key
        }
      });

    } catch (error) {
      console.error("Play reply handler error:", error);
      const sender = mek.key.remoteJid;
      await conn.sendMessage(sender, {
        text: "❌ Download failed. Please try again with a different song."
      }, {
        quoted: mek
      });
    }
  };

  // Register the global handler
  if (typeof global.client !== 'undefined') {
    global.client.ev.on('messages.upsert', ({ messages }) => {
      const mek = messages[0];
      if (mek) {
        global.playReplyHandler(mek, global.client);
      }
    });
  }
}

// Also add session data to track sender
const originalHandler = cmd.handlers[cmd.handlers.length - 1];
cmd.handlers[cmd.handlers.length - 1] = async (...args) => {
  await originalHandler(...args);
  // Update the session with sender information
  const [message, client, context, { from: sender }] = args;
  const latestSession = Array.from(activePlaySessions.entries())
    .find(([_, data]) => !data.sender);
  
  if (latestSession) {
    latestSession[1].sender = sender;
    activePlaySessions.set(latestSession[0], latestSession[1]);
  }
};

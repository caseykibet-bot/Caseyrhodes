const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");
const converter = require("../data/play-converter");
const fetch = require('node-fetch');

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
    
    // Create info caption with download options and newsletter
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

> *Powered by Caseyrhodes tech♡*
    `.trim();

    // Newsletter context info for the song description message only
    const newsletterContextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363302677217436@newsletter',
        newsletterName: 'POWERED BY CASEYRHODES TECH',
        serverMessageId: -1
      }
    };

    // Store video data for later use
    const songData = {
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      timestamp: videoData.timestamp,
      views: videoData.views,
      author: videoData.author.name,
      query: query
    };

    // Send video info with thumbnail, options, and newsletter context
    const infoMessage = await message.sendMessage(sender, {
      'image': {
        'url': videoData.thumbnail
      },
      'caption': infoCaption,
      'contextInfo': newsletterContextInfo
    }, {
      'quoted': client
    });

    // Store the message ID for reply tracking
    const triggerMessageId = infoMessage.key?.id;

    // Set up reply handler
    const replyHandler = async (mek) => {
      try {
        // Check if this is a reply to our trigger message
        if (mek.message?.extendedTextMessage?.contextInfo?.stanzaId === triggerMessageId) {
          const selectedOption = mek.message.extendedTextMessage.text.trim();
          
          // Validate selection
          if (!['1', '2', '3'].includes(selectedOption)) {
            await message.sendMessage(sender, {
              'text': "❌ Invalid selection. Please reply with 1, 2, or 3 only."
            }, {
              'quoted': mek
            });
            return;
          }

          // Remove the listener to prevent multiple handlers
          client.ev.off('messages.upsert', replyHandler);

          // Send processing reaction
          await message.sendMessage(sender, {
            'react': {
              'text': '⬇️',
              'key': mek.key
            }
          });

          // Send processing message
          await message.sendMessage(sender, {
            'text': "⏳ Processing your download request..."
          }, {
            'quoted': mek
          });

          // Fetch audio download URL
          const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(songData.title)}`;
          const apiResponse = await fetch(apiUrl);
          const apiData = await apiResponse.json();

          const downloadUrl = apiData?.result?.download_url || apiData?.result?.downloadUrl;
          
          if (!downloadUrl) {
            return await message.sendMessage(sender, {
              'text': "❌ Failed to fetch audio. Try again later."
            }, {
              'quoted': mek
            });
          }

          // Download and convert audio
          const audioResponse = await fetch(downloadUrl);
          const audioBuffer = await audioResponse.buffer();

          let convertedAudio;
          try {
            convertedAudio = await converter.toAudio(audioBuffer, "mp4");
          } catch (conversionError) {
            console.error("Audio conversion failed:", conversionError);
            return await message.sendMessage(sender, {
              'text': "❌ Audio conversion failed. Please try another song."
            }, {
              'quoted': mek
            });
          }

          // Sanitize filename
          const sanitizedFileName = `${songData.title}.mp3`.replace(/[^\w\s.-]/gi, '');

          // Regular context info for download messages (no newsletter)
          const downloadContextInfo = {
            mentionedJid: [mek.participant || mek.key.participant],
            forwardingScore: 999,
            isForwarded: true
          };

          // Send audio based on selected format
          switch (selectedOption) {
            case '1': // Document format
              await message.sendMessage(sender, {
                'document': convertedAudio,
                'mimetype': "audio/mpeg",
                'fileName': sanitizedFileName,
                'caption': "*📄 MP3 Document • © Created by Caseyrhodes tech ❦*",
                'contextInfo': downloadContextInfo
              }, {
                'quoted': mek
              });
              break;

            case '2': // Audio format
              await message.sendMessage(sender, {
                'audio': convertedAudio,
                'mimetype': "audio/mpeg",
                'ptt': false,
                'fileName': sanitizedFileName,
                'caption': "*🎧 MP3 Audio • © Created by Caseyrhodes tech ❦*",
                'contextInfo': downloadContextInfo
              }, {
                'quoted': mek
              });
              break;

            case '3': // Voice note format
              await message.sendMessage(sender, {
                'audio': convertedAudio,
                'mimetype': "audio/mpeg",
                'ptt': true,
                'fileName': sanitizedFileName,
                'caption': "*🎙️ Voice Note • © Created by Caseyrhodes tech ❦*",
                'contextInfo': downloadContextInfo
              }, {
                'quoted': mek
              });
              break;
          }

          // Send success reaction
          await message.sendMessage(sender, {
            'react': {
              'text': '✅',
              'key': mek.key
            }
          });

        }
      } catch (error) {
        console.error("Reply handler error:", error);
        await message.sendMessage(sender, {
          'text': "⚠️ An error occurred during download. Please try again."
        }, {
          'quoted': mek
        });
      }
    };

    // Add the reply handler with timeout
    client.ev.on('messages.upsert', replyHandler);

    // Set timeout to remove listener after 2 minutes
    setTimeout(() => {
      client.ev.off('messages.upsert', replyHandler);
      console.log('Reply handler removed due to timeout');
    }, 120000);

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

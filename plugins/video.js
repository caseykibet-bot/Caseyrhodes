cmd({
  pattern: "vid",
  alias: ["vid", "vdl"],
  desc: "Download videos from multiple platforms",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    // Determine platform from URL
    let platform;
    if (q.match(/twitter\.com|x\.com|t\.co/)) platform = "twitter";
    else if (q.match(/instagram\.com|instagr\.am/)) platform = "instagram";
    else if (q.match(/youtube\.com|youtu\.be/)) platform = "youtube";
    else if (q.match(/tiktok\.com/)) platform = "tiktok";
    else if (q.match(/facebook\.com|fb\.watch/)) platform = "facebook";

    if (!platform) {
      return reply("❌ Unsupported platform. Supported: Twitter, Instagram, YouTube, TikTok, Facebook");
    }

    // Use David Cyril API for all platforms
    const apiUrl = `https://apis.davidcyriltech.my.id/${platform}/video?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data.result) {
      return reply(`⚠️ Failed to retrieve ${platform} video. Please check the link.`);
    }

    const { 
      title = "No title", 
      thumbnail, 
      url, 
      quality,
      duration,
      audio_url
    } = data.result;

    // Build dynamic options menu
    let optionsText = "📹 *Download Options:*\n";
    let optionCount = 1;
    const optionsMap = {};
    
    if (url) {
      optionsText += `${optionCount}️⃣  *${quality || 'Standard'} Quality*\n`;
      optionsMap[optionCount] = { type: "video", url: url, quality: quality || 'Standard' };
      optionCount++;
    }
    
    if (audio_url) {
      optionsText += `${optionCount}️⃣  *Audio Only*\n`;
      optionsMap[optionCount] = { type: "audio", url: audio_url };
      optionCount++;
      
      optionsText += `${optionCount}️⃣  *Voice Message*`;
      optionsMap[optionCount] = { type: "voice", url: audio_url };
    }

    const caption = `╭════ 〔 *𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 〕════❐\n`
      + `┃▸ *Platform:* ${platform.toUpperCase()}\n`
      + `┃▸ *Title:* ${title}\n`
      + (duration ? `┃▸ *Duration:* ${duration}\n` : '')
      + `╰═════════════════❐\n\n`
      + optionsText + `\n\n`
      + `📌 *Reply with the number to download your choice.*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // Handle user selection
    const selectionHandler = async (receivedMsg) => {
      if (!receivedMsg.message) return;

      const isReplyToBot = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
      const senderID = receivedMsg.key.remoteJid;
      
      if (isReplyToBot && senderID === from) {
        const receivedText = (receivedMsg.message.conversation || 
                             receivedMsg.message.extendedTextMessage?.text || "").trim();
        
        const choice = parseInt(receivedText);
        if (isNaN(choice) || choice < 1 || choice > Object.keys(optionsMap).length) {
          return reply("❌ Invalid option! Please reply with a valid number.");
        }

        await conn.sendMessage(from, {
          react: { text: '⬇️', key: receivedMsg.key }
        });

        const selectedOption = optionsMap[choice];
        
        switch (selectedOption.type) {
          case "video":
            await conn.sendMessage(from, {
              video: { url: selectedOption.url },
              caption: `📥 Downloaded in ${selectedOption.quality} Quality`
            }, { quoted: receivedMsg });
            break;
            
          case "audio":
            await conn.sendMessage(from, {
              audio: { url: selectedOption.url },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;
            
          case "voice":
            await conn.sendMessage(from, {
              audio: { url: selectedOption.url },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;
        }
        
        // Remove listener after successful download
        conn.ev.off("messages.upsert", selectionHandler);
      }
    };

    // Listen for user selection
    conn.ev.on("messages.upsert", selectionHandler);

    // Timeout after 2 minutes
    setTimeout(() => {
      conn.ev.off("messages.upsert", selectionHandler);
    }, 120000);

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred: " + error.message);
  }
});

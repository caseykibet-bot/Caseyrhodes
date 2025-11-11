const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    // Owner restrictions - uses bot owner's number from system
    const botOwner = client.config.owner || client.user.id.split(':')[0] + '@s.whatsapp.net';
    if (message.sender !== botOwner) {
      return await client.sendMessage(from, {
        text: "🚫 *Access Denied*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "📍 *Reply to a message*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };
    const time = new Date().toLocaleString();
    
    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: (match.quoted.text || '') + `\n\n╭─「 🔥 」\n│ ✦ @${message.sender.split('@')[0]}\n│ ✦ ${time}\n╰─`,
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: (match.quoted.text || '') + `\n\n╭─「 🎬 」\n│ ✦ @${message.sender.split('@')[0]}\n│ ✦ ${time}\n╰─`,
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      case "textMessage":
        messageContent = {
          text: (match.quoted.text || '') + `\n\n╭─「 📝 」\n│ ✦ @${message.sender.split('@')[0]}\n│ ✦ ${time}\n╰─`
        };
        break;
      case "stickerMessage":
        messageContent = {
          sticker: buffer,
          mimetype: match.quoted.mimetype || "image/webp"
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ *Unsupported format*"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);

  } catch (error) {
    console.error("Forward Error:", error);
    await client.sendMessage(from, {
      text: "💥 *Error processing request*"
    }, { quoted: message });
  }
});

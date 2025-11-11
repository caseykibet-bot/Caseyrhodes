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
    // Check if the message is a reply (quoted message)
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedMessage = {
        quoted: {
          key: {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: message.message.extendedTextMessage.contextInfo.stanzaId,
            participant: message.message.extendedTextMessage.contextInfo.participant
          },
          message: message.message.extendedTextMessage.contextInfo.quotedMessage,
          download: () => client.downloadAndSaveMediaMessage(message.message.extendedTextMessage.contextInfo.quotedMessage)
        }
      };

      const buffer = await quotedMessage.quoted.download();
      const mtype = Object.keys(quotedMessage.quoted.message)[0];
      
      // Create forward message options to make it appear as forwarded
      const options = {
        quoted: message,
        // Add forwarding context to make it look like a forwarded message
        contextInfo: {
          forwardingScore: 999, // High forwarding score
          isForwarded: true,
          // You can add original sender info if available
          participant: quotedMessage.quoted.key.participant || message.key.participant,
          stanzaId: quotedMessage.quoted.key.id,
          remoteJid: quotedMessage.quoted.key.remoteJid
        }
      };

      let messageContent = {};
      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: quotedMessage.quoted.message.imageMessage?.caption || '',
            mimetype: quotedMessage.quoted.message.imageMessage?.mimetype || "image/jpeg",
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: quotedMessage.quoted.message.videoMessage?.caption || '',
            mimetype: quotedMessage.quoted.message.videoMessage?.mimetype || "video/mp4",
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: quotedMessage.quoted.message.audioMessage?.ptt || false,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          };
          break;
        case "conversation":
        case "extendedTextMessage":
          // Handle text messages
          const text = quotedMessage.quoted.message.conversation || 
                      quotedMessage.quoted.message.extendedTextMessage?.text || '';
          messageContent = {
            text: text,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          };
          break;
        default:
          return await client.sendMessage(from, {
            text: "❌ Only text, image, video, and audio messages are supported"
          }, { quoted: message });
      }

      await client.sendMessage(from, messageContent, options);
    } 
    // If no quoted message but command has prefix, show instruction
    else if (match.command) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message!*"
      }, { quoted: message });
    }
    // If no quoted message and no prefix, do nothing (silent fail)
    else {
      return;
    }
  } catch (error) {
    console.error("Forward Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error forwarding message:\n" + error.message
    }, { quoted: message });
  }
});

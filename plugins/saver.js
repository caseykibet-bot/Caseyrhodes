const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, quoted, client }) => {
    if (!isOwner) return reply("❌ This command is only for the bot owner.");

    try {
        if (!quoted) {
            return await client.sendMessage(from, {
                text: "*🍁 Please reply to a message!*"
            }, { quoted: m });
        }

        const buffer = await quoted.download();
        const mtype = quoted.mtype;
        
        // Configuration to make message appear forwarded
        const forwardConfig = {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: 'status@broadcast',
                    newsletterName: 'Status',
                    serverMessageId: Math.floor(Math.random() * 1000000)
                }
            }
        };

        let messageContent = {};
        switch (mtype) {
            case "imageMessage":
                messageContent = {
                    image: buffer,
                    caption: quoted.text || '',
                    ...forwardConfig
                };
                break;
            case "videoMessage":
                messageContent = {
                    video: buffer,
                    caption: quoted.text || '',
                    ...forwardConfig
                };
                break;
            case "audioMessage":
                messageContent = {
                    audio: buffer,
                    mimetype: "audio/mp4",
                    ptt: quoted.ptt || false,
                    ...forwardConfig
                };
                break;
            case "extendedTextMessage":
            case "conversation":
                // For text messages, use the forwarding configuration
                messageContent = {
                    text: quoted.text,
                    ...forwardConfig
                };
                break;
            default:
                return await client.sendMessage(from, {
                    text: "❌ Unsupported message type"
                }, { quoted: m });
        }

        await client.sendMessage(from, messageContent);
        
    } catch (error) {
        console.error("Forward Error:", error);
        await client.sendMessage(from, {
            text: "❌ Error forwarding message:\n" + error.message
        }, { quoted: m });
    }
});

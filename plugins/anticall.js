const { cmd } = require("../command");
const config = require("../config");
const fs = require('fs');
const path = require('path');

const recentCallers = new Set();

// Anti-call handler
cmd({ on: "body" }, async (client, message, chat, { from: sender }) => {
  try {
    client.ev.on("call", async (callData) => {
      if (!config.ANTI_CALL) return;

      for (const call of callData) {
        if (call.status === 'offer' && !call.isGroup) {
          await client.rejectCall(call.id, call.from);
          
          if (!recentCallers.has(call.from)) {
            recentCallers.add(call.from);
            
            await client.sendMessage(call.from, {
              text: "```Hii this is CASEYRHODES-XMD a Personal Assistant!! Sorry for now, we cannot receive calls, whether in a group or personal if you need help or request features please chat owner``` ⚠️",
              mentions: [call.from]
            });
            
            setTimeout(() => recentCallers.delete(call.from), 600000);
          }
        }
      }
    });
  } catch (error) {
    console.error("Call rejection error:", error);
    await client.sendMessage(sender, { text: "⚠️ Error: " + error.message }, { quoted: chat });
  }
});

cmd({
    pattern: "anticall",
    alias: ["callblock", "togglecall"],
    desc: "Manages the anti-call feature. Use: .anticall [on/off/status]",
    category: "owner",
    react: "📞",
    filename: __filename,
    fromMe: true
},
async (client, message, m, { isOwner, reply, from, sender, args, prefix }) => {
    try {
        if (!isOwner) {
            return reply("🚫 This command is for the bot owner only.");
        }

        const action = args[0] ? args[0].toLowerCase() : 'status';
        let replyText;
        let reaction;
        let status;

        switch (action) {
            case 'on':
                if (config.ANTI_CALL) {
                    replyText = "📞 Anti-call is already *enabled*!";
                    reaction = "ℹ️";
                } else {
                    config.ANTI_CALL = true;
                    replyText = "📞 Anti-call has been *enabled*! Calls will be automatically rejected.";
                    reaction = "✅";
                }
                status = "Anti-call Status: ✅ *ENABLED*";
                break;
                
            case 'off':
                if (!config.ANTI_CALL) {
                    replyText = "📞 Anti-call is already *disabled*!";
                    reaction = "ℹ️";
                } else {
                    config.ANTI_CALL = false;
                    replyText = "📞 Anti-call has been *disabled*! Calls will be accepted.";
                    reaction = "❌";
                }
                status = "Anti-call Status: ❌ *DISABLED*";
                break;
                
            case 'status':
            default:
                status = config.ANTI_CALL ? "✅ *ENABLED*" : "❌ *DISABLED*";
                replyText = `📞 Anti-call Status: ${status}\n\n`
                         + `Usage:\n`
                         + `  ${prefix}anticall on - Enable call blocking\n`
                         + `  ${prefix}anticall off - Disable call blocking\n`
                         + `  ${prefix}anticall status - Show current status`;
                reaction = "📞";
                break;
        }

        // Send reaction to the command message
        await client.sendMessage(from, {
            react: { text: reaction, key: message.key }
        });

        // Send the reply message
        await client.sendMessage(from, {
            text: replyText,
            mentions: [sender]
        }, { quoted: message });
        
        // Send image with caption and newsletter info
        await client.sendMessage(from, { 
            image: { url: `https://i.ibb.co/wN6Gw0ZF/lordcasey.jpg` },  
            caption: status,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐋𝐈𝐕𝐄🍀',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error("Anti-call command error:", error);
        await client.sendMessage(from, {
            text: `⚠️ Error: ${error.message}`,
            mentions: [sender]
        }, { quoted: message });
    }
});

const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "menus",
  react: '🛸',
  alias: ["panel", "commands"],
  desc: "Display main menu",
  category: "main"
}, async (client, message, args, { from, pushname }) => {
  try {
    // Generate greeting based on time
    const hour = new Date().getHours();
    const greeting = `🌟 GOOD ${hour < 12 ? "MORNING" : hour < 18 ? "AFTERNOON" : "EVENING"}, ${pushname}! 🌟`;

    // Create main menu message
    const menuMessage = `
${greeting}

*╭───────────────❂*
*┃✰╭─────────────•*
*┃✰│* ʀᴜɴᴛɪᴍᴇ : *${runtime(process.uptime())}*
*┃✰│* ᴘʟᴀᴛғᴏʀᴍ : *${process.env.DYNO ? "Heroku" : "Localhost"}*
*┃✰│* ᴍᴏᴅᴇ : *[${config.MODE}]*
*┃✰│* ᴘʀᴇғɪx : *[${config.PREFIX}]*
*┃✰╰─────────────•*
*╰───────────────❂*

╭─ 「 *✦${config.BOT_NAME}✦* 」
┊  ╭───────────❂
┊  ┊✰ *MAIN MENU*
┊  ╰───────────❂
┊  *📩 REPLY WITH NUMBER*
┊  ╭───────────❂
┊🤍┊1 *DOWNLOAD-CMD*
┊🧑‍💻┊2 *GROUP-CMD*
┊🌐┊3 *FUN-CMD*
┊👥┊4 *OWNER-CMD*
┊📝┊5 *AI-CMD*
┊💨┊6 *ANIME-CMD*
┊🔄┊7 *CONVERT-CMD*
┊🤖┊8 *OTHER-CMD*
┊🏞️┊9 *REACTIONS-CMD*
┊🌀┊10 *MAIN-CMD*
┊  ╰──────────❂
╰─────────────❂

> ${config.CAPTION}
*●❯────────────❮●*`;

    // Menu data structure
    const menuData = {
      '1': {
        title: "📥 *Download Menu* 📥",
        content: `╭━━━〔 *Download Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ 🌐 *Social Media*
┃★│ • facebook [url]
┃★│ • tiktok [url]
┃★│ • twitter [url]
┃★│ • insta [url]
┃★│ • apk [app]
┃★╰──────────────
┃★╭──────────────
┃★│ 🎵 *Music/Video*
┃★│ • spotify [query]
┃★│ • play [song]
┃★│ • ytmp3 [url]
┃★│ • ytmp4 [url]
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷`
      },
      '2': {
        title: "👥 *Group Menu* 👥",
        content: `╭━━━〔 *Group Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ 🛠️ *Management*
┃★│ • add @user
┃★│ • remove @user
┃★│ • promote @user
┃★│ • demote @user
┃★╰──────────────
┃★╭──────────────
┃★│ 🏷️ *Tagging*
┃★│ • tagall
┃★│ • tagadmins
┃★│ • invitelink
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷`
      },
      // Add other menu items similarly
      '10': {
        title: "🏠 *Main Menu* 🏠",
        content: `╭━━━〔 *Main Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ ℹ️ *Bot Info*
┃★│ • ping
┃★│ • alive
┃★│ • runtime
┃★│ • owner
┃★╰──────────────
┃★╭──────────────
┃★│ 🛠️ *Controls*
┃★│ • menu
┃★│ • restart
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷`
      }
    };

    // Send initial menu
    const sentMsg = await client.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL || 'https://example.com/default.jpg' },
      caption: menuMessage,
      contextInfo: {
        externalAdReply: {
          title: config.BOT_NAME + " MENU",
          body: "Powered by " + config.BOT_NAME,
          thumbnail: await (await axios.get(config.THUMB_URL, { responseType: 'arraybuffer' })).data
        }
      }
    }, { quoted: message });

    const messageID = sentMsg.key.id;
    const handler = async (msg) => {
      if (!msg.message || msg.key.remoteJid !== from) return;
      
      const quotedID = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
      const text = msg.message.conversation || (msg.message.extendedTextMessage?.text || "").trim();
      
      if (quotedID === messageID && menuData[text]) {
        await client.sendMessage(from, {
          text: `*${menuData[text].title}*\n\n${menuData[text].content}\n\n> ${config.CAPTION}`
        }, { quoted: msg });
        
        // Remove listener after successful response
        client.ev.off('messages.upsert', handler);
      }
    };

    // Add listener with 5-minute timeout
    client.ev.on('messages.upsert', handler);
    setTimeout(() => client.ev.off('messages.upsert', handler), 300000);

  } catch (error) {
    console.error('Menu Error:', error);
    await client.sendMessage(from, {
      text: `❌ Failed to load menu. Please try again later.\nError: ${error.message}`
    }, { quoted: message });
  }
});

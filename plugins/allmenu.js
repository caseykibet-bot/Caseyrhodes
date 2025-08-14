//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ██████╗ █████╗ ███████╗███████╗██╗   █╗ ██████╗ ██╗  ██╗ ██████╗ ██████╗ ███████╗ ████████╗███████╗ ██████╗██╗  ██╗
//  ██╔════╝██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔═══██╗██╔══██╗██╔════╝ ╚══██╔══╝██╔════╝██╔════╝██║  ██║
//  ██║     ███████║█████╗  █████╗   ╚████╔╝ ██████╔╝███████║██║   ██║██║  ██║█████╗      ██║   █████╗  ██║     ███████║
//  ██║     ██╔══██║██╔══╝  ██╔══╝    ╚██╔╝  ██╔══██╗██╔══██║██║   ██║██║  ██║██╔══╝      ██║   ██╔══╝  ██║     ██╔══██║
//  ╚██████╗██║  ██║██║     ███████╗   ██║   ██║  ██║██║  ██║╚██████╔╝██████╔╝███████╗    ██║   ███████╗╚██████╗██║  ██║
//   ╚═════╝╚═╝  ╚═╝╚═╝     ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "allmenu",
  alias: ["commandlist", "help"],
  desc: "Fetch and display all available bot commands",
  category: "system",
  filename: __filename,
}, async (Void, m, text, { prefix }) => {
  try {
    const commandDir = path.join(__dirname, '../plugins');
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    let totalCommands = 0;
    let commandList = [];

    for (const file of commandFiles) {
      const filePath = path.join(commandDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/pattern:\s*["'`](.*?)["'`]/g);
      
      if (matches) {
        const extracted = matches.map(x => x.split(':')[1].replace(/["'`,]/g, '').trim());
        totalCommands += extracted.length;
        commandList.push(`📁 *${file}*\n${extracted.map(cmd => `🌟 ${cmd}`).join('\n')}`);
      }
    }

    const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY');

    const caption = `
╭━━━《 *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐗𝐌𝐃* 》━━━┈⊷
┃❍╭──────────────
┃❍│▸  Usᴇʀ : Caseyrhodes Tech 🌟
┃❍│▸  ʙᴀɪʟᴇʏs : 𝐌𝐮𝐥𝐭𝐢 𝐝𝐞𝐯𝐢𝐜𝐞
┃❍│▸  ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs : *${totalCommands}*
┃❍⁠│▸  𝖳ʏᴘᴇ : 𝐍𝐨𝐝𝐞𝐣𝐬
┃❍│▸  ᴘʟᴀᴛғᴏʀᴍ : 𝐇𝐞𝐫𝐨𝐤𝐮
┃❍⁠│▸  𝖵ᴇʀsɪᴏɴ : 𝟏.𝟎.𝟎
┃❍╰──────────────
╰━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n${commandList.join('\n\n')}`;

    const messageOptions = {
      image: { url: "https://files.catbox.moe/y3j3kl.jpg" },
      caption: caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363302677217436@newsletter",
          newsletterName: "CASEYRHODES TECH",
          serverMessageId: 2
        },
        externalAdReply: {
          title: "CASEYRHODES TECH",
          body: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ`,
          mediaType: 1,
          thumbnailUrl: "https://files.catbox.moe/y3j3kl.jpg",
          sourceUrl: "https://github.com/CASEYRHODES-TECH/CASEYRHODES-XMD"
        }
      }
    };

    await Void.sendMessage(m.chat, messageOptions, { quoted: m });
  } catch (err) {
    console.error(err);
    await m.reply('❌ Error: Could not fetch the command list.');
  }
});

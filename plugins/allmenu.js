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
    const categories = {};

    // Read all command files and extract patterns
    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract pattern using regex
        const patternMatch = content.match(/pattern:\s*["'`](.*?)["'`]/);
        if (patternMatch) {
          const pattern = patternMatch[1];
          
          // Extract category
          const categoryMatch = content.match(/category:\s*["'`](.*?)["'`]/);
          const category = categoryMatch ? categoryMatch[1] : 'general';
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          categories[category].push(pattern);
          totalCommands++;
        }
      } catch (fileErr) {
        console.error(`Error reading file ${file}:`, fileErr);
      }
    }

    // Function to stylize text
    const toUpperStylized = (text) => {
      return text.toUpperCase();
    };

    // Emoji mapping for categories
    const emojiByCategory = {
      'system': '⚙️',
      'general': '💫',
      'download': '📥',
      'media': '🎬',
      'fun': '🎮',
      'tools': '🛠️',
      'owner': '👑',
      'search': '🔍',
      'group': '👥',
      'ai': '🤖'
    };

    let commandList = "";

    // Add sorted categories with stylized text
    const sortedCategories = Object.keys(categories).sort();
    
    for (const cat of sortedCategories) {
      const emoji = emojiByCategory[cat] || '💫';
      commandList += `╭─『 ${emoji} ${toUpperStylized(cat)} 』\n`;
      
      // Add commands in a compact format (5 per line)
      const commands = categories[cat].sort();
      for (let i = 0; i < commands.length; i += 5) {
        const lineCommands = commands.slice(i, i + 5);
        commandList += `│ ${lineCommands.join(' • ')}\n`;
      }
      commandList += `╰────────────────\n\n`;
    }

    const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY');

    const caption = `
╭━━━《 *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐗𝐌𝐃* 》━━━┈⊷
┃❍╭──────────────
┃❍│▸  Usᴇʀ : ${m.pushName || 'User'} 🌟
┃❍│▸  ʙᴀɪʟᴇʏs : 𝐌𝐮𝐥𝐭𝐢 𝐝𝐞𝐯𝐢𝐜𝐞
┃❍│▸  ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs : *${totalCommands}*
┃❍⁠│▸  𝖳ʏᴘᴇ : 𝐍𝐨𝐝𝐞𝐣𝐬
┃❍│▸  ᴘʟᴀᴛғᴏʀᴍ : 𝐇𝐞𝐫𝐨𝐤𝐮
┃❍⁠│▸  𝖵ᴇʀsɪᴏɴ : 𝟏.𝟎.𝟎
┃❍╰──────────────
╰━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

${commandList}`;

    const messageOptions = {
      image: { url: "https://files.catbox.moe/y3j3kl.jpg" },
      caption: caption,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420261263259@newsletter',
          newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ ʙᴏᴛ🌟',
          serverMessageId: -1
        },
        externalAdReply: {
          title: "CASEYRHODES TECH",
          body: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ | ${time}`,
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


const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

// Function to stylize text like ʜɪ
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

// Normalize categories
const normalize = (str) => str.toLowerCase().replace(/\s+menu$/, '').trim();

// Emojis by normalized category
const emojiByCategory = {
  ai: '🤖',
  anime: '🍥',
  audio: '🎧',
  bible: '📖',
  download: '⬇️',
  downloader: '📥',
  fun: '🎮',
  game: '🕹️',
  group: '👥',
  img_edit: '🖌️',
  info: 'ℹ️',
  information: '🧠',
  logo: '🖼️',
  main: '🏠',
  media: '🎞️',
  menu: '📜',
  misc: '📦',
  music: '🎵',
  other: '📁',
  owner: '👑',
  privacy: '🔒',
  search: '🔎',
  settings: '⚙️',
  sticker: '🌟',
  system: '⚙️',
  tools: '🛠️',
  user: '👤',
  utilities: '🧰',
  utility: '🧮',
  wallpapers: '🖼️',
  whatsapp: '📱',
};

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
          
          const normalizedCategory = normalize(category);
          if (!categories[normalizedCategory]) {
            categories[normalizedCategory] = [];
          }
          
          categories[normalizedCategory].push(pattern);
          totalCommands++;
        }
      } catch (fileErr) {
        console.error(`Error reading file ${file}:`, fileErr);
      }
    }

    const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY');

    let menu = `⟣──────────────────⟢
▧ *ᴄʀᴇᴀᴛᴏʀ* : *ᴍʀ ᴄᴀsᴇʏʀʜᴏᴅᴇs (🇰🇪)*
▧ *ᴍᴏᴅᴇ* : *public*
▧ *ᴘʀᴇғɪx* : *.*
▧ *ʀᴀᴍ* : 76.28MB / 63276MB
▧ *ᴠᴇʀsɪᴏɴ* : *V.5* ⚡
▧ *ᴜᴘᴛɪᴍᴇ* : 

⟣──────────────────⟢

> 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃 

⟣──────────────────⟢`;

    // Add sorted categories with stylized text
    for (const cat of Object.keys(categories).sort()) {
      const emoji = emojiByCategory[cat] || '💫';
      menu += `\n\n*╭───『 ${emoji} ${toUpperStylized(cat)} ${toUpperStylized('Menu')} 』──⊷*\n`;
      for (const cmd of categories[cat].sort()) {
        menu += `│ ▢ *${cmd}\n*`;
      }
      menu += `*╰───────────────⊷*`;
    }

    menu += `\n\n> ${toUpperStylized('Explore the bot commands!')}`;

    const messageOptions = {
      image: { url: "https://files.catbox.moe/1bim2j.jpg" },
      caption: menu,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420261263259@newsletter',
          newsletterName: 'CASEYRHODES TECH 👑',
          serverMessageId: -1
        },
        externalAdReply: {
          title: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ",
          body: `ᴄᴀsᴇʏʀʜᴏᴅᴇs ʙᴏᴛ | ${time}`,
          mediaType: 1,
          thumbnailUrl: "https://files.catbox.moe/y3j3kl.jpg",
          sourceUrl: "https://github.com/CASEYRHODES-TECH/CASEYRHODES-XMD"
        }
      },
      mentions: [m.sender]
    };

    await Void.sendMessage(m.chat, messageOptions, { quoted: m });
  } catch (err) {
    console.error(err);
    await m.reply('❌ Error: Could not fetch the command list.');
  }
});

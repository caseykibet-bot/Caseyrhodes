const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "allmenu",
  alias: ["commandlist", "help", "menu"],
  desc: "Display all available bot commands with beautiful formatting",
  category: "system",
  filename: __filename,
}, async (Void, m, text, { prefix }) => {
  try {
    const commandDir = path.join(__dirname, '../plugins');
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    let totalCommands = 0;
    let commandList = [];
    const categories = {};

    // Process each command file
    for (const file of commandFiles) {
      const filePath = path.join(commandDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract pattern, category, and description
      const patternMatches = content.match(/pattern:\s*["'`](.*?)["'`]/g) || [];
      const categoryMatch = content.match(/category:\s*["'`](.*?)["'`]/) || ['misc'];
      const descMatch = content.match(/desc:\s*["'`](.*?)["'`]/) || ['No description'];
      
      const category = (categoryMatch[1] || 'misc').toLowerCase();
      const description = descMatch[1] || 'No description';
      const patterns = patternMatches.map(x => x.split(':')[1].replace(/["'`,]/g, '').trim());

      if (patterns.length > 0) {
        totalCommands += patterns.length;
        
        // Organize by category
        if (!categories[category]) {
          categories[category] = {
            name: category.toUpperCase(),
            commands: []
          };
        }
        
        patterns.forEach(pattern => {
          categories[category].commands.push({
            name: pattern,
            desc: description
          });
        });
      }
    }

    const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY');
    
    // Generate the menu sections
    let menuSections = [];
    for (const [category, data] of Object.entries(categories)) {
      let section = `╭───『 ${data.name} 』\n`;
      section += data.commands.map(cmd => 
        `│ ✦ ${cmd.name.padEnd(15)} ➠ ${cmd.desc}`
      ).join('\n');
      section += `\n╰─────────────────`;
      menuSections.push(section);
    }

    const caption = `╭───◇ *CASEYRHODES-XMD* ◇───
│
│ 📅 *Date:* ${date}
│ ⏰ *Time:* ${time}
│ 🤖 *Prefix:* [ ${prefix} ]
│ 📊 *Total Commands:* ${totalCommands}
│
${menuSections.join('\n\n')}
│
╰───◇ *Powered by CASEYRHODES TECH* ◇───`;

    await Void.sendMessage(m.chat, {
      image: { 
        url: "https://files.catbox.moe/y3j3kl.jpg",
        caption: caption,
      },
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "✨ CASEYRHODES TECH ✨",
          body: `🚀 Premium Bot Services | ${totalCommands} Commands Available`,
          thumbnail: await Void.getFile('https://files.catbox.moe/y3j3kl.jpg'),
          mediaType: 1,
          mediaUrl: 'https://github.com/caseyrhodes',
          sourceUrl: 'https://github.com/caseyrhodes',
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Menu Error:', err);
    await Void.sendMessage(m.chat, {
      text: '🚫 An error occurred while generating the menu. Please try again later.',
      contextInfo: {
        externalAdReply: {
          title: "Error Notification",
          body: "CASEYRHODES TECH Support",
          thumbnail: await Void.getFile('https://files.catbox.moe/error.jpg'),
          mediaType: 1
        }
      }
    });
  }
});

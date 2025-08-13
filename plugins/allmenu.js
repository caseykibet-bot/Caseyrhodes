const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "allmenu",
  alias: ["commandlist", "help", "menu"],
  desc: "Display all available bot commands",
  category: "system",
  filename: __filename,
}, async (Void, m, text, { prefix }) => {
  try {
    const commandDir = path.join(__dirname, '../plugins');
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    let totalCommands = 0;
    const categories = {};

    // Process each command file
    for (const file of commandFiles) {
      try {
        const commandModule = require(path.join(commandDir, file));
        if (!commandModule.cmd) continue;

        const commands = Array.isArray(commandModule.cmd) ? commandModule.cmd : [commandModule.cmd];
        
        for (const cmdObj of commands) {
          if (!cmdObj.pattern) continue;
          
          const pattern = typeof cmdObj.pattern === 'string' ? cmdObj.pattern : cmdObj.pattern.source;
          const category = (cmdObj.category || 'misc').toLowerCase();
          const desc = cmdObj.desc || 'No description provided';
          
          if (!categories[category]) {
            categories[category] = {
              name: category.toUpperCase(),
              commands: []
            };
          }
          
          categories[category].commands.push({
            name: pattern,
            desc: desc,
            alias: cmdObj.alias || []
          });
          
          totalCommands++;
          
          // Add aliases if they exist
          if (cmdObj.alias) {
            const aliases = Array.isArray(cmdObj.alias) ? cmdObj.alias : [cmdObj.alias];
            aliases.forEach(alias => {
              categories[category].commands.push({
                name: alias,
                desc: `(Alias of ${pattern}) ${desc}`,
                alias: []
              });
              totalCommands++;
            });
          }
        }
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const date = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY');
    
    // Generate the menu sections
    let menuSections = [];
    for (const [category, data] of Object.entries(categories)) {
      let section = `╭───『 ${data.name} 』───\n`;
      
      // Sort commands alphabetically
      data.commands.sort((a, b) => a.name.localeCompare(b.name));
      
      section += data.commands.map(cmd => {
        let commandText = `│ • ${cmd.name}`;
        if (cmd.desc) commandText += ` - ${cmd.desc}`;
        return commandText;
      }).join('\n');
      
      section += `\n╰─────────────────`;
      menuSections.push(section);
    }

    const caption = `╭───◇ *CASEYRHODES-XMD* ◇───
│
│ 👑 *Total Commands:* ${totalCommands}
│ 📅 *Date:* ${date}
│ ⏰ *Time:* ${time}
│ 🤖 *Prefix:* ${prefix}
│
${menuSections.join('\n\n')}
│
╰───◇ *Powered by CASEYRHODES TECH* ◇───`;

    // Send the message with newsletter information
    await Void.sendMessage(m.chat, {
      image: { 
        url: "https://files.catbox.moe/y3j3kl.jpg",
        caption: caption
      },
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
          thumbnail: await Void.getFile('https://files.catbox.moe/y3j3kl.jpg'),
          sourceUrl: 'https://github.com/caseyrhodes'
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
          mediaType: 1
        }
      }
    });
  }
});

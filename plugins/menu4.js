const config = require('../config');
const { runtime } = require('../lib/functions');

// Uptime calculation
const startTime = Date.now();

const formatRuntime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body?.trim() || '';
  
  if (!body.startsWith(prefix + 'menu4')) return;
  
  await m.React('🪆');
  
  const uptime = formatRuntime(Date.now() - startTime);
  const mode = m.isGroup ? "Public" : "Private";
  const ownerName = config.OWNER_NAME || "POPKID";
  
  let profilePic;
  try {
    profilePic = await sock.profilePictureUrl(m.sender, 'image');
  } catch {
    profilePic = "https://files.catbox.moe/e1k73u.jpg";
  }

  await sock.sendMessage(m.from, {
    image: { url: profilePic },
    caption: `*╭━[ ᴘᴏᴘᴋɪᴅ-ᴘᴏᴡᴇʀᴇᴅ ʙᴏᴛ ]━╮*
*┋*▧ *ᴏᴡɴᴇʀ*    : ${ownerName}
*┋*▧ *ᴠᴇʀsɪᴏɴ*  : 2.0.0
*┋*▧ *ᴍᴏᴅᴇ*     : ${mode}
*┋*▧ *ᴜᴘᴛɪᴍᴇ*   : ${uptime}
*┋*▧ *ᴘʀᴇғɪx*   : "${prefix}"
╰──────────────╶╶╶·····◈

Select a category below to view commands:`,
    buttons: [
      { 
        buttonId: `${prefix}help main`, 
        buttonText: { displayText: '🌟 MAIN MENU' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help owner`, 
        buttonText: { displayText: '👑 OWNER ZONE' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help ai`, 
        buttonText: { displayText: '🤖 AI ZONE' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help convert`, 
        buttonText: { displayText: '🎨 CONVERTERS' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help search`, 
        buttonText: { displayText: '🔍 SEARCH TOOLS' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help group`, 
        buttonText: { displayText: '👥 GROUP ZONE' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help audio`, 
        buttonText: { displayText: '🎧 AUDIO FX' }, 
        type: 1 
      },
      { 
        buttonId: `${prefix}help react`, 
        buttonText: { displayText: '😊 REACTIONS' }, 
        type: 1 
      }
    ],
    headerType: 4
  });
};

module.exports = menu;

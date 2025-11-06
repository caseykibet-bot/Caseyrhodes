const config = require("../config");
const { cmd } = require('../command');
const moment = require('moment-timezone');
const { runtime } = require('../lib/functions');
const os = require('os');

const botStartTime = Date.now();
const ALIVE_IMG = config.ALIVE_IMAGE || 'https://files.catbox.moe/y3j3kl.jpg';
const NEWSLETTER_JID = '120363420261263259@newsletter';
const AUDIO_URL = config.AUDIO_URL || 'https://files.catbox.moe/pjlpd7.mp3';

// Tiny caps mapping for lowercase letters
const tinyCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'q', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

// Function to convert string to tiny caps
const toTinyCaps = (str) => {
  return str
    .split('')
    .map((char) => tinyCapsMap[char.toLowerCase()] || char)
    .join('');
};

// Runtime function
const runtime = (seconds) => {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

cmd({
  pattern: 'alive',
  alias: ['uptime', 'runtime', 'test'],
  desc: 'Check if the bot is active.',
  category: 'system',
  filename: __filename,
}, async (Void, m, text, { prefix, pushName }) => {
  try {
    const uptime = runtime(process.uptime());
    const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);

    const caption = `
*┏─〔${pushName || 'User'}〕─⊷*
*┇ ᴜᴘᴛɪᴍᴇ: ${uptime}*
*┇ ʙᴏᴛ ɴᴀᴍᴇ: ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ*
*┇ ᴏᴡɴᴇʀ: ᴄᴀsᴇʏʀʜᴏᴅᴇs*
*┇ ᴘʟᴀᴛғᴏʀᴍ: ʜᴇʀᴏᴋᴜ*
*┇ ʀᴀᴍ: ${usedRam}ᴍʙ / ${totalRam}ᴍʙ*
*┗──────────────⊷*
> ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ
`.trim();

    const buttons = [
      {
        buttonId: "action",
        buttonText: { displayText: "ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴꜱ" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "ᴄʟɪᴄᴋ ʜᴇʀᴇ",
            sections: [
              {
                title: "ᴄᴀsᴇʏʀʜᴏᴅᴇs",
                highlight_label: "",
                rows: [
                  {
                    title: "ᴍᴇɴᴜ",
                    description: "ᴏᴘᴇɴ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ",
                    id: `${prefix}allmenu`,
                  },
                  {
                    title: "ᴏᴡɴᴇʀ",
                    description: "ᴄᴏɴᴛᴀᴄᴛ ʙᴏᴛ ᴏᴡɴᴇʀ",
                    id: `${prefix}owner`,
                  },
                  {
                    title: "ᴘɪɴɢ",
                    description: "ᴛᴇꜱᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ",
                    id: `${prefix}ping`,
                  },
                  {
                    title: "ꜱʏꜱᴛᴇᴍ",
                    description: "ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ",
                    id: `${prefix}system`,
                  },
                  {
                    title: "ʀᴇᴘᴏ",
                    description: "ɢɪᴛʜᴜʙ ʀᴇᴘᴏꜱɪᴛᴏʀʏ",
                    id: `${prefix}repo`,
                  },
                ],
              },
            ],
          }),
        },
      },
    ];

    await Void.sendMessage(m.chat, {
      buttons,
      headerType: 1,
      viewOnce: true,
      image: { url: ALIVE_IMG },
      caption,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_JID,
          newsletterName: toTinyCaps('ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ'),
          serverMessageId: 143,
        },
        externalAdReply: {
          title: "CASEYRHODES TECH",
          body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ",
          mediaType: 1,
          thumbnailUrl: ALIVE_IMG,
          sourceUrl: "https://github.com/CASEYRHODES-TECH/CASEYRHODES-XMD"
        }
      },
    }, { quoted: m });

    // Send audio if configured
    if (AUDIO_URL) {
      await Void.sendMessage(m.chat, {
        audio: { url: AUDIO_URL },
        mimetype: 'audio/mp4',
        ptt: true,
      }, { quoted: m });
    }

  } catch (error) {
    console.error('❌ Error in alive command:', error.message);
    const errorMessage = toTinyCaps(`
      An error occurred while processing the alive command.
      Error Details: ${error.message}
      Please report this issue or try again later.
    `).trim();
    return m.reply(errorMessage);
  }
});

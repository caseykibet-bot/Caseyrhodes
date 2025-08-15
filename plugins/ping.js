const config = require('../config');
const { cmd, commands } = require('../command');

const whatsappChannelLink = 'https://whatsapp.com/channel/0029VasHgfG4tRrwjAUyTs10';

const speedLatencyQuotes = [
  "Speed matters in the digital world!",
  "Efficiency is doing better what is already being done.",
  "In the race against time, every millisecond counts.",
  "Performance isn't accidental, it's designed.",
  "The faster the response, the smoother the experience."
];

// Contact message for verified context
const verifiedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "CASEYRHODES VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: Caseyrhodes VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254112192119:+254112192119\nEND:VCARD"
    }
  }
};

cmd({
  pattern: "ping",
  alias: ["speed", "pong"],
  use: '.ping',
  desc: "Check bot's response time, load, and stability.",
  category: "main",
  react: "⚡",
  filename: __filename
}, async (conn, mek, m, { from, quoted, sender, reply }) => {
  try {
    const start = Date.now();

    const statusEmojis = ['✅', '🟢', '✨', '📶', '🔋'];
    const stableEmojis = ['🟢', '✅', '🧠', '📶', '🛰️'];
    const moderateEmojis = ['🟡', '🌀', '⚠️', '🔁', '📡'];
    const slowEmojis = ['🔴', '🐌', '❗', '🚨', '💤'];

    const randomQuote = speedLatencyQuotes[Math.floor(Math.random() * speedLatencyQuotes.length)];

    const end = Date.now();
    const latencyMs = end - start;

    let stabilityEmoji = '';
    let stabilityText = '';
    let reactionEmoji = '⚡';

    if (latencyMs > 1000) {
      stabilityText = "Slow 🔴";
      stabilityEmoji = slowEmojis[Math.floor(Math.random() * slowEmojis.length)];
      reactionEmoji = '🐢';
    } else if (latencyMs > 500) {
      stabilityText = "Moderate 🟡";
      stabilityEmoji = moderateEmojis[Math.floor(Math.random() * moderateEmojis.length)];
      reactionEmoji = '🔄';
    } else {
      stabilityText = "Stable 🟢";
      stabilityEmoji = stableEmojis[Math.floor(Math.random() * stableEmojis.length)];
      reactionEmoji = '⚡';
    }

    const stylishText = `
> *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃: ${latencyMs}ms ${reactionEmoji}*
    `.trim();

    await conn.sendMessage(from, {
      text: stylishText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇",
          serverMessageId: 143
        },
        externalAdReply: {
          title: "𝐂𝐚𝐬𝐞𝐲𝐫𝐡𝐨𝐝𝐞𝐬 | 𝐩𝐢𝐧𝐠 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞🚀",
          body: "Speed • Stability • Sync",
          thumbnailUrl: 'https://files.catbox.moe/y3j3kl.jpg',
          sourceUrl: whatsappChannelLink,
          mediaType: 1,
          renderLargerThumbnail: false,
        }
      }
    }, { quoted: verifiedContact });

  } catch (e) {
    console.error("Error in ping command:", e);
    reply(`An error occurred: ${e.message}`);
  }
});

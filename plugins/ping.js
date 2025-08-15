const config = require('../config');
const { cmd, commands } = require('../command');

const whatsappChannelLink = 'https://whatsapp.com/channel/0029VasHgfG4tRrwjAUyTs10';

// Define missing arrays
const loadingMessages = [
  "Calculating response time...",
  "Measuring system performance...",
  "Checking network latency...",
  "Analyzing bot speed...",
  "Running diagnostics..."
];

const speedLatencyQuotes = [
  "Speed is the essence of war!",
  "Latency matters in the digital realm!",
  "A millisecond can make all the difference!",
  "Performance is key to success!",
  "Efficiency is doing better what is already being done!"
];

// Contact used for quoting the reply
const quotedContact = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "⚙️ Latency-Check | Verified ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:SCIFI\nORG:Shadow-Xtech BOT;\nTEL;type=CELL;type=VOICE;waid=254700000001:+254 700 000001\nEND:VCARD"
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

    const randomLoadingMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    const randomQuote = speedLatencyQuotes[Math.floor(Math.random() * speedLatencyQuotes.length)];

    await conn.sendMessage(from, { text: randomLoadingMessage });

    const end = Date.now();
    const latencyMs = end - start;

    let stabilityEmoji = '';
    let stabilityText = '';

    if (latencyMs > 1000) {
      stabilityText = "Slow 🔴";
      stabilityEmoji = slowEmojis[Math.floor(Math.random() * slowEmojis.length)];
    } else if (latencyMs > 500) {
      stabilityText = "Moderate 🟡";
      stabilityEmoji = moderateEmojis[Math.floor(Math.random() * moderateEmojis.length)];
    } else {
      stabilityText = "Stable 🟢";
      stabilityEmoji = stableEmojis[Math.floor(Math.random() * stableEmojis.length)];
    }

    const stylishText = `
  ◉ Time Sync    » *${new Date().toLocaleTimeString()}*
 ⌬━━━━━━━━━━━━━━━━━━━⌬
 ➤ *${randomQuote}*
    `.trim();

    await conn.sendMessage(from, {
      text: stylishText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363369453603973@newsletter',
          newsletterName: "𝐒ʜᴀᴅᴏᴡ 𝐗ᴛᴇᴄʜ",
          serverMessageId: 143
        },
        externalAdReply: {
          title: "⚙️ Shadow-Xtech | System Pulse",
          body: "Speed • Stability • Sync",
          thumbnailUrl: 'https://files.catbox.moe/3l3qgq.jpg',
          sourceUrl: whatsappChannelLink,
          mediaType: 1,
          renderLargerThumbnail: false,
        }
      }
    }, { quoted: quotedContact });

  } catch (e) {
    console.error("Error in ping command:", e);
    reply(`An error occurred: ${e.message}`);
  }
});

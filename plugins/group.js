const config = require('../config');
const { cmd, commands } = require('../command');
const { getBuffer } = require('../lib/functions');

const muteCommand = {
  pattern: 'mute',
  react: '🔇',
  alias: ["close", "f_mute"],
  desc: "Change group settings to only allow admins to send messages.",
  category: "group",
  use: '.mute',
  filename: __filename
};

cmd(muteCommand, async (client, message, args, {
  from: chatId,
  isGroup,
  isAdmins,
  isBotAdmins,
  isDev,
  pushname,
  reply
}) => {
  try {
    // Error messages
    if (!isGroup) return reply("This command can only be used in groups!");
    if (!isAdmins && !isDev) return reply("You need to be an admin to use this command!", { quoted: message });
    if (!isBotAdmins) return reply("The bot needs admin privileges to perform this action!");

    // Mute the group
    await client.groupSettingUpdate(chatId, 'announcement');

    // Get image buffer
    const imageUrl = 'https://i.ibb.co/8gHCXCV9/IMG-20250216-WA0009.jpg';
    const imageBuffer = await getBuffer(imageUrl);

    // Send combined message with image
    await client.sendMessage(chatId, {
      image: imageBuffer,
      caption: `*🔇 GROUP MUTED*\n\n• Action by: @${message.sender.split('@')[0]}\n• Admin: ${pushname}\n\nOnly admins can now send messages.`,
      mentions: [message.sender],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: 'CASEYRHODES-XMD💖',
          serverMessageId: 143
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('Mute Error:', error);
    await client.sendMessage(chatId, {
      react: { text: '❌', key: message.key }
    });
    reply(`❌ Error: ${error.message}`);
  }
});

const unmuteCommand = {
  pattern: 'unmute',
  react: '🔊',
  alias: ["open", 'f_unmute'],
  desc: "Change group settings to allow all members to send messages.",
  category: "group",
  use: ".unmute",
  filename: __filename
};

cmd(unmuteCommand, async (client, message, args, {
  from: chatId,
  isGroup,
  isAdmins,
  isBotAdmins,
  isDev,
  pushname,
  reply
}) => {
  try {
    // Error messages
    if (!isGroup) return reply("This command can only be used in groups!");
    if (!isAdmins && !isDev) return reply("You need to be an admin to use this command!", { quoted: message });
    if (!isBotAdmins) return reply("The bot needs admin privileges to perform this action!");

    // Unmute the group
    await client.groupSettingUpdate(chatId, "not_announcement");

    // Get image buffer
    const imageUrl = 'https://i.ibb.co/8gHCXCV9/IMG-20250216-WA0009.jpg';
    const imageBuffer = await getBuffer(imageUrl);

    // Send combined message with image
    await client.sendMessage(chatId, {
      image: imageBuffer,
      caption: `*🔊 GROUP UNMUTED*\n\n• Action by: @${message.sender.split('@')[0]}\n• Admin: ${pushname}\n\nAll members can now send messages.`,
      mentions: [message.sender],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: 'CASEYRHODES-XMD💖',
          serverMessageId: 143
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('Unmute Error:', error);
    await client.sendMessage(chatId, {
      react: { text: '❌', key: message.key }
    });
    reply(`❌ Error: ${error.message}`);
  }
});

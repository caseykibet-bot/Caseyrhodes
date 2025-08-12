const config = require('../config');
const { cmd, commands } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

const muteCommand = {
  pattern: 'mute',
  react: '🔇',
  alias: ["close", "f_mute"],
  desc: "Change to group settings to only admins can send messages.",
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
    const replyMsgs = {
      only_gp: "This command can only be used in groups!",
      you_adm: "You need to be an admin to use this command!",
      give_adm: "The bot needs to be an admin to perform this action!"
    };
    
    if (!isGroup) return reply(replyMsgs.only_gp);
    if (!isAdmins && !isDev) return reply(replyMsgs.you_adm, { quoted: message });
    if (!isBotAdmins) return reply(replyMsgs.give_adm);
    
    await client.groupSettingUpdate(chatId, 'announcement');
    
    // Combined message with image and newsletter info
    await client.sendMessage(chatId, { 
      image: { url: `https://i.ibb.co/8gHCXCV9/IMG-20250216-WA0009.jpg` },
      text: `*🔇 Group Chat Closed*\n\nAdmin: ${pushname}\n\nGroup settings updated to admin-only messaging.`,
      contextInfo: {
        mentionedJid: [message.sender],
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
    console.error(error);
    await client.sendMessage(chatId, {
      react: { text: '❌', key: message.key }
    });
    reply("❌ *Error Occurred!*\n\n" + error);
  }
});

const unmuteCommand = {
  pattern: 'unmute',
  react: '🔊',
  alias: ["open", 'f_unmute'],
  desc: "Change to group settings to all members can send messages.",
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
    const replyMsgs = {
      only_gp: "This command can only be used in groups!",
      you_adm: "You need to be an admin to use this command!",
      give_adm: "The bot needs to be an admin to perform this action!"
    };
    
    if (!isGroup) return reply(replyMsgs.only_gp);
    if (!isAdmins && !isDev) return reply(replyMsgs.you_adm, { quoted: message });
    if (!isBotAdmins) return reply(replyMsgs.give_adm);
    
    await client.groupSettingUpdate(chatId, "not_announcement");
    
    // Combined message with image and newsletter info
    await client.sendMessage(chatId, { 
      image: { url: `https://i.ibb.co/8gHCXCV9/IMG-20250216-WA0009.jpg` },
      text: `*🔊 Group Chat Opened*\n\nAdmin: ${pushname}\n\nGroup settings updated to allow all members to message.`,
      contextInfo: {
        mentionedJid: [message.sender],
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
    console.error(error);
    await client.sendMessage(chatId, {
      react: { text: '❌', key: message.key }
    });
    reply("❌ *Error Occurred!*\n\n" + error);
  }
});

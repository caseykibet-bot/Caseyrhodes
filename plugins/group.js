const config = require("../config");

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
    // Hardcoded reply messages
    const replyMsgs = {
      only_gp: "This command can only be used in groups!",
      you_adm: "You need to be an admin to use this command!",
      give_adm: "The bot needs to be an admin to perform this action!"
    };
    
    if (!isGroup) {
      return reply(replyMsgs.only_gp);
    }
    
    if (!isAdmins) {
      if (!isDev) {
        return reply(replyMsgs.you_adm, { quoted: message });
      }
    }
    
    if (!isBotAdmins) {
      return reply(replyMsgs.give_adm);
    }
    
    await client.groupSettingUpdate(chatId, 'announcement');
    await client.sendMessage(chatId, {
      text: `*Group Chat closed by Admin ${pushname}* 🔇`
    }, { quoted: message });
    
  } catch (error) {
    console.error(error);
    await client.sendMessage(chatId, {
      react: {
        text: '❌',
        key: message.key
      }
    });
    reply("❌ *Error Occurred !!*\n\n" + error);
  }
});

const unmuteCommand = {
  pattern: 'unmute',
  react: '🔇',
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
    // Hardcoded reply messages
    const replyMsgs = {
      only_gp: "This command can only be used in groups!",
      you_adm: "You need to be an admin to use this command!",
      give_adm: "The bot needs to be an admin to perform this action!"
    };
    
    if (!isGroup) {
      return reply(replyMsgs.only_gp);
    }
    
    if (!isAdmins) {
      if (!isDev) {
        return reply(replyMsgs.you_adm, { quoted: message });
      }
    }
    
    if (!isBotAdmins) {
      return reply(replyMsgs.give_adm);
    }
    
    await client.groupSettingUpdate(chatId, "not_announcement");
    await client.sendMessage(chatId, {
      text: `*Group Chat Opened by Admin ${pushname}* 🔇`
    }, { quoted: message });
    
  } catch (error) {
    console.error(error);
    await client.sendMessage(chatId, {
      react: {
        text: '❌',
        key: message.key
      }
    });
    reply("❌ *Error Occurred !!*\n\n" + error);
  }
});

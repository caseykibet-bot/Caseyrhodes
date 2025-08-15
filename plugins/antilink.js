const { cmd } = require('../command');
const config = require("../config");

cmd({
  'on': "text" // Changed from 'body' to 'text' for better message handling
}, async (conn, m, store, {
  from,
  text,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // List of link patterns to detect (updated with more comprehensive patterns)
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi, // WhatsApp links
      /https?:\/\/(?:api\.whatsapp\.com)\/\S+/gi,         // WhatsApp API links
      /wa\.me\/\S+/gi,                                    // WhatsApp.me links
      /https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/\S+/gi, // Telegram links
      /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.(?:com|net|org|io|xyz)\/\S+/gi, // Generic domain links
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\S+/gi,   // Twitter/X links
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,        // LinkedIn links
      /https?:\/\/(?:www\.)?(?:whatsapp|channel)\.(?:com|me)\/\S+/gi, // Other WhatsApp/channel links
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,          // Reddit links
      /https?:\/\/(?:www\.)?discord\.(?:com|gg)\/\S+/gi,  // Discord links
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,           // Twitch links
      /https?:\/\/(?:www\.)?(?:vimeo|dailymotion|medium)\.com\/\S+/gi, // Video/content links
      /https?:\/\/(?:www\.)?(?:youtube|youtu\.be)\/\S+/gi, // YouTube links
      /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,       // Instagram links
      /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,        // Facebook links
      /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi          // TikTok links
    ];

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(text));

    // Only proceed if anti-link is enabled and link is detected
    if (containsLink && config.ANTI_LINK === 'true') {
      console.log(`Link detected from ${sender}: ${text}`);

      // Try to delete the message using latest API
      try {
        await conn.sendMessage(from, {
          delete: {
            id: m.key.id,
            remoteJid: from,
            fromMe: false
          }
        });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];

      // Handle warnings
      if (warningCount < 4) {
        // Send warning message with updated formatting
        await conn.sendMessage(from, {
          text: `╔════════════════╗\n` +
                `   *⚠️ LINK DETECTED ⚠️*\n` +
                `╚════════════════╝\n` +
                `\n` +
                `• *User:* @${sender.split('@')[0]}\n` +
                `• *Warnings:* ${warningCount}/3\n` +
                `• *Reason:* Sending links\n` +
                `\n` +
                `_⚠️ Next violation will result in removal!_`,
          mentions: [sender]
        }, { quoted: m });
      } else {
        // Remove user if they exceed warning limit
        try {
          await conn.groupParticipantsUpdate(from, [sender], "remove");
          await conn.sendMessage(from, {
            text: `🚫 @${sender.split('@')[0]} has been removed for exceeding link warnings!`,
            mentions: [sender]
          }, { quoted: m });
          delete global.warnings[sender];
        } catch (removeError) {
          console.error("Failed to remove user:", removeError);
          await conn.sendMessage(from, {
            text: `⚠️ Failed to remove @${sender.split('@')[0]}! Please check bot permissions.`,
            mentions: [sender]
          }, { quoted: m });
        }
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});

// Toggle commands
cmd({
  pattern: 'antilink',
  desc: 'Toggle anti-link feature',
  category: 'group',
  fromMe: true,
  isGroup: true,
  isBotAdmins: true
}, async (conn, m, match, { isAdmins, from }) => {
  try {
    const groupId = from;
    
    // Toggle status
    antiLinkStatus[groupId] = antiLinkStatus[groupId] === undefined ? false : !antiLinkStatus[groupId];
    
    const status = antiLinkStatus[groupId] === false ? 'disabled' : 'enabled';
    await conn.sendMessage(from, { text: `Anti-link feature is now ${status} for this group.` });
  } catch (error) {
    console.error('Toggle anti-link error:', error);
    await conn.sendMessage(from, { text: 'Failed to toggle anti-link feature.' });
  }
});

// Status command
cmd({
  pattern: 'antilinkstatus',
  desc: 'Check anti-link status',
  category: 'group',
  fromMe: true,
  isGroup: true
}, async (conn, m, match, { from }) => {
  try {
    const groupId = from;
    const status = antiLinkStatus[groupId] === false ? 'disabled' : 'enabled';
    await conn.sendMessage(from, { text: `Anti-link feature is currently ${status} for this group.` });
  } catch (error) {
    console.error('Status check error:', error);
  }
});

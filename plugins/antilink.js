const { cmd } = require('../command');
const config = require('../config');

// Store anti-link status per group
const antiLinkStatus = {};

const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];

// Anti-link handler
cmd({
  on: 'text'
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    
    // Check if anti-link is enabled for this group (default to true if not set)
    const groupId = from;
    if (antiLinkStatus[groupId] === false) return;

    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink) {
      await conn.sendMessage(from, { delete: m.key });
      await conn.sendMessage(from, { text: `@${sender.split('@')[0]}, Links are not allowed here!` }, { mentions: [sender] });
    }
  } catch (error) {
    console.error('Anti-link error:', error);
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

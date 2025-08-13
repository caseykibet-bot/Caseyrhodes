const config = require('../config');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Global start time for uptime calculation
const startTime = Date.now();

// Uptime formatter
const formatRuntime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Function to generate command boxes
const boxify = (title, cmds) => {
  let out = `╭───[ ${title} ]\n`;
  const perLine = 3;
  for (let i = 0; i < cmds.length; i += perLine) {
    const lineCommands = cmds.slice(i, i + perLine);
    out += "│ " + lineCommands.map(c => c.padEnd(10, ' ')).join('') + "\n";
  }
  out += "╰─────────────";
  return out;
};

// Command sections
const sections = {
  main: boxify("🌟 MAIN MENU", [
    ".menu", ".speed", ".alive", ".bugmenu", ".owner", ".allcmds",
    ".addpremium", ".repo", ".dev", ".ping", ".version"
  ]),
  owner: boxify("👑 OWNER ZONE", [
    ".join", ".autoread", ".pair", ".leave", ".jid", ".autoblock", ".statusreply",
    ".restart", ".host", ".upload", ".vv", ".alwaysonline", ".block", ".unblock",
    ".setstatusmsg", ".setprefix", ".setownername"
  ]),
  ai: boxify("🤖 AI ZONE", [
    ".ai", ".gpt", ".lydia", ".gemini", ".chatbot"
  ]),
  convert: boxify("🎨 CONVERTERS", [
    ".attp", ".sticker", ".take", ".mp3", ".idch", ".ss", ".shorten"
  ]),
  search: boxify("🔍 SEARCH TOOLS", [
    ".play", ".video", ".song", ".ytsearch", ".mediafire", ".facebook", ".instagram",
    ".tiktok", ".githubstalk", ".lyrics", ".app", ".pinterest", ".imdb", ".ipstalk"
  ]),
  group: boxify("👥 GROUP ZONE", [
    ".kickall", ".remove", ".tagall", ".hidetag", ".group open", ".group close", ".add",
    ".vcf", ".left", ".promoteall", ".demoteall", ".setdescription", ".linkgc", ".antilink",
    ".antisticker", ".antispam", ".create", ".setname", ".promote", ".demote",
    ".groupinfo", ".balance"
  ]),
  audio: boxify("🎧 AUDIO FX", [
    ".earrape", ".deep", ".blown", ".bass", ".nightcore", ".fat", ".fast", ".robot",
    ".tupai", ".smooth", ".slow", ".reverse"
  ]),
  react: boxify("😊 REACTIONS", [
    ".bonk", ".bully", ".yeet", ".slap", ".nom", ".poke", ".awoo", ".wave", ".smile",
    ".dance", ".smug", ".blush", ".cringe", ".sad", ".happy", ".shinobu", ".cuddle",
    ".glomp", ".handhold", ".highfive", ".kick", ".kill", ".kiss", ".cry", ".bite",
    ".lick", ".pat", ".hug"
  ])
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';

  const uptime = formatRuntime(Date.now() - startTime);
  const mode = m.isGroup ? "Public" : "Private";
  const ownerName = config.OWNER_NAME || "POPKID";

  let profilePic = "https://files.catbox.moe/e1k73u.jpg";
  try {
    const fetchedPic = await sock.profilePictureUrl(m.sender, 'image');
    if (fetchedPic) profilePic = fetchedPic;
  } catch {}

  // Main menu handler
  if (cmd === 'menu4') {
    await m.React('🪆');
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
        { buttonId: `${prefix}mainmenu`, buttonText: { displayText: '🌟 MAIN MENU' }, type: 1 },
        { buttonId: `${prefix}ownermenu`, buttonText: { displayText: '👑 OWNER ZONE' }, type: 1 },
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: '🤖 AI ZONE' }, type: 1 },
        { buttonId: `${prefix}convertmenu`, buttonText: { displayText: '🎨 CONVERTERS' }, type: 1 },
        { buttonId: `${prefix}searchmenu`, buttonText: { displayText: '🔍 SEARCH TOOLS' }, type: 1 },
        { buttonId: `${prefix}groupmenu`, buttonText: { displayText: '👥 GROUP ZONE' }, type: 1 },
        { buttonId: `${prefix}audiomenu`, buttonText: { displayText: '🎧 AUDIO FX' }, type: 1 },
        { buttonId: `${prefix}reactmenu`, buttonText: { displayText: '😊 REACTIONS' }, type: 1 }
      ],
      headerType: 4
    });
  }

  // Section menu handler
  const validMenus = [
    'mainmenu', 'ownermenu', 'aimenu', 'convertmenu',
    'searchmenu', 'groupmenu', 'audiomenu', 'reactmenu'
  ];
  
  if (validMenus.includes(cmd)) {
    const sectionKey = cmd.replace('menu', '');
    if (sections[sectionKey]) {
      await sock.sendMessage(
        m.from, 
        { text: sections[sectionKey] }, 
        { quoted: m }
      );
    }
  }
};

module.exports = menu;

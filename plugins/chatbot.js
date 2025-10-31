const axios = require("axios");
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

let AI_STATE = {
  'INBOX': "false",
  'GROUP': "false"
};

// Load AI state from config on startup
(async () => {
  const savedState = await getConfig("AI_STATE");
  if (savedState) {
    AI_STATE = JSON.parse(savedState);
  }
})();

/**
 * Chatbot command handler
 * Enable/disable AI chatbot responses
 */
cmd({
  'pattern': 'chatbot',
  'alias': ["aichat", 'casey', "caseyai"],
  'desc': "Enable or disable Casey Rhodes AI responses",
  'category': "settings",
  'filename': __filename,
  'react': '✅'
}, async (message, client, args, { from, args: commandArgs, isOwner, reply, prefix }) => {
  if (!isOwner) {
    return reply("*📛 Only the owner can use this command!*");
  }

  const action = commandArgs[0]?.toLowerCase();
  const scope = commandArgs[1]?.toLowerCase();

  if (action === 'on') {
    return handleEnableAI(scope, reply);
  } else if (action === 'off') {
    return handleDisableAI(scope, reply);
  } else {
    return showHelpMenu(reply);
  }
});

/**
 * Enable AI in specified scope
 */
async function handleEnableAI(scope, reply) {
  if (!scope || scope === 'all') {
    AI_STATE.INBOX = "true";
    AI_STATE.GROUP = "true";
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now enabled for both inbox and group chats");
  } else if (scope === 'ib') {
    AI_STATE.INBOX = "true";
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now enabled for inbox chats");
  } else if (scope === 'gc') {
    AI_STATE.GROUP = 'true';
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now enabled for group chats");
  }
}

/**
 * Disable AI in specified scope
 */
async function handleDisableAI(scope, reply) {
  if (!scope || scope === 'all') {
    AI_STATE.INBOX = "false";
    AI_STATE.GROUP = "false";
    await setConfig('AI_STATE', JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now disabled for both inbox and group chats");
  } else if (scope === 'ib') {
    AI_STATE.INBOX = 'false';
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now disabled for inbox chats");
  } else if (scope === 'gc') {
    AI_STATE.GROUP = 'false';
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("🤖 Casey Rhodes AI is now disabled for group chats");
  }
}

/**
 * Show help menu
 */
function showHelpMenu(reply) {
  const helpText = `
- *Casey Rhodes AI Menu 🤖*

*Enable Settings ✅*      
> .chatbot on all - Enable AI in all chats
> .chatbot on ib - Enable AI in inbox only
> .chatbot on gc - Enable AI in groups only

*Disable Settings ❌*
> .chatbot off all - Disable AI in all chats
> .chatbot off ib - Disable AI in inbox only
> .chatbot off gc - Disable AI in groups only
  `.trim();

  return reply(helpText);
}

/**
 * AI Chatbot message handler
 */
cmd({
  'on': 'body'
}, async (message, msg, client, { from, body, sender, isGroup, isBotAdmins, isAdmins, reply, quotedMsg }) => {
  try {
    // Check if this is a quoted message targeting the bot
    if (!isQuotedMessageToBot(msg, message.user.id)) {
      return;
    }

    const isInbox = !isGroup;
    
    // Check if AI is enabled for this chat type
    if ((isInbox && AI_STATE.INBOX !== 'true') || (isGroup && AI_STATE.GROUP !== "true")) {
      return;
    }

    // Ignore empty messages, bot's own messages, and commands
    if (!body || msg.key.fromMe || body.startsWith(config.PREFIX)) {
      return;
    }

    // Handle time/date queries
    if (isTimeQuery(body)) {
      return handleTimeQuery(reply);
    }

    // Process AI response
    await generateAIResponse(body, message, from, msg, reply);

  } catch (error) {
    console.error("Casey Rhodes AI Error:", error.message);
    reply("❌ An error occurred while contacting Casey Rhodes AI.");
  }
});

/**
 * Check if message is quoted to the bot
 */
function isQuotedMessageToBot(msg, userId) {
  if (!msg?.message?.extendedTextMessage?.contextInfo?.participant) {
    return false;
  }

  const quotedParticipant = msg.message.extendedTextMessage.contextInfo.participant;
  const botId = userId.split(':')[0] + "@s.whatsapp.net";
  
  return quotedParticipant === botId;
}

/**
 * Check if message is a time/date query
 */
function isTimeQuery(message) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes("time") || lowerMessage.includes("date");
}

/**
 * Handle time/date query
 */
function handleTimeQuery(reply) {
  const currentDate = new Date();
  const options = {
    'weekday': "long",
    'year': "numeric",
    'month': "long",
    'day': "numeric",
    'hour': "2-digit",
    'minute': "2-digit",
    'second': "2-digit",
    'timeZoneName': "short"
  };
  
  const formattedTime = currentDate.toLocaleDateString('en-US', options);
  return reply("⏰ Current Date & Time:\n" + formattedTime + "\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Casey Rhodes AI ⚡");
}

/**
 * Generate AI response using API
 */
async function generateAIResponse(userMessage, message, chatId, originalMsg, reply) {
  const encodedMessage = encodeURIComponent(userMessage);
  const systemPrompt = encodeURIComponent(
    "You are Casey Rhodes AI, a powerful and intelligent WhatsApp bot with advanced capabilities. You respond smartly, confidently, and provide helpful assistance. Always remain calm and collected while delivering accurate and useful responses. You are designed to be a reliable AI companion that users can count on for information and support. In every message you send, include this footer: \n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Casey Rhodes AI ⚡"
  );

  const apiUrl = `https://bk9.fun/ai/BK93?BK9=${systemPrompt}&q=${encodedMessage}`;
  
  try {
    const { data } = await axios.get(apiUrl);
    
    if (data?.status && data.BK9) {
      await message.sendMessage(chatId, {
        'text': data.BK9
      }, {
        'quoted': originalMsg
      });
    } else {
      reply("⚠️ Casey Rhodes AI failed to generate a response.");
    }
  } catch (error) {
    console.error("Casey Rhodes AI API Error:", error.message);
    reply("❌ Failed to connect to Casey Rhodes AI service.");
  }
}

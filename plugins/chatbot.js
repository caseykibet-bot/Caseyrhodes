const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Response cache to avoid duplicate processing
const messageCache = new Set();

// Global chatbot state (true = enabled, false = disabled)
let chatbotEnabled = true;

// User/group specific chatbot states
const userChatbotStates = new Map();

// Groq API configuration
const GROQ_API_KEY = 'gifted';
const GROQ_API_URL = 'https://api.giftedtech.co.ke/api/ai/groq-beta';

async function getGroqResponse(prompt) {
  try {
    const response = await axios.get(`${GROQ_API_URL}?apikey=${GROQ_API_KEY}&q=${encodeURIComponent(prompt)}`);
    return response.data?.result || "I couldn't process that request. Please try again.";
  } catch (error) {
    console.error('Groq API Error:', error);
    return "Sorry, I'm having trouble connecting to the AI service.";
  }
}

// Chatbot toggle commands
cmd({
    pattern: "chatbot",
    alias: ["ai", "bot"],
    desc: "Enable/disable chatbot",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, isGroup }) => {
    try {
        const args = text ? text.trim().toLowerCase() : '';
        
        if (args === 'on' || args === 'enable') {
            if (isGroup) {
                userChatbotStates.set(from, true);
                await reply("🤖 *ChatBot Enabled*\n\nAI responses are now active in this group!");
            } else {
                chatbotEnabled = true;
                await reply("🤖 *ChatBot Enabled*\n\nAI responses are now active!");
            }
            return;
        }
        
        if (args === 'off' || args === 'disable') {
            if (isGroup) {
                userChatbotStates.set(from, false);
                await reply("🤖 *ChatBot Disabled*\n\nAI responses are now turned off in this group!");
            } else {
                chatbotEnabled = false;
                await reply("🤖 *ChatBot Disabled*\n\nAI responses are now turned off!");
            }
            return;
        }
        
        if (args === 'status' || args === 'info') {
            let status;
            if (isGroup) {
                status = userChatbotStates.get(from) !== false;
            } else {
                status = chatbotEnabled;
            }
            
            await reply(`🤖 *ChatBot Status:* ${status ? 'ENABLED ✅' : 'DISABLED ❌'}\n\nUse *${config.PREFIX}chatbot on* to enable\nUse *${config.PREFIX}chatbot off* to disable`);
            return;
        }

        // Default help
        await reply(`🤖 *ChatBot Commands*\n\n` +
                   `*${config.PREFIX}chatbot on* - Enable AI responses\n` +
                   `*${config.PREFIX}chatbot off* - Disable AI responses\n` +
                   `*${config.PREFIX}chatbot status* - Check current status\n\n` +
                   `Just chat normally when AI is enabled!`);

    } catch (error) {
        console.error('Chatbot command error:', error);
        await reply('❌ Error processing chatbot command.');
    }
});

// Auto-response handler (to be used in main handler)
async function handleChatbot(conn, mek, m, { from, sender, text, isGroup }) {
    try {
        // Ignore messages from status broadcasts or cached messages
        if (from.endsWith('@broadcast') || messageCache.has(mek.key.id)) {
            return;
        }

        // Add message to cache to prevent duplicate processing
        messageCache.add(mek.key.id);
        
        // Clean the cache periodically
        if (messageCache.size > 100) {
            messageCache.clear();
        }

        // Check if chatbot is disabled (globally or for this group)
        const isChatbotDisabled = isGroup 
            ? userChatbotStates.get(from) === false 
            : !chatbotEnabled;

        if (isChatbotDisabled) {
            return;
        }

        // Ignore empty messages or commands with prefix
        if (!text || text.startsWith(config.PREFIX)) {
            return;
        }

        // Ignore very short messages (optional)
        if (text.length < 2) {
            return;
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);

        // Get response from Groq API
        const aiResponse = await getGroqResponse(text);

        // Send the response without buttons
        await conn.sendMessage(from, { 
            text: `🤖 *AI Response:*\n\n${aiResponse}\n\n_Use ${config.PREFIX}chatbot off to disable AI_`
        }, { quoted: mek });

    } catch (error) {
        console.error('Chatbot auto-response error:', error);
        // Don't send error message to avoid spam
    }
}

module.exports = {
    handleChatbot,
    chatbotEnabled,
    userChatbotStates
};

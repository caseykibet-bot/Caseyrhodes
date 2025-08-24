const { cmd } = require('../command');
const axios = require('axios');

// Create a reusable axios instance with better configuration
const apiClient = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'CaseyRhodes-Bot/1.0'
  }
});

// Cache for frequently used responses
const responseCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt","gpt5"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        // Check cache first
        const cacheKey = `openai-${q}`;
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
            await reply(`🧠 *OpenAI Response:*\n\n${cachedResponse.data}`);
            await react("✅");
            return;
        }

        await react("⏳");
        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await apiClient.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        // Cache the response
        responseCache.set(cacheKey, {
            data: data.result,
            timestamp: Date.now()
        });

        await reply(`🧠 *OpenAI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "ai",
    alias: ["bot", "xd", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        // Check cache first
        const cacheKey = `ai-${q}`;
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
            await sendAiResponse(conn, from, mek, m, cachedResponse.data);
            await react("✅");
            return;
        }

        await react("⏳");
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await apiClient.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }
        
        // Cache the response
        responseCache.set(cacheKey, {
            data: data.message,
            timestamp: Date.now()
        });
        
        await sendAiResponse(conn, from, mek, m, data.message);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

// Helper function to send AI response with proper verification and newsletter
async function sendAiResponse(conn, from, mek, m, message) {
    const status = `🤖 *CASEYRHODES-XMD AI Response:*\n\n${message}`;
    
    // Fixed verification contact
    const verifiedContact = {
        displayName: "CASEYRHODES VERIFIED ✅",
        contacts: [{
            displayName: "CASEYRHODES VERIFIED ✅",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:CASEYRHODES VERIFIED ✅
ORG:CASEYRHODES-TECH BOT;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }]
    };

    try {
        // Send image with caption and context info including newsletter
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐈 🤖',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
        // Send contact separately if needed
        // await conn.sendMessage(from, { contacts: verifiedContact }, { quoted: mek });
    } catch (error) {
        console.error("Error sending AI response:", error);
        // Fallback to simple text response if rich media fails
        await conn.sendMessage(from, { text: status }, { quoted: mek });
    }
}
         
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "👾",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        // Check cache first
        const cacheKey = `deepseek-${q}`;
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
            await reply(`👾 *DeepSeek AI Response:*\n\n${cachedResponse.data}`);
            await react("✅");
            return;
        }

        await react("⏳");
        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await apiClient.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        // Cache the response
        responseCache.set(cacheKey, {
            data: data.answer,
            timestamp: Date.now()
        });

        await reply(`👾 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});

// Periodically clean up cache to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            responseCache.delete(key);
        }
    }
}, 600000); // Clean up every 10 minutes

const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Message memory for conversation context
let messageMemory = new Map();
const MAX_MEMORY = 100;

// Function to manage conversation memory
function updateMemory(chatId, message, isUser = true) {
    if (!messageMemory.has(chatId)) {
        messageMemory.set(chatId, []);
    }
    
    const chatMemory = messageMemory.get(chatId);
    chatMemory.push({
        role: isUser ? "user" : "assistant",
        content: message,
        timestamp: Date.now()
    });
    
    if (chatMemory.length > MAX_MEMORY) {
        messageMemory.set(chatId, chatMemory.slice(-MAX_MEMORY));
    }
}

// Function to detect specific questions
function detectSpecialQuestions(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Owner/Creator questions
    const ownerQuestions = [
        "who is your creator", "who is your owner", "who owns you",
        "who is your boss", "who created you", "who made you",
        "who developed you", "who is your developer", "who built you",
        "what is your creator name", "who is casey", "who is caseyrhodes"
    ];
    
    // Contact questions
    const contactQuestions = [
        "what is your owner number", "contact your owner", "owner contact",
        "owner number", "creator number", "contact creator",
        "how to contact owner", "whatsapp number of owner"
    ];
    
    // Bot identity questions
    const botQuestions = [
        "who are you", "what are you", "what is your name",
        "introduce yourself", "tell me about yourself"
    ];
    
    // Special commands
    const specialCommands = [
        "reset chat", "clear memory", "forget everything",
        "start over", "new chat"
    ];

    if (ownerQuestions.some(q => lowerQuery.includes(q))) {
        return 'owner';
    } else if (contactQuestions.some(q => lowerQuery.includes(q))) {
        return 'contact';
    } else if (botQuestions.some(q => lowerQuery.includes(q))) {
        return 'bot_identity';
    } else if (specialCommands.some(q => lowerQuery.includes(q))) {
        return 'reset';
    }
    
    return false;
}

// Function to get special responses
function getSpecialResponse(type, query) {
    const ownerInfo = {
        name: "CASEYRHODES-AI",
        number: config.OWNER_NUMBER || "Not configured",
        description: "a brilliant and unique programmer whose creativity brings me to life, writing code with precision and elegance, passionate about technology and innovation, inspiring others with his genius, and making every bot a reflection of his extraordinary skills."
    };

    switch(type) {
        case 'owner':
            return `🤖 *Creator Information:*\n\n` +
                   `• *Name:* ${ownerInfo.name}\n` +
                   `• *Description:* ${ownerInfo.description}\n` +
                   `• *Contact:* ${ownerInfo.number}\n\n` +
                   `I was created with passion and dedication to serve you better! ☕`;

        case 'contact':
            return `📞 *Contact Information:*\n\n` +
                   `You can contact my creator ${ownerInfo.name} at:\n` +
                   `• *WhatsApp:* ${ownerInfo.number}\n\n` +
                   `Please be respectful and only contact for important matters!`;

        case 'bot_identity':
            return `🤖 *About Me:*\n\n` +
                   `I'm CASEYRHODES-XMD AI, an advanced AI assistant created by ${ownerInfo.name}.\n\n` +
                   `*Capabilities:*\n` +
                   `• Natural language conversations\n` +
                   `• Multiple AI model integrations\n` +
                   `• Context-aware responses\n` +
                   `• Memory across conversations\n\n` +
                   `I'm here to help you with various tasks and questions!`;

        case 'reset':
            return `🔄 *Chat memory has been reset!*\n\nLet's start our conversation fresh. How can I help you today?`;

        default:
            return null;
    }
}

// Fake verification context function
function getVerifiedContext(sender) {
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363302677217436@newsletter',
            newsletterName: 'CASEYRHODES VERIFIED ✅',
            serverMessageId: -1
        }
    };
}

// Fake verification contact message
function getVerifiedContact() {
    return {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: "CASEYRHODES VERIFIED ✅",
                vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Caseyrhodes VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD"
            }
        }
    };
}

// OpenAI command with fake verification
cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt", "gpt5"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        // Check for special questions
        const specialType = detectSpecialQuestions(q);
        if (specialType) {
            const specialResponse = getSpecialResponse(specialType, q);
            if (specialType === 'reset') {
                messageMemory.delete(from);
            }
            
            // Send special response with fake verification
            await conn.sendMessage(from, { 
                text: specialResponse,
                contextInfo: getVerifiedContext(m.sender)
            }, { quoted: mek });
            
            await react("✅");
            return;
        }

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        // Send response with fake verification
        await conn.sendMessage(from, { 
            text: `🧠 *OpenAI Response:*\n\n${data.result}`,
            contextInfo: getVerifiedContext(m.sender)
        }, { quoted: mek });
        
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

// Main AI command with fake verification
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
        
        // Check for special questions
        const specialType = detectSpecialQuestions(q);
        if (specialType) {
            const specialResponse = getSpecialResponse(specialType, q);
            
            if (specialType === 'reset') {
                messageMemory.delete(from);
            }
            
            // Send with fake verification and image
            await conn.sendMessage(from, { 
                image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
                caption: specialResponse,
                contextInfo: getVerifiedContext(m.sender)
            }, { quoted: mek });
            
            await react("✅");
            return;
        }

        // Update memory with user query
        updateMemory(from, q, true);

        // Get conversation context for better responses
        const context = messageMemory.has(from) 
            ? messageMemory.get(from).slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')
            : `user: ${q}`;

        const enhancedQuery = `Context: ${context}\n\nCurrent query: ${q}`;

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(enhancedQuery)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }
        
        // Update memory with AI response
        updateMemory(from, data.message, false);
        
        const status = `🤖 *CASEYRHODES-XMD AI Response:*\n\n${data.message}`;
        
        // Send image + caption with fake verification
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
            caption: status,
            contextInfo: getVerifiedContext(m.sender)
        }, { quoted: mek });

        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

// DeepSeek AI command with fake verification
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

        // Check for special questions
        const specialType = detectSpecialQuestions(q);
        if (specialType) {
            const specialResponse = getSpecialResponse(specialType, q);
            if (specialType === 'reset') {
                messageMemory.delete(from);
            }
            
            // Send with fake verification
            await conn.sendMessage(from, { 
                text: specialResponse,
                contextInfo: getVerifiedContext(m.sender)
            }, { quoted: mek });
            
            await react("✅");
            return;
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        // Send response with fake verification
        await conn.sendMessage(from, { 
            text: `👾 *DeepSeek AI Response:*\n\n${data.answer}`,
            contextInfo: getVerifiedContext(m.sender)
        }, { quoted: mek });
        
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});

// Memory command with fake verification
cmd({
    pattern: "memory",
    alias: ["chatstatus", "mem"],
    desc: "Check conversation memory status",
    category: "ai",
    react: "💾",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    const memory = messageMemory.get(from);
    const messageCount = memory ? memory.length : 0;
    
    const statusMessage = `💾 *Memory Status:*\n\n` +
                `• Messages in memory: ${messageCount}\n` +
                `• Memory limit: ${MAX_MEMORY} messages\n` +
                `• Chat ID: ${from}\n\n` +
                `Use \`.ai reset chat\` to clear memory.`;
    
    // Send with fake verification
    await conn.sendMessage(from, { 
        text: statusMessage,
        contextInfo: getVerifiedContext(m.sender)
    }, { quoted: mek });
    
    await react("✅");
});

// Additional command to send verification contact
cmd({
    pattern: "verify",
    alias: ["verified", "checkverify"],
    desc: "Check bot verification status",
    category: "ai",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        // Send fake verification contact
        await conn.sendMessage(from, getVerifiedContact());
        
        // Send verification message
        await conn.sendMessage(from, { 
            text: `✅ *CASEYRHODES AI - VERIFIED STATUS*\n\n` +
                  `• *Bot Name:* CASEYRHODES-XMD AI\n` +
                  `• *Status:* VERIFIED ✅\n` +
                  `• *Newsletter:* CASEYRHODES VERIFIED ✅\n` +
                  `• *Server ID:* 120363302677217436\n\n` +
                  `This bot is officially verified and trusted!`,
            contextInfo: getVerifiedContext(m.sender)
        }, { quoted: mek });
        
        await react("✅");
    } catch (e) {
        console.error("Error in verify command:", e);
        await react("❌");
    }
});

//---------------------------------------------------------------------------
//          𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇 🌟
//---------------------------------------------------------------------------
//  ⚠️ DO NOT MODIFY THIS FILE ⚠️  
//---------------------------------------------------------------------------
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper function to send responses with newsletter info, image, and reactions
async function sendResponse(conn, from, replyText, quotedMsg, commandName = '') {
    try {
        // Send reaction first
        if (commandName) {
            try {
                await conn.sendMessage(from, {
                    react: {
                        text: "🌟",
                        key: quotedMsg.key
                    }
                });
            } catch (reactError) {
                console.log('Reaction failed, continuing...');
            }
        }

        // Send audio reaction
        try {
            await conn.sendMessage(from, {
                audio: { 
                    url: "https://files.catbox.moe/6u8a3p.mp3" // Success sound effect
                },
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: quotedMsg });
        } catch (audioError) {
            console.log('Audio reaction failed, continuing...');
        }

        // Create newsletter message with proper context
        const messageOptions = {
            image: { url: `https://i.ibb.co/gKnBmq8/casey.jpg` },
            caption: replyText,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ʙᴏᴛ🌟',
                    serverMessageId: -1
                }
            }
        };
        
        await conn.sendMessage(from, messageOptions, { quoted: quotedMsg });
    } catch (error) {
        console.error('Error sending newsletter message:', error);
        // Fallback: send normal message with reaction
        try {
            await conn.sendMessage(from, { 
                text: replyText 
            }, { quoted: quotedMsg });
            
            // Try to send reaction in fallback
            try {
                await conn.sendMessage(from, {
                    react: {
                        text: "🌟",
                        key: quotedMsg.key
                    }
                });
            } catch (reactError) {
                console.log('Fallback reaction failed');
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
    }
}

cmd({
    pattern: "adminevents",
    alias: ["adminevents"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return await sendResponse(conn, from, "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄ

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const getRandomImage = () => {
    try {
        const srcPath = path.join(__dirname, '../src');
        const files = fs.readdirSync(srcPath);
        const imageFiles = files.filter(file => 
            file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
        );
        
        if (imageFiles.length === 0) {
            console.log('No image files found in src folder');
            return 'https://files.catbox.moe/y3j3kl.jpg'; 
        }
        
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        return path.join(srcPath, randomImage);
    } catch (e) {
        console.log('Error getting random image:', e);
        return 'https://files.catbox.moe/wklbg4.jpg'; 
    }
};

cmd({
    pattern: "button",
    desc: "Show interactive menu system with buttons",
    category: "menu",
    react: "🧾",
    filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const totalCommands = Object.keys(commands).length;
        
        // Main menu with buttons
        const menuCaption = `🌟 *Good ${
            new Date().getHours() < 12 ? 'Morning' : 
            (new Date().getHours() < 18 ? 'Afternoon' : 'Evening')
        }, ${pushname}!* 🌟
╭━━━《 *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐗𝐌𝐃* 》━━━┈⊷
┃❍⁠⁠⁠⁠╭──────────────
┃❍⁠⁠⁠⁠│▸  Usᴇʀ : ${config.OWNER_NAME}
┃❍⁠⁠⁠⁠│▸  ʙᴀɪʟᴇʏs : 𝐌𝐮𝐥𝐭𝐢 𝐝𝐞𝐯𝐢𝐜𝐞
┃❍⁠⁠⁠⁠│▸  ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs : *${totalCommands}*
┃❍⁠⁠⁠⁠│▸  𝖳ʏᴘᴇ : 𝐍𝐨𝐝𝐞𝐣𝐬
┃❍⁠⁠⁠⁠│▸  ᴘʟᴀᴛғᴏʀᴍ : 𝐇𝐞𝐫𝐨𝐤𝐮
┃❍⁠⁠⁠⁠│▸  𝖣ᴇᴠᴇʟᴏᴘᴇʀ : ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ
┃❍⁠⁠⁠⁠│▸  𝖬ᴏᴅᴇ : [${config.MODE}]
┃❍⁠⁠⁠⁠│▸  𝖯ʀᴇғɪx : *[${config.PREFIX}]*
┃❍⁠⁠⁠⁠│▸  ᴛɪᴍᴇ : *${new Date().toLocaleTimeString()}*
┃❍⁠⁠⁠⁠│▸  𝖵ᴇʀsɪᴏɴ : 𝟏.𝟎.𝟎
┃❍⁠⁠⁠⁠╰──────────────
╰━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

> ${config.DESCRIPTION}`;

        // Button template for main menu
        const buttons = [
            { buttonId: 'menu1', buttonText: { displayText: '📥 Download' }, type: 1 },
            { buttonId: 'menu2', buttonText: { displayText: '👥 Group' }, type: 1 },
            { buttonId: 'menu3', buttonText: { displayText: '😄 Fun' }, type: 1 },
            { buttonId: 'menu4', buttonText: { displayText: '👑 Owner' }, type: 1 },
            { buttonId: 'menu5', buttonText: { displayText: '🤖 AI' }, type: 1 },
            { buttonId: 'menu6', buttonText: { displayText: '🎎 Anime' }, type: 1 },
            { buttonId: 'menu7', buttonText: { displayText: '🔄 Convert' }, type: 1 },
            { buttonId: 'menu8', buttonText: { displayText: '📌 Other' }, type: 1 },
            { buttonId: 'menu9', buttonText: { displayText: '💞 Reactions' }, type: 1 },
            { buttonId: 'menu10', buttonText: { displayText: '🏠 Main' }, type: 1 },
            { buttonId: 'menu11', buttonText: { displayText: '⚙️ Settings' }, type: 1 }
        ];

        // Send image with buttons
        await conn.sendMessage(from, {
            image: { url: getRandomImage() },
            caption: menuCaption,
            footer: "Select a menu option below",
            buttons: buttons,
            headerType: 4
        }, { quoted: mek });

        // Audio URLs for menu sound
        const audioUrls = [
            'https://files.catbox.moe/m0xfku.mp3',
            'https://files.catbox.moe/8stziq.mp3',
            'https://files.catbox.moe/3au05j.m4a'
        ];
        const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

        // Send menu audio
        await conn.sendMessage(from, {
            audio: { url: randomAudioUrl },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

        // Menu data for button responses
        const menuData = {
            'menu1': {
                title: "📥 *Download Menu* 📥",
                content: `╭━━〔 Download Menu 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• facebook
┃◈┃• mediafire
┃◈┃• tiktok
┃◈┃• twitter
┃◈┃• Insta
┃◈┃• apk
┃◈┃• img
┃◈┃• spotify
┃◈┃• play
┃◈┃• play2
┃◈┃• play3
┃◈┃• tt2
┃◈┃• audio
┃◈┃• playx
┃◈┃• video
┃◈┃• video1
┃◈┃• ytmp3
┃◈┃• ytmp4
┃◈┃• pdf
┃◈┃• sss
┃◈┃• song
┃◈┃• darama
┃◈┃• git
┃◈┃• gdrive
┃◈┃• smovie
┃◈┃• baiscope 
┃◈┃• ginisilia 
┃◈┃• bible
┃◈┃• xxx
┃◈┃• mp3
┃◈┃• mp4 
┃◈┃• gemini
┃◈└───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`
            },
            'menu2': {
                title: "👥 *Group Menu* 👥",
                content: `╭━━〔 Group Menu 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• grouplink
┃◈┃• kickall
┃◈┃• kickall2
┃◈┃• kickall3
┃◈┃• add
┃◈┃• remove
┃◈┃• kick
┃◈┃• promote 
┃◈┃• demote
┃◈┃• dismiss 
┃◈┃• revoke
┃◈┃• setgoodbye
┃◈┃• setwelcome
┃◈┃• delete 
┃◈┃• getpic
┃◈┃• ginfo
┃◈┃• delete 
┃◈┃• disappear on
┃◈┃• disappear off
┃◈┃• disappear 7D,24H
┃◈┃• allreq
┃◈┃• updategname
┃◈┃• updategdesc
┃◈┃• joinrequests
┃◈┃• senddm
┃◈┃• nikal
┃◈┃• mute
┃◈┃• unmute
┃◈┃• lockgc
┃◈┃• unlockgc
┃◈┃• invite
┃◈┃• tag
┃◈┃• hidetag
┃◈┃• tagall
┃◈┃• tagadmins
┃◈└───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`
            },
            // ... (other menu items follow same pattern)
            'menu11': {
                title: "⚙️ *Settings Menu* ⚙️",
                content: `╭━━━〔 *Settings Menu* 〕━━━┈⊷
〘 𝖲𝖤𝖳𝖳𝖨𝖭𝖦𝖲 𝗠𝗘𝗡𝗨 〙

╭─────────────⪼
┋ ☻ setprefix 
┋ ☻ statusview
┋ ☻ mode
┋ ☻ statusreply
┋ ☻ alwaysonline
┋ ☻ autorecording
┋ ☻ autotyping
┋ ☻ setbotnumber
┋ ☻ autovoice
┋ ☻ autosticker
┋ ☻ autoreply
┋ ☻ statusreact
┋ ☻ autoreact
┋ ☻ welcome
┋ ☻ customreacts
┋ ☻ antibad
┋ ☻ antibot
┋ ☻ antilink
┋ ☻ readmessage
┋ ☻ settings
╰━━━━∙⋆⋅⋆∙━ ─ • ─┉─⊷

> ${config.DESCRIPTION}`
            }
        };

        // Button handler
        conn.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message?.buttonsResponseMessage) return;
            
            const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
            if (menuData[buttonId]) {
                const selectedMenu = menuData[buttonId];
                
                // Create back button
                const backButton = [
                    { buttonId: 'back', buttonText: { displayText: '🔙 Back' }, type: 1 }
                ];
                
                await conn.sendMessage(from, {
                    text: `${selectedMenu.title}\n\n${selectedMenu.content}`,
                    footer: "Tap back to return to main menu",
                    buttons: backButton,
                    headerType: 1
                }, { quoted: msg });
            }
            
            // Handle back button
            if (buttonId === 'back') {
                await conn.sendMessage(from, {
                    image: { url: getRandomImage() },
                    caption: menuCaption,
                    footer: "Select a menu option below",
                    buttons: buttons,
                    headerType: 4
                }, { quoted: msg });
            }
        });

        // Remove listener after 10 minutes
        setTimeout(() => {
            conn.ev.off('messages.upsert', buttonHandler);
        }, 600000);

    } catch (e) {
        console.error('Menu Error:', e);
        reply(`❌ An error occurred while displaying the menu. Please try again later.\n\n> ${config.DESCRIPTION}`);
    }
});

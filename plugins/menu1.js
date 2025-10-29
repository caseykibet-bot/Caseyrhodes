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
            return 'https://i.ibb.co/Ng6PQcMv/caseyweb.jpg'; 
        }
        
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        return path.join(srcPath, randomImage);
    } catch (e) {
        console.log('Error getting random image:', e);
        return 'https://i.ibb.co/Ng6PQcMv/caseyweb.jpg'; 
    }
};

cmd({
    pattern: "menu1",
    desc: "Show interactive menu system",
    category: "menu",
    react: "🧾",
    filename: __filename
}, async (conn, mek, m, { from, pushname, reply, args }) => {
    try {
        const totalCommands = Object.keys(commands).length;
        
        // Enhanced menu list with newsletter info
        const menulist = `🌟 *Good ${
            new Date().getHours() < 12 ? 'Morning' : 
            (new Date().getHours() < 18 ? 'Afternoon' : 'Evening')
        }, ${pushname}!* 🌟

╭━━━《 *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐗𝐌𝐃* 》 ━━━┈⊷
┃❍⁠⁠⁠⁠╭──────────────
┃❍⁠⁠⁠⁠│▸  Usᴇʀ : ${pushname}
┃❍⁠⁠⁠⁠│▸  Oᴡɴᴇʀ : ${config.OWNER_NAME}
┃❍⁠⁠⁠⁠│▸  ʙᴀɪʟᴇʏs : 𝐌𝐮𝐥𝐭𝐢 𝐝𝐞𝐯𝐢𝐜𝐞
┃❍⁠⁠⁠⁠│▸  ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs : *${totalCommands}*
┃❍⁠⁠⁠⁠│▸  𝖳ʏᴘᴇ : 𝐍𝐨𝐝𝐞𝐣𝐬
┃❍⁠⁠⁠⁠│▸  ᴘʟᴀᴛғᴏʀᴍ : 𝐇𝐞𝐫𝐨𝐤𝐮
┃❍⁠⁠⁠⁠│▸  𝖣ᴇᴠᴇʟᴏᴘᴇʀ : ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ
┃❍⁠⁠⁠⁠│▸  𝖬ᴏᴅᴇ : [${config.MODE}]
┃❍⁠⁠⁠⁠│▸  𝖯ʀᴇғɪx : *[${config.PREFIX}]*
┃❍⁠⁠⁠⁠│▸  ᴛɪᴍᴇ : *${new Date().toLocaleTimeString()}*
┃❍⁠⁠⁠⁠│▸  𝖵ᴇʀsɪᴏɴ : 𝟏.𝟎.𝟎
┃❍⁠⁠⁠⁠│▸  𝖭𝖾𝗐𝗌𝗅𝖾𝗍𝗍𝖾𝗋 : 𝖠𝖼𝗍𝗂𝗏𝖾 ✅
┃❍⁠⁠⁠⁠╰──────────────
╰━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

📰 *NEWSLETTER UPDATES*
• Latest features added weekly
• Bug fixes & improvements
• New command announcements
• Community news & events

📚 *INTERACTIVE MENU NAVIGATION*

\`\`\`Reply with any number 1-15\`\`\`

*╭── [ MENU OPTIONS 🌟 ] ──┈⊷*
‎*├⬡ 1. 📥 Download Menu*
‎*├⬡ 2. 👥 Group Menu*
‎*├⬡ 3. 😄 Fun Menu*
‎*├⬡ 4. 👑 Owner Menu*
‎*├⬡ 5. 🤖 AI Menu*
‎*├⬡ 6. 🎎 Anime Menu*
‎*├⬡ 7. 🔄 Convert Menu*
‎*├⬡ 8. 📌 Other Menu*
‎*├⬡ 9. 💞 Reactions Menu*
‎*├⬡ 10. 🏠 Main Menu*
‎*├⬡ 11. ⚙️ Settings Menu*
‎*├⬡ 12. 💰 M-Pesa Menu*
‎*├⬡ 13. 🎨 Logo Menu*
‎*├⬡ 14. 📖 Bible List*
‎*├⬡ 15. 💻 Code Menu*
‎*╰───────────────────┈⊷*

_*📱 Reply with any number above to access menu option*_

🔧 *Quick Commands:*
• *.allmenu* - See all commands
• *.owner* - Contact developer
• *.news* - Latest updates
• *.help* - Get assistance

📬 *Stay Updated: Subscribe to our newsletter for latest features!*

> ${config.DESCRIPTION}`;

        // Get thumbnail buffer for context info
        let thumbnailBuffer;
        try {
            const thumbnailResponse = await axios.get('https://i.ibb.co/Ng6PQcMv/caseyweb.jpg', { 
                responseType: 'arraybuffer' 
            });
            thumbnailBuffer = Buffer.from(thumbnailResponse.data);
        } catch (e) {
            console.log('Error getting thumbnail:', e);
            thumbnailBuffer = Buffer.from('');
        }

        // Newsletter context info
        const newsletterContext = {
            externalAdReply: {
                showAdAttribution: true,
                title: "📰 CASEYRHODES XMD NEWSLETTER",
                body: `Latest Updates • ${pushname}`,
                thumbnail: thumbnailBuffer,
                sourceUrl: "https://whatsapp.com/channel/0029Va8f2VD3REy8LJu9Lz3e",
                mediaType: 1,
                renderLargerThumbnail: true,
            },
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420261263259@newsletter',
                newsletterName: 'CASEYRHODES-XMD OFFICIAL 📰',
                serverMessageId: 143
            }
        };

        // Send document menu as main menu
        const sentMsg = await conn.sendMessage(from, {
            document: {
                url: "https://files.catbox.moe/52dotx.jpg", // Using a reliable image URL
            },
            caption: menulist,
            mimetype: "application/zip",
            fileName: `CASEYRHODES-XMD-MENU-V1.0.zip`,
            fileLength: "9999999",
            contextInfo: newsletterContext
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Send audio with newsletter context
        const audioUrls = [
            'https://github.com/caseyweb/autovoice/raw/refs/heads/main/caseytech/alive.mp3',
            'https://github.com/caseyweb/autovoice/raw/refs/heads/main/caseytech/roddyrich.mp3',
            'https://github.com/caseyweb/autovoice/raw/refs/heads/main/caseytech/casey.mp3'
        ];

        const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

        await conn.sendMessage(from, {
            audio: { url: randomAudioUrl },
            mimetype: 'audio/mp4',
            ptt: false,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Enhanced menu data with newsletter info
        const menuData = {
            '1': {
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

📰 *Newsletter Update:* New download sources added!
> ${config.DESCRIPTION}`,
                image: true
            },
            '2': {
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

📰 *Newsletter Update:* Enhanced group management!
> ${config.DESCRIPTION}`,
                image: true
            },
            '3': {
                title: "😄 *Fun Menu* 😄",
                content: `╭━━〔 Fun Menu 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• insult
┃◈┃• compatibility
┃◈┃• aura
┃◈┃• roast
┃◈┃• compliment
┃◈┃• lovetest
┃◈┃• emoji
┃◈┃• ringtone 
┃◈┃• pickup
┃◈┃• ship
┃◈┃• character
┃◈┃• hack
┃◈┃• joke
┃◈┃• hrt
┃◈┃• hpy
┃◈┃• syd
┃◈┃• anger
┃◈┃• shy
┃◈┃• kiss
┃◈┃• mon
┃◈┃• cunfuzed
┃◈┃• setpp
┃◈┃• hand
┃◈┃• nikal
┃◈┃• hold
┃◈┃• hug
┃◈┃• nikal
┃◈┃• hifi
┃◈┃• poke
┃◈└───────────┈⊷
╰──────────────┈⊷

📰 *Newsletter Update:* New fun commands added weekly!
> ${config.DESCRIPTION}`,
                image: true
            },
            // ... (other menu items remain the same with newsletter updates added)
            '4': {
                title: "👑 *Owner Menu* 👑",
                content: `╭━━━〔 *Owner Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ ⚠️ *Restricted*
┃★│ • block @user
┃★│ • unblock @user
┃★│ • fullpp [img]
┃★│ • setpp [img]
┃★│ • restart
┃★│ • shutdown
┃★│ • updatecmd
┃★╰──────────────
┃★╭──────────────
┃★│ ℹ️ *Info Tools*
┃★│ • gjid
┃★│ • jid @user
┃★│ • listcmd
┃★│ • allmenu
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

📰 *Newsletter Update:* Enhanced owner controls!
> ${config.DESCRIPTION}`,
                image: true
            },
            '5': {
                title: "🤖 *AI Menu* 🤖",
                content: `╭━━━〔 *AI Menu* 〕━━━┈⊷
┃★╭──────────────
┃★│ 💬 *Chat AI*
┃★│ • ai [query]
┃★│ • gpt3 [query]
┃★│ • gpt2 [query]
┃★│ • gptmini [query]
┃★│ • gpt [query]
┃★│ • meta [query]
┃★╰──────────────
┃★╭──────────────
┃★│ 🖼️ *Image AI*
┃★│ • imagine [text]
┃★│ • imagine2 [text]
┃★╰──────────────
┃★╭──────────────
┃★│ 🔍 *Specialized*
┃★│ • blackbox [query]
┃★│ • luma [query]
┃★│ • dj [query]
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

📰 *Newsletter Update:* New AI models integrated!
> ${config.DESCRIPTION}`,
                image: true
            },
            // ... (continue with other menu items in similar format)
            '15': {
                title: "💻 *Code Menu* 💻",
                content: `*╭───❍ CODE MENU ❍──*
‎*├⬡ .ɢɪᴛsᴛᴀʟᴋ*
‎*├⬡ .ᴛᴇʀᴍɪɴᴀᴛᴇ*
‎*├⬡ .ᴜɴʙᴀsᴇ*
‎*├⬡ .ʙᴀsᴇ*
‎*├⬡ .ᴄᴏʟᴏᴜʀ*
‎*╰───────────────❍*

📰 *Newsletter Update:* New developer tools added!
> ${config.DESCRIPTION}`,
                image: true
            }
        };

        // Enhanced message handler with newsletter context
        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                
                if (isReplyToMenu) {
                    const receivedText = receivedMsg.message.conversation || 
                                      receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];
                        
                        try {
                            if (selectedMenu.image) {
                                await conn.sendMessage(
                                    senderID,
                                    {
                                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/52dotx.jpg' },
                                        caption: selectedMenu.content,
                                        contextInfo: newsletterContext
                                    },
                                    { quoted: receivedMsg }
                                );
                            } else {
                                await conn.sendMessage(
                                    senderID,
                                    { 
                                        text: selectedMenu.content, 
                                        contextInfo: newsletterContext 
                                    },
                                    { quoted: receivedMsg }
                                );
                            }

                            await conn.sendMessage(senderID, {
                                react: { text: '✅', key: receivedMsg.key }
                            });

                        } catch (e) {
                            console.log('Menu reply error:', e);
                            await conn.sendMessage(
                                senderID,
                                { 
                                    text: selectedMenu.content, 
                                    contextInfo: newsletterContext 
                                },
                                { quoted: receivedMsg }
                            );
                        }

                    } else {
                        await conn.sendMessage(
                            senderID,
                            {
                                text: `📛 *Invalid Option!* ❌\n\nPlease reply with a number between 1-15 to select a menu.\n\n*Example:* Reply with "1" for Download Menu\n\n📰 *Stay tuned for newsletter updates!*\n\n> ${config.DESCRIPTION}`,
                                contextInfo: newsletterContext
                            },
                            { quoted: receivedMsg }
                        );
                    }
                }
            } catch (e) {
                console.log('Handler error:', e);
            }
        };

        // Add listener
        conn.ev.on("messages.upsert", handler);

        // Remove listener after 5 minutes
        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
            console.log('Menu interaction timeout - listener removed');
        }, 300000);

    } catch (e) {
        console.error('Menu Error:', e);
        try {
            await conn.sendMessage(
                from,
                { 
                    text: `📛 Menu system is currently busy. Please try again later.\n\n📰 Check our newsletter for updates!\n\n> ${config.DESCRIPTION}` 
                },
                { quoted: mek }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});

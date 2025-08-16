const config = require('../config');
const { cmd, commands } = require('../command');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const { getBuffer, getRandom, isUrl, runtime, sleep, fetchJson } = require('../lib/functions');

// Contact message for verified context
const verifiedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "CASEYRHODES VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: Caseyrhodes VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254112192119:+254112192119\nEND:VCARD"
        }
    }
};

// YouTube search command
cmd({
    pattern: 'yts',
    alias: ['ytsearch'],
    use: '<search query>',
    react: '🔎',
    desc: 'Search for YouTube videos',
    category: 'search',
    filename: __filename
}, async (m, sock, msg, { from, l, quoted, body, isCmd, args, q, isGroup, sender, reply }) => {
    try {
        if (!q) {
            return await m.reply(msg.chat, {
                text: 'Please provide a search query. Example: .yts hello world',
                contextInfo: {
                    mentionedJid: [msg.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363302677217436@newsletters',
                        newsletterName: 'CASEYRHODES TECH',
                        serverMessageId: 143
                    }
                }
            }, { quoted: verifiedContact });
        }

        // Perform YouTube search
        let yts;
        try {
            yts = require('yt-search');
            var searchResults = await yts(q);
        } catch (err) {
            l.error(err);
            return await m.reply(from, {
                text: '*Error!!* Failed to perform search. Please try again later.'
            }, { quoted: msg });
        }

        // Format search results
        let resultText = '';
        searchResults.videos.forEach(video => {
            resultText += `*${video.title}*\n`;
            resultText += `⏱️ Duration: ${video.duration}\n`;
            resultText += `👀 Views: ${video.views}\n`;
            resultText += `🔗 URL: ${video.url}\n\n`;
        });

        // Send results with newsletter context
        await m.reply(from, {
            text: resultText,
            contextInfo: {
                mentionedJid: [msg.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletters',
                    newsletterName: 'CASEYRHODES TECH',
                    serverMessageId: 143
                }
            }
        }, { quoted: verifiedContact });

    } catch (error) {
        l.error(error);
        reply('*Error!!* Something went wrong. Please try again later.');
    }
});

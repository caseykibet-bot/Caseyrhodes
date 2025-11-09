const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: m.sender ? [m.sender] : [],
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420261263259@newsletter',
                newsletterName: 'CASEYRHODES TECH 👑',
                serverMessageId: -1
            },
        }
    };
};

const defaultProfilePictures = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const getProfilePicture = async (conn, jid) => {
    try {
        if (!jid) {
            throw new Error('No JID provided');
        }
        return await conn.profilePictureUrl(jid, 'image');
    } catch (error) {
        console.error(`Failed to get profile picture for ${jid}:`, error.message);
        return defaultProfilePictures[Math.floor(Math.random() * defaultProfilePictures.length)];
    }
};

const GroupEvents = async (conn, update) => {
    try {
        // Validate input
        if (!update || !update.id) {
            console.error('Invalid update object received');
            return;
        }

        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        // Get group metadata
        const metadata = await conn.groupMetadata(update.id).catch(err => {
            console.error('Failed to fetch group metadata:', err);
            return null;
        });

        if (!metadata) return;

        const participants = update.participants || [];
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants?.length || 0;

        // Process each participant in the update
        for (const num of participants) {
            if (!num) continue;

            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            try {
                // Get profile pictures with fallback
                const ppUrl = await getProfilePicture(conn, num).catch(async () => {
                    return await getProfilePicture(conn, update.id);
                });

                if (update.action === "add" && config.WELCOME === "true") {
                    const WelcomeText = `Hey @${userName} 👋\n` +
                        `Welcome to *${metadata.subject}*.\n` +
                        `You are member number ${groupMembersCount} in this group. 🙏\n` +
                        `Time joined: *${timestamp}*\n` +
                        `Please read the group description to avoid being removed:\n` +
                        `${desc}\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ 🌟*.`;

                    await conn.sendMessage(update.id, {
                        image: { url: ppUrl },
                        caption: WelcomeText,
                        mentions: [num],
                        ...getContextInfo({ sender: num }),
                    });

                } else if (update.action === "remove" && config.WELCOME === "true") {
                    const GoodbyeText = `Goodbye @${userName}. 😔\n` +
                        `Another member has left the group.\n` +
                        `Time left: *${timestamp}*\n` +
                        `The group now has ${groupMembersCount} members. 😭`;

                    await conn.sendMessage(update.id, {
                        image: { url: ppUrl },
                        caption: GoodbyeText,
                        mentions: [num],
                        ...getContextInfo({ sender: num }),
                    });

                } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                    const author = update.author || num;
                    const demoter = author.split("@")[0];
                    
                    await conn.sendMessage(update.id, {
                        text: `*Admin Event*\n\n` +
                              `@${demoter} has demoted @${userName} from admin. 👀\n` +
                              `Time: ${timestamp}\n` +
                              `*Group:* ${metadata.subject}`,
                        mentions: [author, num],
                        ...getContextInfo({ sender: author }),
                    });

                } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                    const author = update.author || num;
                    const promoter = author.split("@")[0];
                    
                    await conn.sendMessage(update.id, {
                        text: `*Admin Event*\n\n` +
                              `@${promoter} has promoted @${userName} to admin. 🎉\n` +
                              `Time: ${timestamp}\n` +
                              `*Group:* ${metadata.subject}`,
                        mentions: [author, num],
                        ...getContextInfo({ sender: author }),
                    });
                }
            } catch (participantError) {
                console.error(`Error processing participant ${num}:`, participantError);
                // Continue with next participant instead of stopping the entire loop
                continue;
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;

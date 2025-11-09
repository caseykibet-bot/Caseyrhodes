const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

// Fixed getContextInfo function (was missing closing brace)
const getContextInfo = (m) => ({
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES TECH 👑',
            serverMessageId: -1
        },
    }
});

// Optimized: Single default profile picture URL to reduce redundancy
const DEFAULT_PROFILE_PICTURE = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

// Optimized profile picture fetching with better error handling
const getProfilePicture = async (conn, jid) => {
    try {
        return await conn.profilePictureUrl(jid, 'image');
    } catch (error) {
        console.error(`Failed to get profile picture for ${jid}:`, error.message);
        return DEFAULT_PROFILE_PICTURE;
    }
};

// Cache for group metadata to avoid repeated API calls
const groupMetadataCache = new Map();

const getGroupMetadata = async (conn, groupId) => {
    if (groupMetadataCache.has(groupId)) {
        return groupMetadataCache.get(groupId);
    }
    
    const metadata = await conn.groupMetadata(groupId);
    groupMetadataCache.set(groupId, metadata);
    
    // Clear cache after 5 minutes to prevent stale data
    setTimeout(() => groupMetadataCache.delete(groupId), 5 * 60 * 1000);
    
    return metadata;
};

// Pre-defined message templates for better maintainability
const MESSAGE_TEMPLATES = {
    welcome: (userName, groupName, memberCount, timestamp, description) => 
        `Hey @${userName} 👋\n` +
        `Welcome to *${groupName}*.\n` +
        `You are member number ${memberCount} in this group. 🙏\n` +
        `Time joined: *${timestamp}*\n` +
        `Please read the group description to avoid being removed:\n` +
        `${description}\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ 🌟*.`,

    goodbye: (userName, timestamp, memberCount) =>
        `Goodbye @${userName}. 😔\n` +
        `Another mother fucker has left the group.🤧\n` +
        `Time left: *${timestamp}*\n` +
        `The group now has ${memberCount} members. 😭`,

    demote: (demoter, userName, timestamp, groupName) =>
        `*Admin Event*\n\n` +
        `@${demoter} has demoted @${userName} from admin. 👀\n` +
        `Time: ${timestamp}\n` +
        `*Group:* ${groupName}`,

    promote: (promoter, userName, timestamp, groupName) =>
        `*Admin Event*\n\n` +
        `@${promoter} has promoted @${userName} to admin. 🎉\n` +
        `Time: ${timestamp}\n` +
        `*Group:* ${groupName}`
};

const GroupEvents = async (conn, update) => {
    try {
        // Early return if not a group event
        if (!isJidGroup(update.id)) return;

        const { action, participants, id: groupId, author } = update;
        
        // Early return if no relevant action or participants
        if (!action || !participants || participants.length === 0) return;

        // Check config flags early to avoid unnecessary processing
        const shouldWelcome = config.WELCOME === "true" && (action === "add" || action === "remove");
        const shouldNotifyAdmin = config.ADMIN_EVENTS === "true" && (action === "promote" || action === "demote");
        
        if (!shouldWelcome && !shouldNotifyAdmin) return;

        // Get group metadata (cached)
        const metadata = await getGroupMetadata(conn, groupId);
        const { subject: groupName, participants: groupParticipants, desc = "No Description" } = metadata;
        const groupMembersCount = groupParticipants.length;

        const timestamp = new Date().toLocaleString();

        // Process all participants in parallel for better performance
        await Promise.all(participants.map(async (participant) => {
            try {
                const userName = participant.split("@")[0];
                let profilePictureUrl;

                // Optimized profile picture fetching
                if (action === "add" || action === "remove") {
                    profilePictureUrl = await getProfilePicture(conn, participant)
                        .catch(() => getProfilePicture(conn, groupId));
                }

                let messagePayload = null;

                switch (action) {
                    case "add":
                        if (shouldWelcome) {
                            messagePayload = {
                                image: { url: profilePictureUrl },
                                caption: MESSAGE_TEMPLATES.welcome(userName, groupName, groupMembersCount, timestamp, desc),
                                mentions: [participant],
                                contextInfo: getContextInfo({ sender: participant }),
                            };
                        }
                        break;

                    case "remove":
                        if (shouldWelcome) {
                            messagePayload = {
                                image: { url: profilePictureUrl },
                                caption: MESSAGE_TEMPLATES.goodbye(userName, timestamp, groupMembersCount),
                                mentions: [participant],
                                contextInfo: getContextInfo({ sender: participant }),
                            };
                        }
                        break;

                    case "demote":
                        if (shouldNotifyAdmin) {
                            const demoter = author?.split("@")[0] || "Unknown";
                            messagePayload = {
                                text: MESSAGE_TEMPLATES.demote(demoter, userName, timestamp, groupName),
                                mentions: [author, participant].filter(Boolean),
                                contextInfo: getContextInfo({ sender: author }),
                            };
                        }
                        break;

                    case "promote":
                        if (shouldNotifyAdmin) {
                            const promoter = author?.split("@")[0] || "Unknown";
                            messagePayload = {
                                text: MESSAGE_TEMPLATES.promote(promoter, userName, timestamp, groupName),
                                mentions: [author, participant].filter(Boolean),
                                contextInfo: getContextInfo({ sender: author }),
                            };
                        }
                        break;
                }

                if (messagePayload) {
                    await conn.sendMessage(groupId, messagePayload);
                }

            } catch (error) {
                console.error(`Error processing participant ${participant} in group ${groupId}:`, error.message);
                // Continue processing other participants even if one fails
            }
        }));

    } catch (error) {
        console.error('Group event error:', error.message);
    }
};

module.exports = GroupEvents;

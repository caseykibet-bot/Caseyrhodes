var commands = [];

// Function to check if user is admin
async function isAdmin(conn, chatId, userId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants;
        const user = participants.find(participant => participant.id === userId);
        
        return user ? ['admin', 'superadmin'].includes(user.admin) : false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Function to check if bot is admin
async function checkBotAdmin(conn, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await conn.groupMetadata(chatId);
        const botId = conn.user.id;
        const botParticipant = metadata.participants.find(p => p.id === botId);
        
        return botParticipant ? ['admin', 'superadmin'].includes(botParticipant.admin) : false;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

// Function to check if user is owner (update with your actual numbers)
function isOwner(userId) {
    const OWNER_NUMBERS = [
        "254712345678@s.whatsapp.net",  // Replace with your actual numbers
        "254112192119@s.whatsapp.net"   // Replace with your actual numbers
    ];
    
    if (!userId) return false;
    return OWNER_NUMBERS.some(owner => 
        userId === owner || 
        userId.includes(owner.replace('@s.whatsapp.net', '')) ||
        owner.includes(userId.replace('@s.whatsapp.net', ''))
    );
}

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
    isAdmin,
    checkBotAdmin,
    isOwner
};

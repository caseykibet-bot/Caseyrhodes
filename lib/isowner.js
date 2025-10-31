const config = require('../config');

function isOwner(senderId) {
    try {
        if (!senderId || !config.OWNER_NUMBER) return false;
        
        // Handle single owner number
        if (typeof config.OWNER_NUMBER === 'string') {
            const ownerJid = config.OWNER_NUMBER.includes('@') ? 
                config.OWNER_NUMBER : 
                config.OWNER_NUMBER + "@s.whatsapp.net";
            return senderId === ownerJid;
        }
        
        // Handle array of owner numbers
        if (Array.isArray(config.OWNER_NUMBER)) {
            return config.OWNER_NUMBER.some(owner => {
                const ownerJid = owner.includes('@') ? owner : owner + "@s.whatsapp.net";
                return senderId === ownerJid;
            });
        }
        
        return false;
    } catch (error) {
        console.error('Error in isOwner:', error);
        return false;
    }
}

module.exports = isOwner;

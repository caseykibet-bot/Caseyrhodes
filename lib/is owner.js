function isOwner(userId, ownerNumbers) {
    if (!ownerNumbers) return false;
    
    const owners = Array.isArray(ownerNumbers) ? ownerNumbers : [ownerNumbers];
    return owners.some(owner => userId.includes(owner) || owner.includes(userId.replace('@s.whatsapp.net', '')));
}

module.exports = isOwner;

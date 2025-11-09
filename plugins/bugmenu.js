const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');

// Bug Menu Command
cmd({
    pattern: "bugmenu",
    desc: "Show Caseyrhodes Tech bug related menu",
    category: "menu2",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
            }, { quoted: mek });
        }

        const bugMenu = `*╭───⬡ CASEYRHODES TECH BUG MENU ⬡───*
*├▢ 🤖* *android* 
*├▢ 📱* *android2*
*├▢ 🔥* *android3*
*├▢ 🔒* *otplock*
*├▢ * *ios*
*├▢ 🪲* *bugcall*
*├▢ 💣* *bugpv*
*├▢ 👥* *buggroup*
*├▢ 🚀* *bugspam*
*├▢ ⚡* *buglag*
*├▢ 🧨* *bugauto*
*├▢ 🕸️* *bugblock*
*├▢ 🔄* *bugmulti*
*├▢ 🧩* *bugrandom*
*├▢ 🐝* *bugbotcrash*
*├▢ ☠️* *bugvirus*
*├▢ 💀* *bug*
*├▢ 💸* *buybug*
*╰──────────────⬣*

*👑 CASEYRHODES TECH PREMIUM BUGS*
*🔒 Owner Commands Only*
*💎 Premium Features*

> ${config.DESCRIPTION || 'Caseyrhodes Tech - Premium WhatsApp Bot'}
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: bugMenu,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420261263259@newsletter',
                        newsletterName: 'CASEYRHODES TECH 👑',
                        serverMessageId: -1
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});

// Android Bug Command
cmd({
    pattern: "android",
    desc: "Caseyrhodes Tech - Android device bug tools",
    category: "bugs",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const androidBug = `*🤖 CASEYRHODES TECH - ANDROID BUG*

*🚀 Premium Android Bug System*
*💎 Advanced Android Device Exploits*

*✨ Features:*
• Device vulnerability scanning
• System exploit detection
• Security bypass tools
• Root access simulations
• Custom payload generation

*🔧 Technical Specifications:*
• Supports Android 5.0+
• Multiple exploit methods
• Custom payload options
• Real-time monitoring

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: androidBug
    }, { quoted: mek });
});

// Android2 Bug Command
cmd({
    pattern: "android2",
    desc: "Caseyrhodes Tech - Advanced Android bug tools",
    category: "bugs",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const android2Bug = `*📱 CASEYRHODES TECH - ANDROID2 BUG*

*🚀 Advanced Android Exploitation*
*💎 Premium Security Testing Tools*

*✨ Enhanced Features:*
• Advanced vulnerability assessment
• Custom exploit development
• System-level penetration
• Bypass security protocols
• Multi-vector attack simulation

*🎯 Target Systems:*
• Custom ROM vulnerabilities
• Manufacturer-specific exploits
• Kernel-level access
• Hardware manipulation

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: android2Bug
    }, { quoted: mek });
});

// Android3 Bug Command
cmd({
    pattern: "android3",
    desc: "Caseyrhodes Tech - Premium Android exploits",
    category: "bugs",
    react: "🔥",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const android3Bug = `*🔥 CASEYRHODES TECH - ANDROID3 BUG*

*🚀 Premium Android Exploitation Suite*
*💎 Elite Security Testing Platform*

*✨ Premium Features:*
• Zero-day vulnerability detection
• Advanced penetration testing
• Custom payload delivery
• Real-time system monitoring
• Automated exploit chains

*🛡️ Security Levels:*
• High-level system access
• Bypass advanced protections
• Custom vulnerability research
• Professional security audit

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: android3Bug
    }, { quoted: mek });
});

// OTP Lock Command
cmd({
    pattern: "otplock",
    desc: "Caseyrhodes Tech - OTP locking system",
    category: "bugs",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const otpLock = `*🔒 CASEYRHODES TECH - OTP LOCK*

*🚀 Advanced OTP Security System*
*💎 Two-Factor Authentication Tools*

*✨ OTP Features:*
• OTP generation and validation
• Time-based OTP systems
• SMS interception simulation
• Authentication bypass testing
• Security protocol analysis

*🛡️ Security Testing:*
• OTP brute force protection
• Rate limiting testing
• Session management
• Token validation systems

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: otpLock
    }, { quoted: mek });
});

// iOS Bug Command
cmd({
    pattern: "ios",
    desc: "Caseyrhodes Tech - iOS device vulnerabilities",
    category: "bugs",
    react: "",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const iosBug = `* CASEYRHODES TECH - iOS BUG*

*🚀 Premium iOS Security Testing*
*💎 Apple Device Vulnerability Analysis*

*✨ iOS Features:*
• iOS system vulnerability scanning
• Jailbreak detection bypass
• Sandbox escape simulations
• App Store security testing
• iOS-specific exploit development

*📱 Supported Versions:*
• iOS 12.0 and above
• Multiple device compatibility
• Various jailbreak methods
• Custom exploit payloads

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: iosBug
    }, { quoted: mek });
});

// Bug Call Command
cmd({
    pattern: "bugcall",
    desc: "Caseyrhodes Tech - Call-related bugs",
    category: "bugs",
    react: "🪲",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugCall = `*🪲 CASEYRHODES TECH - BUG CALL*

*🚀 Advanced Call System Exploits*
*💎 Voice Communication Vulnerability Testing*

*✨ Call Bug Features:*
• Call interception simulation
• VoIP vulnerability testing
• Network call manipulation
• Call forwarding exploits
• Voice data analysis

*📞 Testing Capabilities:*
• Multiple protocol support
• Real-time call monitoring
• Audio stream manipulation
• Network vulnerability assessment

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugCall
    }, { quoted: mek });
});

// Bug PV Command
cmd({
    pattern: "bugpv",
    desc: "Caseyrhodes Tech - Private chat bugs",
    category: "bugs",
    react: "💣",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugPv = `*💣 CASEYRHODES TECH - BUG PV*

*🚀 Private Chat Vulnerability Testing*
*💎 Direct Message Security Analysis*

*✨ PV Bug Features:*
• Private message encryption testing
• Chat session vulnerability assessment
• Message interception simulation
• End-to-end encryption analysis
• Privacy protocol testing

*🔐 Security Analysis:*
• Encryption strength testing
• Session hijacking simulation
• Message integrity verification
• Privacy breach detection

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugPv
    }, { quoted: mek });
});

// Bug Group Command
cmd({
    pattern: "buggroup",
    desc: "Caseyrhodes Tech - Group chat exploits",
    category: "bugs",
    react: "👥",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugGroup = `*👥 CASEYRHODES TECH - BUG GROUP*

*🚀 Group Chat Security Testing*
*💎 Multi-User Communication Vulnerability Analysis*

*✨ Group Bug Features:*
• Group permission exploitation
• Admin privilege testing
• Member management vulnerabilities
• Group encryption analysis
• Broadcast message security

*👨‍💻 Group Security:*
• Role-based access testing
• Permission escalation detection
• Group policy vulnerability
• Multi-user session analysis

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugGroup
    }, { quoted: mek });
});

// Bug Spam Command
cmd({
    pattern: "bugspam",
    desc: "Caseyrhodes Tech - Spam protection bugs",
    category: "bugs",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugSpam = `*🚀 CASEYRHODES TECH - BUG SPAM*

*🚀 Advanced Spam Protection Testing*
*💎 Anti-Spam System Vulnerability Analysis*

*✨ Spam Bug Features:*
• Spam filter bypass testing
• Rate limiting vulnerability assessment
• Message flood protection testing
• Content filtering analysis
• Automated detection evasion

*🛡️ Protection Testing:*
• Multiple spam detection systems
• Pattern recognition testing
• Behavioral analysis bypass
• Machine learning detection evasion

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugSpam
    }, { quoted: mek });
});

// Bug Lag Command
cmd({
    pattern: "buglag",
    desc: "Caseyrhodes Tech - Lag induction tools",
    category: "bugs",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugLag = `*⚡ CASEYRHODES TECH - BUG LAG*

*🚀 Performance Impact Testing*
*💎 System Resource Consumption Analysis*

*✨ Lag Bug Features:*
• CPU resource consumption testing
• Memory usage optimization analysis
• Network latency simulation
• Processing delay assessment
• System performance monitoring

*📊 Performance Metrics:*
• Resource utilization analysis
• Response time measurement
• Bottleneck identification
• Optimization opportunity detection

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugLag
    }, { quoted: mek });
});

// Bug Auto Command
cmd({
    pattern: "bugauto",
    desc: "Caseyrhodes Tech - Automated bug systems",
    category: "bugs",
    react: "🧨",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugAuto = `*🧨 CASEYRHODES TECH - BUG AUTO*

*🚀 Automated Vulnerability Testing*
*💎 Intelligent Bug Detection System*

*✨ Auto Bug Features:*
• Automated vulnerability scanning
• Intelligent exploit generation
• Self-learning detection systems
• Automated payload delivery
• Smart pattern recognition

*🤖 Automation Capabilities:*
• Continuous monitoring
• Real-time threat detection
• Automated response systems
• Intelligent analysis algorithms

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugAuto
    }, { quoted: mek });
});

// Bug Block Command
cmd({
    pattern: "bugblock",
    desc: "Caseyrhodes Tech - Blocking mechanisms",
    category: "bugs",
    react: "🕸️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugBlock = `*🕸️ CASEYRHODES TECH - BUG BLOCK*

*🚀 Blocking System Vulnerability Testing*
*💎 Access Control Mechanism Analysis*

*✨ Block Bug Features:*
• Blocking system bypass testing
• Access control vulnerability assessment
• Permission escalation testing
• Security policy analysis
• Restriction evasion techniques

*🔐 Access Control:*
• Role-based access testing
• Permission level assessment
• Security policy validation
• Authorization bypass detection

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugBlock
    }, { quoted: mek });
});

// Bug Multi Command
cmd({
    pattern: "bugmulti",
    desc: "Caseyrhodes Tech - Multi-device bugs",
    category: "bugs",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugMulti = `*🔄 CASEYRHODES TECH - BUG MULTI*

*🚀 Multi-Device Synchronization Testing*
*💎 Cross-Platform Vulnerability Analysis*

*✨ Multi Bug Features:*
• Multi-device sync vulnerability testing
• Cross-platform compatibility issues
• Device synchronization exploits
• Platform-specific vulnerability assessment
• Multi-session management testing

*📱 Device Support:*
• Multiple platform compatibility
• Cross-device synchronization
• Various OS version support
• Different hardware configurations

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugMulti
    }, { quoted: mek });
});

// Bug Random Command
cmd({
    pattern: "bugrandom",
    desc: "Caseyrhodes Tech - Random bug generator",
    category: "bugs",
    react: "🧩",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugRandom = `*🧩 CASEYRHODES TECH - BUG RANDOM*

*🚀 Randomized Vulnerability Testing*
*💎 Stochastic Bug Detection System*

*✨ Random Bug Features:*
• Random pattern vulnerability testing
• Stochastic exploit generation
• Unpredictable attack simulation
• Randomized payload delivery
• Probabilistic security assessment

*🎲 Testing Methodology:*
• Random input generation
• Stochastic pattern analysis
• Probability-based testing
• Randomized scenario simulation

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugRandom
    }, { quoted: mek });
});

// Bug Bot Crash Command
cmd({
    pattern: "bugbotcrash",
    desc: "Caseyrhodes Tech - Bot crash exploits",
    category: "bugs",
    react: "🐝",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugBotCrash = `*🐝 CASEYRHODES TECH - BUG BOT CRASH*

*🚀 Bot Stability Testing*
*💎 Automated System Crash Analysis*

*✨ Bot Crash Features:*
• Bot stability vulnerability testing
• Crash scenario simulation
• Error handling assessment
• Recovery mechanism testing
• Fault tolerance analysis

*🛠️ Stability Analysis:*
• Crash point identification
• Error recovery testing
• System resilience assessment
• Failure mode analysis

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugBotCrash
    }, { quoted: mek });
});

// Bug Virus Command
cmd({
    pattern: "bugvirus",
    desc: "Caseyrhodes Tech - Virus simulation",
    category: "bugs",
    react: "☠️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const bugVirus = `*☠️ CASEYRHODES TECH - BUG VIRUS*

*🚀 Malware Simulation Testing*
*💎 Anti-Virus Protection Analysis*

*✨ Virus Bug Features:*
• Malware behavior simulation
• Virus detection bypass testing
• Anti-virus protection assessment
• Malicious payload simulation
• Security software evasion

*🦠 Simulation Types:*
• Various malware families
• Different infection vectors
• Multiple propagation methods
• Various payload types

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: bugVirus
    }, { quoted: mek });
});

// General Bug Command
cmd({
    pattern: "bug",
    desc: "Caseyrhodes Tech - General bug tools",
    category: "bugs",
    react: "💀",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const generalBug = `*💀 CASEYRHODES TECH - GENERAL BUG*

*🚀 Comprehensive Bug Testing Suite*
*💎 All-in-One Vulnerability Assessment*

*✨ General Bug Features:*
• Comprehensive vulnerability scanning
• Multi-vector attack simulation
• Complete security assessment
• Integrated testing tools
• Unified vulnerability management

*🔧 Tool Integration:*
• Multiple testing methodologies
• Various exploit techniques
• Comprehensive analysis tools
• Unified reporting system

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Owner Restricted Command*`;

    await conn.sendMessage(from, {
        text: generalBug
    }, { quoted: mek });
});

// Buy Bug Command
cmd({
    pattern: "buybug",
    alias: ["purchasebug", "bugbuy", "bugpurchase", "premiumbug"],
    desc: "Purchase Caseyrhodes Tech Premium Bug Access",
    category: "bugs",
    react: "💎",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const purchaseMessage = `*💎 CASEYRHODES TECH PREMIUM BUG ACCESS*

*🚀 Premium Bug Package Includes:*
*• All Bug Commands Unlocked*
*• Android/iOS Bug Tools*
*• Call & PV Bugs*
*• Group Bug Features*
*• Advanced Spam Protection*
*• Auto Bug Systems*
*• Multi-Device Support*
*• Virus Protection Tools*
*• 24/7 Premium Support*
*• Regular Updates*

*💰 Pricing & Packages:*
*Contact developer for current pricing*

*📞 Contact for Purchase:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Note: This is a premium service for authorized users only.*`;

    await conn.sendMessage(from, {
        text: purchaseMessage
    }, { quoted: mek });
});

// Caseyrhodes Tech Info Command
cmd({
    pattern: "caseytech",
    alias: ["caseyrhodes", "techinfo"],
    desc: "Caseyrhodes Tech Information",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const techInfo = `*👑 CASEYRHODES TECH*

*🚀 Premium WhatsApp Bot Solutions*
*💎 Advanced Bug Tools & Features*
*🔒 Secure & Reliable*

*✨ Services:*
*• Premium Bug Tools*
*• Advanced Security*
*• Custom Bot Development*
*• Bug Fixing Solutions*
*• Multi-Device Support*

*📞 Contact: ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Professional Tools for Authorized Users*`;

    await conn.sendMessage(from, {
        text: techInfo
    }, { quoted: mek });
});

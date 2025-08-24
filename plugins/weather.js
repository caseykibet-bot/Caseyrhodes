const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❗ Please provide a city name. Usage: .weather [city name]");

        // Verification contact message
        const verifiedContact = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "CASEYRHODES VERIFIED ✅",
                    vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Caseyrhodes VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD"
                }
            }
        };

        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = encodeURIComponent(q);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        const response = await axios.get(url);
        const data = response.data;

        // Generate weather image URL
        const weatherIcon = data.weather[0].icon;
        const imageUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

        const weather = `
> 🌍 *Weather for ${data.name}, ${data.sys.country}*  
> 🌡️ *Temp:* ${data.main.temp}°C  
> 🧊 *Feels Like:* ${data.main.feels_like}°C  
> 🔻 *Min:* ${data.main.temp_min}°C  
> 🔺 *Max:* ${data.main.temp_max}°C  
> 💧 *Humidity:* ${data.main.humidity}%  
> ☁️ *Weather:* ${data.weather[0].main}  
> 🌫️ *Description:* ${data.weather[0].description}  
> 💨 *Wind:* ${data.wind.speed} m/s  
> 📊 *Pressure:* ${data.main.pressure} hPa  

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ*
`;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: weather,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "CASEYRHODES TECH",
                    serverMessageId: 100
                }
            }
        }, { quoted: verifiedContact });

    } catch (e) {
        console.error("Weather command error:", e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 City not found. Please check the spelling and try again.");
        } else if (e.response && e.response.status === 401) {
            return reply("🔑 API key error. Please check the weather API configuration.");
        } else if (e.code === 'ENOTFOUND') {
            return reply("🌐 Network error. Please check your internet connection.");
        }
        return reply("⚠️ An error occurred while fetching the weather information. Please try again later.");
    }
});

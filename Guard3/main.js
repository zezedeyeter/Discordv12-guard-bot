const { Discord, Client, Intents, MessageEmbed, WebhookClient } = require('discord.js');
const conf = require("../config.json");
const ayarlar = require("../safe.json");
const request = require('request');


const client = new Client({
    ws: {
        intents: new Intents(Intents.ALL).remove([
            "GUILD_MESSAGES",
            "GUILD_EMOJIS",
            "GUILD_INTEGRATIONS",
            "GUILD_INVITES",
            "GUILD_VOICE_STATES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_MESSAGE_TYPING",
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING"

        ])
    }
});
const Webhook = new WebhookClient(conf.WEBHOOKID, conf.WEBHOOKTOKEN);
const STAFPERMS = conf.STAFPERMS

client.on("ready", async() => {
    client.user.setPresence({ status: "invisible" });
    let kanal = client.channels.cache.filter(x => x.type === "voice" && x.id === conf.VOICECHANNEL)
    client.channels.cache.get(conf.VOICECHANNEL).join().then(x => console.log("Bot başarılı bir şekilde ses kanalına bağlandı")).catch(() => console.log("Bot ses kanalına bağlanırken bir sorun çıktı Lütfen Yetkileri kontrol ediniz!"))

    for (let event of Object.keys(client._events)) console.log(`Event; ${event}\n`);
    setInterval(() => {
        kanal.map(channel => {
            if (channel.id === conf.VOICECHANNEL) {
                if (channel.members.some(member => member.id === client.user.id)) return;
                if (!client.channels.cache.get(conf.VOICECHANNEL)) return;
                client.channels.cache.get(channel.id).join().then(x => console.log("Bot başarılı bir şekilde ses kanalına bağlandı")).catch(() => console.log("Bot ses kanalına bağlanırken bir sorun çıktı Lütfen Yetkileri kontrol ediniz!"))
            } else return;
        });
        korumaDuzenle();
        console.log(`Koruma Düzenendi `)
    }, 1000 * 60 * 15)
});

function AuthorzedRoles() {
    let GUILD = client.guilds.cache.get(conf.guildID);
    if (!GUILD) return;
    GUILD.roles.cache.filter(r => r.editable && (r.permissions.has("ADMINISTRATOR") || r.permissions.has("MANAGE_EMOJIS") || r.permissions.has("BAN_MEMBERS") || r.permissions.has("KICK_MEMBERS") || r.permissions.has("MANAGE_CHANNELS") || r.permissions.has("MANAGE_GUILD") || r.permissions.has("MANAGE_ROLES") || r.permissions.has("MANAGE_WEBHOOKS"))).forEach(async r => {
        await r.setPermissions(36767232);
    });
};

function safe1(kisiID) {
    let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
    let guvenliler = ayarlar.güvenli1 || [];
    if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
    else return false;
};

function safe2(kisiID) {
    let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
    let guvenliler = ayarlar.güvenli2 || [];
    if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
    else return false;
};

function safe3(kisiID) {
    let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
    let guvenliler = ayarlar.güvenli3 || [];
    if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
    else return false;
};

function safe4(kisiID) {
    let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
    let guvenliler = ayarlar.güvenli4 || [];
    if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
    else return false;
};

function Punish(kisiID, tur) {
    let MEMBER = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
    if (!MEMBER) return;
    if (tur == "jail") return MEMBER.roles.cache.has(conf.BOOSTERROLE) ? MEMBER.roles.set([conf.BOOSTERROLE, conf.JAILROLE]) : MEMBER.roles.set([conf.JAILROLE]).catch()
    if (tur == "ban") return MEMBER.ban({ reason: "Owsla and Zeze Guard" }).catch(console.error);;
    if (tur == "kick") return MEMBER.kick().catch(console.error);;
};

function korumaDuzenle() {
    Object.keys(sagTikBanKoruma).filter(x => sagTikBanKoruma[x] === 0).forEach(x => delete sagTikBanKoruma[x]);
    Object.keys(etiketKoruma).filter(x => etiketKoruma[x] === 0).forEach(x => delete etiketKoruma[x]);
    Object.keys(rolKoruma).filter(x => rolKoruma[x] === 0).forEach(x => delete rolKoruma[x]);
    Object.keys(kanalKoruma).filter(x => kanalKoruma[x] === 0).forEach(x => delete kanalKoruma[x]);
    Object.keys(emojiKoruma).filter(x => emojiKoruma[x] === 0).forEach(x => delete emojiKoruma[x]);
};
var sagTikRolKoruma = [],
    sagTikBanKoruma = {},
    etiketKoruma = {},
    rolKoruma = {},
    kanalKoruma = {},
    emojiKoruma = {},
    islemSuresi = 1000 * 60 * 10;

    client.on("channelDelete", async channel => {
        let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then(audit => audit.entries.first());
        if (!entry || !entry.executor || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
        Punish(entry.executor.id, "kick");
        AuthorzedRoles(channel.guild.id);
      
        await channel.clone({ reason: "Zeze Kanal Koruma" }).then(async kanal => {
          if (channel.parentID != null) await kanal.setParent(channel.parentID);
          await kanal.setPosition(channel.position);
          if (channel.type == "category") await channel.guild.channels.cache.filter(k => k.parentID == channel.id).forEach(x => x.setParent(kanal.id));
        });
      });

client.on("guildUpdate", async(oldGuild, newGuild) => {
    const log = await oldGuild.fetchAuditLogs({ limit: 1, type: "GUILD_UPDATE" }).then(audit => audit.entries.first());
    if (!log || !log.executor || Date.now() - log.createdTimestamp > 10000 || safe1(log.executor.id) || safe2(log.executor.id)) return;
    Punish(log.executor.id, "kick");
    AuthorzedRoles(newGuild.id);
    let guild = client.guilds.cache.get(conf.guildID)
    guild.setBanner(conf.banner);
    guild.setIcon(conf.sunucugif);
    await newGuild.edit({
        name: oldGuild.name,
        icon: oldGuild.iconURL({ dynamic: true }),
        banner: oldGuild.bannerURL(),
        region: oldGuild.region,
        verificationLevel: oldGuild.verificationLevel,
        explicitContentFilter: oldGuild.explicitContentFilter,
        afkChannel: oldGuild.afkChannel,
        systemChannel: oldGuild.systemChannel,
        afkTimeout: oldGuild.afkTimeout,
        rulesChannel: oldGuild.rulesChannel,
        publicUpdatesChannel: oldGuild.publicUpdatesChannel,
        preferredLocale: oldGuild.preferredLocale
    })
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${log.executor}** (\`${log.executor.id}\`) sunucu ayarlarını güncelledi ve sunucudan **atıldı**\n────────────────────────`)).catch(console.error);;
});
client.on("roleDelete", async role => {
    let entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(audit => audit.entries.first());
    if (!ayarlar.PROTECTROLS.includes(role.id)) return;
    Punish(entry.executor.id, "ban");
    AuthorzedRoles(role.guild.id);
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **yasaklı bir rol sildiği ve sunucudan atıldı**.\n\n**Silinen Rol: ${role.name}** \`(${role.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("guildBanAdd", async(guild, user) => {
    let entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || safe1(entry.executor.id)) return;
    if (!sagTikBanKoruma[entry.executor.id]) {
        sagTikBanKoruma[entry.executor.id] = 1;
        Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık ban attı**.\n\n**Sunucudan Banlanan Üye: ${user}** \`(${user.id})\`\n────────────────────────`)).catch(console.error);
    } else {
        sagTikBanKoruma[entry.executor.id]++;
        Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık ban attı**.\n\n**Sunucudan Banlanan Üye: ${user}** \`(${user.id})\`\n────────────────────────`)).catch(console.error);
    };

    setTimeout(() => {
        sagTikBanKoruma[entry.executor.id]--;
        if (sagTikBanKoruma[entry.executor.id] <= 0) delete sagTikBanKoruma[entry.executor.id];
    }, islemSuresi);

    if (sagTikBanKoruma[entry.executor.id] >= 10) {
        Object.keys(sagTikBanKoruma).forEach(k => Punish(k, "jail"));
        Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık ban atma limiti geçildi**.\n\n**Sunucudan Banlanan Üye: ${user}** \`(${user.id})\`\n───────────────────────`)).catch(console.error);

    };
});
client.on("guildMemberUpdate", async(oldMember, newMember) => {
    if (newMember.roles.cache.size > oldMember.roles.cache.size) {
        let entry = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' }).then(audit => audit.entries.first());
        if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id) || safe4(entry.executor.id) || safe2(entry.executor.id)) return;
        if (STAFPERMS.some(p => !oldMember.hasPermission(p) && newMember.hasPermission(p))) {
            Punish(entry.executor.id, "jail");
            newMember.roles.set(oldMember.roles.cache.map(r => r.id));
            Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir üyeye yasaklı rol verdiği için jaile atıldı.**.\n\n**Rol Verilen Üye: ${newMember.name}** \`(${newMember.id})\`\n────────────────────────`)).catch(console.error);;
        };
    };
});
client.on("guildUpdate", async (oldGuild, newGuild) => {
    if (newGuild.vanityURLCode !== oldGuild.vanityURLCode) {
      request({
        method: "PATCH",
        url: `https://discord.com/api/guilds/${conf.guildID}/vanity-url`,
        headers: {
          "Authorization": `Bot ${conf.TOKEN1}`
        },
        json: {
          "code": `${conf.PROTECTEDURL}`
        }
      });
    }
  });
client.login(conf.TOKEN2).then(c => console.log(`${client.user.tag} Olarak Giriş Yaptı`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
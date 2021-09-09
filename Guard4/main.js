const { Discord, Client, Intents, MessageEmbed, WebhookClient } = require('discord.js');
const conf = require("../config.json");
const ayarlar = require("../safe.json");
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
const request = require('request');
const Webhook = new WebhookClient(conf.WEBHOOKID, conf.WEBHOOKTOKEN);
const STAFPERMS = conf.STAFPERMS
client.on("ready", async () => {
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
var sagTikRolKoruma = [], sagTikBanKoruma = {}, etiketKoruma = {}, rolKoruma = {}, kanalKoruma = {}, emojiKoruma = {}, islemSuresi = 1000 * 60 * 10;
client.on("roleDelete", async role => {
  let entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  Punish(entry.executor.id, "kick");
  AuthorzedRoles(role.guild.id);
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir rol sildiği ve sunucudan atıldı**.\n\n**Silinen Rol: ${role.name}** \`(${role.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("channelUpdate", async (oldChannel, newChannel) => {
  let entry = await newChannel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || !newChannel.guild.channels.cache.has(newChannel.id) || safe1(entry.executor.id) || safe3(entry.executor.id)  || safe2(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");
  if (newChannel.type !== "category" && newChannel.parentID !== oldChannel.parentID) newChannel.setParent(oldChannel.parentID);
  if (newChannel.type === "category") {
    newChannel.edit({
      name: oldChannel.name,
    });
  } else if (newChannel.type === "text") {
    newChannel.edit({
      name: oldChannel.name,
      topic: oldChannel.topic,
      nsfw: oldChannel.nsfw,
      rateLimitPerUser: oldChannel.rateLimitPerUser
    });
  } else if (newChannel.type === "voice") {
    newChannel.edit({
      name: oldChannel.name,
      bitrate: oldChannel.bitrate,
      userLimit: oldChannel.userLimit,
    });
  };
  oldChannel.permissionOverwrites.forEach(perm => {
    let thisPermOverwrites = {};
    perm.allow.toArray().forEach(p => {
      thisPermOverwrites[p] = true;
    });
    perm.deny.toArray().forEach(p => {
      thisPermOverwrites[p] = false;
    });
    newChannel.createOverwrite(perm.id, thisPermOverwrites);
  });
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir kanal güncellediği için jaile atıldı.**.\n\n**Güncellenen Kanal: ${oldChannel.name}** \`(${oldChannel.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("roleUpdate", async (oldRole, newRole) => {
  let entry = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || !newRole.guild.roles.cache.has(newRole.id) || safe1(entry.executor.id)) return;
  if (newRole.id == newRole.guild.id) {
    Punish(entry.executor.id, "kick");
    newRole.setPermissions(oldRole.permissions);
    newRole.guild.roles.cache.filter(r => r.permissions.has("ADMINISTRATOR") || r.permissions.has("MANAGE_ROLES") || r.permissions.has("MANAGE_GUILD")).forEach(r => r.setPermissions(37080641));
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir rol güncellediği için sunucudan atıldı.**.\n\n**Güncellenen Rol: ${oldRole.name}** \`(${oldRole.id})\`\n────────────────────────`)).catch(console.error);;
    return;
  };
  Punish(entry.executor.id, "kick");
  if (STAFPERMS.some(p => !oldRole.permissions.has(p) && newRole.permissions.has(p))) {
    newRole.setPermissions(oldRole.permissions);
    newRole.guild.roles.cache.filter(r => !r.managed && (r.permissions.has("ADMINISTRATOR") || r.permissions.has("MANAGE_ROLES") || r.permissions.has("MANAGE_GUILD"))).forEach(r => r.setPermissions(36818497));
  };
  newRole.edit({
    name: oldRole.name,
    color: oldRole.hexColor,
    hoist: oldRole.hoist,
    permissions: oldRole.permissions,
    mentionable: oldRole.mentionable
  });
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir rol güncellediği için sunucudan atıldı.**.\n\n**Güncellenen Rol: ${oldRole.name}** \`(${oldRole.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("guildUpdate", async (oldGuild, newGuild) => {
  let entry = await newGuild.fetchAuditLogs({ type: 'GUILD_UPDATE' }).then(audit => audit.entries.first());
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
    AuthorzedRoles(newGuild.id)
    Webhook.send(conf.ETİKET,new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) sunucu urlsini güncellendiği için yetkiler kapatıldıı ve üye sunucudan banlandı..\n\n────────────────────────`)).catch(console.error);;
  }
});
client.login(conf.TOKEN3).then(c => console.log(`${client.user.tag} Olarak Giriş Yaptı`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));

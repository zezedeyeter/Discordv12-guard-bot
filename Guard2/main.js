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
const logs = require('discord-logs');
logs(client);
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
function safe(kisiID) {
  let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || uye.id === uye.guild.owner.id) return true
  else return false;
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
client.on("channelCreate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe3(entry.executor.id) || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  channel.delete({ reason: "Zeze Kanal Koruma" });
});

client.on("roleCreate", async role => {
  let entry = await role.guild.fetchAuditLogs({ type: 'ROLE_CREATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  role.delete({ reason: "Zeze Rol Koruma" });
  Punish(entry.executor.id, "jail");

});
client.on("guildMemberAdd", async member => {
  let entry = await member.guild.fetchAuditLogs({ type: 'BOT_ADD' }).then(audit => audit.entries.first());
  if (!member.user.bot || !entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe(entry.executor.id)  ) return;
  Punish(entry.executor.id, "ban");
  Punish(member.id, "ban");
  AuthorzedRoles(member.guild.id)
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sunucuya bir bot eklediği için sunucudan atıldı ve yetkiler kapatıldı.**.\n\n**Eklenen Bot: ${member.user.tag}** \`(${member.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("guildChannelPermissionsUpdate", async (channel, oldPermissions, newPermissions) => {
  const entry = await channel.guild.fetchAuditLogs({ limit: 1, type: "CHANNEL_OVERWRITE_UPDATE" }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");
  await channel.edit({ permissionOverwrites: oldPermissions })
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir kanalın izinlerini güncellediği için jaile atıldı.**\n\n**İzinleriyle Oynanılan Kanal: ${channel.name}** \`(${channel.id})\`\n────────────────────────`)).catch(console.error);;
});

client.on("guildMemberRemove", async member => {
  let entry = await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir üyeyi sunucudan attığı için jaile atıldı.**.\n\n**Sunucudan Atılan Üye: ${member.user.tag}** \`(${member.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.roles.cache.size > oldMember.roles.cache.size) {
    let entry = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id)) return;
    if (STAFPERMS.some(p => !oldMember.hasPermission(p) && newMember.hasPermission(p))) {
      sagTikRolKoruma.push(entry.executor.id);
      sagTikRolKoruma.push(newMember.id);
      if (sagTikRolKoruma.length > 5) {
        sagTikRolKoruma.forEach(k => Punish(k, "jail"));
        Punish(entry.executor.id, "jail");
        Webhook.send(conf.ETİKET,
          new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **sağtık yetki verme limiti geçildi.**.\n\n**Rol Verilen Üye: ${newMember}** \`(${newMember.id})\`\n────────────────────────`)).catch(console.error);
      };
      setTimeout(() => {
        sagTikRolKoruma = sagTikRolKoruma.filter(k => k !== entry.executor.id && k !== newMember.id);
      }, islemSuresi);
    };
  };
});
client.on("channelDelete", async channel => {
  let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe1(entry.executor.id)) return;
  let sayi = 2;
  if (!kanalKoruma[entry.executor.id]) {
    kanalKoruma[entry.executor.id] = sayi;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir kanal sildi**\n\n**Silinen Kanal: ${channel.name}** \`(${channel.id})\`\n────────────────────────`)).catch(console.error);
  } else {
    kanalKoruma[entry.executor.id] = kanalKoruma[entry.executor.id] + sayi;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir kanal sildi**\n\n**Silinen Kanal: ${channel.name}** \`(${channel.id})\`\n────────────────────────`)).catch(console.error);
  };
  setTimeout(() => {
    kanalKoruma[entry.executor.id] = kanalKoruma[entry.executor.id] - sayi;
    if (kanalKoruma[entry.executor.id] <= 0) delete kanalKoruma[entry.executor.id];
  }, islemSuresi);

  if (kanalKoruma[entry.executor.id] >= 5) {
    Punish(entry.executor.id, "jail");
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **kanla silme limiti geçildi.**\n\n**Silinen Kanal: ${channel.name}** \`(${channel.id})\`\n────────────────────────`)).catch(console.error);
  };
});
client.login(conf.TOKEN1).then(c => console.log(`${client.user.tag} Olarak Giriş Yaptı`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));

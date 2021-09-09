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
const Webhook = new WebhookClient(conf.WEBHOOKID, conf.WEBHOOKTOKEN);

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
  if (!uye || uye.id === conf.botOwner || uye.id === client.user.id || uye.id === uye.guild.owner.id) return true
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
function Punish(kisiID, tur) {
  let MEMBER = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  if (!MEMBER) return;
  if (tur == "jail") return MEMBER.roles.cache.has(conf.BOOSTERROLE) ? MEMBER.roles.set([conf.BOOSTERROLE, conf.JAILROLE]) : MEMBER.roles.set([conf.JAILROLE]).catch()
  if (tur == "ban") return MEMBER.ban({ reason: "Owsla and Zeze Guard" }).catch(console.error);;
  if (tur == "kick") return MEMBER.kick().catch(console.error);;
};
function safe4(kisiID) {
  let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  let guvenliler = ayarlar.güvenli4 || [];
  if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
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
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || safe1(entry.executor.id)) return;

  let sayi = 2;
  if (!rolKoruma[entry.executor.id]) {
    rolKoruma[entry.executor.id] = sayi;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n ** ${entry.executor}** (\`${entry.executor.id}\`) **bir rol sildi.**.\n\n**Silinen Rol: ${role.name}** \`(${role.id})\`\n────────────────────────`)).catch(console.error);
  } else {
    rolKoruma[entry.executor.id] = rolKoruma[entry.executor.id] + sayi;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir rol sildi.**.\n\n**Silinen Rol: ${role.name}** \`(${role.id})\`\n────────────────────────`)).catch(console.error);
  };
  setTimeout(() => {
    rolKoruma[entry.executor.id] = rolKoruma[entry.executor.id] - sayi;
    if (rolKoruma[entry.executor.id] <= 0) delete rolKoruma[entry.executor.id];
  }, islemSuresi);

  if (rolKoruma[entry.executor.id] >= 3) {
    Object.keys(rolKoruma).forEach(k => Punish(k, "jail"));
    AuthorzedRoles(role.guild.id)
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **rol silme limiti geçildi.**.\n\n**Silinen Rol: ${role.name}** \`(${role.id})\`\n────────────────────────`)).catch(console.error);;
  };
});
client.on("guildMemberRemove", async member => {
  let entry = await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || safe1(entry.executor.id)) return;
  if (!sagTikBanKoruma[entry.executor.id]) {
    sagTikBanKoruma[entry.executor.id] = 1;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık kick attı**.\n\n**Sunucudan Atılan Üye: ${member}** \`(${member.id})\`\n────────────────────────`)).catch(console.error);
  } else {
    sagTikBanKoruma[entry.executor.id]++;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık kick attı**.\n\n**Sunucudan Atılan Üye: ${member}** \`(${member.id})\`\n────────────────────────`)).catch(console.error);

  };
  setTimeout(() => {
    sagTikBanKoruma[entry.executor.id]--;
    if (sagTikBanKoruma[entry.executor.id] <= 0) delete sagTikBanKoruma[entry.executor.id];
  }, islemSuresi);

  if (sagTikBanKoruma[entry.executor.id] >= 5) {
    Object.keys(sagTikBanKoruma).forEach(k => Punish(k, "jail"));
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **sağtık kick atma limiti geçildi**.\n\n**Sunucudan Atılan Üye: ${member}** \`(${member.id})\`\n────────────────────────`)).catch(console.error);;
  };
});
client.on("channelUpdate", async (oldChannel, newChannel) => {
  let entry = await newChannel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || !newChannel.guild.channels.cache.has(newChannel.id) || Date.now() - entry.createdTimestamp > 5000 || safe1(entry.executor.id)) return;
  if (!kanalKoruma[entry.executor.id]) {
    kanalKoruma[entry.executor.id] = 1;
  } else {
    kanalKoruma[entry.executor.id]++;
  };
  setTimeout(() => {
    kanalKoruma[entry.executor.id]--;
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir kanal güncellendi**\n\n**Güncellenen Kanal: ${oldChannel.name}** \`(${oldChannel.id})\`\n────────────────────────`)).catch(console.error);
    if (kanalKoruma[entry.executor.id] <= 0) delete kanalKoruma[entry.executor.id];
    Webhook.send(new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir kanal güncellendi**\n\n**Güncellenen Kanal: ${oldChannel.name}** \`(${oldChannel.id})\`\n────────────────────────`)).catch(console.error);
  }, islemSuresi);

  if (kanalKoruma[entry.executor.id] >= 15) {
    Punish(entry.executor.id, "jail");
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **kanal güncelleme limiti geçildi.**.\n\n**Güncellenen Kanal: ${oldChannel.name}** \`(${oldChannel.id})\`\n────────────────────────`)).catch(console.error);
  };
});
client.on("channelCreate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 10000 || safe3(entry.executor.id) || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  channel.delete({ reason: "Zeze Kanal Koruma" });
  Punish(entry.executor.id, "jail");
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n** ${entry.executor}** (\`${entry.executor.id}\`) **bir kanal oluşturdu, oluşturulan kanal silindi ve yetkili jaile atıldı.**.\n\n**Oluşturulan Kanal: ${channel.name}** \`(${channel.id})\`\n────────────────────────`)).catch(console.error);;
});
client.on("webhookUpdate", async channel => {
  const log = await channel.guild.fetchAuditLogs({ limit: 1 }).then(audit => audit.entries.first());
  const webhook = log.target;
  if (!log || log.targetType !== "WEBHOOK" || Date.now() - log.createdTimestamp > 5000 || safe1(log.executor.id)) return;
  Punish(log.executor.id, "kick");
  if (log.actionType === "CREATE") {
    await webhook.delete();
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${log.executor.name}** (\`${log.executor.id}\`) bir webhook oluşturdu ve sunucudan atıldı **atıldı.**\n\n**Güncellenen Webhook: ${webhook.name}** \`(${webhook.id})\`\n────────────────────────`)).catch(console.error);;
  } else if (log.actionType === "DELETE") {
    await channel.createWebhook(webhook.name, { avatar: webhook.avatar });
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${log.executor.name}** (\`${log.executor.id}\`) bir webhook sildi ve sunucudan atıldı **atıldı.**\n\n**Güncellenen Webhook: ${webhook.name}** \`(${webhook.id})\`\n────────────────────────`)).catch(console.error);;

  } else if (log.actionType === "UPDATE") {
    await webhook.edit({ name: webhook.name, avatar: webhook.avatar, channel: webhook.channelID });
    Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${log.executor.name}** (\`${log.executor.id}\`) bir webhook güncelledi ve sunucudan atıldı **atıldı.**\n\n**Güncellenen Webhook: ${webhook.name}** \`(${webhook.id})\`\n────────────────────────`)).catch(console.error);;
  }
  return
});
client.on("roleCreate", async role => {
  let entry = await role.guild.fetchAuditLogs({ type: 'ROLE_CREATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  role.delete({ reason: "Zeze Rol Koruma" });
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir rol oluşturdu, oluşturulan rol silindi ve yetkili jaiel atıldı.**)\`\n────────────────────────`)).catch(console.error);;
});
client.on("guildBanAdd", async (guild, user) => {
  let entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || safe1(entry.executor.id) || safe2(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");
  guild.members.unban(user.id, "Sağ Tık İle Banlandığı İçin Geri Açıldı!").catch(console.error);
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${entry.executor}** (\`${entry.executor.id}\`) **bir üyeyi sunucudan banladığı için jaile atıldı.**.\n\n**Sunucudan Banlanan Üye: ${user.tag}** \`(${user.id})\`\n────────────────────────`)).catch(console.error);;
});

client.on("roleUpdate", async (oldRole, newRole) => {
  let entry = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 &&  safe(entry.executor.id) ) return;

  if (newRole.id != newRole.guild.id) return;
  Punish(entry.executor.id, "jail");
  newRole.guild.roles.cache.get(newRole.guild.id).setPermissions(36767744).catch()
  Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`EVERYONE ROLÜ GÜNCELLENDİ !!!!!!!!!!!!!`)).catch(console.error);;
});

client.login(conf.TOKEN4).then(c => console.log(`${client.user.tag} Olarak Giriş Yaptı`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));

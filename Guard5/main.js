const { Discord, Client, Intents, MessageEmbed, WebhookClient } = require('discord.js');
const conf = require("../config.json");
const ayarlar = require("../safe.json");
const fs = require('fs')
const mongoose = require("mongoose");
const moment = require("moment");
const Database = require("./models/role.js");
const client = new Client({
  ws: {
    intents: new Intents(Intents.ALL).remove([
      "GUILD_INTEGRATIONS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING"

    ])
  }
});
mongoose.connect(conf.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Webhook = new WebhookClient(conf.WEBHOOKID, conf.WEBHOOKTOKEN);
const STAFPERMS = conf.STAFPERMS

client.on("ready", async () => {
  setInterval(() => {
    const index = Math.floor(Math.random() * (conf.durum.length));
    client.user.setPresence({ activity: { name: `${conf.durum[index]}` }, status: "idle" });
  }, 15000);

  let kanal = client.channels.cache.filter(x => x.type === "voice" && x.id === conf.VOICECHANNEL)
  client.channels.cache.get(conf.VOICECHANNEL).join().then(x => console.log("Bot başarılı bir şekilde ses kanalına bağlandı")).catch(() => console.log("Bot ses kanalına bağlanırken bir sorun çıktı Lütfen Yetkileri kontrol ediniz!"))
  setRoleBackup();
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
    setRoleBackup();
    console.log(`Koruma Düzenendi `)
  }, 1000 * 60 * 15)
});


Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};


function AuthorzedRoles() {
  let GUILD = client.guilds.cache.get(conf.guildID);
  if (!GUILD) return;
  GUILD.roles.cache.filter(r => r.editable && (r.permissions.has("ADMINISTRATOR") || r.permissions.has("MANAGE_EMOJIS") || r.permissions.has("BAN_MEMBERS") || r.permissions.has("KICK_MEMBERS") || r.permissions.has("MANAGE_CHANNELS") || r.permissions.has("MANAGE_GUILD") || r.permissions.has("MANAGE_ROLES") || r.permissions.has("MANAGE_WEBHOOKS"))).forEach(async r => {
    await r.setPermissions(36767232);
  });
};

function güvenli1(kisiID) {
  let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  let guvenliler = ayarlar.güvenli1 || [];
  if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
};

function güvenli2(kisiID) {
  let uye = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  let guvenliler = ayarlar.güvenli2 || [];
  if (!uye || conf.botOwner.some(x => x === uye.id) || uye.id === client.user.id || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
};
function Punish(kisiID, tur) {
  let MEMBER = client.guilds.cache.get(conf.guildID).members.cache.get(kisiID);
  if (!MEMBER) return;
  if (tur == "jail") return MEMBER.roles.cache.has(conf.BOOSTERROLE) ? MEMBER.roles.set([conf.BOOSTERROLE, conf.JAILROLE]) : MEMBER.roles.set([conf.JAILROLE]).catch()
  if (tur == "ban") return MEMBER.ban({
    reason: "zezedeyeter"
  }).catch(console.error);;
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
///-----------------------------------------------------------------------------------------------------------------------------------------------//
client.on("roleDelete", async (role) => {
  let entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || güvenli1(entry.executor.id) || güvenli2(entry.executor.id)) return;
  if (!ayarlar.PROTECTROLS.includes(role.id)) return;
  Punish(entry.executor.id, "ban");
});

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  let entry = await newEmoji.guild.fetchAuditLogs({
    type: 'EMOJI_UPDATE'
  }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || güvenli1(entry.executor.id)) return;
  if (!emojiKoruma[entry.executor.id]) {
    emojiKoruma[entry.executor.id] = 1;
  } else {
    emojiKoruma[entry.executor.id]++;
  };
  setTimeout(() => {
    emojiKoruma[entry.executor.id]--;
  }, islemSuresi);

  if (emojiKoruma[entry.executor.id] >= 10) {
    Object.keys(emojiKoruma).forEach(k => cezalandir(k, "jail"));
  };
});

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  let entry = await newEmoji.guild.fetchAuditLogs({type: 'EMOJI_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor  || güvenli1(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");

});


client.on("emojiDelete", async emoji => {
  let entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_DELETE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor  || güvenli1(entry.executor.id)) return;
  Punish(entry.executor.id, "jail");


});
client.on("emojiDelete", async emoji => {
  let entry = await emoji.guild.fetchAuditLogs({
    type: 'EMOJI_DELETE'
  }).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 5000 || güvenli1(entry.executor.id)) return;
  if (!emojiKoruma[entry.executor.id]) {
    emojiKoruma[entry.executor.id] = 1;
  } else {
    emojiKoruma[entry.executor.id]++;
  };
  setTimeout(() => {
    emojiKoruma[entry.executor.id]--;
  }, islemSuresi);

  if (emojiKoruma[entry.executor.id] >= 10) {
    Object.keys(emojiKoruma).forEach(k => cezalandir(k, "jail"));
  };
});
client.on("message", async message => {
  if (message.author.id === message.guild.ownerID || güvenli1(message.author.id)) return;
  if (message.mentions.everyone || message.mentions.roles.some(r => r.members.size > 500) || message.mentions.users.size > 30) {
    if (!etiketKoruma[message.author.id]) {
      etiketKoruma[message.author.id] = 1;
    } else {
      etiketKoruma[message.author.id]++;
    };
    if (etiketKoruma[message.author.id] >= 5) {
      Punish(message.author.id, "jail");
      Webhook.send(conf.ETİKET, new MessageEmbed().setDescription(`────────────────────────\n**${message.author}** (\`${message.author.id}\`) **Everyneo atma limtini geçtiği için jaile atıldı.**\n\n────────────────────────`)).catch(console.error);;
    };

    setTimeout(() => {
      etiketKoruma[message.author.id]--;
      if (etiketKoruma[message.author.id] <= 0) delete etiketKoruma[message.author.id];
    }, islemSuresi);
  };
});
///-----------------------------------------------------------------------------------------------------------------------------------------------//

function setRoleBackup() {
  let guild = client.guilds.cache.get(conf.guildID);
  if (guild) {
    guild.roles.cache.filter(r => r.name !== "@everyone" && !r.managed).forEach(role => {
      let roleChannelOverwrites = [];
      guild.channels.cache.filter(c => c.permissionOverwrites.has(role.id)).forEach(c => {
        let channelPerm = c.permissionOverwrites.get(role.id);
        let pushlanacak = {
          id: c.id,
          allow: channelPerm.allow.toArray(),
          deny: channelPerm.deny.toArray()
        };
        roleChannelOverwrites.push(pushlanacak);
      });

      Database.findOne({
        guildID: conf.guildID,
        roleID: role.id
      }, async (err, savedRole) => {
        if (!savedRole) {
          let newRoleSchema = new Database({
            _id: new mongoose.Types.ObjectId(),
            guildID: conf.guildID,
            roleID: role.id,
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions,
            mentionable: role.mentionable,
            time: Date.now(),
            members: role.members.map(m => m.id),
            channelOverwrites: roleChannelOverwrites
          });
          newRoleSchema.save();
        } else {
          savedRole.name = role.name;
          savedRole.color = role.hexColor;
          savedRole.hoist = role.hoist;
          savedRole.position = role.position;
          savedRole.permissions = role.permissions;
          savedRole.mentionable = role.mentionable;
          savedRole.time = Date.now();
          savedRole.members = role.members.map(m => m.id);
          savedRole.channelOverwrites = roleChannelOverwrites;
          savedRole.save();
        };
      });
    });

    Database.find({
      guildID: conf.guildID
    }).sort().exec((err, roles) => {
      roles.filter(r => !guild.roles.cache.has(r.roleID) && Date.now() - r.time > 1000 * 60 * 60 * 24 * 3).forEach(r => {
        Database.findOneAndDelete({
          roleID: r.roleID
        });
      });
    });
    console.log(`Rol veri tabanı düzenlendi!`);
  };
};
client.on("message", async message => {
  if ((!conf.botOwner.includes(message.author.id) && !conf.OWNER.includes(message.author.id) && message.author.id !== message.guild.ownerID) || message.author.bot || !message.content || !message.guild) return;
  let args = message.content.split(' ').slice(1);
  let command = message.content.split(' ')[0].slice(conf.botPrefix.length);
  let embed = new MessageEmbed().setColor("2F3136").setAuthor(message.member.displayName, message.author.avatarURL({
    dynamic: true,
  })).setFooter(`${client.users.cache.has(conf.botOwner) ? client.users.cache.get(conf.botOwner).tag : "Zeze"} was here!`).setTimestamp();
  if (command === "eval" && conf.botOwner.includes(message.author.id)) {
    if (!args[0]) return message.channel.send(`Kod belirtilmedi`);
    let code = args.join(' ');

    function clean(text) {
      if (typeof text !== 'string') text = require('util').inspect(text, {
        depth: 0
      })
      text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
      return text;
    };
    try {
      var evaled = clean(await eval(code));
      if (evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
      message.channel.send(`${evaled.replace(client.token, "Yasaklı komut")}`, {
        code: "js",
        split: true
      });
    } catch (err) {
      message.channel.send(err, {
        code: "js",
        split: true
      })
    };
  };
  if (command === 'aç') {
    message.guild.roles.cache.get("883686819915517962").setPermissions(3758096341).catch();
    message.guild.roles.cache.get("883686822104936518").setPermissions(3489660885).catch();
    message.guild.roles.cache.get("883686829361078334").setPermissions(3489529809).catch();
    message.guild.roles.cache.get("883686834025140244").setPermissions(3489529793).catch();
    message.guild.roles.cache.get("883686836533338142").setPermissions(16777216).catch();

    message.channel.send(new MessageEmbed().setTitle("`Yetkiler Açıldı`").setColor("BLACK").setDescription(`**Açılan Yetkiler Sırasıyla Aşağıda Belirtilmiştir.**\n
    <@&883686819915517962>: [3758096341](https://discordapi.com/permissions.html#3758096341)
    <@&883686822104936518>: [3489660885](https://discordapi.com/permissions.html#3489660885)
    <@&883686829361078334>: [3489529809](https://discordapi.com/permissions.html#3489529809)
    <@&883686834025140244>: [3489529793](https://discordapi.com/permissions.html#3489529793)
    <@&883686836533338142>: [16777216](https://discordapi.com/permissions.html#16777216)


 `))
  } 
  if (command === 'kapa') {
    AuthorzedRoles(message.guild.id)
    message.reply("`Yetkiler Kapatıldı`")
  }
  if (command === "kur") {
    if (!args[0] || isNaN(args[0])) return message.reply("Geçerli bir rol ID'si belirtmelisin!").then(x => x.delete({
      timeout: 5000
    }));
    Database.findOne({
      guildID: conf.guildID,
      roleID: args[0]
    }, async (err, roleData) => {
      if (!roleData) return message.reply("Belirtilen rol ID'sine ait veri bulunamadı!").then(x => x.delete({
        timeout: 5000
      }));

      let yeniRol = message.guild.roles.cache.find(r => r.name === roleData.name);

      if (!yeniRol) yeniRol = await message.guild.roles.create({
        data: {
          name: roleData.name,
          color: roleData.color,
          hoist: roleData.hoist,
          permissions: roleData.permissions,
          position: roleData.position,
          mentionable: roleData.mentionable
        },
        reason: "Manuel Olarak Yedek Kuruluyor!"
      });
      message.channel.send(`**${client.user.username}** yedeği kurmaya başladı!`);
      setTimeout(() => {
        let kanalPermVeri = roleData.channelOverwrites;
        if (kanalPermVeri) kanalPermVeri.forEach((perm, index) => {
          let kanal = message.guild.channels.cache.get(perm.id);
          if (!kanal) return;
          setTimeout(() => {
            let yeniKanalPermVeri = {};
            perm.allow.forEach(p => {
              yeniKanalPermVeri[p] = true;
            });
            perm.deny.forEach(p => {
              yeniKanalPermVeri[p] = false;
            });
            kanal.createOverwrite(yeniRol, yeniKanalPermVeri).catch(console.error);
          }, index * 5000);
        });
      }, 5000);
      let roleMembers = roleData.members.shuffle();
      roleMembers.forEach((member, index) => {
        let uye = message.guild.members.cache.get(member);
        if (!uye || uye.roles.cache.has(yeniRol.id)) return;
        setTimeout(() => {
          uye.roles.add(yeniRol.id).catch(console.error);
        }, index * 100);
      });
    });
  };

  if (command === "güvenli") {
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.güvenli1 || [];
    if (!hedef) return message.channel.send(new MessageEmbed().setFooter("Url Hariç Herşey Serbest :)").setDescription(`\`\`\`Güvenli listeye eklemek/kaldırmak için bir hedef (rol/üye) belirtmelisin!\`\`\``).addField("Güvenli Liste", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g.slice(1)) || message.guild.members.cache.has(g.slice(1))) ? (message.guild.roles.cache.get(g.slice(1)) || message.guild.members.cache.get(g.slice(1))) : g).join('\n') : "Bulunamadı!"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.güvenli1 = guvenliler;
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli listesinden kaldırıldı!`));
    } else {
      ayarlar.güvenli1.push(`y${hedef.id}`);
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli listesine eklendi!`));
    };
  };
  if (command === "güvenli2") {
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.güvenli2 || [];
    if (!hedef) return message.channel.send(new MessageEmbed().setFooter("Yapabildikleri : Bir çok şeyi yapabilirsiniz owner guard tarafından denetlenmektesiniz, abartılı işlemlerde cezalandırma uygulanır.").setDescription(`\`\`\`Güvenli listeye eklemek/kaldırmak için bir hedef (rol/üye) belirtmelisin!\`\`\``).addField("Güvenli Liste", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g.slice(1)) || message.guild.members.cache.has(g.slice(1))) ? (message.guild.roles.cache.get(g.slice(1)) || message.guild.members.cache.get(g.slice(1))) : g).join('\n') : "Bulunamadı!"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.güvenli2 = guvenliler;
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli2 listesinden kaldırıldı!`));
    } else {
      ayarlar.güvenli2.push(`y${hedef.id}`);
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli2 listesine eklendi!`));
    };
  };
  if (command === "güvenli3") {
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.güvenli3 || [];
    if (!hedef) return message.channel.send(new MessageEmbed().setDescription(`\`\`\`Güvenli listeye eklemek/kaldırmak için bir hedef (rol/üye) belirtmelisin!\`\`\``).setFooter("Yapabildikleri : Kanal oluşturabilme ve kanal güncelleme").addField("Güvenli Liste", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g.slice(1)) || message.guild.members.cache.has(g.slice(1))) ? (message.guild.roles.cache.get(g.slice(1)) || message.guild.members.cache.get(g.slice(1))) : g).join('\n') : "Bulunamadı!"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.güvenli3 = guvenliler;
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli3 listesinden kaldırıldı!`));
    } else {
      ayarlar.güvenli3.push(`y${hedef.id}`);
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli3 listesine eklendi!`));
    };
  };
  if (command === "güvenli4") {
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.güvenli4 || [];
    if (!hedef) return message.channel.send(new MessageEmbed().setDescription(`\`\`\`Güvenli listeye eklemek/kaldırmak için bir hedef (rol/üye) belirtmelisin!\`\`\``).setFooter("Yapabildikleri : Sağtık rol verebilmek.").addField("Güvenli Liste", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g.slice(1)) || message.guild.members.cache.has(g.slice(1))) ? (message.guild.roles.cache.get(g.slice(1)) || message.guild.members.cache.get(g.slice(1))) : g).join('\n') : "Bulunamadı!"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.güvenli4 = guvenliler;
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli4 listesinden kaldırıldı!`));
    } else {
      ayarlar.güvenli4.push(`y${hedef.id}`);
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli4 listesine eklendi!`));
    };
  };
  if (command === "rol") {
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.PROTECTROLS || [];
    if (!hedef) return message.channel.send(new MessageEmbed()
      .setDescription(`\`\`\`Güvenli rolleri belirtmek için oz!rol rolid/roletiket yapmanız yeterlidir.\`\`\``).addField("Güvenli Rol Listesi", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g) || message.guild.members.cache.has(g)) ? (message.guild.roles.cache.get(g) || message.guild.members.cache.get(g)) : g).join('\n') : "Bulunamadı!"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.PROTECTROLS = guvenliler;
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli rol listesinden kaldırıldı!`));
    } else {
      ayarlar.PROTECTROLS.push(`${hedef.id}`);
      fs.writeFile("././safe.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, ${message.author} tarafından güvenli rol listesinden eklendi!`));
    };
  };
});
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.shuffle = function () {
  let i = this.length;
  while (i) {
    let j = Math.floor(Math.random() * i);
    let t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
};
client.login(conf.MANAGER).then(c => console.log(`${client.user.tag} Dağıtıcı Giriş Yaptı`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));

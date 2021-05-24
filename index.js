const { Client } = require("discord.js");
const Discord = require("discord.js");
const client = new Client({
  allowedMentions: {
    // set repliedUser value to `false` to turn off the mention by default
    repliedUser: true,
  },
});
const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
	warnThreshold: 5, // Amount of messages sent in a row that will cause a warning.
	muteThreshold: 10, // Amount of messages sent in a row that will cause a mute
	kickThreshold: 500, // Amount of messages sent in a row that will cause a kick.
	banThreshold: 500, // Amount of messages sent in a row that will cause a ban.
	maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
	warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in chat upon warning a user.
	kickMessage: '**{user_tag}** has been kicked for spamming.', // Message that will be sent in chat upon kicking a user.
	muteMessage: '**{user_tag}** has been muted for spamming.',// Message that will be sent in chat upon muting a user.
	banMessage: '**{user_tag}** has been banned for spamming.', // Message that will be sent in chat upon banning a user.
	maxDuplicatesWarning: 6, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesMute: 8, // Ammount of duplicate message that trigger a mute.
	ignoredPermissions: [ 'ADMINISTRATOR'], // Bypass users with any of these permissions.
	ignoreBots: true, // Ignore bot messages.
	verbose: true, // Extended Logs from module.
	ignoredMembers: ['734286347858083863'], // Array of User IDs that get ignored.
	muteRoleName: "Muted", // Name of the role that will be given to muted users!
	removeMessages: true // If the bot should remove all the spam messages when taking action on a user!
	// And many more options... See the documentation.
});
const curseWords = require('./cursewords.js')

const prefix = "c!";
const guildId = "799819756914868264";
let amountof = "0";
require("./ExtendedMessage");
const WOKCommands = require("wokcommands");
const { default: messageHandler } = require("wokcommands/dist/message-handler");
module.exports = { amountof: `${amountof}` };

client.on("ready", () => {
	client.user.setActivity('chat', { type: 'WATCHING' });
});

client.on("ready", () => {
  new WOKCommands(client, {
    commandsDir: "commands",
    testServers: [guildId],
  });
});

client.on("message", (msg) => {
  for (var i = 0; i < curseWords.length; i++) {
    if (msg.content.includes(curseWords[i]) && !msg.author.bot) {
      amountof++;
      let censored = msg.content;
      let user = msg.author;
	if (!msg.member.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("I don't have the required permissions to censor this.")
      const embed = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Your message has been moderated")
        .setDescription("Do not send this again")
        .addFields({ name: "Message Moderated:", value: censored })
        .setTimestamp();

      const otherembed = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Message Moderated")
        .setDescription(`${user.username}, do not send this again.`);

      let myRole = msg.guild.roles.cache.find((role) => role.name === "Muted");
      msg.author.send(embed);
      msg.channel.send(otherembed);
      msg.delete();
      console.log(`${user.tag} was moderated for ${censored}`);
    }
  }

  if (msg.content === prefix + "count") {
    msg.inlineReply("I have moderated " + amountof + " words!");
  }

  if (
    msg.content === prefix + "shutdown" &&
    msg.author.id === "734286347858083863"
  ) {
    msg.inlineReply("Shutting down in 5 seconds");
    setTimeout(function () {
      client.destroy();
      msg.delete();
    }, 5000);
  }
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "slowmode") {
    let slowtime = args[0];
    let slowreason = args[1];
    
    if (!msg.member.guild.me.hasPermission("MANAGE_CHANNELS")) return msg.inlineReply("I don't have the required permissions!")
    if (!msg.member.hasPermission("MANAGE_CHANNELS")) return msg.inlineReply("You don't have the required permissions!")
    if (!slowtime) {
      slowtime = 30;
    }
    if (slowtime < 0) return msg.inlineReply("I can't go back in time. (Please use a positive number)")
    if (isNaN(slowtime)) return msg.inlineReply("Alphabetical times don't exist, sorry! (c!slowmode <time> <reason>)")
    let slowreply = `Set a ${slowtime} second slowmode for: ${slowreason}`;
    if (!slowreason) {
      slowreply = `Set a ${slowtime} second slowmode. No reason was given`;
    }

    if (args[0] > 21600)
      return msg.inlineReply("Sorry, please try a lower number (Max 21600)");
    if (args[0] === "0" || args[0] === "off") {
      slowreply = `Turned slowmode off`;
      msg.channel.setRateLimitPerUser(0, args[1]);
      slowtime = 0;
    }
    if (isNaN(slowtime)) return msg.inlineReply("Alphabetical times don't exist, sorry! (c!slowmode <time> <reason>)")
    msg.channel.setRateLimitPerUser(slowtime, args[1]);
    msg.inlineReply(`${slowreply}`);
  }

  if (command === "kick") {
    const user = msg.mentions.users.first();
    let kickreason = args[1];
    if (!msg.member.hasPermission("KICK_MEMBERS"))
      return msg.inlineReply("You do not have permission to use kick");
    if (!msg.member.guild.me.hasPermission("KICK_MEMBERS"))
      return msg.inlineReply(
        "I don't have the required permissions. Please fix this in settings"
      );
    if (!user) return msg.inlineReply("Please mention a valid user");
    if (user === client.user)
      return msg.inlineReply("Why would you kick me :(");
    if (user.kickable) return msg.inlineReply("I cannot kick this user");
    let kickreply = `Kicked ${user.tag} for ${kickreason}`;
    if (!kickreason) {
      kickreply = `Kicked ${user.tag}. No reason was given`;
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle(`You have been kicked.`)
      .setDescription("You may rejoin if someone reinvites you")
      .addFields({ name: "Reason:", value: kickreason })
      .setFooter(`Takanashi`)
      .setTimestamp();
    const member = msg.guild.members.resolve(user);
if(member.roles.highest.position > msg.guild.members.resolve(client.user).roles.highest.position) return msg.inlineReply("My role is too low :c");
    user.send(embed);
    msg.inlineReply(kickreply);
    member.kick();
  }

  if (command === "ban") {
    const user = msg.mentions.users.first();
    let banreason = args[2];
    let banlong = args[1];
    if (!msg.member.hasPermission("BAN_MEMBERS"))
      return msg.inlineReply("You do not have permission to ban members");
    if (!msg.member.guild.me.hasPermission("BAN_MEMBERS"))
      return msg.inlineReply(
        "I don't have the required permission to ban users. Please fix this in settings"
      );
    if (!user) return msg.inlineReply("Please mention a valid user");
    if (user === client.user) return msg.inlineReply("Why would you ban me :(");
    if (user.bannable) return msg.inlineReply("I cannot ban this user");
    if (!msg.member.guild.me.hasPermission("SEND_MESSAGES"))
      return msg.author.send("I cannot send messages in that channel");
    if (isNaN(banlong) && banlong) return msg.inlineReply("Second argument must be a time. (c!ban <time (default 7 days)> <reason (optional)>)")
    if (!banlong) {
      banlong = 7;
    }
    let banreply = `Banned user ${user.tag} for ${banreason}. This ban is ${banlong} days long.`;
    if (!banreason) {
      banreply = `Banned user ${user.tag} for ${banlong} days. No reason was given`;
    }
    if (banlong < 0) return msg.inlineReply("I can't ban for negative days. (Please use a positive number)")
    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been banned.")
      .setDescription("You cannot rejoin unless a moderator unbans you")
      .addFields({ name: "Reason", value: banreason })
      .setFooter("Takanashi")
      .setTimestamp();
    const member = msg.guild.members.resolve(user);
    if(member.roles.highest.position > msg.guild.members.resolve(client.user).roles.highest.position) return msg.inlineReply("My role is too low :c");
    
    user.send(embed);
    msg.inlineReply(banreply);
    member.ban({ days: banlong, reason: banreason });
  }

  if (command === "mute") {
    const user = msg.mentions.users.first();
    let mutedrole = msg.guild.roles.cache.find((role) => role.name === "Muted");
    let mutereason = args[1];
    if (!msg.member.hasPermission("MANAGE_ROLES"))
      return msg.inlineReply("You do not have permission to mute this user");
    if (!msg.member.guild.me.hasPermission("MANAGE_ROLES"))
      return msg.inlineReply(
        "I cannot mute this user. Please fix this in settings"
      );
    if (!user) return msg.inlineReply("Please mention a valid user");
    if (user === client.user)
      return msg.inlineReply("Why would you mute me :(");
    let mutereply = `Muted user ${user.tag} for ${mutereason}. This mute is 30 minutes long.`;
    if (!mutereason) {
      mutereply = `Muted user ${user.tag}. No reason was given`;
    }
    if (!mutedrole) return msg.inlineReply("No muted role found.");

    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been muted")
      .setDescription(`You will be unmuted in 30 minutes`)
      .addFields({ name: "Reason", value: mutereason })
      .setFooter("Takanashi")
      .setTimestamp();
    const member = msg.guild.members.resolve(user);
    if(member.roles.highest.position > msg.guild.members.resolve(client.user).roles.highest.position) return msg.inlineReply("My role is too low :c");
    if (member.roles.cache.has(mutedrole))
      return msg.inlineReply("This user is already muted");
    user.send(embed);
    msg.inlineReply(mutereply);
    member.roles.add(mutedrole);

    setTimeout(() => {
      member.roles.remove(mutedrole);
    }, 1800000);
  }

  if (command === "unmute") {
    const user = msg.mentions.users.first();
    let mutedrole = msg.guild.roles.cache.find((role) => role.name === "Muted");
    if (!msg.member.hasPermission("MANAGE_ROLES"))
      return msg.inlineReply("You do not have permission to mute this user");
    if (!msg.member.guild.me.hasPermission("MANAGE_ROLES"))
      return msg.inlineReply(
        "I cannot unmute this user. Please fix this in settings"
      );
    if (!user) return msg.inlineReply("Please mention a valid user");
    const member = msg.guild.members.resolve(user);
if(member.roles.highest.position > msg.guild.members.resolve(client.user).roles.highest.position) return msg.inlineReply("My role is too low :c");
    if (member.roles.cache.has(mutedrole))
      return msg.inlineReply("This user is not muted");
    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been unmuted")
      .setDescription(`A moderator has unmuted you!`)
      .setFooter("Takanashi")
      .setTimestamp();

    user.send(embed);
    member.roles.remove(mutedrole);
    msg.inlineReply(`Unmuted ${user.tag}`);
  }

  /* if (command === "role") {
    const user = msg.mentions.users.first();
    const rolese = args[1]
    let role = msg.guild.roles.cache.find(role => role.name === rolese)
    if (!msg.member.hasPermission("MANAGE_ROLES")) return msg.inlineReply("You do not have permision to add roles")
    if (!user) return msg.inlineReply("Please mention a valid user")
    if (!msg.member.guild.me.hasPermission("MANAGE_ROLES")) return msg.inlineReply("I don't have permission to manage roles :(")
    if (!role) return msg.inlineReply("No role found")
    const member = msg.guild.members.resolve(user);

    member.roles.add(role)
  } */

  if (command === "help") {
    const embed = new Discord.MessageEmbed()
      .setColor("#FFB6C1")
      .setTitle("Takanashi")
      .setDescription("Multipurpose Moderation & Censorship Bot")
      .setThumbnail(
        "https://media.tenor.com/images/451cd65d6a3f7a34c7378e54f81f32c1/tenor.gif"
      )
      .addFields(
        {
          name: "Commands",
          value:
            "These commands are still in development, and some may not work. Prefix: c!",
        },
        {
          name: "Slowmode",
          value: "Sets a slowmode. c!slowmode <time (in seconds)> <reason>",
          inline: true,
        },
        {
          name: "Ban",
          value:
            "Disallows a user from joining the server until the ban is revoked. c!ban <@user> <time (Default 7 days)> <reason>",
          inline: true,
        },
        {
          name: "Kick",
          value:
            "Kicks a user, they may rejoin with an invite. c!kick <@user> <reason>",
          inline: true,
        },
        {
          name: "Mute",
          value: "Disallows a user from speaking until unmuted. c!mute <@user>",
          inline: true,
        },
        {
          name: "Unmute",
          value:
            "Allows a user to speak if they were previously muted. c!unmute <@user>",
          inline: true,
        },
        { name: "Role", value: "COMING SOON" }
      )
      .setFooter("Created by zenyxis#0001")
      .setTimestamp();
    msg.channel.send(embed);
  }
  antiSpam.message(msg)
});


client.login(process.env.DISCORD_TOKEN);

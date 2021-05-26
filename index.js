const { Client } = require("discord.js");
const Discord = require("discord.js");
const client = new Client({
  allowedMentions: {
    // set repliedUser value to `false` to turn off the mention by default
    repliedUser: true,
  },
});

const ytdl = require('ytdl-core')
const { YTSearcher } = require('ytsearcher')

const searcher = new YTSearcher({
    key: "AIzaSyBANPjMvndZGgLYJWg0gvtl9QTUZlBYlj8",
    revealed: true
})

const queue = new Map()

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
	muteRoleName: "Muted", // Name of the  role that will be given to muted users!
	removeMessages: true // If the bot should remove all the spam messages when taking action on a user!
	// And many more options... See the documentation.
});
const curseWords = require('./cursewords.js')

const prefix = "s!";
const guildId = "799819756914868264";
let amountof = "0";
require("./ExtendedMessage");
const WOKCommands = require("wokcommands");
const { default: messageHandler } = require("wokcommands/dist/message-handler");
module.exports = { amountof: `${amountof}` };

client.on("ready", () => {
	client.user.setActivity('the chat!', { type: 'WATCHING' });
});

client.on("ready", () => {
  new WOKCommands(client, {
    commandsDir: "commands",
    testServers: [guildId],
  });
});

client.on("message", (message) => {
  for (var i = 0; i < curseWords.length; i++) {
    if (message.content.toLowerCase().includes(curseWords[i]) && !message.author.bot) {
      amountof++;
      let censored = message.content;
      let user = message.author;
	if (!message.member.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send("I don't have the required permissions to censor this.")
      const embed = new Discord.MessageEmbed()
        .setColor("#DE3163")
        .setTitle("Your message has been moderated")
        .setDescription("Do not send this again")
        .addFields({ name: "Message Moderated:", value: censored })
        .setTimestamp();

      const otherembed = new Discord.MessageEmbed()
        .setColor("#DE3163")
        .setTitle("Message Moderated")
        .setDescription(`${user.username}, do not send this again.`);

      let myRole = message.guild.roles.cache.find((role) => role.name === "Muted");
      message.author.send(embed);
      message.channel.send(otherembed);
      message.delete();
      console.log(`${user.tag} was moderated for ${censored}`);
    }
  }

  if (message.content === prefix + "count") {
    message.inlineReply("I have moderated " + amountof + " words!");
  }

  if (
    message.content === prefix + "shutdown" &&
    message.author.id === "734286347858083863"
  ) {
    message.inlineReply("Shutting down in 5 seconds");
    setTimeout(function () {
      client.destroy();
      message.delete();
    }, 5000);
  }
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "slowmode") {
    let slowtime = args[0];
    let slowreason = args[1];
    
    if (!message.member.guild.me.hasPermission("MANAGE_CHANNELS")) return message.inlineReply("I don't have the required permissions!")
    if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.inlineReply("You don't have the required permissions!")
    if (!slowtime) {
      slowtime = 30;
    }
    if (slowtime < 0) return message.inlineReply("I can't go back in time. (Please use a positive number)")
    if (isNaN(slowtime)) return message.inlineReply("Alphabetical times don't exist, sorry! (c!slowmode <time> <reason>)")
    let slowreply = `Set a ${slowtime} second slowmode for: ${slowreason}`;
    if (!slowreason) {
      slowreply = `Set a ${slowtime} second slowmode. No reason was given`;
    }

    if (args[0] > 21600)
      return message.inlineReply("Sorry, please try a lower number (Max 21600)");
    if (args[0] === "0" || args[0] === "off") {
      slowreply = `Turned slowmode off`;
      message.channel.setRateLimitPerUser(0, args[1]);
      slowtime = 0;
    }
    if (isNaN(slowtime)) return message.inlineReply("Alphabetical times don't exist, sorry! (c!slowmode <time> <reason>)")
    message.channel.setRateLimitPerUser(slowtime, args[1]);
    message.inlineReply(`${slowreply}`);
  }

  if (command === "kick") {
    const user = message.mentions.users.first();
    let kickreason = args[1];
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.inlineReply("You do not have permission to use kick");
    if (!message.member.guild.me.hasPermission("KICK_MEMBERS"))
      return message.inlineReply(
        "I don't have the required permissions. Please fix this in settings"
      );
    if (!user) return message.inlineReply("Please mention a valid user");
    if (user === client.user)
      return message.inlineReply("Why would you kick me :(");
    if (user.kickable) return message.inlineReply("I cannot kick this user");
    let kickreply = `Kicked ${user.tag} for ${kickreason}`;
    if (!kickreason) {
      kickreply = `Kicked ${user.tag}. No reason was given`;
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#DE3163")
      .setTitle(`You have been kicked.`)
      .setDescription("You may rejoin if someone reinvites you")
      .addFields({ name: "Reason:", value: kickreason })
      .setFooter(`Takanashi`)
      .setTimestamp();
    const member = message.guild.members.resolve(user);
if(member.roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position) return message.inlineReply("My role is too low :c");
    user.send(embed);
    message.inlineReply(kickreply);
    member.kick();
  }

  if (command === "ban") {
    const user = message.mentions.users.first();
    let banreason = args[2];
    let banlong = args[1];
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return message.inlineReply("You do not have permission to ban members");
    if (!message.member.guild.me.hasPermission("BAN_MEMBERS"))
      return message.inlineReply(
        "I don't have the required permission to ban users. Please fix this in settings"
      );
    if (!user) return message.inlineReply("Please mention a valid user");
    if (user === client.user) return message.inlineReply("Why would you ban me :(");
    if (user.bannable) return message.inlineReply("I cannot ban this user");
    if (!message.member.guild.me.hasPermission("SEND_MESSAGES"))
      return message.author.send("I cannot send messages in that channel");
    if (isNaN(banlong) && banlong) return message.inlineReply("Second argument must be a time. (c!ban <time (default 7 days)> <reason (optional)>)")
    if (!banlong) {
      banlong = 7;
    }
    let banreply = `Banned user ${user.tag} for ${banreason}. This ban is ${banlong} days long.`;
    if (!banreason) {
      banreply = `Banned user ${user.tag} for ${banlong} days. No reason was given`;
    }
    if (banlong < 0) return message.inlineReply("I can't ban for negative days. (Please use a positive number)")
    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been banned.")
      .setDescription("You cannot rejoin unless a moderator unbans you")
      .addFields({ name: "Reason", value: banreason })
      .setFooter("Takanashi")
      .setTimestamp();
    const member = message.guild.members.resolve(user);
    if(member.roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position) return message.inlineReply("My role is too low :c");
    
    user.send(embed);
    message.inlineReply(banreply);
    member.ban({ days: banlong, reason: banreason });
  }

  if (command === "mute") {
    const user = message.mentions.users.first();
    let mutedrole = message.guild.roles.cache.find((role) => role.name === "Muted");
    let mutereason = args[1];
    if (!message.member.hasPermission("MANAGE_ROLES"))
      return message.inlineReply("You do not have permission to mute this user");
    if (!message.member.guild.me.hasPermission("MANAGE_ROLES"))
      return message.inlineReply(
        "I cannot mute this user. Please fix this in settings"
      );
    if (!user) return message.inlineReply("Please mention a valid user");
    if (user === client.user)
      return message.inlineReply("Why would you mute me :(");
    let mutereply = `Muted user ${user.tag} for ${mutereason}. This mute is 30 minutes long.`;
    if (!mutereason) {
      mutereply = `Muted user ${user.tag}. No reason was given`;
    }
    if (!mutedrole) return message.inlineReply("No muted role found.");

    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been muted")
      .setDescription(`You will be unmuted in 30 minutes`)
      .addFields({ name: "Reason", value: mutereason })
      .setFooter("Satone")
      .setTimestamp();
    const member = message.guild.members.resolve(user);
    if(member.roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position) return message.inlineReply("My role is too low :c");
    if (member.roles.cache.has(mutedrole))
      return message.inlineReply("This user is already muted");
    user.send(embed);
    message.inlineReply(mutereply);
    member.roles.add(mutedrole);

    setTimeout(() => {
      member.roles.remove(mutedrole);
    }, 1800000);
  }

  if (command === "unmute") {
    const user = message.mentions.users.first();
    let mutedrole = message.guild.roles.cache.find((role) => role.name === "Muted");
    if (!message.member.hasPermission("MANAGE_ROLES"))
      return message.inlineReply("You do not have permission to mute this user");
    if (!message.member.guild.me.hasPermission("MANAGE_ROLES"))
      return message.inlineReply(
        "I cannot unmute this user. Please fix this in settings"
      );
    if (!user) return message.inlineReply("Please mention a valid user");
    const member = message.guild.members.resolve(user);
if(member.roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position) return message.inlineReply("My role is too low :c");
    if (member.roles.cache.has(mutedrole))
      return message.inlineReply("This user is not muted");
    const embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setTitle("You have been unmuted")
      .setDescription(`A moderator has unmuted you!`)
      .setFooter("Satone")
      .setTimestamp();

    user.send(embed);
    member.roles.remove(mutedrole);
    message.inlineReply(`Unmuted ${user.tag}`);
  }

  /* if (command === "role") {
    const user = message.mentions.users.first();
    const rolese = args[1]
    let role = message.guild.roles.cache.find(role => role.name === rolese)
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.inlineReply("You do not have permision to add roles")
    if (!user) return message.inlineReply("Please mention a valid user")
    if (!message.member.guild.me.hasPermission("MANAGE_ROLES")) return message.inlineReply("I don't have permission to manage roles :(")
    if (!role) return message.inlineReply("No role found")
    const member = message.guild.members.resolve(user);

    member.roles.add(role)
  } */

  if (command === "help") {
    const embed = new Discord.MessageEmbed()
      .setColor("#DE3163")
      .setTitle("Satone")
      .setDescription("Multipurpose Moderation & Censorship Bot")
      .setThumbnail(
        "https://kodushi.com/satone.gif"
      )
      .addFields(
        {
          name: "Commands",
          value:
            "These commands are still in development, and some may not work. Prefix: s!",
        },
        {
          name: "Slowmode",
          value: "Sets a slowmode. s!slowmode <time (in seconds)> <reason>",
          inline: true,
        },
        {
          name: "Ban",
          value:
            "Disallows a user from joining the server until the ban is revoked. s!ban <@user> <time (Default 7 days)> <reason>",
          inline: true,
        },
        {
          name: "Kick",
          value:
            "Kicks a user, they may rejoin with an invite. s!kick <@user> <reason>",
          inline: true,
        },
        {
          name: "Mute",
          value: "Disallows a user from speaking until unmuted. s!mute <@user>",
          inline: true,
        },
        {
          name: "Unmute",
          value:
            "Allows a user to speak if they were previously muted. s!unmute <@user>",
          inline: true,
        },
        { name: "Play", value: "Plays a song, or adds to the queue! s!play <Song name>" },
	      { name: "Stop", value: "Stops the current song! s!skip", },
	      { name: "Skip", value: "Skips the song! s!stop", }
      )
    	
      .setFooter("Created by zenyxis#0001")
      .setTimestamp();
    message.channel.send(embed);
  }




  antiSpam.message(message)
 
  const serverQueue = queue.get(message.guild.id);



  if(command === "play" || command === "p") {
          execute(message, serverQueue);
  }
      if(command === "stop" || command === "end" || command === "die") {
          stop(message, serverQueue);
      }
 
  if(command === "skip" || command === "s" || command === "next") {
          skip(message, serverQueue);
  }

  async function execute(message, serverQueue){
      let vc = message.member.voice.channel;
      if(!vc){
          return message.channel.send("Please join a voice chat first");
      }else{
          let result = await searcher.search(args.join(" "), { type: "video" })
          const songInfo = await ytdl.getInfo(result.first.url)

          let song = {
              title: songInfo.videoDetails.title,
              url: songInfo.videoDetails.video_url
          };

          if(!serverQueue){
              const queueConstructor = {
                  txtChannel: message.channel,
                  vChannel: vc,
                  connection: null,
                  songs: [],
                  volume: 10,
                  playing: true
              };
              queue.set(message.guild.id, queueConstructor);

              queueConstructor.songs.push(song);

              try{
                  let connection = await vc.join();
                  queueConstructor.connection = connection;
                  play(message.guild, queueConstructor.songs[0]);
              }catch (err){
                  console.error(err);
                  queue.delete(message.guild.id);
                  return message.channel.send(`Unable to join the voice chat ${err}`)
              }
          }else{
              serverQueue.songs.push(song);
              const addEmbed = new Discord.MessageEmbed().setColor('#DE3163').setTitle("Song Added").setDescription(`${song.title} | ${song.url}`)
              return message.channel.send(addEmbed);
          }
      }
  }
  function play(guild, song){
      const serverQueue = queue.get(guild.id);
      if(!song){
          serverQueue.vChannel.leave();
          queue.delete(guild.id);
          return;
      }
      const dispatcher = serverQueue.connection
          .play(ytdl(song.url))
          .on('finish', () =>{
              serverQueue.songs.shift();
              play(guild, serverQueue.songs[0]);
          })
          const playEmbed = new Discord.MessageEmbed().setColor('#DE3163').setTitle("Now Playing").setDescription(`${serverQueue.songs[0].title} | ${serverQueue.songs[0].url}`)
          serverQueue.txtChannel.send(playEmbed)
  }
  function stop (message, serverQueue){
      if(!message.member.voice.channel)
          return message.channel.send("You need to join the voice chat first!")
      if(!serverQueue) return message.inlineReply("I cannot stop nothingness")
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
      message.inlineReply(":thumbsup:")
  }
  function skip (message, serverQueue){
      if(!message.member.voice.channel)
          return message.channel.send("You need to join a voice channel");
      if(!serverQueue)
          return message.channel.send("There is nothing to skip!");
      serverQueue.connection.dispatcher.end();
  }
  function listQueue(serverQueue){
  	if(!message.member.voice.channel)
		return message.inlineReply("You need to join a voice channel")
	const noneEmbed = new Discord.MessageEmbed().setColor("#DE3163").setTitle("The queue is empty ;-;");
	const queueEmbed = new Discord.MessageEmbed().setColor("#DE3163").setTitle("Queue").setDescription(`${serverQueue.songs}`).addFields({ name: "Now Playing:", 	value: `${serverQueue.songs[0].title | ${serverQueue.songs[0].url}`}).setFooter("Satone").setTimestamp()
  	if(!serverQueue) return message.inlineReply("There is no queue")
	
	message.inlineReply(queueEmbed)
  	
  }


});

client.on("guildCreate", (guild) => {
const guildEmbed = new Discord.MessageEmbed().setColor("#DE3163").setTitle("Bot joined new guild").setDescription(`I joined a new guild!`).addFields(
        {
          name: "Guild Name",
          value:
            `${guild.name}`,
        },
        {
          name: "Guild ID",
          value: `${guild.id}`,
        }
)
let mainGuild = client.guilds.cache.get('799819756914868264'), // returns a Guild or undefined
  channel; 

if (mainGuild) {
  channel = mainGuild.channels.cache.get('799819757394067468');
  if (channel) {
  	channel.send(guildEmbed)
  }
}
});


client.login(process.env.DISCORD_TOKEN);

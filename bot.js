// Packages
const Discord = require('discord.js');
const dotenv = require('dotenv');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const archiver = require('archiver');

// Prefix and Bot ID
const prefix = '!';
const BOT_ID = 649278224106389547n;

// 
const archive = archiver('zip');

// Chalk Config
const log = console.log;
const s = chalk.green;
const w = chalk.yellow;
const e = chalk.red;

// Init
dotenv.config();
const client = new Discord.Client();

// Client
client.once('ready', () => log(s('Bot running')));

client.login(process.env.TOKEN);

client.on('message', (msg) => {
  if (msg.author.bot) return;
  saveToLog(msg);
  checkBlacklist(msg);

  if (msg.content.startsWith(`${prefix}kick`)) {
    kickUser(msg);
  } else if (msg.content.startsWith(`${prefix}ban`)) {
    banUser(msg);
  } else if (msg.content.startsWith(`${prefix}getLog`)) {
    getLog(msg);
  }
});

// Commands
const kickUser = (msg) => {
  let userToKick = msg.mentions.members.first();
  try {
    if (
      userToKick === msg.member ||
      msg.mentions.members.first().id == BOT_ID
    ) {
      return msg.channel.send(
        `OMG u be so funny :joy::joy::joy::joy::joy::joy:`
      );
    }
    if (msg.member.hasPermission('KICK_MEMBERS')) {
      userToKick
        .kick()
        .then(
          msg.channel.send(
            `The user **${userToKick}** has been kicked by ${msg.author}.`
          )
        );
    } else {
      return msg.channel.send(
        `You do not have the permission to kick ${userToKick}.`
      );
    }
  } catch {
    if (userToKick === undefined)
      return msg.channel.send('This user does not exist.');
  }
};

const banUser = async (msg) => {
  let userToBan = msg.mentions.members.first();
  try {
    if (userToBan === msg.member || msg.mentions.members.first().id == BOT_ID) {
      return msg.channel.send(
        `OMG u be so funny :joy::joy::joy::joy::joy::joy::cross:`
      );
    } else if (msg.member.hasPermission('BAN_MEMBERS')) {
      userToBan
        .ban()
        .then(
          msg.channel.send(
            `The user **${userToBan}** has been banned by ${msg.author}.`
          )
        );
    } else {
      return msg.channel.send(
        `You do not have the permission to ban ${userToBan}.`
      );
    }
  } catch {
    if (userToBan === undefined) {
      return msg.channel.send(`This user does not exist.`);
    }
  }
};

const saveToLog = (msg) => {
  try {
    const path = `./logs/${msg.guild.id}.log`;
    fs.appendFile(path, `${msg.author.tag}: ${msg.content} \| ${moment().format('MMMM Do YYYY, h:mm:ss a')}\n`, 'utf8', () => { });
  } catch {
    log(e("could not save to log file."))
  }
}

const getLog = (msg) => {

  try {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
      createArchive(msg);
      return msg.author.send("Here is your log file :wave:", {
        files: [
          `./logs/${msg.guild.id}.zip`
        ]
      });
    } else {
      return msg.channel.send("You aint be a admin.");
    }
  } catch {
    return msg.channel.send("You aint have the permissionzZz.");
  }
}

const createArchive = (msg) => {
  let output = fs.createReadStream(`./logs/${msg.guild.id}.log`);
  let archive = archiver('zip', { zlib: 9});
  let file = `./logs/${msg.guild.id}.log`;
  
}


const checkBlacklist = (msg) => {
    
}
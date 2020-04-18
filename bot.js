// Packages
const Discord = require('discord.js');
const dotenv = require('dotenv');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');


// Prefix and Bot ID
const prefix = '!';
const BOT_ID = 649278224106389547n;

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
  log(msg.content.toLowerCase());
  if (msg.author.bot) return;
  saveToLog(msg);
  checkBlacklist(msg);

  if (msg.content.startsWith(`${prefix}`)) {
    if (msg.content.startsWith(`${prefix}kick`)) {
      kickUser(msg);
    } else if (msg.content.startsWith(`${prefix}ban`)) {
      banUser(msg);
    } else if (msg.content.startsWith(`${prefix}getLog`)) {
      getLog(msg);
    } else if (msg.content.startsWith(`${prefix}clearLog`)) {
      clearLog(msg);
    } else if (msg.content.startsWith(`${prefix}delete`)) {
      delete(msg);
    } else {
      msg.reply('invalid command')
        .then(msg => msg.delete({ timeout: 10000 }))
        .catch(log(e('could not delete msg')));
    }
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
    if (msg.member.hasPermission('KICK_MEMBERS') && !userToKick.hasPermission('ADMINISTRATOR')) {
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
    } else if (msg.member.hasPermission('BAN_MEMBERS') && !userToBan.hasPermission(['BAN_MEMBERS', 'ADMINISTRATOR'])) {
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
      return msg.author.send("Here is your log file :ocean:", {
        files: [
          `./logs/${msg.guild.id}.log`
        ]
      });
    } else {
      return msg.channel.send("You aint be a admin.");
    }
  } catch {
    return msg.channel.send("You aint have the permissionzZz.");
  }
}

const convertJSONtoArray = (path) => {
  let json = require(path);
  let result = [];
  let keys = Object.keys(json);

  keys.forEach((key) => {
    result.push(json[key]);
  })

  return result;
}

const checkBlacklist = (msg) => {
  const blacklist = convertJSONtoArray('./blacklist.json');
  for (let i = 0; i < blacklist.length; i++) {
    let contentLower = msg.content.toLowerCase();
    if (contentLower.includes(blacklist[i])) {
      return msg.channel.send('moin', { files: ['important/goethe.mp3'] });
    }
  }
}

const clearLog = (msg) => {
  const fileToClear = `./logs/${msg.guild.id}.log`;
  if (msg.member.hasPermission('ADMINISTRATOR')) {
    fs.truncate(fileToClear, 0, () => log(s(`file ${msg.guild.id} cleared`)));
    msg.channel.send('Server log cleard! :cross:');
  } else {
    return msg.channel.send('You do not have the permission to clear the log file! :sad:')
  }
}

const delete = async (msg, range) => {
    msg.delete();
    do {
    const fetched = await msg.channel.fetchMessages({limit: range});
    msg.channel.bulkDelete(fetched);
} while(fetched.size >= 2) }
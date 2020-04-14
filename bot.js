// Packages
const Discord = require('discord.js');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Prefix
const prefix = '!';

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
const BOT_ID = 649278224106389547;

client.on('message', (msg) => {
  if (msg.content.startsWith(`${prefix}kick`)) {
    kickUser(msg);
  }
});

client.login(process.env.TOKEN);

const kickUser = (msg) => {
  let userToKick = msg.mentions.members.first();
  try {
    if (userToKick === msg.member || msg.mentions.members.first().id == BOT_ID) {
      return msg.channel.send(
        `OMG u be so funny :joy::joy::joy::joy::joy::joy:`
      )};
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

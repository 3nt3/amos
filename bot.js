// Packages
const Discord = require('discord.js');
const dotenv = require('dotenv');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const ytdl = require('ytdl-core');
const validUrl = require('valid-url');
const ytMp3Down = require('youtube-mp3-downloader');


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
  if (msg.author.bot) return;
  saveToLog(msg);
  checkBlacklist(msg);

  let args = msg.content.substring(1).split(' ');
  log(args);
  switch (args[0]) {
    // BAN & KICK
    case 'kick':
      kickUser(msg);
      break;
    case 'ban':
      banUser(msg);
      break;
    // LOG
    case 'getLog':
      getLog(msg);
      break;
    case 'clearLog':
      clearLog(msg);
      break;
    // DELETE MESSAGES
    case 'delete':
      deleteMessages(msg, range = msg.content.slice(8, msg.content.length));
      break;
    // HELP & CODE
    case 'help':
      help(msg);
      break;
    case 'code':
      code(msg);
      break;
    // MUSIC
    case 'play':
      play(msg);
      break;
    case 'skip':
      skip(msg);
      break;
    case 'stop':
      stop(msg);
      break;
    default:
      msg.reply('Invalid command')
        .then(msg => msg.delete({ timeout: 3000 }))
        .catch(log(e('could not delete msg')));
      break;
  }
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find(channel => channel.name === "neuankömmlinge");
  if (!channel) {
    return;
  }

  channel.send(`Welcome, ${member} :smile:.`);
})

// Commands
// BAN AND KICK
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


// LOG SYSTEM
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

const clearLog = (msg) => {
  const fileToClear = `./logs/${msg.guild.id}.log`;
  if (msg.member.hasPermission('ADMINISTRATOR')) {
    fs.truncate(fileToClear, 0, () => log(s(`file ${msg.guild.id} cleared`)));
    msg.channel.send('Server log cleard! :cross:');
  } else {
    return msg.channel.send('You do not have the permission to clear the log file! :sad:')
  }
}


// DELETE MESSAGES
const deleteMessages = async (msg) => {
  const amount = msg.content.split(' ').slice(1).join(' ');
  if (!amount) return msg.reply('Invalid range.');
  if (isNaN(amount)) return msg.reply('You must provide a number.');
  if (amount > 100) return msg.reply('Amount too high (max: 100).');
  if (amount < 1) return msg.reply('Amount too small (min: 1).');

  await msg.channel.messages.fetch({ limit: amount }).then(messages => {
    msg.channel.bulkDelete(messages
    ).then(msg.channel.send('Finished deleting'));
  });
}

// BLACKLIST
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

// HELP & CODE
const help = (msg) => {
  fs.readFile('help.txt', 'utf8', (err, data) => {
    if (err) throw err;
    msg.channel.send(data);
  })
}

const code = (msg) => {
  return msg.channel.send('Here is the code: https://github.com/Sheesher/amos. Have fun w/ it.');
}

// MUSIC
let servers = {};

const play = (msg) => {
  const args = msg.content.substring(1).split(" ");
  const link = args[1];

  if (!link) {
    return msg.channel.send('You must provide a link.');
  };

  if (!msg.member.voice.channel) {
    return msg.channel.send('You have to be in a voice chat.');
  }

  if (!validUrl.isUri(link)) {
    return msg.channel.send('That aint be link.');
  }

  if (!servers[msg.guild.id]) servers[msg.guild.id] = {
    queque: []
  }

  // downloadMp3(link);

  let server = servers[msg.guild.id];
  server.queque.push(link);

  if (!msg.guild.voiceConnection) msg.member.voice.channel.join().then((connection) => {
    playSong(connection, msg);
  })
}

const skipSong = (msg) => {
  const server = servers[msg.guild.id];
  if (server.dispatcher) server.dispatcher.end();
  msg.channel.send('Song skipped!');
}

const stopSong = (msg) => {
  const server = servers[msg.guild.id];
  if (msg.guild.voiceConnection) {
    for (let i = server.queque.length - 1; i >= 0; i--) {
      server.queque.splice(i, 1);
    }

    server.dispatcher.end();
    msg.channel.send('Queque ended.');
    log("stopped queque");
  }
}

const playSong = (connection, msg) => {
  const server = servers[msg.guild.id];
  server.dispatcher = connection.play(ytdl(server.queque[0], { filter: "audioonly" }))
  server.queque.shift();
  server.dispatcher.on("end", () => {
    if (server.queque[0]) {
      playSong(connection, msg);
    } else {
      connection.disconnect();
    }
  })
}

const downloadMp3 = (url) => {
  let YD = new ytMp3Down({
    "ffmpegPath": "C:\\ffmpeg\\bin",
    "outputPath": `./music/`,
    "youtubeVideoQuality": "highest",
    "queueParallelism": "2",
    "progressTimeout": "100"
  })

  YD.download(url);

  YD.on("finished", (err, data) => {
    log(JSON.stringify(data));
  })

  YD.on("error", (error) => log(e(error)));

  YD.on("progress", (progress) => log(JSON.stringify(progress)));

}

const genString = (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() ** charactersLength));
  }
  return result;
}
const config = require('./config.json'); // Import config file

const Discord = require('discord.js'); // Discord Client

var logger = require('./lib/logger.js'); // Logger code
var commands = require('./lib/commands.js'); // Commands
const prefix = config.prefix; // Get prefix from config

const client = new Discord.Client(config.clientSettings); // Create Discord client

const inviteLink = `https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=359322956817498136&scope=bot&permissions=${Discord.Permissions.ALL}`; // Construct invite link

client.on('ready', function() { // On login
    logger("main", `Ready for action! (shard ${config.clientSettings.shardId + 1}/${config.clientSettings.shardCount})`);
    logger("main", `Invite: ${inviteLink}`);
});

client.on('message', function(message) {
    if (message.content.startsWith(prefix)) { // If the message starts with the doraibu prefix
        var command = commands.find(o => o.name == message.content.trim().split(' ')[0]); // Find the command that the user ran
        if (command && message.content.match(command.regex)) { // If the command exists and the required arguments exist
            command.method(message, command); // Run command method
        }
    }
});

client.login(config.token); // Log in with token specified in config

process.on('exit', function() { // On ^C or SIG*
    client.destroy(); // Signal Discord that the bot/shard is going to shut down
});
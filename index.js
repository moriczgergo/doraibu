const config = require('./config.json');

const Discord = require('discord.js');

var logger = require('./lib/logger.js');
var commands = require('./lib/commands.js');
const prefix = config.prefix;

const client = new Discord.Client(config.clientSettings);

const inviteLink = `https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=359322956817498136&scope=bot&permissions=${Discord.Permissions.ALL}`;

client.on('ready', function() {
    logger("main", `Ready for action! (shard ${config.clientSettings.shardId+1}/${config.clientSettings.shardCount})`);
    logger("main", `Invite: ${inviteLink}`);
});

client.on('message', function(message) {
    if (message.content.startsWith(prefix)){
        var command = commands.find(o => o.name == message.content.trim().split(' ')[0]);
        if (command && message.content.match(command.regex)) {
            command.method(message, command);
        }
    }
});

client.login(config.token);
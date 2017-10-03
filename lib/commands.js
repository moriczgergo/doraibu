const config = require('./../config.json'); // Config file
const prefix = config.prefix; // Command prefix
const footer = { // Embed footer data
	text: "by skiilaa | " + require('./../package.json').version
};

var logger = require('./logger.js'); // Logger code

var osu = require('osu')(config.osuKey); // osu! API library
var mal = require('popura')(config.malUsername, config.malPassword); // MAL API library
var he = require('he'); // HTML Entity decoder
var Raven = require('raven');
if (config.sentryDSN) { // If raven config isn't specified, don't report.
	Raven.config(config.sentryDSN).install();
}

/*	List of commands.
	name - Identifier within the bot's code
	helpText - Command name displayed in "d!help"
	regex - Regex to match command and get data from it
	description - Command description displayed in "d!help"
	method - Function to run
*/
module.exports = [
	{
		name: prefix + "ping",
		helpText: prefix + "ping",
		regex: new RegExp(prefix + "ping", "i"),
		description: "The match is on.",
		method: function (message) {
			message.reply("Pong!");
		}
	},
	{
		name: prefix + "mal",
		helpText: prefix + "mal <anime name>",
		regex: new RegExp(prefix + "mal (.+)", "i"),
		description: "Look up an anime.",
		method: function (message, commandData) {
			var animeName = message.content.match(commandData.regex)[1];
			logger("mal", `${animeName} requested.`);
			mal.searchAnimes(animeName).then(res => {
				var animes = res.map(function(x) { // Create Discord field object from anime search results
					if (x) {
						return {
							name: x.title,
							// Assemble text from search result and decode HTML entities
							value: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**").substr(0, 97) + "...",
							inline: true
						};
					}
				});
				animes = animes.reduce(function(acc, val) { // Delete NULLs from search results
					if (val) acc.push(val);
					return acc;
				}, []);
				var exactAnime = animes.find(o => o.english.trim().toLowerCase() == animeName.trim().toLowerCase() || o.title.trim().toLowerCase() == animeName.trim().toLowerCase())
				if (animes.length == 0) {
					message.reply("Couldn't find anything...");
				} else if (animes.length == 1 || exactAnime) { // If only found one anime or an exact anime, display it in detail
					var x = res[0];
					var selectedAnime = {
						title: x.title,
						description: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**"),
						color: 0x0000FF,
						url: "https://myanimelist.net/anime/" + x.id,
						image: {
							url: x.image
						},
						footer: footer
					};
					message.channel.send({
						embed: selectedAnime
					});
				} else {
					message.channel.send({
						embed: {
							fields: animes.slice(0, 5),
							footer: footer
						}
					});
				}
			}).catch(err => {
				message.reply("Sorry, but an error occurred.");
				logger("mal", err);
				if (config.sentryDSN) {
					Raven.captureException(err);
				}
			});
		}
	},
	{
		name: prefix + "mml",
		helpText: prefix + "mml <manga name>",
		regex: new RegExp(prefix + "mml (.+)", "i"),
		description: "Look up a manga.",
		method: function (message, commandData) {
			var mangaName = message.content.match(commandData.regex)[1];
			logger("mml", `${mangaName} requested.`);
			mal.searchMangas(mangaName).then(res => {
				var mangas = res.map(function(x) { // Create Discord field object from manga search results
					if (x) {
						return {
							name: x.title,
							value: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**").substr(0, 97) + "...",
							inline: true
						};
					}
				});
				mangas = mangas.reduce(function(acc, val) { // Delete NULLs from searcg results
					if (val) acc.push(val);
					return acc;
				}, []);
				var exactManga = mangas.find(o => o.english.trim().toLowerCase() == mangaName.trim().toLowerCase() || o.title.trim().toLowerCase() == mangaName.trim().toLowerCase())
				if (mangas.length == 0) {
					message.reply("Couldn't find anything...");
				} else if (mangas.length == 1 || exactManga) { // If only found one manga or found an exact manga, display it in detail
					var x = res[0];
					var selectedManga = {
						title: x.title,
						description: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**"),
						color: 0x0000FF,
						url: "https://myanimelist.net/manga/" + x.id,
						image: {
							url: x.image
						},
						footer: footer
					};
					message.channel.send({
						embed: selectedManga
					});
				} else {
					
					message.channel.send({
						embed: {
							fields: mangas.slice(0, 5),
							footer: footer
						}
					});
				}
			}).catch(err => {
				message.reply("Sorry, but an error occurred.");
				logger("mml", err);
				if (config.sentryDSN) {
					Raven.captureException(err);
				}
			});
		}
	},
	{
		name: prefix + "osu",
		helpText: prefix + "osu <username>",
		regex: new RegExp(prefix + "osu (.+)", "i"),
		description: "Look up a user on osu!.",
		method: function (message, commandData) {
			var osuUsername = message.content.match(commandData.regex)[1];
			logger("osu", `User ${osuUsername} requested.`);
			osu.get_user({ // Get osu! user data
				"u": osuUsername
			}).then(function(user) {
				if (user.length == 0) {
					message.reply("User not found.");
					return;
				}
				user = user[0];
				message.channel.send({
					embed: {
						title: user.username,
						description: "https://osu.ppy.sh/users/" + user.user_id,
						fields: [ // Construct field objects from user stats
							{
								name: "Level",
								value: user.level + "",
								inline: true
							},
							{
								name: "Accuracy",
								value: user.accuracy + "%",
								inline: true
							},
							{
								name: "PP",
								value: user.pp_raw + "",
								inline: true
							},
							{
								name: "SSes",
								value: user.count_rank_ss + "",
								inline: true
							},
							{
								name: "Ses",
								value: user.count_rank_s + "",
								inline: true
							},
							{
								name: "As",
								value: user.count_rank_a + "",
								inline: true
							},
							{
								name: "300s",
								value: user.count300 + "",
								inline: true
							},
							{
								name: "100s",
								value: user.count100 + "",
								inline: true
							},
							{
								name: "50s",
								value: user.count50 + "",
								inline: true
							}
						],
						footer: footer
					}
				});
			}).catch(function(err) {
				message.reply("Sorry, but an error occurred.");
				logger("osu", err);
				if (config.sentryDSN) {
					Raven.captureException(err);
				}
			});
		}
	},
	{
		name: prefix + "help",
		helpText: prefix + "help",
		regex: new RegExp(prefix + "help", "i"),
		description: "Hmmmm, I have no idea what this is... 🤔",
		method: function (message) {
			var commands = module.exports;
			var fields = commands.map(function(x) { // Construct field objects from commands
				return {
					name: x.name,
					value: x.description,
					inline: true
				};
			});
			message.channel.send({
				embed: {
					title: "Commands",
					description: "Here are all the commands you can use with *doraibu*.\nHave fun!",
					fields: fields,
					footer: footer
				}
			});
		}
	},
	{
		name: prefix + "stats",
		helpText: prefix + "stats",
		regex: new RegExp(prefix + "stats", "i"),
		description: "Get stats about the bot.",
		method: function (message, commandData, client) {
			message.channel.send({
				embed: {
					title: "Stats",
					fields: [
						{
							name: "Shards",
							value: config.clientSettings.shardCount,
							inline: true
						},
						{
							name: "Guilds",
							value: client.guilds.size,
							inline: true
						},
						{
							name: "Users",
							value: client.users.size,
							inline: true
						},
						{
							name: "Memory Usage",
							value: Math.ceil(process.memoryUsage().rss / 1000000) + "MB",
							inline: true
						},
						{
							name: "Library",
							value: "discord.js",
							inline: true
						}
					],
					footer: footer
				}
			});
		}
	}
];
const config = require('./../config.json');
const prefix = config.prefix;
const footer = {
	text: "by skiilaa | " + require('./../package.json').version
};

var logger = require('./logger.js');

var osu = require('osu')(config.osuKey);
var mal = require('popura')(config.malUsername, config.malPassword);
var he = require('he');

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
				var animes = res.map(function(x){
					if (x) {
						return {
							name: x.title,
							value: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**").substr(0,97) + "...",
							inline: true
						};
					}
				});
				animes = animes.reduce(function(acc, val){
					if (val) acc.push(val);
					return acc;
				}, []);
				if (animes.length == 0) {
					message.reply("Couldn't find anything...");
				} else if (animes.length == 1) {
					var x = res[0];
					var selectedAnime = {
						title: x.title,
						description: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**"),
						color: 0x0000FF,
						url: "https://myanimelist.net/anime/" + x.id,
						image: {
							url: x.image
						}
					};
					message.channel.send({
						embed: selectedAnime
					});
				} else {
					message.channel.send({
						embed: {
							fields: animes.slice(0, 5)
						}
					});
				}
			}).catch(err => {
				message.reply("Sorry, but an error occurred.");
				logger("mal", err);
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
				var mangas = res.map(function(x){
					if (x) {
						return {
							name: x.title,
							value: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**").substr(0,97) + "...",
							inline: true
						};
					}
				});
				mangas = mangas.reduce(function(acc, val){
					if (val) acc.push(val);
					return acc;
				}, []);
				if (mangas.length == 0) {
					message.reply("Couldn't find anything...");
				} else if (mangas.length == 1) {
					var x = res[0];
					if (!x) console.log("rip x");
					var selectedManga = {
						title: x.title,
						description: he.decode(x.english + "\n\n" + x.type + " | " + x.status + "\n\n" + x.synopsis).replace(new RegExp("\\[i\\]", "g"), "*").replace(new RegExp("\\[/i\\]", "g"), "*").replace(new RegExp("\\[b\\]", "g"), "**").replace(new RegExp("\\[/b\\]", "g"), "**"),
						color: 0x0000FF,
						url: "https://myanimelist.net/anime/" + x.id,
						image: {
							url: x.image
						}
					};
					message.channel.send({
						embed: selectedManga
					});
				} else {
					message.channel.send({
						embed: {
							fields: mangas.slice(0, 5)
						}
					});
				}
			}).catch(err => {
				message.reply("Sorry, but an error occurred.");
				logger("mml", err);
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
			osu.get_user({
				"u": osuUsername
			}).then(function(user){
				user = user[0];
				message.channel.send({
					embed: {
						title: user.username,
						description: "https://osu.ppy.sh/users/" + user.user_id,
						fields: [
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
			var fields = commands.map(function(x) {
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
	}
];
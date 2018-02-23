const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const snekfetch = require('snekfetch');
const { shuffle, list } = require('../../util/Util');
const types = ['multiple', 'boolean'];
const difficulties = ['easy', 'medium', 'hard'];
const choices = ['A', 'B', 'C', 'D'];

module.exports = class QuizCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'quiz',
			aliases: ['jeopardy'],
			group: 'games',
			memberName: 'quiz',
			description: 'Answer a quiz question.',
			details: stripIndents`
				**Types**: ${types.join(', ')}
				**Difficulties**: ${difficulties.join(', ')}
			`,
			args: [
				{
					key: 'type',
					prompt: `Which type of question would you like to have? Either ${list(types, 'or')}.`,
					type: 'string',
					validate: type => {
						if (types.includes(type.toLowerCase())) return true;
						return `Invalid type, please enter either ${list(types, 'or')}.`;
					},
					parse: type => type.toLowerCase()
				},
				{
					key: 'difficulty',
					prompt: `What should the difficulty of the game be? Either ${list(difficulties, 'or')}.`,
					type: 'string',
					default: '',
					validate: difficulty => {
						if (difficulties.includes(difficulty.toLowerCase())) return true;
						return `Invalid difficulty, please enter either ${list(difficulties, 'or')}.`;
					},
					parse: difficulty => difficulty.toLowerCase()
				}
			]
		});
	}

	async run(msg, { type, difficulty }) {
		try {
			const { body } = await snekfetch
				.get('https://opentdb.com/api.php')
				.query({
					amount: 1,
					type,
					encode: 'url3986',
					difficulty
				});
			if (!body.results) return msg.reply('Oh no, a question could not be fetched. Try again later!');
			const answers = body.results[0].incorrect_answers.map(answer => decodeURIComponent(answer.toLowerCase()));
			const correct = decodeURIComponent(body.results[0].correct_answer.toLowerCase());
			answers.push(correct);
			const shuffled = shuffle(answers);
			await msg.say(stripIndents`
				**You have 15 seconds to answer this question.**
				${decodeURIComponent(body.results[0].question)}
				${shuffled.map((answer, i) => `**${choices[i]}**. ${answer}`).join('\n')}
			`);
			const filter = res => res.author.id === msg.author.id && choices.includes(res.content.toUpperCase());
			const msgs = await msg.channel.awaitMessages(filter, {
				max: 1,
				time: 15000
			});
			if (!msgs.size) return msg.say(`Sorry, time is up! It was ${correct}.`);
			const win = shuffled[choices.indexOf(msgs.first().content.toUpperCase())] === correct;
			if (!win) return msg.say(`Nope, sorry, it's ${correct}.`);
			return msg.say('Nice job! 10/10! You deserve some cake!');
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};

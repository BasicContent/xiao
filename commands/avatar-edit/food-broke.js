const { Command } = require('discord.js-commando');
const { createCanvas, loadImage } = require('canvas');
const snekfetch = require('snekfetch');
const path = require('path');

module.exports = class FoodBrokeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'food-broke',
			aliases: ['food-machine-broke'],
			group: 'avatar-edit',
			memberName: 'food-broke',
			description: 'Draws a user\'s avatar over the "Food Broke" meme.',
			throttling: {
				usages: 1,
				duration: 15
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'user',
					prompt: 'Which user would you like to edit the avatar of?',
					type: 'user',
					default: ''
				}
			]
		});
	}

	async run(msg, { user }) {
		if (!user) user = msg.author;
		const avatarURL = user.displayAvatarURL({
			format: 'png',
			size: 128
		});
		try {
			const canvas = createCanvas(680, 680);
			const ctx = canvas.getContext('2d');
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'food-broke.png'));
			const { body } = await snekfetch.get(avatarURL);
			const avatar = await loadImage(body);
			ctx.drawImage(base, 0, 0);
			ctx.drawImage(avatar, 23, 9, 125, 125);
			ctx.drawImage(avatar, 117, 382, 75, 75);
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'food-broke.png' }] });
		} catch (err) {
			return msg.say(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
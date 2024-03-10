const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Create the Slash Command
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),

    // Execute the Slash Command    
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
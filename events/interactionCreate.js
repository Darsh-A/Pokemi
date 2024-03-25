const { Events } = require('discord.js');

// Define the wait function
function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await interaction.deferReply();
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};
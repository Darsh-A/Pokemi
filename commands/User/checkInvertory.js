const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Checks the User Inventory'),
    async execute(interaction) {
        await interaction.reply('Response to Command')
    }
}
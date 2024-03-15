const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('what does the command do')
        .addStringOption(option => option
            .setName('input')
            .setDescription('Text to Save')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.reply('Response to Command')
    }
}
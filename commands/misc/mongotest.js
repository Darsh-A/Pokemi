const { SlashCommandBuilder } = require('discord.js');
const testSchema = require('../../mongo/Schemas/exaple');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Testing a Schema')
    .addStringOption(option => option
        .setName('input')
        .setDescription('Text to Save')
        .setRequired(true)
    ),

    async execute (interaction) {

        const options = interaction.options;
        const string = options.getString('input');

        await testSchema.create({
            name: string
        })

        await interaction.reply('Data Saved')
    }
}
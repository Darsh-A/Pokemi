const { SlashCommandBuilder } = require('discord.js');
const { getEvolutions } = require('../../Utils/UtilityClasses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('what does the command do'),

    async execute(interaction) {

        getEvolutions('pikachu')

    }
}
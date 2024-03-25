const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {getPokemon} = require('pkmonjs')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Gives information about a pokemon')
        .addStringOption(option => option
            .setName('name')
            .setDescription('Name of the Pokemon')
            .setRequired(true)
        ),
    async execute(interaction) {

        const channel = interaction.channel;

        const options = interaction.options;
        const Pok_name = options.getString('name');

        
    }
}
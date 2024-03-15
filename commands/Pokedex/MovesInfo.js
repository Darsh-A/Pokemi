const { SlashCommandBuilder } = require('discord.js');
const { Dex } =  require('@pkmn/dex');
const {Generations} = require('@pkmn/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moveinfo')
        .setDescription('Know what a move does')
        .addStringOption(option => option
            .setName('name')
            .setDescription('Moves Name')
            .setRequired(true)
        ),

    async execute(interaction) {
        const gens = new Generations(Dex);
        console.log(await gens.get(8).learnsets.get('Ursaring'));
    }
}
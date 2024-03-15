const { SlashCommandBuilder } = require('discord.js');
const {Dex} = require('@pkmn/dex');
const {Generations} = require('@pkmn/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('what does the command do'),

    async execute(interaction) {
        
        const gens = new Generations(Dex);
        console.log(gens.get(8).species.get('Pikachu'));
        
    }
}
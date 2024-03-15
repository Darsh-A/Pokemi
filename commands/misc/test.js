const { SlashCommandBuilder } = require('discord.js');
const {Dex} = require('@pkmn/dex');
const {Generations} = require('@pkmn/data');
const {filterMovesByGen} = require('../../Utils/UtilityClasses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('what does the command do'),

    async execute(interaction) {
        
        const gen = new Generations(Dex);
        const output = await gen.get(8).learnsets.get('Ursaring');
        const learnset = output.learnset;

        const moves = filterMovesByGen(8,learnset);

        console.log(moves);
    }
}
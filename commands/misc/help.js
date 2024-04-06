const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Need Help?'),

    async execute(interaction) {

        let infoFields = [];

        infoFields.push(
            {name: `pickteam`,value: `Pick a Team of upto 6 Pokemons for Battle`},
            {name: `battle`,value: `Gives Pokemon-Showdown Import data for your selected Team`},
            {name: `pokemons`,value: `Gives list of all your pokemons\nCan also be used to Train Pokemons`},
            {name: `verifypokemons`,value: `Fecthes Missing parameters for your pokemons like ability and sprites`},
            {name: `info`,value: `Gives info about your profile`},
            {name: `pokedex`,value: `Well its a Pokedex duh`},
            {name: `moveinfo`,value: `Shows Info about a move`},
            {name: `help`,value: `What you just entered`},
        )


        const infoEmbed = new EmbedBuilder()
        .setTitle('All Commands')
        .setDescription('Here are all the commands yipee')
        .addFields(infoFields)
        .setColor('#8770fa')
        .setTimestamp();

        await interaction.reply({embeds: [infoEmbed]});

    }
}
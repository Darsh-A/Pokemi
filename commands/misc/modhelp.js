const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modhelp')
        .setDescription(':3'),

    async execute(interaction) {

        let modFields = [];

        modFields.push(
            {name: `register`, value: `Registers A User with a starter`},
            {name: `additem`, value: `Adds an item (mostly rarecandy) to a user`},
            {name: `addpokemon`, value: `Adds a pokemon (specific gen) to a user`},
            {name: `viewpokemons`, value: `Views a Users pokemons`},
            {name: `cresselia`, value: `Talk Through Cresselia`},
            {name: `removepokemon`, value: `Removes a pokemon from user. if multiple of same name, remove the latest one.`},
            {name: `givebadge`, value: `Guess karo kya karta hoga ye`},
        )

        const modEmbed = new EmbedBuilder()
        .setTitle('Moderator Commands')
        .setDescription('Here are all the Moderator Commands')
        .addFields(modFields)
        .setColor('#fa9284')
        .setTimestamp();

        await interaction.reply({embeds: [modEmbed]});


    }
}
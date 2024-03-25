const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pickteam')
        .setDescription('Pick a Team for Battle'),
    async execute(interaction) {

        const userid = interaction.user.id;

        const user = await UserSchema.findOne({ DiscordID: userid });

        if (!user) return interaction.editReply("User Not Found");

        const userPokemons = user.AllPokemons;
        const userTeam = user.Team;

        let menuOptions = [];
        for (let i = 0; i < userPokemons.length; i++) {
            menuOptions.push({
                label: `${userPokemons[i].species} - ${userPokemons[i].level}`,
                value: userPokemons[i].id
            });
        }

        let maxvalue = Math.min(menuOptions.length, 6);

        const menu = new StringSelectMenuBuilder()
            .setCustomId('team')
            .setPlaceholder('Select a Pokemon')
            .addOptions(menuOptions)
            .setMinValues(1)
            .setMaxValues(maxvalue);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await interaction.editReply({ content: 'Pick a Pokemon for your Team', components: [row] });

        const filter = i => i.customId === 'team' && i.user.id === userid;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {

            const pokemonIDs = i.values; // Array of selected Pokemon IDs

            let newTeam = [];
            for (const pokemonID of pokemonIDs) {
                const pokemonMap = new Map(userPokemons.map(pokemon => [pokemon.id, pokemon]));

              const pokemon = pokemonMap.get(pokemonID);
              if (!pokemon) return interaction.editReply("Pokemon Not Found");
          
              newTeam.push(pokemon);
          
              await UserSchema.updateOne({ DiscordID: userid }, { Team: newTeam });
            }
          
            interaction.editReply(`${pokemonIDs.length} Pokemon added to your team!`);
        });

    }
}
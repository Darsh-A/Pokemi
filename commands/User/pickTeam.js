const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pickteam')
    .setDescription('Pick a Team for Battle'),
  async execute(interaction) {
    const userid = interaction.user.id;

    const user = await UserSchema.findOne({ DiscordID: userid });

    if (!user) return interaction.reply("User Not Found");

    const userPokemons = user.AllPokemons;
    const userTeam = user.Team;

    let currentPage = 1;
    const pageSize = 25; // Number of Pokemon per page

    function getPokemonForPage(page) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, userPokemons.length);
      return userPokemons.slice(startIndex, endIndex);
    }

    function createMenu(pokemons) {
      return new StringSelectMenuBuilder()
        .setCustomId('team')
        .setPlaceholder('Select a Pokemon')
        .addOptions(pokemons.map(pokemon => ({
          label: `${pokemon.species} - ${pokemon.level}`,
          value: pokemon.id
        })))
        .setMinValues(1)
        .setMaxValues(Math.min(pokemons.length, Math.min(pageSize, 6 - userTeam.length)))
    }

    const menu = createMenu(getPokemonForPage(currentPage));

    const previousButton = new ButtonBuilder()
      .setCustomId('prev_page')
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 1); // Disable on first page

    const nextButton = new ButtonBuilder()
      .setCustomId('next_page')
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === Math.ceil(userPokemons.length / pageSize)); // Disable on last page

    const row1 = new ActionRowBuilder().addComponents(menu);
    const row2 = new ActionRowBuilder().addComponents(previousButton, nextButton);

    await interaction.reply({ content: 'Pick a Pokemon for your Team', components: [row1, row2] });

    const filter = (i) => i.user.id === userid;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'team') {
        const pokemonIDs = i.values; // Array of selected Pokemon IDs

        let newTeam = [];
        for (const pokemonID of pokemonIDs) {
          const pokemonMap = new Map(userPokemons.map(pokemon => [pokemon.id, pokemon]));
          const pokemon = pokemonMap.get(pokemonID);
          if (!pokemon) return interaction.reply("Pokemon Not Found");
          newTeam.push(pokemon);
        }
        if (i.customId === 'team') {
            // Update selected Pokemon IDs (remove duplicates)
            selectedPokemonIDs = [...new Set([...selectedPokemonIDs, ...i.values])];

            if (selectedPokemonIDs.length > 6) {
                // If more than 6 Pokemon are selected, limit to 6 and inform the user
                selectedPokemonIDs = selectedPokemonIDs.slice(0, 6);
                interaction.editReply(`You can only have a maximum of 6 Pokemon in your team. Selection limited to 6.`);
              }
              
            confirmButton.setDisabled(selectedPokemonIDs.length === 0); // Enable confirm only if selections exist
            await interaction.editReply({ components: [row1.setComponents(menu), row2.setComponents(previousButton, nextButton, confirmButton)] });
          }

        await UserSchema.updateOne({ DiscordID: userid }, { Team: newTeam });
        interaction.editReply(`${pokemonIDs.length} Pokemon added to your team!`);
      } else if (i.customId === 'prev_page') {
        currentPage--;
        const updatedMenu = createMenu(getPokemonForPage(currentPage));
        previousButton.setDisabled(currentPage === 1);
        nextButton.setDisabled(false);
        await interaction.editReply({ components: [row1.setComponents(updatedMenu), row2.setComponents(previousButton, nextButton)] });
      } else if (i.customId === 'next_page') {
        currentPage++;
        const updatedMenu = createMenu(getPokemonForPage(currentPage));
        previousButton.setDisabled(false);
        nextButton.setDisabled(currentPage === Math.ceil(userPokemons.length / pageSize));
        await interaction.editReply({ components: [row1.setComponents(updatedMenu), row2.setComponents(previousButton, nextButton)] });
      }
    });
  }
}

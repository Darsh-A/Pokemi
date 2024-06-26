const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newpickteam')
        .setDescription('Pick a Team for Battle'),
    async execute(interaction) {

        await interaction.deferReply();
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
            const maxValues = Math.min(pokemons.length, 6);
            if (pokemons.length === 0) {
                return new StringSelectMenuBuilder()
                    .setCustomId('team')
                    .setPlaceholder('No Pokemon Found') // Informative placeholder
                    .setDisabled(true); // Disable the menu
            }
            return new StringSelectMenuBuilder()
                .setCustomId('team')
                .setPlaceholder('Select a Pokemon')
                .addOptions(pokemons.map(pokemon => ({
                    label: `${pokemon.species} - ${pokemon.level}`,
                    value: pokemon.id
                })))
                .setMinValues(1)
                .setMaxValues(maxValues);
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
            .setDisabled(currentPage === Math.ceil(userPokemons.length / pageSize)); // Disable on last pag
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_team') // Ensure this ID is unique
            .setLabel('Confirm Team')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true); // Initially disabled

        const row1 = new ActionRowBuilder().addComponents(menu);
        const row2 = new ActionRowBuilder().addComponents(previousButton, nextButton, confirmButton)

        await interaction.editReply({ content: 'Pick a Pokemon for your Team', components: [row1, row2] });

        const filter = (i) => i.user.id === userid;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        let selectedPokemonIDs = [];

        collector.on('collect', async (i) => {
          if (i.customId === 'team') {
            selectedPokemonIDs = i.values; // Update selected IDs
        
            // Enable confirmation button if selections exist
            const confirmButton = row2.components[2];
            confirmButton.setDisabled(selectedPokemonIDs.length === 0);
        
            await interaction.editReply({ components: [row1, row2.setComponents(previousButton, nextButton, confirmButton)] });

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

          } else if (i.customId === 'confirm_team') {

            const newTeam = [];
            for (const pokemonID of selectedPokemonIDs) {
              const pokemon = userPokemons.find(pokemon => pokemon.id === pokemonID);
              if (pokemon) {
                newTeam.push(pokemon); // Add entire Pokemon object to team
              } else {
                console.error(`Pokemon with ID ${pokemonID} not found in user's Pokemon list.`);
              }
            }
            
            // Update user's team in MongoDB
            await UserSchema.updateOne({ DiscordID: userid }, { Team: newTeam });
            
            await interaction.editReply("Your team has been updated!");
            // Reset state for next selection
            selectedPokemonIDs = []; // Clear selected IDs
            currentPage = 1;
            const updatedMenu = createMenu(getPokemonForPage(currentPage));
            confirmButton.setDisabled(true); // Disable confirmation again
            await interaction.editReply({ components: [row1.setComponents(updatedMenu), row2.setComponents(previousButton.setDisabled(true), nextButton, confirmButton)] });
          }
        });
        
    }
}
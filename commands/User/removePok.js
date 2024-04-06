const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removepok')
        .setDescription('Removes a Pokemon from the User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('pokemon')
            .setDescription('The Pokemon Name')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = interaction.user.id;
        const Pokemon = options.getString('pokemon');

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        const userPokemons = user.AllPokemons;

        const pokemonIndex = userPokemons.map(pokemon => pokemon.species).lastIndexOf(Pokemon);

        if (pokemonIndex === -1) return interaction.reply(`Pokemon ${Pokemon} Not Found in <@${UserID}>'s Collection`)

        const removedPokemon = userPokemons[pokemonIndex];
        const newPokemons = [...userPokemons.slice(0, pokemonIndex), ...userPokemons.slice(pokemonIndex + 1)];

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, { AllPokemons: newPokemons });

        // Remove from the team using the ID of the removed Pokémon
        const userTeam = user.Team;
        const newTeam = userTeam.filter(pokemon => pokemon.id !== removedPokemon.id);
        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, { Team: newTeam });

        await interaction.reply(`Removed ${Pokemon} from <@${UserID}>`);
    }
}

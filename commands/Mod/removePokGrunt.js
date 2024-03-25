const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removepokemon')
        .setDescription('Removes a Pokemon from the User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('pokemon')
            .setDescription('The Pokemon Name')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const Pokemon = options.getString('pokemon');

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.editReply(`User <@${UserID}> Not Registered`)

        const userPokemons = user.AllPokemons;

        const pokemonExists = userPokemons.find(pokemon => pokemon.species === Pokemon);

        if (!pokemonExists) return interaction.editReply(`Pokemon ${Pokemon} Not Found in <@${UserID}>'s Collection`)

        const newPokemons = userPokemons.filter(pokemon => pokemon.species !== Pokemon);

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, { AllPokemons: newPokemons });

        // remove from the team also
        const userTeam = user.Team;
        const newTeam = userTeam.filter(pokemon => pokemon.species !== Pokemon);
        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, { Team: newTeam });

        await interaction.editReply(`Removed ${Pokemon} from <@${UserID}>`)

    }
}
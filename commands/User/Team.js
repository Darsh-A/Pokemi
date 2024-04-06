const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { convertToShowdownFormat } = require('../../Utils/miscFunc')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Gives Pokemon Showdown Format for your team')
        .addStringOption(
            option => option
                .setName('first')
                .setDescription('The Pokemon Name')
                .setRequired(true)
        )
        .addStringOption(
            option => option
                .setName('second')
                .setDescription('The Pokemon Name')
                .setRequired(false)
        )
        .addStringOption(
            option => option
                .setName('third')
                .setDescription('The Pokemon Name')
                .setRequired(false)
        )
        .addStringOption(
            option => option
                .setName('fourth')
                .setDescription('The Pokemon Name')
                .setRequired(false)
        )
        .addStringOption(
            option => option
                .setName('fifth')
                .setDescription('The Pokemon Name')
                .setRequired(false)
        )
        .addStringOption(
            option => option
                .setName('sixth')
                .setDescription('The Pokemon Name')
                .setRequired(false)
        ),

    async execute(interaction) {

        const userid = interaction.user.id;
        const user = await UserSchema.findOne({ DiscordID: userid });
        if (!user) return interaction.reply("User Not Found");

        const userTeam = user.Team;

        if (userTeam.length === 0) return interaction.reply("No Team Found");

        const allPokemons = user.AllPokemons;

        const options = interaction.options;

        const PokemonFirst = options.getString('first');
        const PokemonSecond = options.getString('second');
        const PokemonThird = options.getString('third');
        const PokemonFourth = options.getString('fourth');
        const PokemonFifth = options.getString('fifth');
        const PokemonSixth = options.getString('sixth');

        // get the pokemon object with the options but the highest level ones only

        const team = [];

        const highestLevelPokemonfirst = user.AllPokemons
            .filter(pokemon => pokemon.species === PokemonFirst)  // Filter by matching name
            .sort((a, b) => b.level - a.level)[0];  // Sort by level in descending order and get the highest level

        if (!highestLevelPokemonfirst) {
            return interaction.reply(`No Pokemon named ${PokemonFirst} found in your party.`);
        }

        team.push(highestLevelPokemonfirst);

        if (PokemonSecond) {
            const highestLevelPokemonSecond = user.AllPokemons
                .filter(pokemon => pokemon.species === PokemonSecond)
                .sort((a, b) => b.level - a.level)[0];

            if (!highestLevelPokemonSecond) {
                return interaction.reply(`No Pokemon named ${PokemonSecond} found in your party.`);
            }

            team.push(highestLevelPokemonSecond);
        }

        if (PokemonThird) {
            const highestLevelPokemonThird = user.AllPokemons
                .filter(pokemon => pokemon.species === PokemonThird)
                .sort((a, b) => b.level - a.level)[0];

            if (!highestLevelPokemonThird) {
                return interaction.reply(`No Pokemon named ${PokemonThird} found in your party.`);
            }

            team.push(highestLevelPokemonThird);
        }

        if (PokemonFourth) {
            const highestLevelPokemonFourth = user.AllPokemons
                .filter(pokemon => pokemon.species === PokemonFourth)
                .sort((a, b) => b.level - a.level)[0];

            if (!highestLevelPokemonFourth) {
                return interaction.reply(`No Pokemon named ${PokemonFourth} found in your party.`);
            }

            team.push(highestLevelPokemonFourth);
        }

        if (PokemonFifth) {
            const highestLevelPokemonFifth = user.AllPokemons
                .filter(pokemon => pokemon.species === PokemonFifth)
                .sort((a, b) => b.level - a.level)[0];

            if (!highestLevelPokemonFifth) {
                return interaction.reply(`No Pokemon named ${PokemonFifth} found in your party.`);
            }

            team.push(highestLevelPokemonFifth);
        }

        if (PokemonSixth) {
            const highestLevelPokemonSixth = user.AllPokemons
                .filter(pokemon => pokemon.species === PokemonSixth)
                .sort((a, b) => b.level - a.level)[0];

            if (!highestLevelPokemonSixth) {
                return interaction.reply(`No Pokemon named ${PokemonSixth} found in your party.`);
            }

            team.push(highestLevelPokemonSixth);
        }

        console.log("Team: ", team);

        // update the user's team

        user.Team = team;

        await user.save();

    }
}
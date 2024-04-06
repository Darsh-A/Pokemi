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


        if (PokemonFirst) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonFirst && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonFirst);
            }
        }

        if (PokemonSecond) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonSecond && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonSecond);
            }
        }

        if (PokemonThird) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonThird && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonThird);
            }
        }

        if (PokemonFourth) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonFourth && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonFourth);
            }
        }

        if (PokemonFifth) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonFifth && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonFifth);
            }
        }

        if (PokemonSixth) {
            const highestLevelPokemon = allPokemons.reduce((highest, pokemon) =>
                pokemon.species === PokemonSixth && pokemon.level > highest.level ? pokemon : highest,
                {level: -Infinity});

            if (highestLevelPokemon) {
                team.push(highestLevelPokemon);
            } else {
                return interaction.reply("You don't have a Pokémon named " + PokemonSixth);
            }
        }

        // update users team

        user.Team = team;
        

        await user.save();

    }
}
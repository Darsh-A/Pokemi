const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const {Pokemon, getAbility, filterMovesByGen, checkMovesForScratchOrTackle, checkPokemonExists} = require('../../Utils/UtilityClasses');
const { generateRandomString } = require('../../Utils/miscFunc.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('starterpokemon')
            .setDescription('The Starter Pokemon Chosen by the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('starterpokemongeneration')
            .setDescription('The Starter Pokemon Generation')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const StarterPokemonSpecies = options.getString('starterpokemon');
        const StarterPokemonGeneration = options.getString('starterpokemongeneration');

        const pokemonExists = checkPokemonExists(StarterPokemonGeneration, StarterPokemonSpecies);

        if (!pokemonExists) return interaction.reply(`Pokemon ${StarterPokemonSpecies} Not Found in Generation ${StarterPokemonGeneration}`)

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (user) return interaction.reply(`User <@${UserID}> Already Registered`)
        
        const moves  = filterMovesByGen(StarterPokemonGeneration, StarterPokemonSpecies);
        const selectedAbility = getAbility(StarterPokemonGeneration, StarterPokemonSpecies)
        const preferredMove = checkMovesForScratchOrTackle(moves);

        const StarterPokemon = new Pokemon(
            "", // Name
            StarterPokemonGeneration, // Generation
            generateRandomString(15), // ID
            StarterPokemonSpecies, // Species
            "", // Gender
            "", // Shiny 
            "", // Item
            4, // Level
            selectedAbility, // Ability // IS Randomized
            {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}, // EVs
            "Quirky", // Nature
            {"hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31}, // IVs
            [preferredMove] // Moves // IS Fetched
        )



        await UserSchema.create({
            DiscordID: UserID,
            Items: [],
            Money: 0,
            AllPokemons: [StarterPokemon],
            AllMoves: [],
            Team: [StarterPokemon],
        })

        await interaction.reply(`User <@${UserID}> Registered`)

    }
}
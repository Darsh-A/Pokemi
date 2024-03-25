const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const {Pokemon, getAbility, checkPokemonExists, getSprites} = require('../../Utils/UtilityClasses');
const { generateRandomString, giveShiny } = require('../../Utils/miscFunc.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpokemon')
        .setDescription('Add a Pokemon from the User')
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
        )
        .addStringOption(option => option
            .setName('generation')
            .setDescription('The Pokemon Generation')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('level')
            .setDescription('The Pokemon Level')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const Species = options.getString('pokemon');
        const Generation = options.getString('generation');
        const Level = options.getString('level');

        const pokemonExists = checkPokemonExists(Generation, Species);

        if (!pokemonExists) return interaction.editReply(`Pokemon ${Species} Not Found in Generation ${Generation}`)
        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.editReply(`User <@${UserID}> Not Registered`)

        const selectedAbility = getAbility(Generation, Species)

        const isShiny = giveShiny()
34
        const Sprite = await getSprites(Generation, Species,isShiny)

        const NewPokemon = new Pokemon(
            "", // Name
            Generation, // Generation
            generateRandomString(15), // ID
            Sprite, // Sprite
            Species, // Species
            "", // Gender
            isShiny, // Shiny 
            "", // Item
            Level, // Level
            selectedAbility, // Ability // IS Randomized
            {"hp": 1, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}, // EVs
            "Quirky", // Nature
            {"hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31}, // IVs
            ["scratch"], // Moves // IS Fetched
            0
        )

        await   UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $push: {
                AllPokemons: NewPokemon
            }
        })

        await interaction.editReply(`Added ${Species} to <@${UserID}>`)



    }
}
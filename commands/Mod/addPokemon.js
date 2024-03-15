const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const {Pokemon, getAbility, checkPokemonExists} = require('../../Utils/UtilityClasses');
const { generateRandomString } = require('../../Utils/miscFunc.js');

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

        if (!pokemonExists) return interaction.reply(`Pokemon ${Species} Not Found in Generation ${Generation}`)
        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        const selectedAbility = getAbility(Generation, Species)

        const NewPokemon = new Pokemon(
            "", // Name
            Generation, // Generation
            generateRandomString(15), // ID
            Species, // Species
            "", // Gender
            "", // Shiny 
            "", // Item
            Level, // Level
            selectedAbility, // Ability // IS Randomized
            {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}, // EVs
            "Quirky", // Nature
            {"hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31}, // IVs
            ["scratch"] // Moves // IS Fetched
        )

        await   UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $push: {
                AllPokemons: NewPokemon
            }
        })

        await interaction.reply(`Added ${Species} to <@${UserID}>`)



    }
}
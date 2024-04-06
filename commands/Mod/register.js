const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const {Pokemon, getAbility, filterMovesByGen, checkMovesForScratchOrTackle, checkPokemonExists, getSprites} = require('../../Utils/UtilityClasses');
const { generateRandomString, giveShiny } = require('../../Utils/miscFunc.js');
const {config} = require('dotenv')

config()


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

        
        const isShiny = giveShiny()
        
        const Sprite = await getSprites(StarterPokemonGeneration, StarterPokemonSpecies, isShiny)

        const StarterPokemon = new Pokemon(
            "", // Name
            StarterPokemonGeneration, // Generation
            generateRandomString(15), // ID
            Sprite, // Sprite
            StarterPokemonSpecies, // Species
            "", // Gender
            isShiny, // Shiny 
            "", // Item
            5, // Level
            selectedAbility, // Ability // IS Randomized
            {"hp": 1, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}, // EVs
            "Quirky", // Nature
            {"hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31}, // IVs
            [preferredMove], // Moves // IS Fetched
            0
        )



        await UserSchema.create({
            DiscordID: UserID,
            Items: [],
            Money: 0,
            AllPokemons: [StarterPokemon],
            AllMoves: [],
            Team: [StarterPokemon],
            WildRef: {
                lastGymLow: 5,
                nextGymLow: 12
            
            },
        })

        await interaction.reply(`User <@${UserID}> Registered`)

        // Adding user to their channel

        const client = interaction.client;
        const guild = await interaction.guild;
        const User = await guild.members.fetch(UserID);
        const category = await guild.channels.fetch(process.env.userchannelCatId)

        const userChannel = await guild.channels.create({
            name: User.id,
            parent: category,
            permissionOverwrites: [
                {
                    id: User.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]

        })

        console.log(userChannel)


    }
}
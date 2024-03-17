const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { Pokemon, getAbility, getSprites } = require('../../Utils/UtilityClasses');
const { generateRandomString, giveShiny } = require('../../Utils/miscFunc');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrpokemon')
        .setDescription('Adds Pokemon through a QR Code')
        .addAttachmentOption(option => option
            .setName('qrcode')
            .setDescription('Attach a QR Code to add a Pokemon to your collection.')
            .setRequired(true)
        ),

    async execute(interaction) {

        const attachment = interaction.options.get('qrcode');
        const qrUrl = await attachment.attachment.url;

        try {
            const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });

            const imageBuffer = response.data;
            const image = await Jimp.read(imageBuffer);

            const qr = new QrCode();
            qr.callback = async function (err, value) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(value.result);

                    const result = value.result.toLowerCase();
                    const splitResult = result.split('-');
                    const species = splitResult[0];
                    const generation = splitResult[1];
                    const level = splitResult[2];

                    console.log(species, generation, level)
                    const user = await UserSchema.findOne({ DiscordID: interaction.user.id });
                    if (!user) return interaction.reply("User Not Found");

                    const userPokemons = user.AllPokemons;

                    const pokemonExists = userPokemons.find(pokemon => pokemon.species === value.result);
                    if (pokemonExists) return interaction.reply("Pokemon already exists in your collection");
                    const selectedAbility = getAbility(generation, species)


                    const isShiny = giveShiny()

                    const Sprite = getSprites(generation, species, isShiny)

                    const newPokemon = new Pokemon(
                        "", // Name
                        generation, // Generation
                        generateRandomString(15), // ID
                        Sprite, // Sprite
                        species, // Species
                        "", // Gender
                        giveShiny(), // Shiny 
                        "", // Item
                        level, // Level
                        selectedAbility, // Ability // IS Randomized
                        { "hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 }, // EVs
                        "Quirky", // Nature
                        { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, // IVs
                        ['scratch'] // Moves // IS Fetched
                    )

                    userPokemons.push(newPokemon);
                    await UserSchema.updateOne({ DiscordID: interaction.user.id }, { AllPokemons: userPokemons });

                    await interaction.reply(`Pokemon added to your collection: ${species} - Gen:${generation} - Level:${level}`);
                }
            };
            qr.decode({
                width: image.bitmap.width,
                height: image.bitmap.height,
                data: image.bitmap.data
            });

        } catch (error) {
            console.error("Error downloading image:", error);
        }
    }
};

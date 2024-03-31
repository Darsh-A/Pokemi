const mongoose = require('mongoose');
const UserSchema = require('../mongo/Schemas/user');
const { Pokemon, checkPokemonExists, filterMovesByGen, getAbility, checkMovesForScratchOrTackle, getSprites, getEvolutions } = require('../Utils/UtilityClasses');
const { giveShiny, levelup, levelupRareCandy, getLevel, isCompletePokemon } = require('../Utils/miscFunc.js');

// Object to store the last update timestamps for each user
const userCooldowns = {};

function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

module.exports = {
    name: 'verifyPokemon',
    once: false,
    async execute() {


        const UserChangeStream = UserSchema.watch({
            pipeline: [
                {
                    $match: {
                        'updateDescription.updatedFields.AllPokemons': { $exists: true }, // AllPokemons field exists
                        //   'updateDescription.removedFields': { $exists: false } // No fields are removed (indicating addition)
                    }
                }
            ]
        });

        UserChangeStream.on('change', async (change) => {


            const updatedFields = change.updateDescription.updatedFields;
            const key = Object.keys(updatedFields)[0];

            const userId = change.documentKey._id;

            // Check if cooldown period has passed for this user
            const currentTime = Date.now();
            if (userCooldowns[userId] && currentTime - userCooldowns[userId] < 10000) { // 10 seconds
                // console.log("Cooldown active for user:", userId);
                return; // Skip processing
            }

            // Update the cooldown timestamp for this user
            userCooldowns[userId] = currentTime;


            if (change.operationType === 'update' && key.startsWith('AllPokemons.')) {

                console.log("Pokemon Updated...")

                const userId = change.documentKey._id;

                const newPokemon = change.updateDescription.updatedFields;
                console.log(newPokemon)
                if (!isCompletePokemon(newPokemon)) return;
                console.log("Valid Pokemon")
                const updatedUser = await UserSchema.findOne({ _id: userId });

                const addedPokemonKey = Object.keys(newPokemon).find(key => key.startsWith('AllPokemons.'));

                // **Check for specific addition to AllPokemons array:**
                if (addedPokemonKey) {

                    const addedPokemon = newPokemon[addedPokemonKey];
                    const species = addedPokemon.species;
                    const generation = addedPokemon.gen;
                    const id = addedPokemon.id;

                    // remove this pokemon from the user's AllPokemons array
                    await UserSchema.updateOne({ _id: userId }, { $pull: { AllPokemons: addedPokemon } });


                    const pokemonExists = checkPokemonExists(generation, species);

                    if (pokemonExists) {
                        console.log(`New Pokemon added for user ${userId}: ${species}`);

                        const moves = filterMovesByGen(generation, species);
                        const selectedAbility = getAbility(generation, species);
                        const preferredMove = checkMovesForScratchOrTackle(moves);

                        const isShiny = giveShiny();

                        const Sprite = await getSprites(generation, species, isShiny);

                        const newUpdatedPokemon = new Pokemon(
                            "", // Name
                            generation, // Generation
                            id, // ID
                            Sprite, // Sprite
                            species, // Species
                            "", // Gender
                            isShiny, // Shiny
                            "", // Item
                            await getLevel(updatedUser.DiscordID), // Level
                            selectedAbility, // Ability // IS Randomized
                            { "hp": 1, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0 }, // EVs
                            "Quirky", // Nature
                            { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, // IVs
                            [preferredMove], // Moves // IS Fetched
                            0
                        );



                        await UserSchema.updateOne({ DiscordID: updatedUser.DiscordID }, { $push: { AllPokemons: newUpdatedPokemon } });

                        // **Optional additional processing for the added Pokemon (levelup, etc.)**
                        // You can uncomment and customize these lines as needed
                        levelup(updatedUser.DiscordID);
                        levelupRareCandy(updatedUser.DiscordID);

                        // check for evoltions

                        const UpdatedFinalUser = await UserSchema.findOne({ DiscordID: updatedUser.DiscordID });

                        const allUpdatedPokemons = UpdatedFinalUser.Team;

                        console.log("Entering the shit")

                        for (const pokemon of allUpdatedPokemons) {

                            const evolution = await getEvolutions(pokemon.species);

                            if (!evolution) return;

                            if (pokemon.level >= evolution.evolvesAt) {
                                console.log(`Pokemon ${pokemon.species} is ready to evolve!`)
                                console.log(evolution.evolvesToSpecies)
                                const newSpecies = evolution.evolvesToSpecies;
                                pokemon.species = newSpecies;

                                await UserSchema.findOneAndUpdate({ DiscordID: updatedUser.DiscordID, "AllPokemons.id": pokemon.id }, { "AllPokemons.$.species": newSpecies });
                            }
                        }

                    } else {
                        console.log(`Invalid Pokemon added for user ${userId}: ${species}`);
                        // Handle invalid Pokemon addition (e.g., remove from array)

                        // Remove the invalid Pokemon from the user's AllPokemons array
                        await UserSchema.updateOne({ DiscordID: updatedUser.DiscordID }, { $pull: { AllPokemons: addedPokemon } });
                    }
                }
            }
        });

    }
}

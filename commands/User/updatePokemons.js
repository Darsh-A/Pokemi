const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const axios = require('axios');
const { getAbility, getSprites } = require('../../Utils/UtilityClasses');
const { giveShiny } = require('../../Utils/miscFunc.js');


let discordID;
let AllPokemons;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifypokemons')
    .setDescription('Verify Any Missing Info for your Pokemons'),

  async execute(interaction) {
    const userid = interaction.user.id;
    discordID = userid
    const user = await UserSchema.findOne({ DiscordID: userid });
    if (!user) {
      return interaction.reply('You are not registered');
    }

    const allPokemons = user.AllPokemons;
    AllPokemons = allPokemons

    let message = "";
    for (const pokemon of allPokemons) {
      const undefinedFields = isCompletePokemon(pokemon);
      if (undefinedFields.length > 0) {
        message += `Pokemon ${pokemon.id} has the following missing fields: `;
        undefinedFields.forEach(field => {
          message += `${field}, `;
        });
        message = message.slice(0, -2) + "\n";
      }
    }

    if (message) {
      await interaction.reply("Updating the fields, please wait...\n" + message);
      for (const pokemon of allPokemons) {
        const updatedUser = await updatePokemon(pokemon);
        if (updatedUser) {
          // Do nothing, update already reflected in user object
        } else {
          console.error(`Failed to update / Nothing to update - Pokemon ${pokemon.id}`); // Log update error
        }
      }
      await interaction.editReply("All verifications complete!"); // Edit initial response after updates
    } else {
      await interaction.reply("All Pokemons have complete information!");
    }
  }
}

function isCompletePokemon(newPokemon) {
  const pokemonData = newPokemon; // Accessing the Pokemon object using the first key
  const undefinedFields = [];

  // if (typeof pokemonData !== 'object') {
  //     undefinedFields.push('Object is not defined');
  //     return undefinedFields;
  // }

  // if (pokemonData.gen === undefined || pokemonData.gen.length == 0) undefinedFields.push('gen');
  // if (pokemonData.id === undefined) undefinedFields.push('id');
  if (pokemonData.sprite === undefined || pokemonData.sprite.length == 0) undefinedFields.push('sprite');
  //if (pokemonData.species === undefined) undefinedFields.push('species');
  if (pokemonData.shiny === undefined || pokemonData.shiny.length == 0) undefinedFields.push('shiny');
  if (pokemonData.ability === undefined || pokemonData.ability.length == 0) undefinedFields.push('ability');
  // if (pokemonData.evs === undefined || Object.keys(pokemonData.evs).length === 0) undefinedFields.push('evs');
  // if (pokemonData.nature === undefined) undefinedFields.push('nature');
  // if (pokemonData.ivs === undefined || Object.keys(pokemonData.ivs).length === 0) undefinedFields.push('ivs');

  return undefinedFields;
}

async function updatePokemon(pokemon) {

  const undefinedFields = isCompletePokemon(pokemon);
  if (undefinedFields.length === 0) return;

  const pokemonData = pokemon // Accessing the Pokemon object using the first key
  const species = pokemonData.species;
  const gen = pokemonData.gen;

  const abilities = await getAbility(gen, species);
  const isShiny = giveShiny();
  const sprite = await getSprites(gen, species, isShiny);

  if (undefinedFields.includes('sprite')) {
    console.log("Adding Sprite")
    pokemonData.sprite = sprite;
  }

  if (undefinedFields.includes('ability')) {
    console.log("Adding Ability")
    pokemonData.ability = abilities;
  }

  if (undefinedFields.includes('shiny')) {
    console.log("Adding Shiny")
    pokemonData.shiny = isShiny;
  }

  console.log(pokemonData);

  const updatedUser = await UserSchema.findOneAndUpdate(
    { DiscordID: discordID, 'AllPokemons.id': pokemon.id },
    { $set: { 'AllPokemons.$': pokemonData } },
    { new: true } // Return the updated document
  );

  return updatedUser;

}


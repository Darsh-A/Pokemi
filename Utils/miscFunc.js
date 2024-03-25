const { getSprites } = require('../Utils/UtilityClasses');
const axios = require('axios');
const UserSchema = require('../mongo/Schemas/user');


function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

function convertToShowdownFormat(jsonData) {
  // Parse the JSON data
  var data = JSON.parse(jsonData);

  // Initialize an empty string for the showdown format
  var showdownFormat = "";

  // Iterate over each Pokemon in the team
  data.forEach(function (pokemon) {

    // Add the Pokemon's details to the showdown format string
    showdownFormat += pokemon.species + " @ " + pokemon.item + "\n";
    showdownFormat += "Ability: " + pokemon.ability + "\n";
    showdownFormat += "Level: " + pokemon.level + "\n";
    showdownFormat += "Shiny: " + pokemon.shiny + "\n";
    showdownFormat += "EVs: " + pokemon.evs.hp + " HP / " + pokemon.evs.atk + " Atk / " + pokemon.evs.def + " Def / " + pokemon.evs.spa + " SpA / " + pokemon.evs.spd + " SpD / " + pokemon.evs.spe + " Spe\n";
    showdownFormat += "IVs: " + pokemon.ivs.hp + " HP / " + pokemon.ivs.atk + " Atk / " + pokemon.ivs.def + " Def / " + pokemon.ivs.spa + " SpA / " + pokemon.ivs.spd + " SpD / " + pokemon.ivs.spe + " Spe\n";
    showdownFormat += pokemon.nature + " Nature\n";
    if (pokemon.moves) {
      if (pokemon.moves[0]) showdownFormat += "- " + pokemon.moves[0] + "\n";
      if (pokemon.moves[1]) showdownFormat += "- " + pokemon.moves[1] + "\n";
      if (pokemon.moves[2]) showdownFormat += "- " + pokemon.moves[2] + "\n";
      if (pokemon.moves[3]) showdownFormat += "- " + pokemon.moves[3] + "\n";
    }
    showdownFormat += "\n";
  });

  return showdownFormat;
}

function giveShiny() {
  return Math.random() < 0.05 ? "Yes" : "No";
}

async function uploadEmoji(interaction, pokemon) {

  const species = pokemon.species;
  const shiny = pokemon.shiny
  const generation = pokemon.gen
  const pokeID = pokemon.id

  const sprite = await getSprites(generation, species, shiny)

  const response = await axios.get(sprite, { responseType: 'arraybuffer' });

  const spriteBuffer = response.data;

  const emoji = await interaction.guild.emojis.create({ attachment: spriteBuffer, name: pokeID });

  return emoji.id;

}

async function deleteEmoji(interaction, emojiID) {

  await interaction.guild.emojis.delete(emojiID);

}

async function levelup(discordID) {
  console.log("Called Levelup...")
  const user = await UserSchema.findOne({ DiscordID: discordID });
  if (!user) return "User Not Found";

  const userTeam = user.Team;

  for (const pokemon of userTeam) {

    pokemon.defeatCount += 1;

    if (pokemon.defeatCount % 3 === 0) {
      pokemon.level += 1;
    }

    await UserSchema.updateOne(
      { DiscordID: discordID, 'AllPokemons.id': pokemon.id },
      { 
        $set: { 
          'AllPokemons.$.level': pokemon.level,
          'AllPokemons.$.defeatCount': pokemon.defeatCount
        } 
      }
    );
    await UserSchema.updateOne(
      { DiscordID: discordID, 'Team.id': pokemon.id },
      { 
        $set: { 
          'Team.$.level': pokemon.level,
          'Team.$.defeatCount': pokemon.defeatCount
        } 
      }
    );
    
  }

}

async function levelupRareCandy(discordID) {
  const user = await UserSchema.findOne({ DiscordID: discordID });
  if (!user) return "User Not Found";
  const userItems = user.Items;

  const rareCandy = userItems.find(item => item.name === "rarecandy");

  if (!rareCandy) {
    userItems.push({ name: "rarecandy", amount: 1 });
  } else {
    rareCandy.amount += 1;
  }

}

async function getLevel(discordID) {
  const user = await UserSchema.findOne({ DiscordID: discordID });

  if (!user) return 0;

  const lastGym = user.WildRef.lastGymLow;
  const nextGym = user.WildRef.nextGymLow;

  //pick a integer between last and next gym

  const level = Math.floor(Math.random() * (nextGym - lastGym + 1)) + lastGym;
  console.log(level)

  return level;


}

module.exports = {
  generateRandomString,
  convertToShowdownFormat,
  giveShiny,
  uploadEmoji,
  deleteEmoji,
  levelup,
  levelupRareCandy,
  getLevel
}

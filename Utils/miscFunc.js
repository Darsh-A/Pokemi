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
    showdownFormat += "Level:" + pokemon.level + "\n";
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

async function uploadEmoji(interaction, url, name) {
  await interaction.guild.emojis.create(url, name)

}



module.exports = {
  generateRandomString,
  convertToShowdownFormat,
  giveShiny
}

const { Dex } = require('@pkmn/dex');
const { Generations } = require('@pkmn/data');
const UserSchema = require('../mongo/Schemas/user');
const axios = require('axios');


class Pokemon {

    constructor(name, gen, id, sprite, species, gender, shiny, item, level, ability, evs, nature, ivs, moves, defeatCount) {
        this.name = name;
        this.gen = gen;
        this.id = id;
        this.sprite = sprite;
        this.species = species;
        this.gender = gender;
        this.shiny = shiny
        this.item = item;
        this.level = level;
        this.ability = ability;
        this.evs = evs;
        this.nature = nature;
        this.ivs = ivs;
        this.moves = moves;
        this.defeatCount = defeatCount;
    }
}

class InvItem {

    constructor(name, amount) {
        this.name = name;
        this.amount = amount;
    }

}

class Badges {

    constructor(name, icon, currentlow, nextlow) {
        this.name = name;
        this.icon = icon;
        this.currentlow = currentlow;
        this.nextlow = nextlow;

    }
}




function getAbility(gen, species) {

    const gens = new Generations(Dex);
    const Pokemon = gens.get(gen).species.get(species);

    if (!Pokemon) return "No Pokemon Found";

    const abilities = Pokemon.abilities;

    // Get the list of ability keys (either numeric or the letter)
    const abilityKeys = Object.keys(abilities);

    // Choose a random index within the keys array
    const randomIndex = Math.floor(Math.random() * abilityKeys.length);

    // Access the corresponding ability using the random key
    const chosenAbility = abilities[abilityKeys[randomIndex]];

    return chosenAbility;
}

function checkPokemonExists(gen, species) {
    const gens = new Generations(Dex);
    const Pokemon = gens.get(gen).species.get(species);

    if (!Pokemon) return false;
    return true;

}

function filterMovesByGen(startingNumber, moves) {
    const filteredMoves = {};

    for (const move in moves) {
        const moveArray = moves[move];
        for (const moveName of moveArray) {
            if (moveName.startsWith(`${startingNumber}L`)) {
                filteredMoves[move] = moveName;
                break; // Break after finding the first move starting with the specified number
            }
        }
    }

    return filteredMoves;
}

function checkMovesForScratchOrTackle(moves) {
    const hasScratch = moves.hasOwnProperty('scratch');
    const hasTackle = moves.hasOwnProperty('tackle');

    if (hasScratch && hasTackle) {
        return 'scratch';
    } else if (hasScratch || hasTackle) {
        return 'scratch';
    } else {
        return 'scratch';
    }
}

async function getAligibleMoves(PokemonID, DiscordID) {

    const user = await UserSchema.findOne({ DiscordID: DiscordID });
    if (!user) return "User Not Found";

    const userPokemons = user.AllPokemons;

    const pokemon = userPokemons.find(pokemon => pokemon.id === PokemonID);
    if (!pokemon) return "Pokemon Not Found";

    const gen = pokemon.gen;

    const gens = new Generations(Dex);
    const output = await gens.get(gen).learnsets.get(pokemon.species);

    const learnset = output.learnset;
    const moves = filterMovesByGen(gen, learnset);
    const level = pokemon.level;

    const eligibleMoves = [];
    // level is the number after the L 
    for (const move in moves) {
        const moveLevel = parseInt(moves[move].split('L')[1]);
        if (moveLevel <= level) {
            eligibleMoves.push(move);
        }
    }

    return eligibleMoves;


}

async function getSprites(gen, species, shiny) {
    const gens = new Generations(Dex);
    const Pokemon = gens.get(gen).species.get(species);

    if (!Pokemon) return "No Pokemon Found";

    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species.toLowerCase()}`);
    const spriteUrl = response.data.sprites.other.showdown.front_default;
    const shinySprite = response.data.sprites.other.showdown.front_shiny;

    if (shiny) {
        return shinySprite;
    } else {
        return spriteUrl;
    }

}

async function getType(gen, species) {
    const gens = new Generations(Dex);
    const Pokemon = gens.get(gen).species.get(species);

    if (!Pokemon) return "No Pokemon Found";

    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species.toLowerCase()}`);

    const allTypes = response.data.types;

    const types = [];

    for (const type of allTypes) {
        types.push(type.type.name);
    }


    return types;
}

async function trainPokemon(pokemonID, DiscordID, forgetmove, learnmove, MoveReplace) {

    const user = await UserSchema.findOne({ DiscordID: DiscordID });
    if (!user) return "User Not Found";

    const userPokemons = user.AllPokemons;

    const pokemon = userPokemons.find(pokemon => pokemon.id === pokemonID);
    if (!pokemon) return "Pokemon Not Found";

    const PokMoves = pokemon.moves;

    // if the learnmove already exists in the moveset, return
    if (PokMoves.includes(learnmove)) return "Move Already Exists";

    if (learnmove === forgetmove) return "Cannot Replace with the same move"; 1

    if (PokMoves.length === 4 && MoveReplace) {
        const moveIndex = PokMoves.indexOf(forgetmove);

        if (moveIndex === -1) return console.log("Move Not Found");

        PokMoves[moveIndex] = learnmove;

        await UserSchema.updateOne({ DiscordID: DiscordID }, { AllPokemons: userPokemons });

        return `${pokemon.species} has learned ${learnmove} and forgotten ${forgetmove}`

    }
    else {
        PokMoves.push(learnmove);
        await UserSchema.updateOne({ DiscordID: DiscordID }, { AllPokemons: userPokemons });

        return `${pokemon.species} has learned ${learnmove}`

    }


}

async function levelUpPokemon(pokemonID, DiscordID, numRareCandies) {
    const user = await UserSchema.findOne({ DiscordID: DiscordID });
    if (!user) return "User Not Found";

    const userPokemons = [...user.AllPokemons]; // Create a shallow copy
    const userItems = user.Items;

    const pokemonIndex = userPokemons.findIndex(pokemon => pokemon.id === pokemonID);
    if (pokemonIndex === -1) return "Pokemon Not Found";

    const pokemon = userPokemons[pokemonIndex];

    const rareCandyIndex = userItems.findIndex(item => item.name === "rarecandy");

    if (rareCandyIndex === -1 || userItems[rareCandyIndex].amount < numRareCandies)
        return "Insufficient Rare Candies";

    userItems[rareCandyIndex].amount -= numRareCandies;

    if (userItems[rareCandyIndex].amount === 0) {
        userItems.splice(rareCandyIndex, 1);
    }

    const level = pokemon.level;
    const newLevel = level + numRareCandies;

    // Update the cloned Pokemon's level
    userPokemons[pokemonIndex].level = newLevel;

    await UserSchema.updateOne({ DiscordID: DiscordID }, { AllPokemons: userPokemons });

    return [`${pokemon.species} has leveled up by ${numRareCandies} levels to level ${newLevel}`,newLevel];
}

async function getStats(gen, species) {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species.toLowerCase()}`);

    const stats = response.data.stats;

    const baseStats = {};

    for (const stat of stats) {
        baseStats[stat.stat.name] = stat.base_stat;
    }

    return baseStats;

}

async function getNextEvolution(currentSpecies) {
    const PokSpecies = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${currentSpecies.toLowerCase()}`);
    const evoChainURL = PokSpecies.data.evolution_chain.url;
    const response = await axios.get(evoChainURL);
    const evoChain = response.data.chain;

    return findNextEvolution(evoChain, currentSpecies);
}

function findNextEvolution(chain, currentSpecies) {
    if (!chain || !chain.species || !chain.evolves_to) {
        return null;
    }

    // Find the current species in the chain
    if (chain.species.name === currentSpecies.toLowerCase()) {
        // Check if there is an evolution after the current species
        if (chain.evolves_to.length > 0) {
            const nextEvolution = chain.evolves_to[0];
            if (nextEvolution.evolution_details.length > 0 && nextEvolution.evolution_details[0].min_level !== null) {
                return { species: nextEvolution.species.name, evolvesAt: nextEvolution.evolution_details[0].min_level };
            } else {
                return { species: nextEvolution.species.name, evolvesAt: "Special" };
            }
        } else {
            return null; // No further evolution
        }
    }

    // Recursively search for the next evolution
    for (const nextChain of chain.evolves_to) {
        const result = findNextEvolution(nextChain, currentSpecies);
        if (result) {
            return result;
        }
    }

    return null; // Next evolution not found
}

// Example usage
async function getEvolutions(currentSpecies) {
    const nextEvolution = await getNextEvolution(currentSpecies);
    if (!nextEvolution) {
        return false; // No next evolution found
    }

    // Now you can handle the nextEvolution
    // For example, get the minimum level or other details
    // You can modify this as per your requirements
    const { species, evolvesAt } = nextEvolution;
    return { evolvesToSpecies: species, evolvesAt };
}




module.exports = {
    Pokemon,
    InvItem,
    Badges,
    getAbility,
    filterMovesByGen,
    checkMovesForScratchOrTackle,
    checkPokemonExists,
    getAligibleMoves,
    getSprites,
    getType,
    trainPokemon,
    levelUpPokemon,
    getStats,
    getEvolutions
};
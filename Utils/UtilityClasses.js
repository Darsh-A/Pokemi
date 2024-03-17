const { Dex } = require('@pkmn/dex');
const { Generations } = require('@pkmn/data');
const UserSchema = require('../mongo/Schemas/user');
const axios = require('axios');


class Pokemon {

    constructor(name, gen, id, sprite, species, gender, shiny, item, level, ability, evs, nature, ivs, moves) {
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
    }

    // Add methods to access or modify properties (optional)
    getStats() {
        // Implement logic to calculate or retrieve stats based on level, etc.
        return { /* stats object */ };
    }
}

class InvItem {

    constructor(name, amount) {
        this.name = name;
        this.amount = amount;
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

    const user = await UserSchema.findOne({ DiscordID : DiscordID });
    if (!user) return "User Not Found";

    const userPokemons = user.AllPokemons;

    const pokemon = userPokemons.find(pokemon => pokemon.id === pokemonID);
    if (!pokemon) return "Pokemon Not Found";

    const PokMoves = pokemon.moves;

    // if the learnmove already exists in the moveset, return
    if (PokMoves.includes(learnmove)) return "Move Already Exists";

    if(learnmove === forgetmove) return "Cannot Replace with the same move";1

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

async function levelUpPokemon(pokemonID, DiscordID) {

    const user = await UserSchema.findOne({ DiscordID : DiscordID });
    if (!user) return "User Not Found";

    const userPokemons = user.AllPokemons;
    const userItems = user.Items;

    const pokemon = userPokemons.find(pokemon => pokemon.id === pokemonID);
    if (!pokemon) return "Pokemon Not Found";

    const rareCandyIndex = userItems.findIndex(item => item.name === "rarecandy");

    if (rareCandyIndex === -1) return "No Rare Candy Found";

    userItems[rareCandyIndex].amount -= 1;

    if (userItems[rareCandyIndex].amount === 0) {
        userItems.splice(rareCandyIndex, 1);
    }

    const level = pokemon.level;
    const newLevel = level + 2;

    pokemon.level = newLevel;

    await UserSchema.updateOne({ DiscordID: DiscordID }, { AllPokemons: userPokemons });

    return `${pokemon.species} has leveled up to level ${newLevel}`;

}


module.exports = {
    Pokemon,
    InvItem,
    getAbility,
    filterMovesByGen,
    checkMovesForScratchOrTackle,
    checkPokemonExists,
    getAligibleMoves,
    getSprites,
    getType,
    trainPokemon,
    levelUpPokemon
};
const { Dex } = require('@pkmn/dex');
const { Generations } = require('@pkmn/data');
const UserSchema = require('../mongo/Schemas/user');


class Pokemon {

    constructor(name, gen, id, species, gender, shiny, item, level, ability, evs, nature, ivs, moves) {
        this.name = name;
        this.gen = gen;
        this.id = id;
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

module.exports.InvItem = class InvItem {

    constructor(name, description, url) {
        this.name = name;
        this.description = description;
        this.image = url;
    }

    // Add methods to access or modify properties (optional)
    useItem() {
        // Implement logic to use the item
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

    const user = await UserSchema.findOne({ Discord : DiscordID });
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
        const moveLevel = parseInt(move.split('L')[1]);
        if (moveLevel <= level) {
            eligibleMoves.push(moves[move]);
        }
    }

    return eligibleMoves;

    
}


module.exports = { Pokemon, getAbility, filterMovesByGen, checkMovesForScratchOrTackle, checkPokemonExists, getAligibleMoves };
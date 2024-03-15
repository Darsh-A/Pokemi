class Pokemon {
    constructor(name,gen,species,gender,shiny,item,level,ability,evs,nature,ivs,moves) {
        this.name = name;
        this.gen = gen;
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

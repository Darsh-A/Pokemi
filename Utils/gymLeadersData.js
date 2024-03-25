const { Badges } = require('../Utils/UtilityClasses');

async function Gyms() {

    const Gym1 = {
        Type: "Normal",
        Location: "Community Center",
        Badge: new Badges("Normal", "https://static.wikia.nocookie.net/pokemon/images/4/42/Plainbadge.png",12,15),
        LvlMin: 12,
        LvlMax: 14,
    }

    const Gym2 = {
        Type: "Electric",
        Location: "Main Gate",
        Badge: new Badges("Electric", "https://static.wikia.nocookie.net/pokemon/images/a/a8/Thunderbadge.png",15,17),
        LvlMin: 15,
        LvlMax: 17,
    }

    const Gym3 = {
        Type: "Grass",
        Location: "Stadium",
        Badge: new Badges("Grass", "https://static.wikia.nocookie.net/pokemon/images/c/cc/Earthbadge.png",17,22),
        LvlMin: 17,
        LvlMax: 18,
    }

    const Gym4 = {
        Type: "Fighting",
        Location: "H5 Gym",
        Badge: new Badges("Fighting", "https://static.wikia.nocookie.net/pokemon/images/d/d9/Volcanobadge.png",22,28),
        LvlMin: 22,
        LvlMax: 26,
    }

    const Gym5 = {
        Type: "Ghost",
        Location: "Old Library",
        Badge: new Badges("Ghost", "https://static.wikia.nocookie.net/pokemon/images/9/9a/Risingbadge.png",28,35),
        LvlMin: 28,
        LvlMax: 30,
    }

    const Gym6 = {
        Type: "Psychic",
        Location: "Library",
        Badge: new Badges("Psychic", "https://static.wikia.nocookie.net/pokemon/images/6/64/Soulbadge.png",35,42),
        LvlMin: 35,
        LvlMax: 40,
    }

    const Gym7 = {
        Type: "Steel",
        Location: "CAF",
        Badge: new Badges("Steel", "https://static.wikia.nocookie.net/pokemon/images/b/b6/Zephyrbadge.png",42,50),
        LvlMin: 42,
        LvlMax: 48,
    }

    const Gym8 = {
        Type: "Ice",
        Location: "Sheet Lab",
        Badge: new Badges("Ice", "https://static.wikia.nocookie.net/pokemon/images/5/53/Iciclebadge.png",50,60),
        LvlMin: 50,
        LvlMax: 55,
    }

    return [Gym1, Gym2, Gym3, Gym4, Gym5, Gym6, Gym7, Gym8];

}

module.exports = {Gyms};
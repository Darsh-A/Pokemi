if (i.customId === 'select_pokemon') {

    console.log("Pokemon Selected: ", i.values[0])

    isSelectionOver = true;

    const selectedPokemonIndex = i.values[0];
    const selectedPokemon = UserPokemons.find((pokemon) => pokemon.index === parseInt(selectedPokemonIndex));
    const sprite = await getSprites(selectedPokemon.gen, selectedPokemon.species, false);
    const types = await getType(selectedPokemon.gen, selectedPokemon.species);
    const moves = selectedPokemon.moves;


    let movefields = [];
    for (const move of moves) {
        movefields.push({ name: '-', value: move, inline: true });
    }

    // Update the embed with more information about the selected Pokémon
    let rarecandy = user.Items.find(item => item.name.toLowerCase() === "rarecandy");
    if (rarecandy) {
        rarecandy = rarecandy.amount;
    }
    else {
        rarecandy = 0;
    }
    const Pokemon_embed = new EmbedBuilder()
        .setTitle(selectedPokemon.species)
        .setDescription(` Level: ${selectedPokemon.level.toString()} \n Ability: ${selectedPokemon.ability} \n Nature: ${selectedPokemon.nature} \n Types: ${types.join(',')}`)
        .addFields(
            movefields
        )
        .setThumbnail(sprite)
        .setColor('#e36d83')
        .setFooter({ text: `Rare Candy: ${rarecandy} | 1 RareCandy = 2 Level`, iconURL: 'https://i.postimg.cc/52gBWdNY/image.png' })

    const trainRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('nickname_pokemon')
                .setLabel('NickName')
                .setStyle('Primary')
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('levelup_pokemon')
                .setLabel('LevelUp')
                .setStyle('Primary')
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('train_pokemon')
                .setLabel('Train')
                .setStyle('Primary')
        )

    // Edit the existing message with the updated embed
    await interaction.editReply({ embeds: [Pokemon_embed], components: [trainRow] });


    const filter = i => i.user.id === interaction.user.id;
    const trainCollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    trainCollector.on('collect', async i => {
        if (i.customId === 'train_pokemon') {


            const eligibleMoves = await getAligibleMoves(selectedPokemon.id, userid);
            const learnedMoves = selectedPokemon.moves

            let MoveReplace = false;

            if (learnedMoves.length === 4) {
                MoveReplace = true;
            }


            // if (!heartScales && MoveReplace == true) return "You dont have any HeartScales, Collect More."

            if (eligibleMoves.length === 0) {
                return 'No Moves Found';
            }

            let selectMoveOptions = [];
            for (const move of eligibleMoves) {
                selectMoveOptions.push(new StringSelectMenuOptionBuilder().setLabel(move).setValue(move));
            }

            let learnedMoveOptions = [];
            for (const move of learnedMoves) {
                learnedMoveOptions.push(new StringSelectMenuOptionBuilder().setLabel(move).setValue(move));
            }


            const moveSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_move')
                .setPlaceholder('Select a Move to Train')
                .addOptions(selectMoveOptions);

            const learnedMoveSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_learned_move')
                .setPlaceholder('Select a Move to Forget')
                .addOptions(learnedMoveOptions);

            const moveRow = new ActionRowBuilder()
                .addComponents(
                    moveSelectMenu
                );
            const learnedMoveRow = new ActionRowBuilder()
                .addComponents(
                    learnedMoveSelectMenu
                );

            let notifMsg = ""
            let moveComps = []
            if (MoveReplace == true) {
                notifMsg = `***IMPORTANT*** \n This will consume 1 HeartScale, Currently Owned HearScale: `
                moveComps = [moveRow, learnedMoveRow]
            }
            else {
                notifMsg = `Learning a New Move, Select from Below`
                moveComps = [moveRow]
            }
            await interaction.editReply({ content: notifMsg, components: moveComps });

            const trainCollector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id, // Only collect interactions from the user who sent the command
                time: 60000, // Set a timeout for interaction (optional)
            });

            let selectedMove; // Variable to store selected move
            let selectedLearnedMove; // Variable to store selected learned move

            trainCollector.on('collect', async (i) => {
                if (i.customId === 'select_move') {
                    selectedMove = i.values[0]; // Store the selected move value
                } else if (i.customId === 'select_learned_move' && MoveReplace == true) {
                    selectedLearnedMove = i.values[0]; // Store the selected learned move value
                }

                // Check if both selections are made
                if (selectedMove && selectedLearnedMove || selectedMove && MoveReplace == false) {

                    // Your logic for handling the selected moves and updating user data
                    // ... (e.g., train the Pokemon, replace the learned move)
                    const learnResponse = await trainPokemon(selectedPokemon.id, userid, selectedLearnedMove, selectedMove, MoveReplace);

                    // Stop the collector after handling selections
                    trainCollector.stop();

                    await interaction.editReply({
                        content: learnResponse, // Send the response to the user
                        components: [] // Remove the menus after selection
                    });

                } else {
                    // Defer the update to inform Discord that the bot is still processing
                    await i.deferUpdate();
                }
            });
        }
        else if (i.customId === 'levelup_pokemon') {

            let rareCandyAmount



            try {
                const RareCandyModal = new ModalBuilder()
                    .setCustomId('rare_candy_modal')
                    .setTitle('How Many Rare Candies to use')

                const candyAmount = new TextInputBuilder()
                    .setCustomId('candyamount')
                    .setLabel("amount")
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);


                const candyActionRow = new ActionRowBuilder().addComponents(candyAmount);

                RareCandyModal.addComponents(candyActionRow)

                await i.showModal(RareCandyModal);

                // Collect a modal submit interaction
                const filter = (i) => i.customId === 'rare_candy_modal';

                const modalVals = await i.awaitModalSubmit({ filter, time: 60_000 }).then(async (modal) => {
                    const modalComp = modal.fields.fields //(candy => candy.customId === 'candyamount');
                    rareCandyAmount = parseInt(modalComp.get('candyamount').value)

                    const res = await levelUpPokemon(selectedPokemon.id, userid, rareCandyAmount);
                    console.log(res)
                    await modal.update(res);

                    user.Items.find(item => item.name.toLowerCase() === "rarecandy").amount -= rareCandyAmount;

                    await UserSchema.findOneAndUpdate({ DiscordID: userid }, { Items: user.Items });

                    const Evolutions = await getEvolutions(selectedPokemon.species.toLowerCase());
                    if (!Evolutions) return;

                    if (selectedPokemon.level >= Evolutions.evolvesAt - 1) {
                        console.log(Evolutions.evolvesToSpecies)
                        console.log("Evolving Pokemon...")
                        // change pokemons species
                        await UserSchema.findOneAndUpdate({ DiscordID: userid, "AllPokemons.id": selectedPokemon.id }, { "AllPokemons.$.species": Evolutions.evolvesToSpecies });
                        await interaction.editReply(`Pokemon Evolved to ${Evolutions.evolvesToSpecies}`);
                    }

                })

            }
            catch (error) {
                console.log(error)
            }



        }
        else if (i.customId === 'nickname_pokemon') {

            const nickname = await interaction.channel.send(`Enter Nickname for ${selectedPokemon.species}`);
            const filter = m => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async (m) => {
                const nickname = m.content;
                const response = await UserSchema.findOneAndUpdate({ DiscordID: userid, "AllPokemons.id": selectedPokemon.id }, { "AllPokemons.$.name": nickname });
                await interaction.editReply(`Nickname Updated to ${nickname}`);
                collector.stop();
            });
        }
        trainCollector.stop();
    });


}
const { SlashCommandBuilder } = require('discord.js');
const GymSchema = require('../../mongo/Schemas/Gyms');
const {Gyms} = require('../../Utils/gymLeadersData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addgymleader')
        .setDescription('Adds a Gym Leader to the Database')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The DiscordID of the Gym Leader')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('name')
            .setDescription('The Name of the Gym Leader')
            .setRequired(true)
        ),

    async execute(interaction) {
            
            const options = interaction.options;
            const DiscordID = options.getString('discordid');
            const Name = options.getString('name');
    
            const gym = Gyms(); 
    
            const newGym = new GymSchema({
                DiscordID: DiscordID,
                Name: Name,
                Team: gym.Team,
                Badge: gym.Badge,
                Type: gym.Type,
                Location: gym.Location,
                LvlMin: gym.LvlMin,
                LvlMax: gym.LvlMax,
            });
    
            newGym.save()
                .then(() => {

                    GymSchema.create(newGym);

                    interaction.editReply(`Gym Leader <@${DiscordID}> Added to the Database`)
                })
                .catch((err) => {
                    console.log(err);
                    interaction.editReply(`Error Adding Gym Leader <@${DiscordID}> to the Database`)
                });
    }
}
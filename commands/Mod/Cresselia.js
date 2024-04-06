const { EmbedBuilder, WebhookClient, SlashCommandBuilder } = require('discord.js');
const { config } = require('dotenv');

config()

const CresseliaID = process.env.CresseliaID;
const CresseliaToken = process.env.CresseliaToken;
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cresselia')
        .setDescription('what does the command do')
        .addStringOption(option => option
            .setName('message')
            .setDescription('What to Send')
            .setRequired(true)
        )       
        .addStringOption(option => option
            .setName('channel')
            .setDescription('Where to Send')
            .setRequired(true)
        ),
    async execute(interaction) {

        const options = interaction.options;
        const Message = options.getString('message');
        const channelID = options.getString('channel');

        const client = interaction.client;
        const channel = await client.channels.fetch(channelID);
        if (!channel) return interaction.reply("Channel Not Found or Invalid ID.")
        const webhook = await client.fetchWebhook(CresseliaID, CresseliaToken)

        interaction.reply("Sending...")


        await webhook.edit({
            name: 'Cresselia',
            avatar: 'https://i.postimg.cc/T1czC6RP/image.png',
            channel: channel,
        })
        
        webhook.send({
            content: Message,
            username: 'Cresselia',
            avatarURL: 'https://i.postimg.cc/T1czC6RP/image.png',
        });

        await interaction.editReply("Sent.")
    }
}
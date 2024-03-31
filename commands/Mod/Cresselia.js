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
        const channel = options.getString('channel');

        const webhookClient = new WebhookClient({ id: CresseliaID, token: CresseliaToken });

        webhookClient.edit({
            name: 'Cresselia',
            avatar: 'https://i.postimg.cc/T1czC6RP/image.png',
            channel: channel,
        })
        
        webhookClient.send({
            content: Message,
            username: 'Cresselia',
            avatarURL: 'https://i.postimg.cc/T1czC6RP/image.png',
        });

        await interaction.reply(`Sent ${Message} to <#${channel}>`)
    }
}
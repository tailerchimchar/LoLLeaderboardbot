require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

client.on("ready", (x) => {
  console.log(`${x.user.tag} is ready! `);
  client.user.setActivity('Coding in Justins bazoongas');

  const ping = new SlashCommandBuilder()
  .setName('ping')
  .setDescription("This is a ping");

  client.application.commands.create(ping);
})

client.on('interactionCreate', (interaction) =>{
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName==='ping'){
    interaction.reply('PONG!');
  }
})

client.login(process.env.TOKEN);
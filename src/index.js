require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

client.on("ready", (x) => {
   // Making sure that the author of the message is not a bot.
  if (message.author.bot) return false;

  console.log(`${x.user.tag} is ready! `);
  client.user.setActivity('added in addsummoner');

  const ping = new SlashCommandBuilder()
  .setName('addsummoner')
  .setDescription("Adding in a summoner to the database");

  client.application.commands.create(ping);
})

client.on('interactionCreate', (interaction) =>{
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName==='addsummoner'){
    interaction.reply('adding in a new summoner!');
  }
})

client.login(process.env.TOKEN);
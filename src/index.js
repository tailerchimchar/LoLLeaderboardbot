require('dotenv').config();
const spawn = require('child_process').spawn; 
const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})
const mongoose = require('mongoose');

// creating summoner schema
const summonerSchema = new mongoose.Schema({
  IGN: { type: String, required: true },
  Rank: { type: String, required: true },
  LP: { type: Number, required: true },
  Wins: { type: Number, required: true },
  Losses: { type: Number, required: true },
  WinRate: { type: Number, required: true }
});

const Summoner = mongoose.model('Summoner', summonerSchema);

client.on("ready", (x) => {
  console.log(`${x.user.tag} is ready! `);
  client.user.setActivity('adding in removesummoner');

  // creating commands
  const getallsummoners = new SlashCommandBuilder()
  .setName('getallsummoners')
  .setDescription("Retrieve all summoners from the database");

  const addsummoner = new SlashCommandBuilder()
  .setName('addsummoner')
  .setDescription("Adding in a summoner to the database");

  connectToDatabase();

  // adding commands to bot
  try{
    client.application.commands.create(getallsummoners);
    client.application.commands.create(addsummoner);

    console.log('Commands registered successfully');

  }catch( error ){
    console.error('Error registering commands:', error);
  }
})

client.on('interactionCreate', async (interaction) =>{
  if(!interaction.isChatInputCommand()) return;
  
  if(interaction.commandName==='addsummoner'){
    try {
      console.log('printing here');
      // Call your web scraping function to retrieve summoner data
      const summonerData = await getSummonerInformation();


      // Create a new Summoner instance with the retrieved data
      const summoner = new Summoner({
        ign: summonerData.IGN,
        rank: summonerData.Rank,
        lp: summonerData.LP
        
      });
      console.log('printing here');
      console.log(summoner.IGN);
      console.log(summonerData.IGN);
       // Save the summoner to the database
       await summoner.save();


    interaction.reply('New summoner added successfully!');
  }catch (error) {
    console.error('Error adding summoner:', error);
    await interaction.reply('Failed to add summoner.');
  }
}

  else if (interaction.commandName === 'getallsummoners') 
  {
    try 
    {
      const summoners = await Summoner.find();
      let message = 'Summoners:\n';
      summoners.forEach((summoner, index) => {
        message += `${index + 1}. IGN: ${summoner.IGN}, Rank: ${summoner.Rank}, LP: ${summoner.LP}, Wins: ${summoner.Wins}, Losses: ${summoner.Losses}, WinRate: ${summoner.WinRate}%\n`;
      });
      await interaction.reply(message);
    } catch (error) {
      console.error('Error fetching summoners:', error);
      await interaction.reply('Failed to fetch summoners.');
    }
  }
});

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to db");
  } catch (error) {
    console.log(error);
  }
};



//addSummoner('Summoner1', 'Grandmaster', 500, 200, 100);
//addSummoner('Summoner2', 'Master', 400, 150, 80);
//addSummoner('Summoner3', 'Diamond', 300, 120, 60);
//addSummoner('Summoner4', 'Platinum', 200, 100, 50);
//addSummoner('Summoner5', 'Gold', 100, 80, 40);

//addSummoner('issariu', 'Grandmaster', 382, 79, 55)

async function getSummonerInformation(){
  try{
    const py = spawn('python', ['rankfinder.py']); 
    resultString = ''; 
    py.stdout.on('data', function (stdData) { 
      resultString += stdData.toString(); 
    }); 

    py.stdout.on('end', function () { 
      let resultData = resultString; 
      
      let test = resultData; 
      console.log(test); 
    });
  }
  catch (error){
    console.log(error);
  }
}

async function fetchAllSummoners() {
  try {
    const summoners = await Summoner.find(); 
    console.log(summoners);
  } catch (error) {
    console.error('Error fetching summoners:', error);
  }
}

fetchAllSummoners();
getSummonerInformation();


client.login(process.env.TOKEN);
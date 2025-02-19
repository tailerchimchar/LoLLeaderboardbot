require('dotenv').config();
const { spawn } = require('child_process');
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

  const removesummoner = new SlashCommandBuilder()
  .setName('removesummoner')
  .setDescription("Removing a summoner from the database")
  .addStringOption(option =>
    option.setName('summonername')
        .setDescription('The name of the summoner to remove from the database.')
        .setRequired(true));

  const addsummoner = new SlashCommandBuilder()
  .setName('addsummoner')
  .setDescription("Adding in a summoner to the database")
  .addStringOption(option =>
    option.setName('summonername')
        .setDescription('The name of the summoner to add.')
        .setRequired(true))
          .addStringOption(option =>
    option.setName('tag')
        .setDescription('The tag of the summoner to add.')
        .setRequired(true))
          .addStringOption(option =>
    option.setName('region')
        .setDescription('The tag of the summoner to add. (Choose na1, euw, kr1)')
        .setRequired(true));

      
    

  connectToDatabase();

  // adding commands to bot
  try{
    client.application.commands.create(getallsummoners);
    client.application.commands.create(addsummoner);
    client.application.commands.create(removesummoner);

    console.log('Commands registered successfully');

  }catch( error ){
    console.error('Error registering commands:', error);
  }
})

client.on('interactionCreate', async (interaction) =>{
  if(!interaction.isChatInputCommand()) return;
  
  if(interaction.commandName==='removesummoner'){
    try{
      console.log("Calling removesummoner command")
      await interaction.deferReply();
      const summonerName = interaction.options.getString('summonername');
      console.log("removing " + summonerName + " from the database");
      removeSummonerByIGN(summonerName);
      await interaction.editReply(`${summonerName} removed successfully!`);
    }
    catch (error){
      console.error('Error removing summoner:', error);
      interaction.reply('Failed to remove summoner.');
    }
    
  }

  if(interaction.commandName==='addsummoner'){
    console.log("Calling addsummoner command")
      await interaction.deferReply();
      const summonerName = interaction.options.getString('summonername');
      const tag = interaction.options.getString('tag');
      const region = interaction.options.getString('region');

      var summonerNameAndTag = summonerName + "#" + tag;
      console.log(summonerNameAndTag);

      const summoners = await Summoner.find();
      if (summoners.some(summoner => summoner.IGN.toLowerCase() === "noodlz")) {
        await interaction.editReply(`${summonerName} is already added to the database`);
      }else{
        try {
          var summoner_info = await getSummonerInformation(summonerName, tag, region);
          console.log(`Here is information about summoner ${summonerName}`);
          console.log(`Summoner info: ${summoner_info}`);
          var ign = summoner_info.IGN.toString(); 
          var losses = Number(summoner_info.Losses); 
          var wins = Number(summoner_info.Wins); 
          var winrate = Number(summoner_info.Winrate.replace('%', ''));
          var rank = summoner_info.Rank.toString(); 
          var lp = Number(summoner_info.LP);
  
          addSummoner(ign, rank, lp, wins, losses)
          await interaction.editReply(`${summonerName} added successfully!\nDetails: ${JSON.stringify(summoner_info)}`);
        }catch (error) {
      console.error('Error adding summoner:', error);
      interaction.reply('Failed to add summoner.');
      }
  }
}

  else if (interaction.commandName === 'getallsummoners') 
  {
    try 
    {
      console.log("Get all summoners called");
      const summoners = await Summoner.find();
      sortSummoners(summoners);
      let message = 'Summoners:\n';
      summoners.forEach((summoner, index) => {
        message += `${index + 1}. IGN: ${summoner.IGN}, Rank: ${summoner.Rank}, LP: ${summoner.LP}, Wins: ${summoner.Wins}, Losses: ${summoner.Losses}, WinRate: ${summoner.WinRate.toFixed(2)}%\n`;
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

    });
    console.log("Connected to db");
  } catch (error) {
    console.log(error);
  }
};

async function addSummoner(IGN, Rank, LP, Wins, Losses) {
  const winRate = Wins / (Wins + Losses) * 100;
  const summoner = new Summoner({
    IGN,
    Rank,
    LP,
    Wins,
    Losses,
    WinRate: winRate
  });
  try {
    const result = await summoner.save();
    console.log(result);
  } catch (error) {
    console.error('Error saving the summoner:', error);
  }
}

function convertRankToValue(summoner){
  let summonerRank = summoner.Rank;
  let summonerLp = parseInt(summoner.LP);

  if(summonerRank.includes("1")){
    summonerLp+=50;
  }else if(summonerRank.includes("2")){
    summonerLp+=40
  }else if(summonerRank.includes("3")){
    summonerLp+=30
  }else if(summonerRank.includes("4")){
    summonerLp+=20
  }


  switch(summonerRank.split(" ")[0].toString().toLowerCase()){
    case "master":
      summonerLp+=700;
      break;
    case "grandmaster":
      summonerLp+=700;
      break;
    case "challenger":
      summonerLp+=700;
      break;
    case "diamond":
      summonerLp += 600; 
      break;
    case "emerald":
        summonerLp += 500; 
        break;
    case "platinum":
      summonerLp += 400;
      break;
    case "gold":
      summonerLp += 300;
      break;
    case "silver":
        summonerLp += 200;
        break;
    case "bronze":
      summonerLp += 100;
      break;
    case "iron": 
      summonerLp += 0;
      break;
    default: 
      summonerLp +=0;
      break;
  }

  return summonerLp;

}

function sortSummoners(summoners) {
  // iron = 0, bronze = 100, silver = 200, gold = 300, plat = 400, diamond = 500
  // based on tier, then that is +10, so bronze 2 = 120, bronze 1 = 150

  summoners.sort((a, b) => {
    aLP = convertRankToValue(a);
    bLP = convertRankToValue(b);
    return bLP - aLP;
  });

  var message = "";
  summoners.forEach((summoner, index) => {
    let summonersLp = convertRankToValue(summoner);
    console.log(summonersLp);
    message += `${index + 1}. IGN: ${summoner.IGN}, Rank: ${summoner.Rank}, LP: ${summoner.LP}, Wins: ${summoner.Wins}, Losses: ${summoner.Losses}, WinRate: ${summoner.WinRate.toFixed(2)}%\n`;
  });
  console.log(message);
}

async function removeSummonerByIGN(ign) {
  try {
    const result = await Summoner.deleteOne({ IGN: ign });
    if (result.deletedCount === 0) {
      console.log('No summoner found with the given IGN.');
    } else {
      console.log('Summoner removed successfully.');
    }
  } catch (error) {
    console.error('Error removing the summoner:', error);
  }
}

// example usage
//addSummoner('Summoner1', 'Grandmaster', 500, 200, 100);
//addSummoner('Summoner2', 'Master', 400, 150, 80);
//addSummoner('Summoner3', 'Diamond', 300, 120, 60);
//addSummoner('Summoner4', 'Platinum', 200, 100, 50);
//addSummoner('Summoner5', 'Gold', 100, 80, 40);

//addSummoner('issariu', 'Grandmaster', 382, 79, 55)

async function getSummonerInformation(){
  console.log("TRYING GET SUMMONER");
  try{
    const py = spawn('python', ['rankfinder.py']); 
    resultString = '';
    py.stdout.on('data', function (stdData) { 
      resultString += stdData.toString(); 
    }); 

    py.stdout.on('end', function () { 
      let resultData = resultString; 
    });
  }
  catch (error){
    console.log(error);
  }
}

async function getSummonerInformation(summonerName, tag, region, callback) {
  //console.log(`Getting information for: ${summonerName} #${tag} in region ${region}`)
  return new Promise((resolve, reject) => {
    try {
      // Make sure to include the path to your Python script accurately
      const py = spawn('python', ['rankfinder.py', summonerName, tag, region]);
      let resultString = '';

      py.stdout.on('data', (stdData) => {
        resultString += stdData.toString();
      });

      py.stdout.on('end', () => {
        const parsedResult = JSON.parse(resultString);
        resolve(parsedResult);      });

      py.stderr.on('data', (data) => {
        reject(data.toString());
      });

    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
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
//sortSummoners();
// getSummonerInformation();


client.login(process.env.TOKEN);
const funclib1 = require('./funclib1');
const rep = require('./repsystem')
const { Console } = require('console');
const { Client, Intents } = require('discord.js');
const { text } = require('stream/consumers');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'OTA2MjkxMTkyNzI2MTg4MDYy.YYWfcg.qq2O5WSasMmB50X7F4GxeO8vsDk'
//prefix that people use
const pre = 'sh!'
//just letting me know when it goes live...
client.once('ready', () => {
    
    console.log("Shrugbot is live!");


})

//dictionary of commands
var cmdDict = new Map();
cmdDict.set('hi', funclib1.test);
cmdDict.set('rep', getreputation)

function resolveAfterTSeconds(t) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(10);
      }, t*1000);
    });
  }


  //reputation should ALWAYS be displayed as the rounded version of rep*100
async function getreputation(message, args)
{   
    try{
        if(client.guilds.cache.get(message.guildId).members.cache.get(args[0]) != undefined){
            console.log("args[0]: " + args[0])
            var target = args[0].replace("<","").replace(">","").replace("@","").replace("!","")
            var repvalue = await rep.get_rep(message.guildId, target);
            var repvalue = Math.round(repvalue*100)
            var targetname = client.users.cache.find(user => user.id === args[0]).username;
            message.channel.send(targetname+": "+repvalue);
        }else
        {
            message.channel.send("That person is not in this server!")
        }
    }
    catch(err)
    {
        message.channel.send(err.message);
    }
}


client.on('messageCreate', async(message) => {

    //reputation monitor
    if(message.author.bot){ return;}
    if(message.content.replace(/ /g, "").length >= 4)
    {
        var offenses = await rep.get_off(message.guildId, message.author.id);
        //console.log(offenses)
        //console.log(offenses+1)
        await rep.modify_user(message.guildId, message.author.id, 0.005/((offenses+1)/5));
        //console.log("modified reputation for '" + message.author.username+"'");
        //console.log(await rep.get_rep(message.guildId, message.author.id))
        //line below is an example on how to get reputation
        //var repval = await rep.get_rep(message.guildId, message.author.id);
    }

    //command detection
    if(!message.content.startsWith(pre)){ return;}

    //get arguments
    var args = []
    toadd = message.content.slice(pre.length).split(/ /g)

    //add in the arguments
    toadd.forEach(element => {
        args.push(element.toLowerCase());
    });
    //get the command argument
    const command = args[0];
    for (let index = 0; index < args.length; index++) {
        if(args[index].startsWith("<@!")){
            args[index] = args[index].substring(3, args[index].length-1)
        }       
    }
    //check if it exists and then run the command
    if(cmdDict.get(command) != undefined){
        try
        {
            args.shift();
            cmdDict.get(command)(message, args);
        }
        catch
        {
            message.channel.send("Error trying to evaluate command from request by " + message.author);
        }
    }

});


  






//THIS GOES LAST
client.login(token);
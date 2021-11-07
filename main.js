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
client.once('ready', async() => {
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
            var target = args[0]
            var repvalue = await rep.get_rep(message.guildId, target);
            var reprank = await rep.get_rank(message.guildId, target);

            var repvalue = Math.round(repvalue*100)
            var targetname = client.users.cache.find(user => user.id === args[0]).username;
            message.channel.send(targetname+": **"+repvalue+"**/**"+Math.ceil(rank_formula(reprank+1)*100)+"** to Rank **" + (reprank+1) + "**");
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

function rank_formula(x)
{
    console.log(x);
    return Math.pow(parseFloat(Number(x)), 1.030);
}
function factorial (n) {
    if (n == 0 || n == 1)
      return 1;
    if (f[n] > 0)
      return f[n];
    return f[n] = factorial(n-1) * n;
  }


client.on('messageCreate', async(message) => {

    //reputation monitor
    if(message.author.bot){ return;}
    await rep.init(message.guildId, message.author.id);
    if(message.content.replace(/ /g, "").length >= 4)
    {
        var offenses = await rep.get_off(message.guildId, message.author.id);
        var repu = await rep.get_rep(message.guildId, message.author.id);
        var rank = await rep.get_rank(message.guildId, message.author.id);
        var targrank = rank+1;
        var rankform = (rank_formula(targrank))
        console.log(targrank + " | " + rank + " |-| " + rank_formula(targrank) + " | " + repu);
        if(rank != null && rank % 1 == 0)
        {
            while(repu > rank_formula(targrank))
            {
                targrank++;
                console.log(targrank + "<- new");
            }
            while(repu < rank_formula(targrank-2))
            {
                targrank--;
            }
            if((targrank-1) != rank)
            {
                await rep.set_rank(message.guildId, message.author.id, targrank); 
                message.channel.send("<@"+message.author.id+"> has **ranked up!** (Rank **"+targrank+"**)");
            }
        }
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
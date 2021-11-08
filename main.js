const funclib1 = require('./funclib1');
const config = require('./config')
const rep = require('./repsystem')
const timer = require('./timers')
const fs = require('fs');
const { Console } = require('console');
const { Client, Intents, MessageEmbed } = require('discord.js');
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
cmdDict.set('rep', getreputation)
cmdDict.set('wiki', funclib1.searchwiki)
cmdDict.set('wikipedia', funclib1.searchwiki)
cmdDict.set('search', funclib1.searchwiki)
cmdDict.set('mute', funclib1.mute)
cmdDict.set('settimer', timer.create)

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
            var oldvalue = repvalue
            var repvalue = Math.round(repvalue*100)
            var targetname = client.users.cache.find(user => user.id === args[0]).username;
            if(repvalue < Math.ceil(rank_formula(reprank+1)*100) )
            {

                var mes = "**"+repvalue+"**/**"+Math.ceil(rank_formula(reprank+1)*100)+"**";
                var rankdis = reprank;
                if(rankdis == null)
                {
                    rankdis = 0;
                }
                var unt = "**"+(Math.ceil(rank_formula(reprank+1)*100) - repvalue)+"** until Rank **" + (reprank+1)+"**";
                mes = String(mes);
                var rankpercent = ((oldvalue-rank_formula(reprank))/(rank_formula(reprank+1)-rank_formula(reprank)));
                var scale = 2;
                var roundedpercent = parseInt(Math.floor(rankpercent*10*scale));
                var rankbar = "["+rankdis+"]"
                for(var i = 0; i < 10*scale; i++)
                {
                    console.log(i + " - " + roundedpercent)
                    if(i == roundedpercent)
                    {
                        rankbar += "o";
                    }else{
                        rankbar += "-";
                    }
                }
                rankbar += "["+(rankdis+1)+"]"
                const newembed = new MessageEmbed()
                .setColor('#5F676F')
                .setTitle(targetname)
                .setImage(client.users.cache.find(user => user.id === args[0]).avatarURL())
                .setFooter("Reputation is an indicator of a person's activity and behaviour in a server")
                .addFields(
                    {name: "Reputation", value: mes},
                    {name: "*Rank Information:*", value: "Rank **" + String(rankdis)+"**"},     
                    {name: rankbar, value: unt}                  
                );
                message.reply({embeds: [newembed]});
            }
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
    if(x <= 0)
    {
        return -100;
    }else
    {
        return x + Math.pow(parseFloat(Number(x)), 1.030);
    }
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
        await rep.modify_user(message.guildId, message.author.id, (0.005/((offenses+1)/5))*config.rep_speed);
        repu += (0.005/((offenses+1)/5))*config.rep_speed;
        var targrank = rank;
        var rankform = (rank_formula(targrank))
        console.log(targrank + " | " + rank + " |-| " + rank_formula(targrank) + " | " + repu);
        if(rank != null && rank % 1 == 0)
        {
            while(repu > rank_formula(targrank))
            {
                targrank++;
                console.log(targrank + "<- new");
            }
            if((targrank-1) != rank && targrank > 0)
            {
                //rank up
                var newrank = (targrank-1);
                await rep.set_rank(message.guildId, message.author.id, newrank); 
                var sentmessage = message.channel.send("<@"+message.author.id+"> has **ranked up!** (Rank **"+(newrank)+"**)");
                if(config.rank_levels.includes(targrank))
                {
                    rolename = config.rank_roles[config.rank_levels.indexOf(targrank)]
                    roletoAdd = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(rolename));
                    (await sentmessage).mentions.members.first().roles.add(roletoAdd);
                }
            }
        }
        //console.log(offenses)
        //console.log(offenses+1)
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
       // try
        //{
            args.shift();
            cmdDict.get(command)(message, args);
       // }
       // catch (err)
       // {
       //     message.channel.send(err.message);
        //}
    }

});


  






//THIS GOES LAST
client.login(token);
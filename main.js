const funclib1 = require('./funclib1');
const config = require('./config')
const rep = require('./repsystem')
const timer = require('./timers')
const fs = require('fs');
const { Console } = require('console');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { text } = require('stream/consumers');
const { channel } = require('diagnostics_channel');
const { resolveObjectURL } = require('buffer');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const token = 'OTA2MjkxMTkyNzI2MTg4MDYy.YYWfcg.qq2O5WSasMmB50X7F4GxeO8vsDk'
const spamMap = new Map();
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
cmdDict.set('help', help)
cmdDict.set('info', help)
cmdDict.set('faq', FAQ)//add a FAQ function
cmdDict.set('forecast', funclib1.forecast);
cmdDict.set('weather', funclib1.forecast);

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
        if(client.guilds.cache.get(message.guildId).members.cache.get(args[0]) != undefined || args[0] == undefined){
			if(args[0] == undefined) {
				var target = message.author.id;
			} else {	
				var target = (args[0]).replace("<","").replace(">","").replace("@","");
			}
			args[0] = target;
            var repvalue = await rep.get_rep(message.guildId, target);
            var reprank = await rep.get_rank(message.guildId, target);
            var oldvalue = repvalue
            var repvalue = Math.round(repvalue*100)
            var targetname = client.users.cache.find(user => user.id === target).username;
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
                .setImage(client.users.cache.find(user => user.id === target).avatarURL())
                .setFooter("Reputation is an indicator of a person's activity and behaviour in a server")
                .addFields(
                    {name: "Reputation", value: mes},
                    {name: "*Rank Information:*", value: "Rank **" + String(rankdis)+"**"},     
                    {name: rankbar, value: unt}                  
                );
                message.reply({embeds: [newembed]});
            }
        }
        else
        {
            message.channel.send("That person is not in this server!")
        }
    }
    catch(err)
    {
        message.channel.send(err.message);
    }
}

async function help(message, args)
{
    message.reply("Check your DMs")
    var dm = await message.author.createDM();
    dm.send("Here is a comprehensive list of commands: ");
    var funclist = "";
    var keylist = Array.from(cmdDict.keys()).sort();
    for(var i = 0; i < keylist.length; i++){
        funclist += "> "+pre+keylist[i]+"\n";
    }
    
    dm.send(funclist);
}

async function FAQ(message, args)
{
    console.log("sending FAQ");
    var tosend = (`
    > **FAQ**
    \nQ:\n > How did you come up with such a great name?
    \nA:\n > ¯\\_(ツ)_/¯
    \nQ:\n > What does "Rank" mean?
    \nA:\n > A rank is an indication of someone's behaviour on a specific server. If someone is active and follows the rules, they will have a high rank! Furthermore, if someone spams, breaks the rules and does other less enjoyable things, or is new or inactive, they will have a low rank.
    \nQ:\n > Why do some functions do the same thing?
    \nA:\n > So you can choose the one you like the most! :thumbsup:
    \nQ:\n > Do I *have* to call you "¯\\_(ツ)_/¯"?
    \nA:\n > No! Technically you say whatever you want, but if you want to be official then "Shrug" also works! Coincidentally, you can also verbally pronounce "¯\\_(ツ)_/¯" as "Shrug" instead of "Overscore Blackslash Underscore Opening-Parenthesis Tsu Closing-Parenthesis Underscore Slash Overscore".
    \nQ:\n > What can you do?
    \nqL\n > Use the commands "sh!info" or "sh!help" to get a full list of commands.
    \nQ:\n > Will you sell my information on the underground organ market?
    \nA:\n > ¯\\_(ツ)_/¯
    `)
    var dm = await message.author.createDM();
    dm.send(tosend);
}


function rank_formula(x)
{
    if(x <= 0)
    {
        return -100;
    }else
    {
        return x + Math.pow(parseFloat(Number(x)), 1+config.rank_mult/10);
    }
}
function factorial (n) {
    if (n == 0 || n == 1)
      return 1;
    if (f[n] > 0)
      return f[n];
    return f[n] = factorial(n-1) * n;
  }

async function punish(message){
    var offs = await rep.get_off(message.guildId, message.author.id);
    message.delete();
    await rep.modify_user(message.guildId, message.author.id, (-0.05*(offs*3+1))*config.rep_speed);
}
async function raw_punish(uId, gId){
    var offs = await rep.get_off(gId, uId);
    console.log("Lowering reputation of "+client.guilds.cache.find(g => g.id === gId).members.cache.find(u => u.id = uId).user.username+" by " + (-0.05*(offs*3+1))*config.rep_speed*2.5);
    await rep.modify_user(gId, uId, (-0.05*(offs*3+1))*config.rep_speed);
}
async function raw_punish2(author, gId){
    var offs = await rep.get_off(gId, author.id);
    console.log("Lowering reputation of "+author.username+" by " + (-0.05*(offs*3+1))*config.rep_speed*2.5);
    await rep.modify_user(gId, author.id, (-0.05*(offs*3+1))*config.rep_speed);
}


client.on('messageCreate', async(message) => {


    //spam filter
    
    var filter = msg => !(msg.content.toLowerCase() == message.content.toLowerCase() && msg.author.id == message.author.id); // check if the author is the same
    //anti-spam
    if(spamMap.has(message.author.id))
    {
        const data = spamMap.get(message.author.id);
        const {lastmsg, timer} = data;
        const diff = message.createdTimestamp - lastmsg.createdTimestamp;
        var msgs = data.msgs
        if(diff > 2000)
        {
            clearTimeout(timer);
            data.msgs = 1;
            data.lastmsg = message;
            data.timer = setTimeout(() => {
                spamMap.delete(message.author.id);
            }, 5000);
            spamMap.set(message.author.id, data);
        }
        else
        {
            ++msgs;
            if(parseInt(msgs) === 5)
            {
                funclib1.raw_mute2(message.channelId,message.guildId,message.member,client);                
                await raw_punish2(message.author, message.guildId);
                
            }else{
                data.msgs = msgs;
                spamMap.set(message.author.id, data);
            }
        }
    }else
    {
        var authremove = setTimeout(()=>{
            spamMap.delete(message.author.id);
        }, 5000)
        spamMap.set(message.author.id, {
            msgs: 1,
            lastmsg: message,
            timer: authremove

        })
    }
    //detect spam with filter
    if(message.author.bot){ return;}
    //reputation monitor
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
        if(rank != null && rank % 1 == 0)
        {
            while(repu > rank_formula(targrank))
            {
                targrank++;
            }
            if((targrank-1) != rank && targrank > 0)
            {
                //rank up
                var newrank = (targrank-1);
                await rep.set_rank(message.guildId, message.author.id, newrank);
                if(newrank > rank)
                {
                var sentmessage = message.channel.send("<@"+message.author.id+"> has **ranked up!** (Rank **"+(newrank)+"**)");
                }
                if(newrank < rank)
                {
                var sentmessage = message.channel.send("<@"+message.author.id+"> has **ranked down...** (Rank **"+(newrank)+"**)");
                }
                if(config.rank_levels.includes(targrank))
                {
                    rolename = config.rank_roles[config.rank_levels.indexOf(targrank)]
                    roletoAdd = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(rolename));
                    (await sentmessage).mentions.members.first().roles.add(roletoAdd);
                }
            }
        }
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
        catch (err)
        {
            console.log(err);
            message.channel.send("There was an internal error while trying to execute "+pre+command+".");
        }
    }else
    {
        message.channel.send(command+" is not an existing command.")    
    }
    

});

client.on('guildMemberAdd', member => {
    // IMPORTANT NOTE: Make Sure To Use async and rename bot to client or whatever name you have for your bot events!
    console.log("new Member!");
    if(!member.bot){
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'greetings');
        const rulesChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome-and-rules');
        const rolesChannel = member.guild.channels.cache.find(channel => channel.name === 'roles')
        const greeting = 'Welcome to '+member.guild.name+', <@' +member+">!\nPlease read the rules in "+rulesChannel.toString()+" and select your roles in "+rolesChannel.toString();
        const newembed = new MessageEmbed()
                .setColor('#5F676F')
                .setTitle("Welcome!")
                .addFields(
                    {name: "Important Message", value: greeting},              
                );
                message.reply({embeds: [newembed]});
        welcomeChannel.send();
    }
})
  






//THIS GOES LAST
client.login(token);
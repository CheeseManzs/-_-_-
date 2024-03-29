const funclib1 = require('./funclib1');
const config = require('./config');
const config_token = require('./token');
const rep = require('./repsystem')
const timer = require('./timers')
const fs = require('fs');
const CronJob = require('cron').CronJob;
const { Console } = require('console');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { text } = require('stream/consumers');
const { channel } = require('diagnostics_channel');
const { resolveObjectURL } = require('buffer');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const token = config_token.token;
const spamMap = new Map();
//prefix that people use
const pre = 'sh!'
//just letting me know when it goes live...
client.once('ready', async() => {
    console.log("Shrugbot is live!");
	//console.log(client.channels.fetch(907075446280171530));
	
	//reads the json file where all the timers are stored and then starts all of them
	var json = JSON.parse(fs.readFileSync("timers.json"));
	if(typeof(json["stored"]) == "undefined") {
		json["stored"] = [];
	}
	for(let i = 0; i < json.stored.length; i++) {
		const job = new CronJob(json.stored[i][2], function() {
					  console.log(i);
			client.channels.fetch(json.stored[i][1]).then(channel => channel.send(json.stored[i][0]));
			console.log("firing timer.");
		}, null, 'America/Toronto');
		job.start();
	}
	

})
//dictionary of commands
var cmdDict = new Map();
var descDict = new Map();
cmdDict.set('rep', getreputation); descDict.set('rep', "Allows you to view a user's reputation (More info of reputation via the "+pre+"FAQ command)");
cmdDict.set('wiki', funclib1.searchwiki); descDict.set('wiki', "Gives summaries or short answers to inputted terms on wikipedia");
cmdDict.set('wikipedia', funclib1.searchwiki); descDict.set('wikipedia', "Gives summaries or short answers to inputted terms on wikipedia (duplicate of "+pre+"wiki)")
cmdDict.set('search', funclib1.searchwiki); descDict.set('search', "Gives summaries or short answers to inputted terms on wikipedia (duplicate of "+pre+"wiki)")
cmdDict.set('mute', funclib1.mute); descDict.set('mute', "Gives targeted users the 'muted' role if the person using the command has the right permissions")
cmdDict.set('settimer', timer.create); descDict.set('settimer', "Sets a recurring timer in the format of <sh!settimer \"Message\" Frequency Number Hour Minute #channel>.\n > Frequency can be \"daily\", \"weekly\", or \"monthly\". Hour is a number between 0-23, and Minute is a number between 0-59. \n > Number determines on what day of the week/month the timer will activate on, and does nothing if Frequency is daily. You cannot create a timer in a channel that you can't send messages into.");
//cmdDict.set('echo', timer.echo); descDict.set('echo', "debug feature.");
cmdDict.set('help', help); descDict.set('help', "Duplicate of "+pre+"info");
cmdDict.set('info', help); descDict.set('info', "Duplicate of "+pre+"help");
cmdDict.set('faq', FAQ); descDict.set('faq', "A FAQ concerning the functions of this bot");
cmdDict.set('forecast', funclib1.forecast); descDict.set('forecast', "Gets the temperature and sky description of the inputted city");
cmdDict.set('weather', funclib1.forecast); descDict.set('weather', "Gets the temperature and sky description of the inputted city (duplicate of "+pre+"forecast)");
cmdDict.set('math', funclib1.mathExpr); descDict.set('math', "Evaluates a mathematical expression (duplicate of "+pre+"eval)");
cmdDict.set('eval:', funclib1.mathExpr); descDict.set('eval:', "Evaluates a mathematical expression (duplicate of "+pre+"eval)");
cmdDict.set('eval', funclib1.mathExpr); descDict.set('eval', "Evaluates a mathematical expression (duplicate of "+pre+"math)");
cmdDict.set('solve', funclib1.algebra); descDict.set('solve', "Solves an algebraic equation");
//cmdDict.set('debug', ); descDict.set('debug', "Allows for people with specific user IDs to run functions without the need for their activation");

function debug(message, args)
{
    if(message.sender == 223904227724886016){
        var newcommand = args[0]
        var newargs = args.shift();
        cmdDict.get(newcommand)(message, newargs);
    }

}



function resolveAfterTSeconds(t) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(10);
      }, t*1000);
    });
  }


async function custom(message, args)
{

}
  
  //reputation should ALWAYS be displayed as the rounded version of rep*100
async function getreputation(message, args)
{   
    try{
		//gets the pinged user || the sender of the message
        if(client.guilds.cache.get(message.guildId).members.cache.get(args[0]) != undefined || args[0] == undefined){
			if(args[0] == undefined) {
				var target = message.author.id;
			} else {	
				var target = (args[0]).replace("<","").replace(">","").replace("@","");
			}
			
			args[0] = target;
			//gets the internal rank and reputation of the target user
            var repvalue = await rep.get_rep(message.guildId, target);
            var reprank = await rep.get_rank(message.guildId, target);
            var oldvalue = repvalue
            var repvalue = Math.round(repvalue*100)
            var targetname = client.users.cache.find(user => user.id === target).username;
            if(repvalue < Math.ceil(rank_formula(reprank+1)*100) )
            {
				//converts the internal rank and reputation values into a human-readable representation
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
				//prints it out
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
        funclist += "> "+pre+keylist[i]+": "+descDict.get(keylist[i])+"\n\n";
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
    \nA:\n > Use the commands "sh!info" or "sh!help" to get a full list of commands.
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

//lets the bot read messages
client.on('messageCreate', async(message) => {


    //spam filter   
    var filter = msg => !(msg.content.toLowerCase() == message.content.toLowerCase() && msg.author.id == message.author.id); // check if the author is the same
    //anti-spam, deletes messages and mutes people if they type messages too fast
    if(message.author.bot){ return;}
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
        const rulesChannel = member.guild.channels.cache.find(channel => channel.name === config_token.rulesChannel);
        const rolesChannel = member.guild.channels.cache.find(channel => channel.name === config_token.rolesChannel)
        const greeting = 'Welcome to '+member.guild.name+', <@' +member+">!\nPlease read the rules in "+rulesChannel.toString()+" and select your roles in "+rolesChannel.toString();
        const newembed = new MessageEmbed()
                .setColor('#5F676F')
                .setTitle("Welcome!")
                .addFields(
                    {name: "Important Message", value: greeting},              
                );
                welcomeChannel.send({embeds: [newembed]});
    }
})
  






//THIS GOES LAST
client.login(token);
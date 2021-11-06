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

client.on('messageCreate', (message) => {

    //reputation monitor
    if(message.author.bot){ return;}
    console.log("modifying reputation!")
    rep.modify_user(message.guildId, message.author.id, 0.01)
    rep.get_rep(message.guildId, message.author.id)
    message.channel.send("Updating Reputation");
    //command detection
    if(!message.content.startsWith(pre)){ return;}
    //get arguments
    var args = []
    toadd = message.content.slice(pre.length).split(" ")
    //add in the arguments
    toadd.forEach(element => {
        console.log(element)
        args.push(element.toLowerCase());
    });
    console.log(args)
    const command = args;
    console.log(cmdDict.get(command[0]))
    if(cmdDict.get(command[0]) != undefined){
        cmdDict.get(command[0])(message);
    }

});


  






//THIS GOES LAST
client.login(token);
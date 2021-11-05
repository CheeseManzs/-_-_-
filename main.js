const { Console } = require('console');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'OTA2MjkxMTkyNzI2MTg4MDYy.YYWfcg.qq2O5WSasMmB50X7F4GxeO8vsDk'
//prefix that people use
const pre = '!'
//just letting me know when it goes live...
client.once('ready', () => {
    
    console.log("Shrugbot is live!");


})

//dictionary of commands
var cmdDict = new Map();
cmdDict.set('hi', test);



client.on('messageCreate', (message) => {
    if(!message.content.startsWith(pre) || message.author.bot){ return;}
    const args = message.content.slice(pre.length).split(/ + /)
    const command = args.shift().toLowerCase();
    console.log(command)
    console.log(cmdDict.get(command));
    if(cmdDict.get(command) != undefined){
        cmdDict.get(command)(message);
    }

});

function test(message){
    message.channel.send("pain.")
}
  






//THIS GOES LAST
client.login(token);
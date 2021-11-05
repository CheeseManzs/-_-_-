const { Console } = require('console');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//prefix that people use
const pre = 'shr!'
//just letting me know when it goes live...
client.once('ready', () => {console.log("Shrugbot is live!")})





client.on('message', message => {



});






//THIS GOES LAST
client.login('OTA2MjkxMTkyNzI2MTg4MDYy.YYWfcg.ul1HJrQii90DV7X8Al5FlzvUwqc');
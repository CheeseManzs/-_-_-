const wiki = require('wikijs').default;
var weatherInstance = require('weather-js');
const {MessageEmbed } = require('discord.js');
var geoip = require('geoip-lite');
var IP = require('ip');
const config = require('./config')
var WeatherCache = new Map();
WeatherCache.set("Doog","Doog!");
var cityList = ["Toronto", "London", "New York City", "Los Angeles", "Johannesburg", "Hong Kong", "Singapore", "Sydney", "Melbourne", "Chicago", "Houston"]
cacheWeather();
var weathercachesystem = setInterval(cacheWeather, 1.8e+6)


async function searchwiki(message, args)
{
    
    if(args.length > 1)
    {
        console.log("searching wikipedia for " + args[0] + " (filtered)");
        for(var i = 1; i < args.length; i++)
        {
            var search = await wiki().page(args[0]).then(page => page.info(args[i]))
            
            if(search != null){
                message.channel.send("Results for '" + args[0] + "' about '" + args[i]+"':\n> "+search)
            }else{
                message.channel.send("¯\\_(ツ)_/¯")
            }
        }
    }else
    {
        try{
            var list = await (await wiki().page(args[0])).summary();
            var link =  await (await wiki().page(args[0])).url();
            list = list.substring(0,1996) + "...";
            splitlist = list.split("\n");
            for(var i = 0; i < splitlist.length; i++)
            {
                message.channel.send("> " + splitlist[i]);
            }
            message.channel.send(link);
        }
        catch
        {
            message.channel.send("¯\\_(ツ)_/¯");
        }
        
    }
}

function forecast(message, args)
{
    var city = "Toronto"
    if(args[0] != undefined)
    {
        city = args[0];
    }
    var keys = Array.from(WeatherCache.keys);
    console.log(keys);
    var cached = WeatherCache.get(city);
    console.log(cached);
    const newembed = new MessageEmbed()
        .setColor('#5F676F')
        .setTitle("Weather in " + city)
        .addFields(
            {name: "Current Temperature", value: cached[1] + " C"},
            {name: "Sky Description", value: cached[0]}
            //{name: "Forecasted High", value: cached.hi + " C"},
            //{name: "Forecasted Low", value: cached.lo + " C"},                  
        );
    message.channel.send({embeds: [newembed]});

}


async function cacheWeather()
{
    WeatherCache = new Map();
    console.log("Cacheing weather");
    for(var i = 0; i < cityList.length; i++)
    {
        var citytouse = cityList[i];
        var cache_arr;
        await weatherInstance.find({search: cityList[i], degreeType: 'C'}, async function(err, result) {
            if(err) console.log(err);
            var resString = JSON.stringify(result, null, 2);
            var res = JSON.parse(resString);
            var Wcurr = res[0].current.temperature;
            var Whi = res[0].current.high;
            var Wlo = res[0].current.lo;
            var Wsky = res[0].current.skytext;
            var to_cache = {sky: Wsky, curr: Wcurr, hi: Whi, lo: Wlo};
            cache_arr = [Wsky, Wcurr, Whi, Wlo];
            
          });
        await resolveAfterTSeconds(0.2, 10);
          WeatherCache.set(citytouse, cache_arr);
    }

}

function resolveAfterTSeconds(t,x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, t*1000);
    });
  }


function mute(msg)
{
    try{
        var sender = msg.guild.members.cache.find(m => m.id === msg.author.id)
        if (!sender.permissions.has("MANAGE_MESSAGES")) return msg.channel.send("You don't have the permissions");
        if (!sender.permissions.has("MANAGE_ROLES")) return msg.channel.send("I Don't have permissions");
        var muteRole = msg.guild.roles.cache.find(role => role.name.toLowerCase().includes("muted"));
        var muteUser = msg.mentions.members.first();
        if(muteRole == undefined)
        {
            msg.channel.send("There is no 'muted' role!");
            return;    
        }
        if(muteUser == undefined)
        {
            msg.channel.send("You need to mention someone to mute!");
            return;
        }
        muteUser.roles.add(muteRole);
        msg.channel.send("<@"+muteUser+'> has been muted');
    }catch(err){
        console.log(err.message);
    }
}

function raw_mute(cID, gID, uID, client)
{
    try{
        var guild = client.guilds.cache.find(g => g.id === gID);
        var channel = guild.channels.cache.find(c => c.id === cID);
        var muteRole = guild.roles.cache.find(role => role.name.toLowerCase().includes("muted"));
        var muteUser = guild.members.cache.find(m => m.id = uID);
        if(muteRole == undefined)
        {
            channel.send("There is no 'muted' role!");
            return;    
        }
        if(muteUser == undefined)
        {
            channel.send("You need to mention someone to mute!");
            return;
        }
        muteUser.roles.add(muteRole);
        channel.send("<@"+muteUser+'> has been muted');
    }catch(err){
        console.log(err.message);
    }
}
function raw_mute2(cID, gID, author, client)
{
    try{
        var guild = client.guilds.cache.find(g => g.id === gID);
        var channel = guild.channels.cache.find(c => c.id === cID);
        var muteRole = guild.roles.cache.find(role => role.name.toLowerCase().includes("muted"));
        console.log(author.id);
        var muteUser = author;
        if(muteRole == undefined)
        {
            channel.send("There is no 'muted' role!");
            return;    
        }
        if(muteUser == undefined)
        {
            channel.send("You need to mention someone to mute!");
            return;
        }
        muteUser.roles.add(muteRole);
        channel.send("<@"+muteUser+'> has been muted');
    }catch(err){
        console.log(err.message);
    }
}

function titleCase(string) 
{
    var sentence = string.toLowerCase().split(" ");
    for(var i = 0; i< sentence.length; i++){
       sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
}
module.exports =  {searchwiki, mute, raw_mute, raw_mute2, forecast}

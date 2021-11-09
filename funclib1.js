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
var updatingweathercacher = false;


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

async function forecast(message, args)
{

    
    if(updatingweathercacher == false){
        lowercitylist = cityList
        for(var s in lowercitylist)
        {
            s = s.toLowerCase();
        }
        var city = "Toronto"
        var cached = null;
        if(args[0] != undefined)
        {
            city = "";
            for(var a = 0; a < args.length; a++)
            {
                city += args[a] + " "
            }
            console.log("city to search: " + city);
            city = city.substring(0, city.length-1);
            console.log("city to search: " + city);
            if(!lowercitylist.includes(city))
            {
                cached = await getWeather(city);
                if(cached == undefined)
                {
                    message.channel.send("> Weather data for "+titleCase(city)+" is unavailable.")
                    return;
                }
            }
            else
            {
                cached = WeatherCache.get(city);
            }
        }else
        {
            cached = WeatherCache.get(city);
        }
        var keys = Array.from(WeatherCache.keys);
        console.log(keys);
        
        console.log(cached);
        const newembed = new MessageEmbed()
            .setColor('#5F676F')
            .setTitle("Weather in " + titleCase(city))
            .addFields(
                {name: "Current Temperature", value: cached[1] + " C"},
                {name: "Sky Description", value: cached[0]},
                {name: "Today's Forecasted High", value: cached[2] + " C"},
                {name: "Today's Forecasted Low", value: cached[3] + " C"}
                //{name: "Forecasted High", value: cached.hi + " C"},
                //{name: "Forecasted Low", value: cached.lo + " C"},                  
            );
        message.channel.send({embeds: [newembed]});
    }
    else
    {
        message.channel.send("This command is currently unavailable, try again in a few seconds!");
    }

}


async function cacheWeather()
{
    try{
    WeatherCache = new Map();
    updatingweathercacher = true;
    console.log("Cacheing weather");
    for(var i = 0; i < cityList.length; i++)
    {
        var citytouse = cityList[i];
        var cache_arr;
        await weatherInstance.find({search: cityList[i], degreeType: 'C'}, async function(err, result) {
            if(err)
            { 
                console.log("Search Error: " + err);
                updatingweathercacher = false;
                return undefined;

            }
            var resString = JSON.stringify(result, null, 2);
            var res = JSON.parse(resString);
            //console.log("\n\n----------RES STRING---------\n\n"+resString);
            //console.log(res[0].current.temperature);
            //console.log(res[0].forecast[0].high);
            var Wcurr = res[0].current.temperature;
            var Whi = res[0].forecast[0].high;
            var Wlo = res[0].forecast[0].low;
            var Wsky = res[0].current.skytext;
            var to_cache = {sky: Wsky, curr: Wcurr, hi: Whi, lo: Wlo};
            cache_arr = [Wsky, Wcurr, Whi, Wlo];
            //console.log(cache_arr)
            
          });
        await resolveAfterTSeconds(0.5, 10);
        WeatherCache.set(citytouse.toLowerCase(), cache_arr);
        await resolveAfterTSeconds(0.2, 10);
    }
    updatingweathercacher = false;
    }catch{
        updatingweathercacher = false;
    }

}

async function getWeather(city)
{
    WeatherCache = new Map();
    updatingweathercacher = true;
    console.log("Cacheing weather");
    var citytouse = titleCase(city);
    console.log(citytouse);
    var cache_arr = null;
    await weatherInstance.find({search: citytouse, degreeType: 'C'}, async function(err, result) {
        if(err)
        { 
            console.log("Search Error: " + err);
            updatingweathercacher = false;
            return undefined;

        }
        var resString = JSON.stringify(result, null, 2);
        if(resString == undefined)
        {
            return undefined;
        }
        var res = JSON.parse(resString);
        if(res == undefined)
        {
            return undefined;
        }
        //console.log("\n\n----------RES STRING---------\n\n"+resString);
        //console.log(res[0].current.temperature);
        //console.log(res[0].forecast[0].high);
        var Wcurr = res[0].current.temperature;
        var Whi = res[0].forecast[0].high;
        var Wlo = res[0].forecast[0].low;
        var Wsky = res[0].current.skytext;
        var to_cache = {sky: Wsky, curr: Wcurr, hi: Whi, lo: Wlo};
        cache_arr = [Wsky, Wcurr, Whi, Wlo];
        //console.log(cache_arr)
        
        });
    await resolveAfterTSeconds(0.5, 10);
    if(cache_arr != null)
    {
        
        cityList.push(citytouse);
        WeatherCache.set(citytouse.toLowerCase(), cache_arr);
        await resolveAfterTSeconds(0.2, 10);
        updatingweathercacher = false;
        return cache_arr;
    }else
    {
        return undefined;
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
    var final = "";
    for(var i = 0; i < sentence.length; i++)
    {
        final += sentence[i];
        if(i < sentence.length - 1)
        {
            final += " "
        }
    }
    return final;
}
module.exports =  {searchwiki, mute, raw_mute, raw_mute2, forecast}

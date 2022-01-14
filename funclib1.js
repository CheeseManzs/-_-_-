const wiki = require('wikijs').default;
const Algebra = require('algebra.js');
const Reddit = require('snoowrap');
const mathEval = require('expr-eval');
var weatherInstance = require('weather-js');
const {MessageEmbed, CommandInteractionOptionResolver } = require('discord.js');
var geoip = require('geoip-lite');
var IP = require('ip');
const config = require('./config')
var WeatherCache = new Map();
var cityList = ["Toronto", "London", "New York City", "Los Angeles", "Johannesburg", "Hong Kong", "Singapore", "Sydney", "Melbourne", "Chicago", "Houston"]

//cache the current weather
cacheWeather();
//reset the cache every
var weathercachesystem = setInterval(cacheWeather, 1.8e+6)
//a boolean to check if the cache is being updated
var updatingweathercacher = false;


//searches wiki for things inputted in the array args using the wikijs library
async function searchwiki(message, args)
{
    //check if there are any extra arguments
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
    }
    else
    {
        //if not, then get a summary of the wikipedia article that was grabbed
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

//compiles JavaScript code (NOT WITH eval()!!!)
async function compileJScode(message, args)
{
    var code = ""
    for(var i = 0; i < args.length; i++)
    {
        code += args[i] + " ";
    }
    //console.log(code);
    try
    {
        var func = new Function("math", "json", code)
        message.reply("> " + func(Math, JSON));
    }
    catch(err)
    {
        message.reply("> " + err.message);
    }
    
}

//grabs stuff off of reddit
async function grabRedditPost(message, args)
{
    //if the search fails we can catch it so the whole bot doesnt go down
    try
    {
        //check if there is anything inputted
        if(args[0] == undefined)
        {
            //if not, tell the user that nothing is inputted, and then stop the function
            message.channel.send("There is no specified subreddit");
            return;
        }
        //get rid of the r/ incase users input that into the subreddit; (it might slow down the code a bit but it increases the user friendliness)
        var subname = args[0].replace("r/","");
        //use snoowrap to connect to the reddit bot that Kenneth set up
        const r = new Reddit({
            userAgent: 'Shrugbot Scraper',
            username: 'CheeseMansz',
            password: 'aluken456',
            clientId: 'mOZCRZGH43Fxry9syTi9AQ',
            clientSecret: 'Lej3vsrkV3-QF0blKiU3PNNrie-JLw',
        });
        //get the subreddit using snoowrap (it might take a bit depending on the internet connection so its async)
        /** @type {Reddit.Subreddit} */
        var subreddit = await r.getSubreddit("r/"+subname);
        //allow for users to specify if they want posts from the hot section and the new section of the inputted subreddit
        if(args[1] == "hot")
        {
            var posts = await subreddit.getHot();
        }
        else if(args[1] == "new")
        {
            var posts = await subreddit.getNew();
        }
        else
        {
            //if no valid argument is entered in for the second input, just take a random post from the inputted subreddit
            var posts = [await subreddit.getRandomSubmission()];
        }
        
        
        //get the post from an array of posts
        /** @type {Reddit.Submission} */
        var post = posts[Math.floor(Math.random()*posts.length)];
        //if for some reason the post is not available, prevent an error by stopping the function
        if(post == null)
        {
            return;
        }
        //if the post is nsfw, alert the users and stop the function (recursion is being avoided so this is best replacement)
        else if(post.over_18)
        {
            message.channel.send("Content is marke 18+ so it will not be sent.")
            return;
        }
        
        //if the img is not null then decide what to do with the link
        if(img != null){
            /** @type {String} */
            var img = post.url_overridden_by_dest;
            //imgur links are not supported so stop the code if the image is an imgur link
            if(img.includes('imgur'))
            {
                return;
            }
        }
        console.log(post);
        
        //create an embed
        const newembed = new MessageEmbed()
            .setColor('#5F676F')
            .setTitle(post.title)
            .setFooter("Post by " + post.author.name)
            .setDescription(post.selftext)
            .setImage(post.url_overridden_by_dest)
            .addFields(                
            );
        message.channel.send({embeds: [newembed]});
        }
    catch(err)
    {
        //if it fails for some reason tell the user that the command failed
        message.reply('Failed to execute that command!');
        //alert the person running the bot that the function failed and why the fail occured
        console.log(err);
    }
}

//parse math expressions and return an answer
async function mathExpr(message, args)
{
    //if the user inputs a bad/invalid input, this is probably more effecient then checking every part of the expression
    try
    {
        //turn the array into a string containing all the elements
        var expression = args.join('');
        if(args.length > 0)
        {
            //reply to the user with the result of the expression (use reply instead of send for more clarity in case 2 people use it at once)
            message.reply("> " + mathEval.Parser.evaluate(expression));
        }
    }
    catch
    {
        //tell the user that the code is invalid
        message.reply("That mathematical expression is invalid.")
    }
}

//use the Algebra.js library to integrate algebra into discord (yay!)
function algebra(message, args)
{
    //turn the array into a string of all the elements
    try
    {
        //create an expression by joining all the elements in the argument array
        var expression = args.join(" ")
        //use the library to parse the expression
        var eq = Algebra.parse(expression);
        //solve the equation and send it (in the same line of code)
        message.reply("> " + eq.toString() + "\n> x = **" + eq.solveFor("x")+'**');
    }
    catch(err)
    {   
        //tell the user if the code is invalid
        console.log(err);
        message.channel.send("Failed!");
    }
}



//use the weather.js library to get weather from msn weather and display nicely on discord
async function forecast(message, args)
{
    //check if the cache is updating (and stop people from using the function while the cache updates)
    if(updatingweathercacher == false)
    {
        //copy the cache into an array of cities
        lowercitylist = cityList
        for(var s in lowercitylist)
        {
            //convert all of the cities to lowercase
            s = s.toLowerCase();
        }
        //default search if for Toronto
        var city = "Toronto"
        //default the result of the search to null
        var cached = null;
        console.log(args[0]);
        //check if the user has inputted a specific city to get the weather from
        if(args[0] != undefined)
        {
            //if the city is multiple words long, then the words into one sentence (since each word is a different argument)
            city = args.join(" ");
            //set it to lowercase so it can match with the cache
            city = city.toLowerCase();
            //check if the city is NOT in the cache
            if(!lowercitylist.includes(city))
            {
                //if true, then use weather.js to grab it from MSN
                cached = await getWeather(city);
                //if the search failed
                if(cached == undefined)
                {
                    //if the search has failed, then tell the user that the search has failed and stop the function
                    message.channel.send("> Weather data for "+titleCase(city)+" is unavailable.")
                    return;
                }
            }
            else
            {
                //if the city IS in the cache, then get the data from the cache
                cached = WeatherCache.get(city.toLowerCase());
            }
        }
        else
        {
            //if not then get data from the default city, which is Toronto
            console.log("Auto searching for cached city: " + city)
            cached = WeatherCache.get(city.toLowerCase());
            await resolveAfterTSeconds(1, 10);
            
        }

        //create an embed to display the weather data which includes: Current Temp, Sky Description, The highest temp of that day, the lowest temp of that day
        const newembed = new MessageEmbed()
            .setColor('#5F676F')
            .setTitle("Weather in " + titleCase(city))
            .setFooter("When searching, the API chooses the region with the name closest to the one inputted, so if you enter a gibberish name you will still get a city.")
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
        //if the cache is updating, then tell the user that the command is unavailable
        message.channel.send("This command is currently unavailable, try again in a few seconds!");
    }

}

//use the weather.js library to cache weather data from a selection of large cities
async function cacheWeather()
{
    try
    {
        //reset the cache
        WeatherCache = new Map();
        //make sure that other weather functions dont run since it will return an error if it tries using the cache
        updatingweathercacher = true;
        //log the cache update
        console.log("Cacheing weather");
        for(var i = 0; i < cityList.length; i++)
        {
            //grab a city from the city list
            var citytouse = cityList[i];
            //create an array to store the info
            var cache_arr;
            //run the weather.js function to search for cities
            await weatherInstance.find({search: cityList[i], degreeType: 'C'}, async function(err, result) {
                if(err)
                { 
                    //if it runs into an error, then stop the loop
                    console.log("Search Error: " + err);
                    updatingweathercacher = false;
                    return undefined;

                }
                //convert the json into an object
                var resString = JSON.stringify(result, null, 2);
                var res = JSON.parse(resString);
                if(res == undefined || res[0] == undefined)
                {
                    //if the object is undefined then stop the loop
                    return;
                }
                //store the weather data 
                var Wcurr = res[0].current.temperature;
                var Whi = res[0].forecast[0].high;
                var Wlo = res[0].forecast[0].low;
                var Wsky = res[0].current.skytext;
                updatingweathercacher = true;
                //put the weather data into the array that was created
                cache_arr = [Wsky, Wcurr, Whi, Wlo];
                
                
            });
            //there is some delay to make sure no timing errors occur and since this only runs in the background every 30 minutes, there is no harm to the user experience
            //wait for 0.5 seconds since this takes time and JavaScript runs asynchronously
            await resolveAfterTSeconds(0.5, 10);
            console.log(cache_arr)
            WeatherCache.set(citytouse.toLowerCase(), cache_arr);
            //wait for 0.2 more seconds for the cache to set in case it takes longer
            await resolveAfterTSeconds(0.2, 10);
            updatingweathercacher = false;
        }
        //log the finishing of the cache
        console.log("finished cacheing! (succesful)");
        console.log(updatingweathercacher);
    }catch(err)
    {
        //if an unexpected error occurs during the cache, then stop the cache and display the error
        console.log(err.message)
        console.log("finished cacheing!");
        updatingweathercacher = false;
    }

}

//use weather.js to get the weather from an inputted city
async function getWeather(city)
{
    //convert the city to title case
    var citytouse = titleCase(city);
    console.log(citytouse);
    var cache_arr = null;
    //do the same thing that is done in cacheWeather()
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
        var Wcurr = res[0].current.temperature;
        var Whi = res[0].forecast[0].high;
        var Wlo = res[0].forecast[0].low;
        var Wsky = res[0].current.skytext;
        var to_cache = {sky: Wsky, curr: Wcurr, hi: Whi, lo: Wlo};
        cache_arr = [Wsky, Wcurr, Whi, Wlo];
        console.log(cache_arr)
        
        });
    await resolveAfterTSeconds(0.5, 10);
    //check if the cache is NOT null
    if(cache_arr != null)
    {
        
        cityList.push(citytouse);
        WeatherCache.set(citytouse.toLowerCase(), cache_arr);
        await resolveAfterTSeconds(0.2, 10);
        updatingweathercacher = false;
        return cache_arr;
    }
    else
    {
        //if the cache IS null then return undefined
        return undefined;
    }
    

}


//a function to halt a function for T seconds
function resolveAfterTSeconds(t,x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, t*1000);
    });
  }

//use discord.js to mute people
function mute(msg)
{
    //make sure that if an error occurs, the bot does not crash
    try
    {
        //get the sender of the command
        var sender = msg.guild.members.cache.find(m => m.id === msg.author.id)
        //if the sender doesnt have permissions then tell the sender and stop the function
        if (!sender.permissions.has("MANAGE_MESSAGES")) return msg.channel.send("You don't have the permissions");
        if (!sender.permissions.has("MANAGE_ROLES")) return msg.channel.send("You fon't have the permissions");
        //get the role that mutes users (it must have 'mute' in its name)
        var muteRole = msg.guild.roles.cache.find(role => role.name.toLowerCase().includes("mute"));
        //get the user to mute (the first ping in the message)
        var muteUser = msg.mentions.members.first();
        //if there is NO mute role then tell the user and stop the function
        if(muteRole == undefined)
        {
            msg.channel.send("There is no 'muted' role!");
            return;    
        }
        //if there is no person to mute then tell the user and stop the function
        if(muteUser == undefined)
        {
            msg.channel.send("You need to mention someone to mute!");
            return;
        }
        //give the target the role that mutes users
        muteUser.roles.add(muteRole);
        //tell the sender that the target has been muted
        msg.channel.send("<@"+muteUser+'> has been muted');
    }catch(err){
        console.log(err.message);
    }
}

//the same as mute() but it takes in different values to determine the person that should be muted and the role that is used to mute people
function raw_mute(cID, gID, uID, client)
{
    try{
        var guild = client.guilds.cache.find(g => g.id === gID);
        var channel = guild.channels.cache.find(c => c.id === cID);
        var muteRole = guild.roles.cache.find(role => role.name.toLowerCase().includes("mute"));
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
//the same as mute() and raw_mute() but it takes in unique values to determine the person that should be muted and the role that is used to mute people
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

//converts strings into title case
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
//the node.js functions to export into main
module.exports =  {searchwiki, mute, raw_mute, raw_mute2, forecast, mathExpr, compileJScode, grabRedditPost, algebra}

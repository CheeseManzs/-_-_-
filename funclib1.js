const wiki = require('wikijs').default;
const config = require('./config')
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


module.exports =  {searchwiki, mute}

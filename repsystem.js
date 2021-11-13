const { func } = require('assert-plus');
const config = require('./config')
const sql3 = require('sqlite3').verbose();

//a reputation system that uses sqlite3 to edit the database

//initiate user into the table of a guild
async function init(guildID, uID)
{
    //access the database
    let db = new sql3.Database('rep.db');
    //if the database does have a section for the guild, create one 
    db.run("CREATE TABLE IF NOT EXISTS g"+guildID+"(uID int, value real, offenses int, rank int, UNIQUE(uID))", function(err){if(err){console.log("1: " + err.message)}});
    await resolveAfterTSeconds(0.02, 10);
    //insert the user into the guild
    db.run("INSERT INTO g"+guildID+" VALUES ("+uID+",0,0,0);",function(err){if(err){}});
    await resolveAfterTSeconds(0.02, 10);
    return true;
}

//modifies the user
async function modify_user(guildID, uID, amt)
{
    var toreturn = 0;
    //access the database
    let db = new sql3.Database('rep.db');
    db.serialize(function() {
        //actual sqlite3 code
        //if the database does have a section for the guild, create one 
        db.run("CREATE TABLE IF NOT EXISTS g"+guildID+"(uID int, value real, offenses int, rank int, UNIQUE(uID))", function(err){if(err){console.log("1: " + err.message)}});
        //try and run the code but make sure that if it fails, the bot doesnt crash
        try
        {
            //insert the user into the guild
            db.run("INSERT INTO g"+guildID+" VALUES ("+uID+",0,0,0);",function(err){if(err){}});
        }catch
        {
            console.log("duplicate insertion");
        }
        //find the original value of the user via their user ID
        var search = "(SELECT value FROM g"+guildID+" WHERE uID ="+uID+")"
        //set the value of the user to an amount + their original value
        db.run("UPDATE g"+guildID+" SET value = ("+search+"+("+amt+")) WHERE uID="+uID,function(err){if(err){console.log("3: " + err.message)}})
    });
    db.close();
    return toreturn;
}

async function get_rep(guildID, uID)
{
    //access the database
    let db = new sql3.Database('rep.db');
    //default value to return is null
    val = null;
    //search for the specific user ID and get the row containing it
    db.each("SELECT uID, value FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        //get the reputation of that user
        val = row.value;
    });
    //wait some time since sqlite runs seperately to js
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

async function get_rank(guildID, uID)
{
    //access the database
    let db = new sql3.Database('rep.db');
    //default value to return is null
    val = null;
    //search for the specific user ID and get the row containing it
    db.each("SELECT uID, value, rank FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        //get the rank
        val = row.rank;
    });
    //wait some time since sqlite runs seperately to js
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

async function set_rank(guildID, uID, r)
{
    //access the database
    let db = new sql3.Database('rep.db');
    //default value to return is null
    val = null;
    //set the rank of the row than contains the user's userID to 'r'
    db.run("UPDATE g"+guildID+" SET rank="+r+" WHERE uID="+uID, function(err){});
}

async function get_off(guildID, uID)
{
    //access the database
    let db = new sql3.Database('rep.db');
    val = null;
    //search for the specific user ID and get the row containing it
    db.each("SELECT uID, value, offenses FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        //get the number of offenses
        val = row.offenses;
    });
    //wait some time since sqlite runs seperately to js
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

//a function to halt a function for T seconds
function resolveAfterTSeconds(t,x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, t*1000);
    });
  }

//the node.js functions to export into main
module.exports = {modify_user, get_rep, get_off, get_rank, set_rank, init}
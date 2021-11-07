const { func } = require('assert-plus');

const sql3 = require('sqlite3').verbose();
function get_value(db, guildID){


    db.serialize(async function() {
        db.each("SELECT uID, value, offenses FROM g"+guildID, function(err, row){
            if(err){console.log("err: "+err.message)}
            console.log(row.uID+": " + row.value);
            return row.value
        });
    });

}

async function init(guildID, uID)
{
    let db = new sql3.Database('rep.db');
    db.run("CREATE TABLE IF NOT EXISTS g"+guildID+"(uID int, value real, offenses int, rank int, UNIQUE(uID))", function(err){if(err){console.log("1: " + err.message)}});
    await resolveAfterTSeconds(0.1, 10);
    db.run("INSERT INTO g"+guildID+" VALUES ("+uID+",0,0,0);",function(err){if(err){}});
    await resolveAfterTSeconds(0.1, 10);
    return true;
}

async function modify_user(guildID, uID, amt)
{
    var toreturn = 0;
    let db = new sql3.Database('rep.db');
    db.serialize(function() {
        //actual sqlite3 code
        db.run("CREATE TABLE IF NOT EXISTS g"+guildID+"(uID int, value real, offenses int, rank int, UNIQUE(uID))", function(err){if(err){console.log("1: " + err.message)}});
        try
        {
            db.run("INSERT INTO g"+guildID+" VALUES ("+uID+",0,0,0);",function(err){if(err){}});
        }catch
        {
            console.log("duplicate insertion");
        }
        var search = "(SELECT value FROM g"+guildID+" WHERE uID ="+uID+")"
        db.run("UPDATE g"+guildID+" SET value = ("+search+"+"+amt+") WHERE uID="+uID,function(err){if(err){console.log("3: " + err.message)}})
        //db.each("SELECT uID, value, offenses FROM g"+guildID, function(err, row){
        //    
        //    if(err){
        //        console.log("err: "+err.message)
        //    }
        //    console.log("{"+row.uID  + "," + row.value + "," + row.offenses+"}");
        //
        //});
    });
    db.close();
    return toreturn;
    //console.log("100% - closed!")
}

async function get_rep(guildID, uID)
{
    let db = new sql3.Database('rep.db');
    val = null;
    db.each("SELECT uID, value FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        val = row.value;
    });
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

async function get_rank(guildID, uID)
{
    let db = new sql3.Database('rep.db');
    val = null;
    db.each("SELECT uID, value, rank FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        val = row.rank;
    });
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

async function set_rank(guildID, uID, r)
{
    let db = new sql3.Database('rep.db');
    val = null;
    db.run("UPDATE g"+guildID+" SET rank="+r+" WHERE uID="+uID, function(err){});
}

async function get_off(guildID, uID)
{
    let db = new sql3.Database('rep.db');
    val = null;
    db.each("SELECT uID, value, offenses FROM g"+guildID+" WHERE uID="+uID, function(err, row){
        if(err){
            console.log(err.message);
        }
        val = row.offenses;
    });
    await resolveAfterTSeconds(0.05, 10);
    return val;
}

function resolveAfterTSeconds(t,x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, t*1000);
    });
  }


module.exports = {modify_user, get_rep, get_off, get_rank, set_rank, init}
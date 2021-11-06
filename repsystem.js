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

async function modify_user(guildID, uID, amt)
{
    var toreturn = 0;
    let db = new sql3.Database('rep.db');
    const val = await get_value(db, guildID);
    db.serialize(async function() {
        //actual sqlite3 code
        //console.log("0%")
        db.run("CREATE TABLE IF NOT EXISTS g"+guildID+"(uID int, value real, offenses int); DELETE FROM g"+guildID+" WHERE uID="+uID+"; INSERT INTO g"+guildID+" VALUES ("+uID+","+(val+amt)+","+0+")", function(err){console.log("")});
        //console.log("33%")
        // IF NOT EXISTS(SELECT 1 FROM g"+guildID+" WHERE uID="+uID+") 
        
        console.log("endval: " + val);
        //console.log("67%");
        db.each("SELECT uID, value, offenses FROM g"+guildID, function(err, row){
            
            if(err){
                console.log("err: "+err.message)
            }
            console.log("{"+row.uID  + "," + row.value + "," + row.offenses+"}");
            toreturn = row.value;

        });
    });
    db.close();
    console.log(toreturn);
    return toreturn;
    //console.log("100% - closed!")
}

function get_rep(guildID, uID)
{
    let db = new sql3.Database('rep.db');
    db.serialize(function() {

        db.each("SELECT * FROM g"+guildID+" WHERE uID="+uID, function(err, row){

            console.log("found: " + row);

        });

    })
}
module.exports = {modify_user, get_rep}
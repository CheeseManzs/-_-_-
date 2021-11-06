const { func } = require('assert-plus');

const sql3 = require('sqlite3').verbose();




function modify_user(guildID, uID, amt)
{
    let db = new sql3.Database('rep.db');
    db.serialize(function() {
        //actual sqlite3 code
        console.log("0%")
        db.run('CREATE TABLE IF NOT EXISTS g'+guildID+' (uID int, value real)', function(err){console.log("")});
        console.log("33%")
        // IF NOT EXISTS(SELECT 1 FROM g"+guildID+" WHERE uID="+uID+") 
        console.log("INSERT INTO g"+guildID+" VALUES ("+uID+","+amt+")");
        db.run("INSERT INTO g"+guildID+" VALUES ("+uID+","+amt+")", function(err){console.log()})
        console.log("67%")
        db.each("SELECT uID, value FROM g"+guildID, function(err, row){

            console.log(row);

        });
    });
    db.close();
    console.log("100% - closed!")
}
module.exports = {modify_user}
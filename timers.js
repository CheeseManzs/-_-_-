const { func } = require('assert-plus');

const sql3 = require('sqlite3').verbose();




function create(guildID, uID, message)
{
	//takes in a recurring timer in the form of "timer [frequency] [number] [hour] [minute]"
	//frequency can be daily, weekly, or monthly
	//if frequency is daily, ignore number
	//if frequency is weekly, number is 1-7, monday-sunday
	//if frequency is monthly, number is 1-31, representing a day
    let db = new sql3.Database('rep.db');
	var st = message.toLowerCase();
	var parameters = [];
	st = st.substring(st.indexOf(' ') + 1);
	parameters[0] = st;
	parameters[0] = parameters[0].substring(0, parameters[0].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[1] = st;
	parameters[1] = parameters[1].substring(0, parameters[1].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[2] = st;
	parameters[2] = parameters[2].substring(0, parameters[2].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[3] = st;
	console.log(parameters[0]);
	console.log(parameters[1]);
	console.log(parameters[2]);
	console.log(parameters[3]);
	
    db.serialize(function() {
        //actual sqlite3 code
        console.log("0%")
        db.run('CREATE TABLE IF NOT EXISTS t'+guildID+' (message text, time text)', function(err){console.log("")});
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
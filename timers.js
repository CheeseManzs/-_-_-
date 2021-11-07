const { func } = require('assert-plus');

const sql3 = require('sqlite3').verbose();
const fs = require('fs');



function create(guildID, uID, message)
{
	//takes in a recurring timer in the form of "timer [frequency] [number] [hour] [minute]"
	//frequency can be daily, weekly, or monthly
	//if frequency is daily, ignore number
	//if frequency is weekly, number is 1-7, monday-sunday
	//if frequency is monthly, number is 1-31, representing a day
    let db = new sql3.Database('rep.db');
	var st = message;
	var parameters = [];
	st = st.substring(st.indexOf('"') + 1);
	parameters[0] = st.substring(0, st.lastIndexOf('"'));
	st = st.substring(st.lastIndexOf('"') + 2);
	parameters[1] = st;
	parameters[1] = parameters[1].substring(0, parameters[1].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[2] = st;
	parameters[2] = parameters[2].substring(0, parameters[2].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[3] = st;
	parameters[3] = parameters[3].substring(0, parameters[3].indexOf(' '));
	st = st.substring(st.indexOf(' ') + 1);
	parameters[4] = st;
	console.log(parameters[0]);
	console.log(parameters[1]);
	console.log(parameters[2]);
	console.log(parameters[3]);
	console.log(parameters[4]);
	
    var json = JSON.parse(fs.readFile("timers.json"));
	if(typeof(json["g" + guildID]) == "undefined") {
		json["g" + guildID] = {};
	}
	json["g" + guildID].message = message;
	json["g" + guildID].params = parameters;
	
	
	
    console.log("100% - closed!")
}
module.exports = {create}
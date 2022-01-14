const { func } = require('assert-plus');

const fs = require('fs');
const CronJob = require('cron').CronJob;


function create(message, args)
{
	console.log(message);
	//takes in a recurring timer in the form of "timer "message" [frequency] [number] [hour] [minute]"
	//frequency can be daily, weekly, or monthly
	//if frequency is daily, ignore number
	//if frequency is weekly, number is 1-7, monday-sunday
	//if frequency is monthly, number is 1-31, representing a day
	var st = message.content;
	var parameters = [];
	//breaks up the message into its arguments and prints it
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
	parameters[4] = parameters[4].substring(0, parameters[4].indexOf(' '));
	parameters[5] = args[args.length-1].substring(2, args[args.length-1].length-1);
	//console.log(parameters[0]);
	//console.log(parameters[1]);
	//console.log(parameters[2]);
	///console.log(parameters[3]);
	//console.log(parameters[4]);
	//console.log(parameters[5]);
	//console.log(message.mentions.channels.first());
	//console.log(message.guildId);
    
	//converts the parameters into a string used for cron
	//cronstrings are in the format "second minute hour (day of the month) month (day of the week)"
	// */1 in a cronstring makes it recurring
	//honestly you should just google what cron is
	//success variable is a rudimentary way of validating the cronstring
	//TODO: actually validate the cronstring
	var success = 0;
	var cronstring = "0 ";
	cronstring += parameters[4];
	cronstring += " ";
	cronstring += parameters[3];
	cronstring += " ";
	switch(parameters[1].toLowerCase()) {
		case "daily":
			cronstring += "*/1 * *";
			success = 1;
			break;
		case "weekly":
			cronstring += "*/1 * " + parameters[2];
			success = 1;
			break;
		case "monthly":
			cronstring += parameters[2] + " */1 *";
			success = 1;
			break;
		case "debug":
			cronstring = "* 21 * * * *";
			success = 2;
	}
	const validate = message.mentions.channels.last().permissionsFor(message.member).has('SEND_MESSAGES', false)
	console.log(validate);
	if(!validate) {
		success = -1
	}
	if(success == 1) {
		//TODO: Rewrite this with async functions
		
		//reads a json file and saves the newly created timer into the appropriate spot in that file
		var json = JSON.parse(fs.readFileSync("timers.json"));
		if(typeof(json["stored"]) == "undefined") {
			json["stored"] = [];
		}
		json["stored"].push([parameters[0], "c" + parameters[5], cronstring]);
		console.log(message.channel);
		message.channel.send("Timer Instantiated.")
		fs.writeFileSync("timers.json", JSON.stringify(json));
		console.log(cronstring);
		//starts a recurring timer
		const job = new CronJob(cronstring, function() {
			message.client.channels.fetch(parameters[5])
			.then(channel => channel.send(parameters[0]));
			console.log("firing timer.");
		}, null, 'America/Toronto');
		job.start();
	} else if (success == 2) {
		//debug feature do not use it will ruin our rate limits
		message.channel.send("Timer Instantiating.")
		//for(i = 16; i < 24; i++) {
			cronstring = "* * " + 21 + " * * *";
			console.log(cronstring);
			const job = new CronJob(cronstring, function() {
				message.channel.send(parameters[0]);
				var x = "firing timer at hour "
				console.log(x);
			});
			job.start();
		//}
		
	} else if(success == -1) {
		message.channel.send("You don't have permission to create a timer in that channel!");
	} else {
		message.channel.send("Timer syntax invalid.");
	}
	
    console.log("100% - closed!")
}

//test function that prints into an arbitrary channel
function echo(message, args) {
	console.log(message);
	console.log(message.channel);
	console.log(args[0]);
	//console.log(message.client.channels)
	message.client.channels.fetch(args[0].substring(2, args[0].length-1))
	.then(channel => channel.send("echo!"));
}
module.exports = {create, echo}
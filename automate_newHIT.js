function Refresh_and_qualifyAll() {
    var buttons = document.getElementsByClassName("is-prime");
    for (i=0;i<buttons.length;i++) {
	if (buttons[i].innerText=="REFRESH") {
	    buttons[i].click();
	    console.log("refreshed")
	}
    } 
    setTimeout(function () {
	var buttons = document.getElementsByClassName("is-second is-square");
   	for (i=0;i<buttons.length;i++) {
	    if (buttons[i].innerText=="QUALIFY ALL") {
                buttons[i].click();
		console.log("Qualified All for " + buttons[i].parentElement.parentElement.firstChild.innerText);
    	    }
	} 
	console.log("Qualified All");
    }, 25000);
}

setInterval(Refresh_and_qualifyAll,5*60*1000);

// Clicks the first found NEW HIT button after the predefined amount of time
function schedule_newHIT(minutes) {
    var delay = minutes *60*1000;
    var now = new Date();
    var schedule = new Date(now.getTime() + delay);
    console.log("Scheduling HIT for " + schedule.getHours() + ":" + schedule.getMinutes() + ":" + schedule.getSeconds());

    setTimeout(function () {
	Refresh_and_qualifyAll();
        // Wait for refresh to be done
        setTimeout(function () {
	    var buttons = document.getElementsByClassName("is-second is-square");
	    for (i=0;i<buttons.length;i++) {
		if (buttons[i].innerText=="NEW HIT") {
		    console.log("Found button: new Hit");
		    //buttons[i].click();
		    break;
		}
	    } 
	}, 25000+25000);
    }, delay-25000-25000);
}

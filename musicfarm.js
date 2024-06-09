const apiAddress = "https://api.kenmyers.io/melodyfarm/"

currentIDs = [null, null, null]

// why cant i do this w jquery? i dont know.
p1 = document.querySelector("#player1");
p2 = document.querySelector("#player2");

// maybe add checks for all these
function lockBoxes(){
	$("button").prop("disabled", true);
	$("label").prop("disabled", true);
	$("input").prop("disabled", true);
}

function unlockBoxes(){
	$("button").not("#voteButton").prop("disabled", false);
	$("label").prop("disabled", false);
	$("input").prop("disabled", false);
}

function endLoad(){
	$(".loader").addClass('hidden');
	$("#boombox").removeClass('hidden');
}

function startLoad(){
	$("#boombox").addClass('hidden');
	$(".loader").removeClass('hidden');
}

function setSources(){
	fetch(apiAddress+"requestPair", { method: 'GET', mode: 'cors' }).then(function(response){
		if(response.status !== 200){
			console.log("Error, status code: "+response.status+". Trying again...");
			setTimeout(setSources,6000);
			return;
		}
		response.json().then(function(data){
			stem = "data:;base64,";
			currentIDs = [data.pairid, data.id1, data.id2];
			song1 = data.song1;
			song2 = data.song2;
			$("#player1").attr("src",stem+song1);
			$("#player2").attr("src",stem+song2);
			unlockBoxes();
			endLoad();
		});
	}).catch(function(error){
		console.log("Error fetching: "+error+". Trying again...");
		setTimeout(setSources,6000);
	});
}

function voteOff(loser){
	lockBoxes();
	startLoad();
	data = {"loser" : loser};
	fetch(apiAddress+"voteOff/"+currentIDs[0],{
		method: 'POST',
		mode: 'cors',
		headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
		body: JSON.stringify(data)
	}).then(setSources).catch(function(error){
		console.log("Error fetching: "+error+".");
		setSources();
	});
}

function init(){
	setTimeout(function(){
		// Hide the address bar!
		window.scrollTo(0, 1);
	}, 0);
	setSources();
}

$(document).ready(init);

p1.addEventListener("stop", function(){

	setTimeout(function(){
		$("#button1").removeClass("pushed");
		$("#boombox").removeClass("playing");
	},400);
});

p2.addEventListener("stop", function(){
	setTimeout(function(){
		$("#button2").removeClass("pushed");
		$("#boombox").removeClass("playing");
	},400);
	
});

$("#button1").click(function(){
	p1.start();
	$(this).addClass("pushed");
	$("#boombox").addClass("playing");

});

$("#button2").click(function(){
	p2.start();
	$(this).addClass("pushed");
	$("#boombox").addClass("playing");
});

$("[type=radio]").change(function(){
	$("[for='submit']").prop("disabled", false);
	$("#voteButton").prop("disabled", false);
});

$("#voteButton").click(function(event){
	radio = $('input[name="pickWinner"]:checked', "#winnerForm").val();
	if (radio == 1){
		voteOff(currentIDs[2])
	}
	else if (radio == 2){
		voteOff(currentIDs[1])
	}
	$('input[name="pickWinner"]:checked').prop('checked',false);
});

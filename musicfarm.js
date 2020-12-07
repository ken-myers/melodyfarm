const apiAddress = "https://melodyfarm.herokuapp.com/api/"


currentID = null;

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
	$("#loader").removeClass('hidden');
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
			currentID = data.id;
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

function pickWinner(winner){
	lockBoxes();
	startLoad();
	data = {"winner" : winner};
	fetch(apiAddress+"selectWinner/"+currentID,{
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
		pickWinner(true);
	}
	else if (radio == 2){
		pickWinner(false);
	}
	$('input[name="pickWinner"]:checked').prop('checked',false);
});

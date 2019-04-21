var config = {
    apiKey: "AIzaSyBnzR4VgkD81ANrPCVTD6xu8vnorJWz_II",
    authDomain: "test-a05b4.firebaseapp.com",
    databaseURL: "https://test-a05b4.firebaseio.com",
    projectId: "test-a05b4",
    storageBucket: "test-a05b4.appspot.com",
    messagingSenderId: "131623986672"
};
firebase.initializeApp(config);
var database = firebase.database();

var player1;
var player2;
var playerText = "player";

var winner;
var loser;



//                      FIREBASE EVENTS
database.ref("/players/").on("value", function (snap) {
    let val = snap.val();

    if (snap.hasChild("player1")) {
        player1 = val.player1;
        $(".player1 .player-box-header-title").html(player1.name)
        $(".player1 .wins").html(player1.wins)
        $(".player1 .losses").html(player1.losses)
    } else {
        $(".player1 .player-box-header-title").html("Waiting for Player1")
    }
    if (snap.hasChild("player2")) {
        player2 = val.player2;
        $(".player2 .player-box-header-title").html(player2.name)
        $(".player2 .wins").html(player2.wins)
        $(".player2 .losses").html(player2.losses)
    } else {
        $(".player2 .player-box-header-title").html("Waiting for Player2")
    }
    loadChoices();

    if (snap.hasChild("player1") && snap.hasChild("player2")) {
        $(".player .wins-losses").css({
            "visibility": "visible"
        })
        if (val.player1.choice && val.player2.choice) {

            $(".player .items").css({
                "visibility": "hidden"
            });
            $(".player1 .choice-text").html(val.player1.choice);
            $(".player2 .choice-text").html(val.player2.choice);
            $(".player1 .choice-text").show();
            $(".player2 .choice-text").show();

            database.ref("/result_text/").once("value", function (snap) {
                $(".winner-name").html(snap.val());
            })

            setTimeout(() => {
                database.ref("players/player1/choice").set(null);
                database.ref("players/player2/choice").set(null);
                database.ref("result-text").set(null);
                $(".player1 .choice-text").hide();
                $(".player2 .choice-text").hide();
                $(".winner-name").html("");

            }, 3000);
        } 
    } else if(!snap.hasChild("player1")&&!snap.hasChild("player2")) {
        database.ref("chat").set(null)
    }
})


database.ref("/turn/").on("value", function (snap) {
    loadChoices();
})



//                              EVENTS
$(document).ready(function () {
    loadTurn();

    database.ref("/result_text/").set("");
})
 

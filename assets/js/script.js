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
 
$(document).on("click", ".item", function () {
    console.log(playerText)

    changeTurn();
    loadPlayerChoice($(this).data("value"));
    database.ref("players").once("value", function (snap) {
        let val = snap.val();
        if (val.player1.choice && val.player2.choice) {
            play(val.player1.choice, val.player2.choice)
        }
    })
})

$(window).on("beforeunload", function () {
    database.ref("players/" + playerText).once("value", function (snap) {
        let val=snap.val();
        database.ref('chat/messages/').push({
            player: val.name,
            message: "I have disconnected"
        });
    })
    database.ref("players/" + playerText).set(null)
})



$(document).on("submit", ".register", function (event) {
    event.preventDefault();
    playerText = "player";
    let name = $("#name-text").val();
    let wins = 0;
    let losses = 0;
    database.ref("players").once("value", function (snap) {
        if (!snap.hasChild("player1") || !snap.hasChild("player2")) {
            if (!snap.hasChild("player1")) {
                playerText += "1";
            } else if (!snap.hasChild("player2")) {
                playerText += "2";
            }
            database.ref("players/" + playerText).set({
                name,
                wins,
                losses
            })
        }
        $(".register").hide();
        $(".name-header").show();
        $(".name-header-title").html("Hi, " + name + ". You are " + playerText)
    })
})





//                  FUNCTIONS

function loadChoices() {
    if (player1 && player2) {
        database.ref().once("value", function (snap) {
            let val = snap.val();
            let currentPlayer;
            let otherPlayer;
            if (val.turn === 1) {
                currentPlayer = 1;
                otherPlayer = 2;
            } else if (val.turn === 2) {
                currentPlayer = 2;
                otherPlayer = 1;
            }
            database.ref("/players/player" + currentPlayer + "/choice").once("value", function (result) {
                if (playerText === "player" + currentPlayer && !result.exists()) {
                    $(".player" + currentPlayer + " .items").css({
                        "visibility": "visible"
                    });
                    $(".player" + currentPlayer).css("border", "1px solid yellow");
                }
                $(".player" + otherPlayer + " .items").css({
                    "visibility": "hidden"
                });
                $(".player" + otherPlayer).css("border", "1px solid black");
            })
        })
    }
}

function changeTurn() {
    database.ref("/turn/").once("value", function (snap) {
        let value = snap.val();
        let num;
        if (value === 1) {
            num = 2;
        } else if (value === 2) {
            num = 1
        }
        database.ref("/turn/").set(num);
    })
}


function loadPlayerChoice(choice) {
    database.ref("players/" + playerText + "/choice").set(choice);
    $("." + playerText + " .choice-text").html(choice);
    $("." + playerText + " .choice-text").show();
}


function play(choice1, choice2) {

    if (choice1 === "rock" && choice2 === "paper") {
        winner = "player2";
        loser = "player1"
    } else if (choice1 === "paper" && choice2 === "rock") {
        winner = "player1";
        loser = "player2"
    } else if (choice1 === "rock" && choice2 === "scissors") {
        winner = "player1";
        loser = "player2"
    } else if (choice1 === "scissors" && choice2 === "rock") {
        winner = "player2";
        loser = "player1"
    } else if (choice1 === "paper" && choice2 === "scissors") {
        winner = "player2";
        loser = "player1"
    } else if (choice1 === "scissors" && choice2 === "paper") {
        winner = "player1";
        loser = "player2"
    } else {
        database.ref("/result_text/").set("TIE!");
        return;
    }
    won(winner);
    lost(loser);
}

function won(player) {
    database.ref("/players/" + player).once("value", function (snap) {
        let val = snap.val();
        let winsScore = parseInt(val.wins) + 1;
        database.ref("/players/" + player + "/wins/").set(winsScore);
        database.ref("/result_text/").set(val.name + " won!");
    })
}

function lost(player) {
    database.ref("/players/" + player).once("value", function (snap) {
        let val = snap.val();
        let lossesScore = parseInt(val.losses) + 1
        database.ref("/players/" + player + "/losses/").set(lossesScore);
    })
}


function loadTurn() {
    database.ref().once("value", function (snap) {
        if (!snap.hasChild("turn")) {
            database.ref("turn").set(1);
        }
    })
}

var _i = require('inquirer');
var install = require('cryptr');
var fs = require('fs');
var colors = require('colors');
var Cryptr = require('cryptr');
var cryptr = new Cryptr('18-g-995421m71cv9xwwa');

function print(something) {
    console.log(something);
}

function Question(question, answer) {
    console.log("Decrypting your answer!");
    this.question = question;
    this.answer = cryptr.encrypt(answer);
}

function readLog(inputFile, callback) {
    fs.readFile(inputFile, 'utf8', function read(err, data) {
        if (err) {
            console.log(err);
        }
        var questions = data.trim().split(';');
        var data = questions.map(function(each) {
            return JSON.parse(each);
        });
        callback(data);
    });
};

function logData(inputFile, question, answer, showNewFile) {
    var userSearch = new Question(question, answer);
    fs.appendFile(inputFile, ";" + JSON.stringify(userSearch), function(err) {
        if (err) {
            console.log(err);
        }
        if (showNewFile === true) {
            console.log('Writing File :)'.green);
            readLog('data.txt');
        } else {
            console.log('Data Added to ' + inputFile);
        }
    });
}
//variables for keeping track of the game;
var count = 0;
var numCorrect = 0;
var numInc = 0;

function showPer() {
    console.log("Correct Answers: " + (numInc).toString().red);
    console.log("Incorrect Answers: " + (numCorrect).toString().green);
}

function decryptAnswers(testQuestions) {
	console.log("DANGER: ANSWERS DECRYPTED!!!".red);
	for (var i = 0; i < testQuestions.length; i++) {
		console.log(testQuestions[i]["question"] + ": " +cryptr.decrypt(testQuestions[i]["answer"]).toUpperCase().red);
	}
}
function administerTest(testQuestions) {
    if (count < testQuestions.length) {
        console.log("-------" + testQuestions[count]["question"] + "-------");
        _i.prompt([{
            'type': 'input',
            'message': 'Answer: '.red,
            'name': 'answer'
        }]).then(function(data) {
            if (data.answer.toLowerCase() == cryptr.decrypt(testQuestions[count]["answer"]).toLowerCase()) {
                console.log("Correct".green + "\n");
                numCorrect++;
                showPer();
            } else {
                console.log("Incorrect".red);
                console.log("The correct answer is: " + cryptr.decrypt(testQuestions[count]["answer"]) + "\n")
                numInc--;
                showPer();
            }
            count++;
            administerTest(testQuestions); //go again as long as there are questions; Recursion.
        });
    } else {
        _i.prompt([{
            type: "checkbox",
            message: "Play Again?",
            name: "choice",
            choices: ["yes", "no"],
        }]).then(function(result) {
            if (result.choice == "yes") {
                count = 0;
                readLog("data.txt", administerTest);
            } else {
                showPer();
                console.log("That's Okay. See You later!".green);
                process.exit();
            }
        });
    }
}

function addQuestion() {
    _i.prompt([{
        type: 'input',
        message: 'Add your question (without the answer)',
        name: 'question',
    }, {
        type: 'input',
        message: 'Add the answer',
        name: 'answer'
    }]).then(function(result) {
        logData('data.txt', result.question, result.answer, false);
    })
}

function getInitialInput() {
    var input = process.argv[2]
    if (input === undefined) {
        console.log("The Options are 1) play, 2) add, 3) display [opts: --decrypt]. E.g. ``node flashCards play`` ".red)
    } else if (input === 'play') {
        readLog("data.txt", administerTest);
    } else if (input === 'add') {
        console.log("Awesome oPossum. . .Let's Add A Question. . .".green);
        addQuestion();
    } else if (input === 'display') {
        if (process.argv[3] === undefined) {
            console.log("Displaying Questions! (Answers Encrypted.)".yellow);
            readLog('data.txt', print);
        } else if (process.argv[3] === "--decrypt") {
            
            readLog('data.txt', decryptAnswers);
        }
    } else {
        console.log("Command Not Recognized".red);
    }
}

function main() {
    getInitialInput();
}
main();
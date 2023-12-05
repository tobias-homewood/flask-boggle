class Boggle {
    constructor(letters) {
        // data
        this.letters = letters;
        this.guesses = new Set();
        this.interval = null;
        this.fullTime = 60;

        // html elements
        this.timer = document.getElementById("timer");
        this.score = document.getElementById("score");
        this.wordGuess = document.getElementById("word_guess");
        this.message = document.getElementById("message");
        this.board = document.getElementById("board");

        // buttons
        this.startButton = document.getElementById("start");

        // bind all the methods
        this.start = this.start.bind(this);
        // this.restart = this.restart.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.runTimer = this.runTimer.bind(this);
    }

    setup() {
        // set wordGuess functionality
        this.wordGuess.onsubmit = this.handleSubmit;

        // but keep it hidden
        this.wordGuess.hidden = true;

        // set timer and score
        this.timer.innerText = this.fullTime;
        this.score.innerText = 0;

        // clear message
        this.message.innerText = "";

        // set buttons functionality to start a new game
        this.startButton.onclick = this.start;
        this.startButton.style.display = "";

        // unhide game
        document.getElementById("game").hidden = false;

        // create empty board, make sure its empty first
        this.board.innerHTML = "";
        for (let row of this.letters) {
            const tr = document.createElement("tr");
            for (let letter of row) {
                const td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                tr.append(td);
            }
            this.board.append(tr);
        }
    }

    start() {
        // reset the data
        this.timer.innerText = this.fullTime;
        this.score.innerText = 0;
        this.guesses.clear();
        this.message.innerText = "";

        // set wordGuess functionality
        this.showBoard();
        this.wordGuess.onsubmit = this.handleSubmit;
        this.wordGuess.hidden = false;

        // start timer
        this.interval = setInterval(this.runTimer, 1000);

        // hide start and restart buttons
        this.startButton.style.display = "none";
    }

    restart() {
        location.reload();

        // instead of reloading let's make another board with the generate board wordGuess
    }

    async handleSubmit(event) {
        event.preventDefault();
        const wordInput = this.wordGuess["Word"];

        if (wordInput.value.length === 0) {
            this.message.innerHTML = "";
            wordInput.value = "";
            return;
        }

        const response = await axios.post("/word_guess", {
            Word: wordInput.value,
        });

        if (response.data.result === "ok") {
            // award points
            if (this.guesses.has(wordInput.value)) {
                this.message.innerHTML = "Word already used!";
                wordInput.value = "";
                return;
            } else {
                this.guesses.add(wordInput.value);
                this.message.innerHTML = "Found the word in the board!";
            }

            const points = wordInput.value.length;
            const score = parseInt(this.score.innerText);

            this.score.innerText = score + points;
        } else if (response.data.result == "not-word") {
            this.message.innerHTML = "Invalid word!";
        } else {
            this.message.innerHTML = "Word does not exist in the board!";
        }

        wordInput.value = "";

        setTimeout(() => {
            this.message.innerHTML = "";
        }, 1000);
    }

    hideBoard() {
        const board = document.getElementById("board");
        for (let tr of board.getElementsByTagName("tr")) {
            const row = [];
            for (let td of tr.getElementsByTagName("td")) {
                row.push(td.innerText);
                td.innerHTML = "&nbsp;";
            }
            this.letters.push(row);
        }
    }

    showBoard() {
        const board = document.getElementById("board");
        for (let tr of board.getElementsByTagName("tr")) {
            const row = this.letters.shift();
            for (let td of tr.getElementsByTagName("td")) {
                td.innerText = row.shift();
            }
        }
    }

    gameOver() {
        const score = this.score.innerText;

        // hide wordGuess
        this.wordGuess.onsubmit = null;
        this.wordGuess.hidden = true;

        this.message.innerText = `Times up! You got a score of ${score}!`;

        // show hidden restart button

        // update statistics
        axios
            .post("/statistics", { score: parseInt(this.score.innerText) })
            .then((res) => {
                console.log(res.data);
                document.getElementById("highscore").innerText =
                    res.data.highscore;
                document.getElementById("numberOfGames").innerText =
                    res.data.numberOfGames;
            });

        // show generateboard wordGuess again
        document.getElementById("generate_board").hidden = false;
    }

    runTimer() {
        this.timer.innerText--;
        if (this.timer.innerText == 0) {
            clearInterval(this.interval);
            // show game over message
            this.gameOver();
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const generateBoardForm = document.getElementById("generate_board");
    generateBoardForm.onsubmit = async (event) => {
        event.preventDefault();
        const response = await axios.get(
            `new_board/${generateBoardForm["size"].value}`
        );
        const boggle = new Boggle(response.data.board);
        boggle.setup();

        // hide wordGuess
        generateBoardForm.hidden = true;
    };
});

from flask import Flask, render_template, request, redirect, jsonify
from flask_debugtoolbar import DebugToolbarExtension

from boggle import Boggle

boggle_game = Boggle()

app = Flask(__name__)
debug = DebugToolbarExtension(app)

app.config["TESTING"] = True
app.config["DEBUG_TB_HOSTS"] = []
app.config["TEMPLATES_AUTO_RELOAD"] = True
boggle = Boggle()
board = None
numberOfGames = 0
highscore = 0

@app.route("/")
def homepage():
    global board
    board = boggle.make_board(5)
    print(board)
    return render_template("homepage.html", board=board, highscore=highscore, numberOfGames=numberOfGames)



# these are used as API requests
@app.route("/new_board/<int:size>")
def new_board(size):
    global board
    board = boggle.make_board(size)
    return jsonify({"board": board})

@app.route("/word_guess", methods=["GET", "POST"])
def guess():
    if request.method == "GET":
        return redirect("/")
    
    # this is the case of a POST request
    word = request.json['Word']
    result = boggle.check_valid_word(board, word)
    return jsonify({"result": result})

@app.route("/statistics", methods=["POST"])
def update_statistics():
    global highscore, numberOfGames
    score = request.json['score']
    if score > highscore:
        highscore = score
    
    numberOfGames += 1

    # return the new updated statistics
    return jsonify({
        "highscore": highscore,
        "numberOfGames": numberOfGames
    })


if __name__ == "__main__":
    app.run(debug=True)

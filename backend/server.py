from flask import Flask, request, jsonify
from flask_cors import CORS

import chessbro 

app = Flask(__name__)
CORS(app)

@app.route('/api/validate-pgn', methods=['POST'])
def validatePGN():
    pgn = request.get_json()['pgn']
    state = chessbro.validation.validatePGN(pgn)
    return jsonify(state)
    
@app.route('/api/review-game', methods=['POST'])
def reviewGame():
    pgn = request.get_json()['pgn']
    reviewed_game = chessbro.gamereview.review_game(pgn)
    return jsonify(reviewed_game)

@app.route('/api/get-chesscom-games', methods=['POST'])
def getChesscomGames():
    username = request.get_json()['username']
    start = request.get_json()['start_date']
    end = request.get_json()['end_date']
    games = chessbro.webscraper.getGames(username=username, start_date=start, end_date=end)
    return jsonify(games)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
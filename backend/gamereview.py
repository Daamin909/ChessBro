import chess
import chess.pgn 
import io
import requests
import json
def analyse(FENs):
    response = []
    x=0
    for FEN in FENs:
        x+=1
        API_ENDPOINT = "https://chess-api.com/v1"
        data = {'fen': FEN}
        r = requests.post(url=API_ENDPOINT, data=data)
        response.append(r.json())
        if (x==10):
            break
        print(f'{x} is done')
    return response
def review_game (pgn):
    game = chess.pgn.read_game(io.StringIO(pgn))
    board = game.board()
    moves = game.mainline_moves()
    moves_fens = []
    for move in moves:
        board.push(move)
        moves_fens.append(board.fen())
    review = analyse(moves_fens)
    with open("response.json", "w", encoding="utf-8") as f:
        json.dump(review, f, ensure_ascii=False, indent=4)

review_game("""[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.10.20"]
[Round "?"]
[White "mido_sigma"]
[Black "daamin_101"]
[Result "0-1"]
[TimeControl "600"]
[WhiteElo "800"]
[BlackElo "1224"]
[Termination "daamin_101 won by checkmate"]
[ECO "B01"]
[EndTime "12:30:03 GMT+0000"]
[Link "https://www.chess.com/game/live/123166182575"]

1. e4 d5 2. exd5 Qxd5 3. Nf3 Nc6 4. Nc3 Qa5 5. b4 Qxb4 6. Rb1 Qa5 7. Bd3 e5 8.
O-O Bg4 9. Qe1 Bxf3 10. gxf3 Nf6 11. f4 Bb4 12. fxe5 Nxe5 13. Rxb4 Qxb4 14. Bb2
Qa5 15. Ne4 Nxe4 16. Bxe4 O-O 17. Bxb7 Rab8 18. Bc3 Qb6 19. Bf3 Nxf3+ 20. Kg2
Nxe1+ 21. Rxe1 Qg6+ 22. Kf3 Qf5+ 23. Kg2 Qg4+ 24. Kf1 Rfe8 25. Rxe8+ Rxe8 26.
Bd4 Rb8 27. Bc3 Rb1# 0-1""")
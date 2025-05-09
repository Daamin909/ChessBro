import { Chess } from "chess.js";
import { player_info } from "./inforetriever";
import openingsList from "./openings";

const isBookMove = (fen) => {
  let board = new Chess(fen);
  fen = board.fen().split(" ")[0].trim();
  for (let opening of openingsList) {
    if (opening["fen"] === fen) {
      return [true, opening["name"]];
    }
  }
  return [false];
};

const gradeMove = (eval_change) => {
  if (eval_change >= 4.5) {
    return "blunder";
  } else if (eval_change >= 2.6) {
    return "mistake";
  } else if (eval_change >= 1.3) {
    return "inaccuracy";
  } else if (eval_change >= 0.8) {
    return "good";
  } else if (eval_change >= 0.1) {
    return "excellent";
  } else {
    return "best_move";
  }
};

const isBestMove = (move_info) => {
  return move_info["best_move"] === move_info["move"];
};

const classifyMoves = (analysis) => {
  let evalDiffs = [null];
  let openings = ["Starting Position"];

  for (let counter = 1; counter < analysis.length; counter++) {
    let current = analysis[counter];
    let previous = analysis[counter - 1];

    let current_type = current["eval"]["type"];
    let previous_type = previous["eval"]["type"];

    let book_move = isBookMove(current["fen"]);
    if (book_move[0]) {
      evalDiffs.push("book_move");
      openings.push(book_move[1]);
    } else {
      openings.push(null);
      if (isBestMove(current)) {
        evalDiffs.push("best_move");
      } else if (current_type === "cp" && previous_type === "cp") {
        let resp = cp_and_cp(current, previous);
        evalDiffs.push(resp);
      } else if (current_type === "cp" && previous_type === "mate") {
        let resp = cp_and_mate(current, previous);
        evalDiffs.push(resp);
      } else if (current_type === "mate" && previous_type === "mate") {
        let resp = mate_and_mate(current, previous);
        evalDiffs.push(resp);
      } else if (current_type === "mate" && previous_type === "cp") {
        let resp = mate_and_cp(current, previous);
        evalDiffs.push(resp);
      }
    }
  }

  for (
    let counter = 0;
    counter < Math.min(evalDiffs.length, openings.length);
    counter++
  ) {
    analysis[counter]["opening"] = openings[counter];
    analysis[counter]["move_type"] = evalDiffs[counter];
  }
  analysis = correctBookMoves(analysis);
  return analysis;
};

const cp_and_cp = (current, previous) => {
  let diff = previous["eval"]["value"] - current["eval"]["value"];
  diff = Math.floor(diff * 100) / 100;
  return gradeMove(Math.abs(diff));
};

const cp_and_mate = (current, previous) => {
  let current_eval = current["eval"]["value"];
  if (current_eval >= 20) {
    return "excellent";
  } else if (current_eval >= 12) {
    return "good";
  } else if (current_eval >= 9) {
    return "inaccuracy";
  } else if (current_eval >= 6) {
    return "mistake";
  } else {
    return "blunder";
  }
};

const mate_and_cp = (current, previous) => {
  let previous_eval = previous["eval"]["value"];
  if (previous_eval >= 30) {
    return "good";
  } else if (previous_eval >= 20) {
    return "inaccuracy";
  } else if (previous_eval >= 10) {
    return "mistake";
  } else {
    return "blunder";
  }
};

const mate_and_mate = (current, previous) => {
  let current_mate_in = current["eval"]["value"];
  let previous_mate_in = previous["eval"]["value"];
  let player_color = current["move_no"] % 2 === 0 ? "b" : "w";
  switch (player_color) {
    case "w":
      if (previous_mate_in > 0) {
        if (current_mate_in > 0) {
          return "excellent";
        } else if (current_mate_in < 0) {
          return "blunder";
        }
      } else if (previous_mate_in < 0) {
        return "excellent";
      }
      break;
    case "b":
      if (previous_mate_in < 0) {
        if (current_mate_in < 0) {
          return "excellent";
        } else if (current_mate_in > 0) {
          return "blunder";
        }
      } else if (previous_mate_in > 0) {
        return "excellent";
      }
      break;
  }
};

const calculate_accuracy = (ListWithFENs) => {
  let FENs = [];
  let usableList = ListWithFENs.slice(1)
  for (let FEN of usableList) {
    FENs.push(FEN);
  }
  const weightage = {
    blunder: 0,
    mistake: 0.2,
    inaccuracy: 0.4,
    good: 0.65,
    excellent: 0.9,
    best_move: 1,
    book_move: 1,
  };
  let accuracyList = {
    white: {
      current: 0,
      maximum: 0,
    },
    black: {
      current: 0,
      maximum: 0,
    },
  };

  let moveTypesList = {
    white: {
      best_move: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      book_move: 0,
    },
    black: {
      best_move: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      book_move: 0,
    },
  };

  for (let i = 0; i < FENs.length; i++) {
    const fen = FENs[i];
    const moveColour = fen.fen.includes(" b ") ? "white" : "black";
    accuracyList[moveColour].current += weightage[fen.move_type];
    accuracyList[moveColour].maximum++;

    moveTypesList[moveColour][fen.move_type] += 1;
  } 
  return [
    accuracyList.white.maximum
      ? accuracyList.white.current / accuracyList.white.maximum
      : 0,
    accuracyList.black.maximum
      ? accuracyList.black.current / accuracyList.black.maximum
      : 0,
  ];
};

export const countMoveCategories = (analysedFENs, pgn) => {
  let move_types_b = [];
  let move_types_w = [];
  for (let FEN of analysedFENs) {
    if (FEN["move_no"] % 2 === 0) {
      move_types_b.push(FEN["move_type"]);
    } else {
      move_types_w.push(FEN["move_type"]);
    }
  }
  let accuracy = [...calculate_accuracy(analysedFENs)];
  analysedFENs = {
    info: player_info(pgn),
    accuracy: {
      white: Math.floor(accuracy[0] * 100 * 100) / 100,
      black: Math.floor(accuracy[1] * 100 * 100) / 100,
    },
    number_of_move_types: {
      w: {
        best_move: move_types_w.filter((move) => move === "best_move").length,
        excellent: move_types_w.filter((move) => move === "excellent").length,
        good: move_types_w.filter((move) => move === "good").length,
        inaccuracy: move_types_w.filter((move) => move === "inaccuracy").length,
        mistake: move_types_w.filter((move) => move === "mistake").length,
        blunder: move_types_w.filter((move) => move === "blunder").length,
        book_move: move_types_w.filter((move) => move === "book_move").length,
      },
      b: {
        best_move: move_types_b.filter((move) => move === "best_move").length,
        excellent: move_types_b.filter((move) => move === "excellent").length,
        good: move_types_b.filter((move) => move === "good").length,
        inaccuracy: move_types_b.filter((move) => move === "inaccuracy").length,
        mistake: move_types_b.filter((move) => move === "mistake").length,
        blunder: move_types_b.filter((move) => move === "blunder").length,
        book_move: move_types_b.filter((move) => move === "book_move").length,
      },
    },
    move_evaluations: analysedFENs,
  };
  return analysedFENs;
};

const correctBookMoves = (analysis) => {
  // this is an algorithm to add 'book_move' title to the missed FENs
  // in the openings list, not all FENs are mentioned
  // however if a move leads to a book-move
  // it is also a book move
  // this algo fills up those missing moves and it also makes the subsequent move to have the same opening-name
  let opening = [];

  for (let position of analysis) {
    // ? this makes a list of lists containg, move_no and opening name
    opening.push([position["move_no"], position["opening"]]);
  }

  let opening_reversed = [];

  for (let x = opening.length - 1; x > 0; x--) {
    // ! makes a list that is the reversal of the first one, this one doesnt include the starting position though
    opening_reversed.push(opening[x]);
  }

  let index = null;
  for (let move of opening_reversed) {
    // * this gets the index of the last book_move
    if (move[1]) {
      index = move[0];
      break;
    }
  }

  if (index) {
    // ? checks if there is any book move and then
    // ! makes all moves a book move until that move
    for (let count = 0; count < opening.length; count++) {
      let position = opening[count];
      if (position[0] <= index && !position[1]) {
        let prevIndex = count - 1 < 0 ? opening.length - 1 : count - 1;
        position[1] = opening[prevIndex][1];
      }
    }
  }

  opening[0][1] = null;

  for (let i = 0; i < analysis.length; i++) {
    // this adds the new openings to the analysis and returns that variable
    let individualOpening = opening[i];
    if (individualOpening[1]) {
      analysis[i]["move_type"] = "book_move";
      analysis[i]["opening"] = individualOpening[1];
    }
  }

  for (let count = 0; count < analysis.length; count++) {
    if (!analysis[count]["opening"]) {
      analysis[count]["opening"] = analysis[count - 1]["opening"];
    }
  }

  return analysis;
};

export default classifyMoves;

import React from "react";
import "./ReviewPanel.css";
import review_game from "./../../scripts/index";
import gameLoaded from "../../assets/sound/game-loaded.mp3";
const ReviewPanel = ({ setPGN }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById("game-input");
    const input_type = document.getElementById("game-input-type");
    const reviewed_game = await review_game(input.value, input_type.value);
    setPGN(reviewed_game);
    input.value = "";
    input_type.value = "pgn";
    const sound = new Audio(gameLoaded);
    sound.play();
  };
  return (
    <div id="review-panel">
      <div id="review-panel-header">
        <h2>Game Review</h2>
      </div>
      <hr />
      <div id="game-input-container">
        <form id="game-input-form" onSubmit={handleSubmit}>
          <div id="game-input-box">
            <textarea
              type="text"
              id="game-input"
              placeholder="Enter PGN"
              required
            ></textarea>
            <select id="game-input-type">
              <option value="pgn">PGN</option>
            </select>
          </div>
          <div id="game-input-button-container">
            <button type="submit" id="game-input-button">
              <p id="img">🔍</p>| Analyse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewPanel;

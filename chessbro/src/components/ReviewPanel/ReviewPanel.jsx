import React from "react";
import "./ReviewPanel.css";

const ReviewPanel = () => {
  return (
    <div id="review-panel">
      <div id="review-panel-header">
        <h2>Game Review</h2>
      </div>
      <hr />
      <div id="game-input-container">
        <form id="game-input-form">
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

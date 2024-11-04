import React, { useEffect, useState } from "react";

import "./EvalBar.css";

const EvalBar = ({ PGN, currentMove, flipped }) => {
  const [evalStyle, setEvalStyle] = useState([
    { height: "50%" },
    { height: "50%" },
    "",
    "",
  ]);

  useEffect(() => {
    var x = PGN.move_evaluations[currentMove].eval;
    if (x) {
      if (x.type) {
        const evalType = PGN.move_evaluations[currentMove].eval.type;
        const evalValue = PGN.move_evaluations[currentMove].eval.value;
        if (evalType === "mate") {
          if (evalValue === 0) {
            const winner = PGN.move_evaluations[currentMove].move_no % 2 === 0;
            if (winner) {
              setEvalStyle([{ height: "100%" }, { height: "0" }, `0-1`, ""]);
            } else {
              setEvalStyle([{ height: "0" }, { height: "100%" }, "", `1-0`]);
            }
          } else if (evalValue > 0) {
            setEvalStyle([
              { height: "0" },
              { height: "100%" },
              "",
              `M${Math.abs(evalValue)}`,
            ]);
          } else if (evalValue < 0) {
            setEvalStyle([
              { height: "100%" },
              { height: "0" },
              `M${Math.abs(evalValue)}`,
              "",
            ]);
          }
        } else if (evalType === "cp") {
          if (evalValue === 0) {
            setEvalStyle([{ height: "50%" }, { height: "50%" }, "", ""]);
          }
          evalValue > 0
            ? setEvalStyle([
                { height: `calc(50% - ${Math.abs(evalValue) * 4}%)` },
                { height: `calc(50% + ${Math.abs(evalValue) * 4}%)` },
                "",
                `${Math.abs(evalValue)}`,
              ])
            : setEvalStyle([
                { height: `calc(50% + ${Math.abs(evalValue) * 4}%)` },
                { height: `calc(50% - ${Math.abs(evalValue) * 4}%)` },
                `${Math.abs(evalValue)}`,
                "",
              ]);
        }
      }
    }
  }, [currentMove]);

  return (
    <div className="eval-bar">
      <div className="black" style={evalStyle[0]}>
        <a className="eval-value" id="black-eval">
          {evalStyle[2]}
        </a>
      </div>
      <div className="white" style={evalStyle[1]}>
        <a className="eval-value" id="black-eval">
          {evalStyle[3]}
        </a>
      </div>
    </div>
  );
};

export default EvalBar;
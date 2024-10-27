import React from "react";
import IndividualControl from "./IndividualControl";
import "./Controls.css"
import {
  faForward,
  faBackward,
  faFloppyDisk,
  faRetweet,
  faFastBackward,
  faFastForward,  
} from "@fortawesome/free-solid-svg-icons";

const Controls = ({ save, firstMove, previous, next, lastMove, reverse }) => {
  return (
    <div className="controls">
      <IndividualControl name="save" onclick={save} fasfa={faFloppyDisk} />
      <IndividualControl
        name="first-move"
        onclick={firstMove}
        fasfa={faFastBackward}
      />
      <IndividualControl
        name="previous"
        onclick={previous}
        fasfa={faBackward}
      />
      <IndividualControl name="next" onclick={next} fasfa={faForward} />
      <IndividualControl name="last-move" onclick={lastMove} fasfa={faFastForward} />
      <IndividualControl name="reverse" onclick={reverse} fasfa={faRetweet} />
    </div>
  );
};

export default Controls;
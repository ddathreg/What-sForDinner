import React from "react";
import { Wheel } from "react-custom-roulette";

const CustomWheel = ({ mustSpin, prizeNumber, onStopSpinning, data }) => (
  <Wheel
    mustStartSpinning={mustSpin}
    prizeNumber={prizeNumber}
    data={data}
    backgroundColors={["#3e3e3e", "#df3428"]}
    textColors={["#ffffff"]}
    onStopSpinning={onStopSpinning}
    spinDuration={.35}
  />
);

export default CustomWheel;

import { View } from "react-native";
import React from "react";

type SizedBoxProps = {
  width?: number;
  height?: number;
};

const SizedBox = ({ width, height }: SizedBoxProps) => {
  return <View style={{ height: height, width: width }} />;
};

export default SizedBox;

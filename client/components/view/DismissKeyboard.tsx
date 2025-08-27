import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ViewProps,
} from "react-native";

import React, { PropsWithChildren } from "react";

const DismissKeyboard: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <TouchableWithoutFeedback
    onPress={() => Keyboard.dismiss()}
    accessible={false}
  >
    <View style={{ flex: 1 }}>{children}</View>
  </TouchableWithoutFeedback>
);

export default DismissKeyboard;

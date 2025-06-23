const isDarkTheme = true;

const darkColors = {
  bgDark: "#0d0d0d", // 0°, 0%, 5%
  bg: "#1a1a1a", // 0°, 0%, 10%
  bgLight: "#262626", // 0°, 0%, 15%
  border: "#4d4d4d", // 0°, 0%, 30%
  text: "#f2f2f2", // 0°, 0%, 95%
  textMuted: "#b3b3b3", // 0°, 0%, 70%
  primary: "#7906d0", // 274°, 94%, 42%
};

// Not Implemented yet
const lightColors = {
  bgDark: "#ffffff", // 0°, 0%, 5%
  bg: "#1a1a1a", // 0°, 0%, 10%
  bgLight: "#262626", // 0°, 0%, 15%
  border: "#4d4d4d", // 0°, 0%, 30%
  text: "#f2f2f2", // 0°, 0%, 95%
  textMuted: "#b3b3b3", // 0°, 0%, 70%
  primary: "#7906d0", //274°, 94%, 42%
};

export var colors = {
  ...(isDarkTheme ? darkColors : lightColors),
};

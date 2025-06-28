const isDarkTheme = true;

const darkColors = {
  bgDark: "#0d0d0d", // 0°, 0%, 5%
  bg: "#1a1a1a", // 0°, 0%, 10%
  bgLight: "#262626", // 0°, 0%, 15%
  border: "#4d4d4d", // 0°, 0%, 30%
  text: "#f2f2f2", // 0°, 0%, 95%
  textMuted: "#b3b3b3", // 0°, 0%, 70%
  primary: "#7906d0", // 274°, 94%, 42%
  link: "#155dfc"
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
  link: "#155dfc"
};

const pinkColors = {
  bgDark: "#f3bed3", // 0°, 0%, 5%
  bg: "#f7d4e0", // 0°, 0%, 10%
  bgLight: "#fbe9f0", // 0°, 0%, 15%
  border: "#e77ea8", // 0°, 0%, 30%
  text: "#16040b", // 0°, 0%, 95%
  textMuted: "#811840", // 0°, 0%, 70%
  primary: "#7906d0", // 274°, 94%, 42%
  link: "#155dfc"
}

export var colors = {
  // ...pinkColors
  ...(isDarkTheme ? darkColors : lightColors),
};

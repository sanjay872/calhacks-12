import styleConfig from '../style.json';

export const theme = {
  colors: {
    primary: styleConfig.colors.primary,
    secondary: styleConfig.colors.secondary,
    accent: styleConfig.colors.accent,
    highlight: `#${styleConfig.colors.higlight}`, // Fixed missing # in style.json
    background: styleConfig.colors.background,
  },
  fonts: {
    heading: styleConfig.fonts.heading,
    normal: styleConfig.fonts.normal,
  },
};

// CSS class strings for easy use in components
export const themeClasses = {
  colors: {
    primary: `text-[${theme.colors.primary}]`,
    secondary: `text-[${theme.colors.secondary}]`,
    accent: `text-[${theme.colors.accent}]`,
    highlight: `text-[${theme.colors.highlight}]`,
    background: `bg-[${theme.colors.background}]`,
    bgAccent: `bg-[${theme.colors.accent}]`,
    bgHighlight: `bg-[${theme.colors.highlight}]`,
    borderHighlight: `border-[${theme.colors.highlight}]`,
    borderSecondary: `border-[${theme.colors.secondary}]`,
  },
};

export default theme;


export const THEME_KEY = "quiz-duel:theme";

/** Runs before the page paints (see app/layout.tsx), so there's no flash of the wrong theme. */
/** Dark is the house look, so a first visit starts dark; "system" follows the device. */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t===null)t="dark";if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

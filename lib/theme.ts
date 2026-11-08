export const THEME_KEY = "quiz-duel:theme";

/** Runs before the page paints (see app/layout.tsx), so there's no flash of the wrong theme. */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

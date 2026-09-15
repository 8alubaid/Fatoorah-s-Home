// Kept out of the "use client" ThemeToggle module: a server component that
// imports a value from a client module gets a client reference, not the string.

// Runs before hydration (next/script beforeInteractive in the root layout) so
// the right theme is applied before the first paint — without it, dark-mode
// visitors would see a white flash. Saved choice first, else the OS setting.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

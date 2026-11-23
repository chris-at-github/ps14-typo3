import { defineConfig } from "vite";
import typo3 from "vite-plugin-typo3";

export default defineConfig({
  plugins: [
    typo3()
  ],
  experimental: {
    // Absolute URLs in CSS, damit das kritische CSS (site-inline) auch inline im HTML funktioniert
    renderBuiltUrl(filename, { hostType }) {
      return hostType === "css" ? `/_assets/vite/${filename}` : { relative: true };
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // KIST-SCSS (Stand v12) nutzt @import, globale Sass-Funktionen und /-Division.
        // Die Umstellung folgt in der Optimierungsrunde (docs/plans/kist-v14-optimizations.md, O3).
        silenceDeprecations: ["import", "global-builtin", "slash-div", "color-functions", "if-function"],
      },
    },
  },
});

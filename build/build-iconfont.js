import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import webfont from "webfont"; // Import the entire webfont module

// Access the webfont function from the imported module.
// This handles different export styles (default and direct).
const __webfont = webfont.default || webfont;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
const result = await __webfont({
	files: 'packages/ps14_site/Resources/Private/Assets/Svg/Font/**/*.svg',
	fontName: 'iconfont',
	formats: ['woff2'],
	dest: 'test/fonts',
	template: path.resolve(__dirname, "./template.scss.njk"),
	templateClassName: 'icon-font',
	templateFontPath: 'EXT:ps14_site/Resources/Public/Fonts/',
});

await mkdir('public/fonts', { recursive: true });
await Promise.all([
	writeFile('packages/ps14_site/Resources/Public/Fonts/iconfont.woff2', result.woff2),
	writeFile('packages/ps14_site/Resources/Private/Assets/Scss/bootstrap/_iconfont.scss', result.template),
]);
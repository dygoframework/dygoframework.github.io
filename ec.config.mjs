// Expressive Code options live here so the <Code> component can use them.
import { join } from 'node:path';
import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import { codeTheme, framePlugin, loadTokens } from './scripts/lib/code-theme.mjs';

// Relative to the project root, because the <Code> component loads this file
// from a bundled chunk where import.meta.url points somewhere else.
const tokens = loadTokens(join(process.cwd(), 'src/styles/tokens.css'));

export default defineEcConfig({
	themes: [codeTheme(tokens)],
	plugins: [framePlugin()],
	useStarlightDarkModeSwitch: false,
	useStarlightUiThemeColors: false,
	styleOverrides: {
		borderRadius: 'var(--dy-radius-lg)',
		borderColor: 'var(--dy-color-border)',
		codeBackground: 'var(--dy-color-surface-code)',
		codeFontFamily: 'var(--dy-font-mono)',
		codeFontSize: 'var(--dy-text-md)',
		codeLineHeight: '1.8',
		codePaddingBlock: 'var(--dy-space-6)',
		codePaddingInline: 'var(--dy-space-7)',
		uiFontFamily: 'var(--dy-font-sans)',
		uiFontSize: 'var(--dy-text-md)',
		focusBorder: 'var(--dy-color-text)',
		frames: {
			frameBoxShadowCssValue: 'none',
			editorTabBarBackground: 'var(--dy-color-surface-code-header)',
			editorTabBarBorderBottomColor: 'var(--dy-color-border)',
			editorActiveTabBackground: 'var(--dy-color-surface-code-header)',
			editorActiveTabForeground: 'var(--dy-color-text)',
			editorActiveTabIndicatorTopColor: 'transparent',
			editorActiveTabIndicatorBottomColor: 'transparent',
			editorActiveTabBorderColor: 'transparent',
			editorTabsMarginInlineStart: '0',
			editorBackground: 'var(--dy-color-surface-code)',
			inlineButtonBackground: 'var(--dy-color-surface-code)',
			inlineButtonForeground: 'var(--dy-color-text-muted)',
			inlineButtonBorder: 'transparent',
			tooltipSuccessBackground: 'var(--dy-color-accent)',
			tooltipSuccessForeground: 'var(--dy-color-on-accent)',
		},
	},
});

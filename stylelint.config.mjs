// Guards from DESIGN.md: no raw colors outside tokens.css, and only the token fonts.
const colorFunctions = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'];

/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard'],
	overrides: [
		{
			files: ['**/*.astro'],
			customSyntax: 'postcss-html',
		},
		{
			files: ['src/styles/tokens.css'],
			rules: {
				'color-no-hex': null,
				'function-disallowed-list': null,
				'declaration-property-value-allowed-list': null,
			},
		},
	],
	rules: {
		'color-no-hex': true,
		'color-named': 'never',
		'function-disallowed-list': colorFunctions,
		'declaration-property-value-allowed-list': {
			'font-family': ['/^var\\(--dy-font-(sans|mono)\\)$/', 'inherit'],
			font: ['inherit'],
		},
		'selector-class-pattern': null,
		'custom-property-pattern': null,
		'keyframes-name-pattern': null,
		'import-notation': 'string',
		// Astro scopes component styles, so :global() is valid.
		'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
		// Component styles list states after the base rule on purpose.
		'no-descending-specificity': null,
	},
};

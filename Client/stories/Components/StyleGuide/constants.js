const colorAndBoxShadowData = [
	// About primary colors
	[
		{
			tooltip: 'Pro Tip: Use it as company brand color throught the product',
			componentThumnailClassName: 'color-swatch--primary',
			componentText: 'Primary',
			componentCode: '#eb575c'
		},
		{
			tooltip: 'Pro Tip: Use it as hover transition state to primary color',
			componentThumnailClassName: 'color-swatch--primary-dark-1',
			componentText: 'Primary-Dark-1',
			componentCode: '#e62930'
		},
		{
			tooltip: 'Pro Tip: Use it as primary color for icons, labels etc.',
			componentThumnailClassName: 'color-swatch--primary-dark-2',
			componentText: 'Primary-Dark-2',
			componentCode: '#d9434e'
		},
		{
			tooltip: 'Pro Tip: Use it as dark variation of primary color',
			componentThumnailClassName: 'color-swatch--primary-dark-3',
			componentText: 'Primary-Dark-3',
			componentCode: '#cf474b'
		},
		{
			tooltip: 'Pro Tip: Use it as light variation of primary color',
			componentThumnailClassName: 'color-swatch--primary-light',
			componentText: 'Primary-Light-1',
			componentCode: '#fb9fa2'
		}
	],
	// About background colors
	[
		{
			tooltip: 'Pro Tip: Use it as app/component back/foreground color',
			componentThumnailClassName: 'color-swatch--background-1',
			componentText: 'Background-1',
			componentCode: '#f6f7f8'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component back/foreground color',
			componentThumnailClassName: 'color-swatch--background-2',
			componentText: 'Background-2',
			componentCode: '#fff'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component back/foreground color',
			componentThumnailClassName: 'color-swatch--background-3',
			componentText: 'Background-3',
			componentCode: '#ebf1f2'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component back/foreground color',
			componentThumnailClassName: 'color-swatch--background-4',
			componentText: 'Background-4',
			componentCode: '#f3f5f7'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component back/foreground color',
			componentThumnailClassName: 'color-swatch--background-5',
			componentText: 'Background-5',
			componentCode: '#f9f9f9'
		}
	],
	// About font colors
	[
		{
			tooltip: 'Pro Tip: Use it as app/component font color',
			componentThumnailClassName: 'color-swatch--font-1',
			componentText: 'Font-1',
			componentCode: '#555'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component font color',
			componentThumnailClassName: 'color-swatch--font-2',
			componentText: 'Font-2',
			componentCode: '#000'
		},
		{
			tooltip: 'Pro Tip: Use it as app/component font color',
			componentThumnailClassName: 'color-swatch--font-3',
			componentText: 'Font-3',
			componentCode: '#b2b2b2'
		},
		{
			tooltip: 'Pro Tip: Use it as UI component font color',
			componentThumnailClassName: 'color-swatch--font-4',
			componentText: 'Font-4',
			componentCode: '#89949b'
		}
	],
	// About alert message colors
	[
		{
			tooltip: 'Pro Tip: Use it as alert error message fore/background color',
			componentThumnailClassName: 'color-swatch--alert-error',
			componentText: 'Alert-Error-Message',
			componentCode: '#e34849'
		},
		{
			tooltip: 'Pro Tip: Use it as alert warning message fore/background color',
			componentThumnailClassName: 'color-swatch--alert-warning',
			componentText: 'Alert-Warning-Message',
			componentCode: '#f0ad4e'
		},
		{
			tooltip: 'Pro Tip: Use it as alert success message fore/background color',
			componentThumnailClassName: 'color-swatch--alert-success',
			componentText: 'Alert-Success-Message',
			componentCode: '#3bb85d'
		},
		{
			tooltip: 'Pro Tip: Use it as alert success message fore/background color',
			componentThumnailClassName: 'color-swatch--alert-success-2',
			componentText: 'Alert-Success-Message-2',
			componentCode: '#04a506'
		}
	],
	// About border, icon and link colors
	[
		{
			tooltip: 'Pro Tip: Use it as border color',
			componentThumnailClassName: 'color-swatch--border-1',
			componentText: 'Border-1',
			componentCode: '#e6e6e6'
		},
		{
			tooltip: 'Pro Tip: Use it as UI component border color',
			componentThumnailClassName: 'color-swatch--border-2',
			componentText: 'Border-2',
			componentCode: '#ddd'
		},
		{
			tooltip: "Pro Tip: Use it as UI component's focus state border color",
			componentThumnailClassName: 'color-swatch--border-focus',
			componentText: 'Border-Focus',
			componentCode: '#ccc'
		}
	],
	// About button, icon, link, dropdown and datepicker colors
	[
		{
			tooltip: 'Pro Tip: Use it as button primary background/border/text color',
			componentThumnailClassName: 'color-swatch--button-primary',
			componentText: 'Button-Primary',
			componentCode: '#167096'
		},
		{
			tooltip: 'Pro Tip: Use it as icon color',
			componentThumnailClassName: 'color-swatch--icon',
			componentText: 'Icon',
			componentCode: '#787878'
		},
		{
			tooltip: 'Pro Tip: Use it as UI (link/dropdown/datepicker) border color',
			componentThumnailClassName: 'color-swatch--ui-border-or-font',
			componentText: 'UI-Border/Color',
			componentCode: '#47b6e4'
		},
		{
			tooltip: 'Pro Tip: Use it as UI (dropdown/datepicker) background color',
			componentThumnailClassName: 'color-swatch--ui-background',
			componentText: 'UI-Background',
			componentCode: '#ecf7fc'
		}
	],
	// About unused but listed colors
	[
		{
			tooltip: "Pro Tip: Use it however you want. It ain't used in product ;)",
			componentThumnailClassName: 'color-swatch--grey-light',
			componentText: 'Light-Grey',
			componentCode: '#ccc'
		},
		{
			tooltip: "Pro Tip: Use it however you want. It ain't used in product ;)",
			componentThumnailClassName: 'color-swatch--green',
			componentText: 'Green',
			componentCode: '#14a314'
		}
	],
	// About box-shadow colors and values
	[
		{
			tooltip: 'Pro Tip: Use it as button hover box-shadow value',
			componentThumnailClassName: 'color-swatch--background-2 color-swatch--boxShadow-1',
			componentText: 'Box-Shadow-1',
			componentCode: '0 6px 10px rgba(0, 0, 0, 0.23), 0 10px 30px rgba(0, 0, 0, 0.19)'
		},
		{
			tooltip: 'Pro Tip: Use it as component default box-shadow value',
			componentThumnailClassName: 'color-swatch--background-2 color-swatch--boxShadow-2',
			componentText: 'Box-Shadow-2',
			componentCode: '0 0 10px #f9f9f9, 0 0 5px #f9f9f9;'
		}
	]
];

const fontSizeData = [
	[
		{
			tooltip: 'Pro Tip: Use it as minimum spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'Font-Base',
			componentCode: '0.25rem',
			componentInlineText: '0.25rem',
			componentInlineStyle: { fontSize: `0.25rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as default spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'Font-XS',
			componentCode: '0.5rem',
			componentInlineText: '0.5rem',
			componentInlineStyle: { fontSize: `0.5rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as small spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'Font-SM',
			componentCode: '1rem',
			componentInlineText: '1rem',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as medium spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'Font-MD',
			componentCode: '2rem',
			componentInlineText: '2rem',
			componentInlineStyle: { fontSize: `2rem` }
		}
	],
	[
		{
			tooltip: 'Pro Tip: Use it as large spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentColumnClassName: 'col-sm-12 col-md-3 col-lg-3',
			componentText: 'Font-LG',
			componentCode: '4rem',
			componentInlineText: '4rem',
			componentInlineStyle: { fontSize: `4rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as extra-large spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentColumnClassName: 'col-sm-12 col-md-4 col-lg-4',
			componentText: 'Font-XL',
			componentCode: '8rem',
			componentInlineText: '8rem',
			componentInlineStyle: { fontSize: `8rem` }
		}
	],
	[
		{
			tooltip: 'Pro Tip: Use it as extra-extra-large spacing (margin/padding) unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentColumnClassName: 'col-sm-12 col-md-12 col-lg-12',
			componentText: 'Font-XXL',
			componentCode: '16rem',
			componentInlineText: '16rem',
			componentInlineStyle: { fontSize: `16rem` }
		}
	]
];

const zIndexData = [
	[
		{
			tooltip: 'Pro Tip: Use it as minimum zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-Base',
			componentCode: '0',
			componentInlineText: '0',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as default zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-XS',
			componentCode: '1000',
			componentInlineText: '1000',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as small zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-SM',
			componentCode: '2000',
			componentInlineText: '2000',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as medium zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-MD',
			componentCode: '3000',
			componentInlineText: '3000',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as large zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-LG',
			componentCode: '4000',
			componentInlineText: '4000',
			componentInlineStyle: { fontSize: `1rem` }
		},
		{
			tooltip: 'Pro Tip: Use it as extra-large zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-XL',
			componentCode: '10000',
			componentInlineText: '10000',
			componentInlineStyle: { fontSize: `1rem` }
		}
	],
	[
		{
			tooltip: 'Pro Tip: Use it as extra-extra-large zIndex unit value',
			componentThumnailClassName:
				'color-swatch--background-2 color-swatch--boxShadow-1 aligner aligner--vCenter aligner--hCenter',
			componentText: 'zIndex-XXL',
			componentCode: '10001',
			componentInlineText: '10001',
			componentInlineStyle: { fontSize: `1rem` }
		}
	]
];

const styleElementData = `.color-swatch { background: #fff; border-radius: 5px; min-height: 100px; position: relative;}
.color-swatch.color-swatch--grey-light { background: #ccc; }
.color-swatch.color-swatch--green { background: #14a314; }
.color-swatch.color-swatch--primary { background: #eb575c; }
.color-swatch.color-swatch--primary-dark-1 { background: #e62930; }
.color-swatch.color-swatch--primary-dark-2 { background: #d9434e; }
.color-swatch.color-swatch--primary-dark-3 { background: #cf474b; }
.color-swatch.color-swatch--primary-light { background: #fb9fa2; }
.color-swatch.color-swatch--background-1 { background: #f6f7f8; }
.color-swatch.color-swatch--background-2 { background: #fff; }
.color-swatch.color-swatch--background-3 { background: #ebf1f2; }
.color-swatch.color-swatch--background-4 { background: #f3f5f7; }
.color-swatch.color-swatch--background-5 { background: #f9f9f9; }
.color-swatch.color-swatch--font-1 { background: #555; }
.color-swatch.color-swatch--font-2 { background: #000; }
.color-swatch.color-swatch--font-3 { background: #b2b2b2; }
.color-swatch.color-swatch--font-4 { background: #89949b; }
.color-swatch.color-swatch--alert-error { background: #e34849; }
.color-swatch.color-swatch--alert-warning { background: #f0ad4e; }
.color-swatch.color-swatch--alert-success { background: #3bb85d; }
.color-swatch.color-swatch--alert-success-2 { background: #04a506; }
.color-swatch.color-swatch--border-1 { background: #e6e6e6; }
.color-swatch.color-swatch--border-2 { background: #ddd; }
.color-swatch.color-swatch--border-focus { background: #ccc; }
.color-swatch.color-swatch--icon { background: #787878; }
.color-swatch.color-swatch--ui-border-or-font { background: #47b6e4; }
.color-swatch.color-swatch--ui-background { background: #ecf7fc; }
.color-swatch.color-swatch--boxShadow-1 { box-shadow: 0 6px 10px rgba(0, 0, 0, 0.23), 0 10px 30px rgba(0, 0, 0, 0.19); }
.color-swatch.color-swatch--boxShadow-2 { box-shadow: 0 0 10px #f9f9f9, 0 0 5px #f9f9f9; }
.color-swatch.color-swatch--button-primary { background: #167096; }
.button.button--line {border: 0.2rem solid #47b6e4;outline: 0 none;background: #fff;border-radius: 0.5rem;position: absolute;right: 0.5rem;top: 0.5rem;color: #47b6e4;padding: 0.1rem 0.5rem;}
.panel-heading-description {color: #89949b; display: inline-block;}
`;

module.exports = { colorAndBoxShadowData, fontSizeData, zIndexData, styleElementData };

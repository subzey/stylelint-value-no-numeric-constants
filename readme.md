# `tradingview/value-no-numeric-constants`

Disallows constant numeric values for specified properties. Designed to disallow "magic constants" for `z-index` properties, but can be used for any property.

Expressions in braces or within `calc()` that consists only of constant values are treated like constants as well.


## Options:

```
{
	properties: string[];
	allowGt:? number;
	allowLt:? number;
}
```

• `properties` is array of unprefixed property names.
• `allowLt` is optional parameter, allow numeric literals lowest this.
• `allowGt` is optional parameter, allow numeric literals greatest this.

## Sample configuration:

*.stylelintrc.js*:

```js
module.exports.plugins = ['stylelint-value-no-numeric-constants'];

module.exports.rules = {
	'tradingview/value-no-numeric-constants': [{ properties: ['order', 'z-index']}, {
		severity: 'warning'
	}],
}
```

## Values that triggers errors:

Config: `{ properties: ['width', 'z-index'], allowGt: 50, allowLt: 100}`

```css
z-index: 42;                        /* Error! Numeric constant. */
z-index: 40 + 2;                    /* Error! Expression that consists only of numeric constants. */
z-index: 50 + 2;                    /* Error! Allow range not consider simple expression. */
z-index: calc(50 + 2);              /* Error! Allow range not consider calc expression. */
z-index: (40 + 2);                  /* Error! Expression that consists only of numeric constants. And braces won't fool us. */
z-index: calc(40 + 2);              /* Error! Calc expression that consists only of numeric constants. */
width: calc(42% + 100px);           /* Error! Constants with units are still constants. */
-moz-z-index: -webkit-calc(40 + 2); /* Error! No matter how property or calc are prefixed. */
z-index: -40 + -2.71;               /* Error! */

```

## OK values, that DOESN'T trigger errors:

Config: `{ properties: ['z-index'], allowLt: 10}`

```css
z-index: 5;                  /* Okay. Allow lowest 10. */
z-index: $my_z_index;        /* Okay. A SASS-like variable. That's the way we code! */
z-index: @my_z_index;        /* Okay. A LESS-like variable. Yess! Variables everywhere! */
z-index: #my_z_index;        /* Okay. We don't know what is it, but it's clearly not a numeric constant. */
z-index: $my_z_index + 1;    /* Okay. */
z-index: var(--omg, 100px);  /* Okay. */
z-index: url(100px);         /* Okay. */
```

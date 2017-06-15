# `tradingview/value-no-numeric-constants`

Disallows constant numeric values for specified properties. Designed to disallow "magic constants" for `z-index` properties, but can be used for any property.

Expressions in braces or within `calc()` that consists only of constant values are treated like constants as well.


## Options:

Array of unprefixed property names (strings).


## Sample configuration:

*.stylelintrc.js*:

```js
module.exports.plugins = ['stylelint-value-no-numeric-constants'];

module.exports.rules = {
	'tradingview/value-no-numeric-constants': [['order', 'z-index'], {
		severity: 'warning'
	}],
}
```

## Values that triggers errors:

Given `z-index` and `width` are specified in config:

```css
z-index: 42;                        /* Error! Numeric constant. */
z-index: 40 + 2;                    /* Error! Expression that consists only of numeric constants. */
z-index: (40 + 2);                  /* Error! Expression that consists only of numeric constants. And braces won't fool us. */
z-index: calc(40 + 2);              /* Error! Calc expression that consists only of numeric constants. */
width: calc(42% + 100px);           /* Error! Constants with units are still constants. */
-moz-z-index: -webkit-calc(40 + 2); /* Error! No matter how property or calc are prefixed. */
z-index: -40 + -2.71;               /* Error! */

```

## OK values, that DOESN'T trigger errors:

Given `z-index` is specified in config:

```css
z-index: $my_z_index;        /* Okay. A SASS-like variable. That's the way we code! */
z-index: @my_z_index;        /* Okay. A LESS-like variable. Yess! Variables everywhere! */
z-index: #my_z_index;        /* Okay. We don't know what is it, but it's clearly not a numeric constant. */
z-index: $my_z_index + 1;    /* Okay. */
z-index: var(--omg, 100px);  /* Okay. */
z-index: url(100px);         /* Okay. */
```

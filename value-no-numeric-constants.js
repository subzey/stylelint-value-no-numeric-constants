'use strict';
/* eslint-env node, es6 */

const postcss = require('postcss');
const unprefixed = postcss.vendor.unprefixed;
const stylelint = require('stylelint');
const report = stylelint.utils.report;
const ruleMessages = stylelint.utils.ruleMessages;
const validateOptions = stylelint.utils.validateOptions;

const ruleName = 'tradingview/value-no-numeric-constants';

const messages = ruleMessages(ruleName, {
	rejected: (propName, value) => `Unexpected numeric constant value "${value}" for property "${propName}"`,
});

// Matches anything that looks like a number
const RE_NUMERIC = /(?:[+-])?(?:\d+|\.\d+|\d+.\d*)/g;

// Matches any space separated zeroes with optional unary operators
const RE_NUMERIC_LIST = /\s*(?:0[%a-z]*\s*)+/ig;

// Matches "0+0"
const RE_BINARY_OPERATOR = /0[+-/*]0/g;

// Matches "(0), calc(0), -vendor-prefix-calc(0)"
const RE_BRACES = /((\B-\w[a-z-]*-|\b)?calc)?\(0\)/ig;

const isNumeric = value => {
	const result = (value
		.replace(RE_NUMERIC, '0')
		.replace(RE_NUMERIC_LIST, '0')
		.replace(RE_BINARY_OPERATOR, '0')
		.replace(RE_BRACES, '0')
	);

	if (result === '0') {
		// Result was simplified to 0. It's numeric
		return true;
	}

	if (result !== value) {
		// Unclear so far. Try to unwrap another syntactic layer.
		return isNumeric(result);
	}

	// Not numeric.
	return false;
};

const getReportIndex = decl => {
	const str = decl.toString();
	// Search for ":", starting right after the property name
	RE_NUMERIC.lastIndex = str.indexOf(':', decl.prop.length);
	const match = RE_NUMERIC.exec(str);
	// Reset lastIndex
	RE_NUMERIC.lastIndex = 0;
	if (match) {
		return match.index;
	}
	return 0;
};

const rule = stylelint.createPlugin(ruleName, function(primaryOption) {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			possible: (primaryOption) => (
				typeof primaryOption === 'object'
			&&
				Array.isArray(primaryOption.properties)
			&&
				primaryOption.properties.length > 0
			&&
				primaryOption.properties.every(value => typeof value === 'string')
			&&
				(primaryOption.allowGt === undefined || typeof primaryOption.allowGt === 'number')
			&&
				(primaryOption.allowLt === undefined || typeof primaryOption.allowLt === 'number')
			),
			actual: primaryOption
		});
		if (!validOptions) {
			return;
		}

		const propertyNames = primaryOption.properties.map(propName => unprefixed(propName).toLowerCase());
		const isExistAllowRange = primaryOption.allowLt !== primaryOption.allowGt;
		const allowLt = primaryOption.allowLt === undefined ? +Infinity : primaryOption.allowLt;
		const allowGt = primaryOption.allowGt === undefined ? -Infinity : primaryOption.allowGt;

		root.walkDecls((decl) => {
			const propName = unprefixed(decl.prop).toLowerCase();

			if (propertyNames.indexOf(propName) === -1) {
				return;
			}

			if (isExistAllowRange && + decl.value < allowLt && + decl.value > allowGt) {
				return;
			}

			if (isNumeric(decl.value)) {
				report({
					message: messages.rejected(decl.prop, decl.value),
					node: decl,
					index: getReportIndex(decl),
					result,
					ruleName,
				});
			}
		});
	};
});

rule.ruleName = ruleName;
rule.messages = messages;
module.exports = rule;

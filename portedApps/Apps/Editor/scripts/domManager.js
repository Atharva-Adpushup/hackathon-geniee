import $ from 'jquery';
import Selectorator from 'libs/cssSelectorator';
import Utils from 'libs/utils';

// Method to enable element-level DOM manipulation
const manipulateElement = (selector, type, params) => {
	let element = $(selector);
	switch (type) {
		case 'expand':
		case 'shrink':
			element.css(params.property, params.value);
			break;
	}
	return true;
};

export { manipulateElement };

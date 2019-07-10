// Inline edit component

import React, { PropTypes } from 'react';
import { renderDropdownList, renderActionButtons, renderNormalMode, renderInlineEditPanel } from './renderMethods.js';

class InlineEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			editMode: false,
			inputError: false,
			disableSave: false,
			showDropdownList: false
		};
	}

	componentWillReceiveProps(nextProps) {
		nextProps.dropdownList && nextProps.dropdownList.length && nextProps.dropdownList[0].trim().length > 0
			? this.showDropdown()
			: this.hideDropdown();

		if (nextProps.customError) {
			this.hideDropdown();
			this.setState({ inputError: true, disableSave: true });
		} else {
			this.setState({ inputError: false, disableSave: false });
		}
	}

	showDropdown() {
		this.setState({ showDropdownList: true });
	}

	hideDropdown() {
		this.setState({ showDropdownList: false });
	}

	triggerEdit() {
		// this.props.editClickHandler ? this.props.editClickHandler() : null;
		this.setState({ editMode: true });
		this.props.dropdownList && this.props.dropdownList.length ? this.showDropdown() : null;
	}

	cancelEdit() {
		this.props.cancelEditHandler ? this.props.cancelEditHandler() : null;
		this.setState({ editMode: false, inputError: false, disableSave: false });
	}

	submitValue() {
		if (!this.refs.editedText.value && this.props.validate) {
			this.setState({ inputError: true });
			return;
		}

		this.setState({ editMode: false, inputError: false });
		this.props.submitHandler(this.props.adCode ? btoa(this.refs.editedText.value) : this.refs.editedText.value);
	}

	changeValue() {
		const validated = this.props.changeHandler(this.refs.editedText.value);
		!validated
			? this.setState({ disableSave: true, inputError: true })
			: this.setState({ disableSave: false, inputError: false });
	}

	keyUp() {
		this.props.keyUpHandler(this.refs.editedText.value);
	}

	selectDropdownValue(xpath) {
		this.refs.editedText.value = xpath;
		this.hideDropdown();
	}

	renderDropdownList() {
		return renderDropdownList(this);
	}

	renderActionButtons() {
		return renderActionButtons(this);
	}

	renderNormalMode(adCodeStyles, adCodeEdit) {
		return renderNormalMode(this, adCodeStyles, adCodeEdit);
	}

	render() {
		const colCompact = this.props.compact ? 12 : 6,
			adCodeStyles = {
				width: 150,
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				display: 'inline-block'
			},
			adCodeEdit = {
				verticalAlign: 'super'
			},
			adCodeCheck = this.props.adCode ? (!this.props.value ? '' : atob(this.props.value)) : this.props.value,
			rootClassNames = this.props.rootClassNames || '',
			showTextarea = this.props.showTextarea ? true : false;

		return renderInlineEditPanel(
			this,
			colCompact,
			adCodeStyles,
			adCodeEdit,
			adCodeCheck,
			rootClassNames,
			showTextarea
		);
	}
}

InlineEdit.propTypes = {
	text: PropTypes.string.isRequired,
	submitHandler: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
	validate: PropTypes.bool,
	value: PropTypes.string.isRequired,
	compact: PropTypes.bool,
	font: PropTypes.number,
	changeHandler: PropTypes.func,
	validationError: PropTypes.string,
	editClickHandler: PropTypes.func,
	adCode: PropTypes.bool,
	dropdownList: PropTypes.array,
	keyUpHandler: PropTypes.func,
	customError: PropTypes.bool,
	cancelEditHandler: PropTypes.func,
	rootClassNames: PropTypes.string,
	type: PropTypes.string,
	showTextarea: PropTypes.bool
};

InlineEdit.defaultProps = {
	errorMessage: 'Input field cannot be blank'
};

export default InlineEdit;

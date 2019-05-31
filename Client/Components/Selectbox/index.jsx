import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';

const findSelected = props => {
	const { selected, title, options } = props;
	let name = title;

	if (selected === 0 || selected) {
		for (let i = 0; i < options.length; i += 1) {
			const option = options[i];
			if (option.value === selected) {
				// eslint-disable-next-line prefer-destructuring
				name = option.name;
				break;
			}
		}
	}

	return { selected, name };
};

class SelectBox extends Component {
	state = {
		...findSelected(this.props)
	};

	selectWrapper = (key, e) => {
		const { onSelect, options } = this.props;
		const optionValueType = typeof options[0].value;
		let value;
		switch (optionValueType) {
			case 'number': {
				value = Number(e.target.getAttribute('data-value'));
				break;
			}
			default:
			case 'string': {
				value = String(e.target.getAttribute('data-value'));
				break;
			}
		}
		this.setState(
			{
				// selected: value,
				name: e.target.getAttribute('data-name')
			},
			() => onSelect(value)
		);
	};

	render() {
		const { name } = this.state;
		const { selected, options, id, title, wrapperClassName, dropdownClassName, type } = this.props;
		const buttonTitle = selected === 0 || selected ? name : title;
		return (
			<div className={`custom-select-box-wrapper ${wrapperClassName}`}>
				<DropdownButton
					title={buttonTitle}
					bsStyle={type}
					className={`custom-select-box ${dropdownClassName}`}
					id={id}
					onSelect={this.selectWrapper}
				>
					{options.map((option, key) => (
						<MenuItem
							eventKey={`id-${key}`}
							// eslint-disable-next-line react/no-array-index-key
							key={key}
							data-value={option.value}
							data-name={option.name}
							active={selected === option.value}
						>
							{option.name}
						</MenuItem>
					))}
				</DropdownButton>
			</div>
		);
	}
}

SelectBox.propTypes = {
	id: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string,
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
		})
	).isRequired,
	selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	dropdownClassName: PropTypes.string,
	wrapperClassName: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string
};

SelectBox.defaultProps = {
	title: 'Select Value',
	dropdownClassName: '',
	wrapperClassName: '',
	type: 'default',
	selected: null
};

export default SelectBox;

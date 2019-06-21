/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import CustomIcon from '../CustomIcon';

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
		const { onSelect, options, title } = this.props;
		const optionValueType = typeof options[0].value;

		if (!e.target.getAttribute('data-value')) {
			return this.setState({ name: title }, () => onSelect(null));
		}

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
		return this.setState(
			{
				// selected: value,
				name: e.target.getAttribute('data-name')
			},
			() => onSelect(value)
		);
	};

	render() {
		const { name } = this.state;
		const {
			selected,
			options,
			id,
			title,
			wrapperClassName,
			dropdownClassName,
			type,
			reset
		} = this.props;
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
				{reset && selected && (
					<CustomIcon classNames="selectbox-reset" icon="times" onClick={this.selectWrapper} />
				)}
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
	type: PropTypes.string,
	reset: PropTypes.bool
};

SelectBox.defaultProps = {
	title: 'Select Value',
	dropdownClassName: '',
	wrapperClassName: '',
	type: 'default',
	selected: null,
	reset: false
};

export default SelectBox;

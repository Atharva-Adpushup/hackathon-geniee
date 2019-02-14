import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';

const findSelected = props => {
	const { selected = null, title, options } = props;
	let name = title;
	if (selected) {
		for (let i = 0; i < options.length; i += 1) {
			const option = options[i];
			if (option.value === selected) {
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
		const value = e.target.getAttribute('data-value');
		const { onSelect } = this.props;
		this.setState(
			{
				selected: value,
				name: e.target.getAttribute('data-name')
			},
			() => onSelect(value)
		);
	};

	render() {
		const { selected, name } = this.state;
		const { options, id, title, wrapperClassName, dropdownClassName, type } = this.props;
		const buttonTitle = name || title;
		return (
			<div className={`custom-select-box-wrapper ${wrapperClassName}"`}>
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
	options: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.string }))
		.isRequired,
	dropdownClassName: PropTypes.string,
	wrapperClassName: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string
};

SelectBox.defaultProps = {
	title: 'Select Value',
	dropdownClassName: '',
	wrapperClassName: '',
	type: 'default'
};

export default SelectBox;

/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
		const dataKey = e && e.target ? e.target.getAttribute('data-key') : '';

		if (!e || !e.target || !e.target.getAttribute('data-value')) {
			return this.setState({ name: title, selected: '' }, () => onSelect(null));
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
				name: e.target.getAttribute('data-name'),
				selected: value
			},
			() => onSelect(value, dataKey)
		);
	};

	render() {
		const { name, selected } = this.state;
		const {
			//	selected,
			options,
			id,
			title,
			wrapperClassName,
			dropdownClassName,
			type,
			dataKey,
			reset
		} = this.props;
		const selectedTitle = reset ? (
			<div
				className="aligner aligner--hSpaceBetween width-100  aligner--wrap"
				style={{ width: '100%' }}
			>
				{name}

				<Glyphicon
					glyph="remove"
					className="u-margin-r3"
					onClick={e => {
						e.stopPropagation();
						this.selectWrapper();
					}}
				/>
			</div>
		) : (
			name
		);
		const buttonTitle = selected === 0 || selected ? selectedTitle : title;
		const tooltip = <Tooltip id="tooltip">Please select a website.</Tooltip>;
		return (
			<div className={`custom-select-box-wrapper ${wrapperClassName}`}>
				<DropdownButton
					title={buttonTitle}
					bsStyle={type}
					className={`custom-select-box ${dropdownClassName}`}
					id={id}
					onSelect={this.selectWrapper}
				>
					{options.map((option, key) => {
						if (option.isDisabled) {
							return (
								<OverlayTrigger overlay={tooltip} id="1">
									<MenuItem
										eventKey={`id-${key}`}
										key={option.value}
										data-value={option.value}
										data-name={option.name}
										data-key={dataKey}
										active={selected === option.value}
										disabled={option.isDisabled}
									>
										{option.name}
									</MenuItem>
								</OverlayTrigger>
							);
						}
						return (
							<MenuItem
								eventKey={`id-${key}`}
								key={option.value}
								data-value={option.value}
								data-name={option.name}
								data-key={dataKey}
								active={selected === option.value}
								disabled={option.isDisabled}
							>
								{option.name}
							</MenuItem>
						);
					})}
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

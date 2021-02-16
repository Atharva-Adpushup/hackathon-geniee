/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	DropdownButton,
	MenuItem,
	Checkbox,
	Glyphicon,
	OverlayTrigger,
	Tooltip
} from '@/Client/helpers/react-bootstrap-imports';

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

const SELECT_ALL = {
	name: 'select-all',
	value: 'select-all',
	label: 'Select All'
};
class MultiSelectBox extends Component {
	constructor(props) {
		super(props);
		const selectedOption = {};
		if (props.selected) {
			props.selected.map(key => {
				selectedOption[key] = true;
				return key;
			});
		}
		this.state = {
			selectedOption
		};
		this.handleMultiSelect = this.handleMultiSelect.bind(this);
	}

	static getDerivedStateFromProps(props) {
		return { ...findSelected(props) };
	}

	// eslint-disable-next-line react/sort-comp
	handleMultiSelect(e) {
		const { target } = e;
		const dataValue = target.getAttribute('data-value');
		const { onSelect, options } = this.props;

		const { selectedOption } = this.state;
		const checked = Boolean(e.target.checked);

		// logic for select/deSelect all
		if (dataValue === SELECT_ALL.value) {
			options.forEach(option => {
				selectedOption[option.value] = checked;
				return option;
			});
			selectedOption[SELECT_ALL.value] = checked;
		} else {
			options.forEach(option => {
				if (option.value === dataValue) {
					selectedOption[dataValue] = checked;
				}
				// to uncheck select all if any of th eoption is unchecked
				if (!checked) {
					selectedOption[SELECT_ALL.value] = false;
				}
				return option;
			});
		}

		this.setState(
			{
				selectedOption: { ...selectedOption }
			},
			() => {
				const selected = Object.keys(selectedOption).filter(key => selectedOption[key]);
				onSelect(selected);
			}
		);
	}

	selectWrapper = (key, e) => {
		const { onSelect, options = [], title, dataKey: dataKeyFromProps } = this.props;
		const optionValueType = typeof options[0].value;
		const dataKey = e && e.target ? e.target.getAttribute('data-key') : dataKeyFromProps || '';

		if (!e || !e.target || !e.target.getAttribute('data-value')) {
			return this.setState({ name: title, selected: '' }, () => onSelect(null, dataKey));
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
		const { name, selected, selectedOption, selectedChartKey } = this.state;
		const {
			//	selected,
			options,
			id,
			title,
			wrapperClassName,
			dropdownClassName,
			type,
			dataKey,
			reset,
			pullRight
		} = this.props;

		const count = Object.keys(selectedOption).filter(item => selectedOption[item]).length;
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
			`${count} selected`
		);

		const buttonTitle = selectedOption[selectedChartKey] === 0 || selected ? selectedTitle : title;
		const tooltip = <Tooltip id="tooltip">Please select a chart.</Tooltip>;
		return (
			<div className={`custom-select-box-wrapper ${wrapperClassName}`}>
				<DropdownButton
					title={buttonTitle}
					bsStyle={type}
					pullRight={pullRight}
					className={`custom-select-box ${dropdownClassName}`}
					id={id}
					onSelect={this.selectWrapper}
				>
					<div className="checkbox-wrapper" key={`${'select-all'}check`}>
						<Checkbox
							className=""
							data-value={SELECT_ALL.value}
							data-name={SELECT_ALL.name}
							data-key={dataKey}
							onChange={e => {
								this.handleMultiSelect(e);
							}}
							checked={selectedOption[SELECT_ALL.value]}
						>
							{SELECT_ALL.label}
						</Checkbox>
					</div>

					{options.map((option, key) => {
						if (option.isDisabled) {
							return (
								<OverlayTrigger overlay={tooltip} key={`id-${key}`}>
									<MenuItem
										eventKey={`id-${key}`}
										key={option.value}
										data-value={option.value}
										data-name={option.name}
										data-key={dataKey}
										active={selectedOption[option.value]}
										disabled={option.isDisabled}
									>
										{option.name}
									</MenuItem>
								</OverlayTrigger>
							);
						}
						return (
							<div className="checkbox-wrapper" key={`${option.name}check`}>
								<Checkbox
									className=""
									data-value={option.value}
									data-name={option.name}
									data-key={dataKey}
									onChange={e => {
										this.handleMultiSelect(e);
									}}
									checked={selectedOption[option.value]}
								>
									{option.name} {selectedOption[option.value]}
								</Checkbox>
							</div>
						);
					})}
				</DropdownButton>
			</div>
		);
	}
}

MultiSelectBox.propTypes = {
	id: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
		})
	).isRequired,
	selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	dropdownClassName: PropTypes.string,
	wrapperClassName: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	reset: PropTypes.bool,
	pullRight: PropTypes.bool
};

MultiSelectBox.defaultProps = {
	title: 'Select Value',
	dropdownClassName: '',
	wrapperClassName: '',
	type: 'default',
	selected: [],
	reset: false,
	pullRight: false
};

export default MultiSelectBox;

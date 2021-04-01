/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	DropdownButton,
	Checkbox,
	Glyphicon,
	OverlayTrigger,
	Tooltip
} from '@/Client/helpers/react-bootstrap-imports';

const findSelected = props => {
	const selectedOption = {};
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

	selected.map(key => {
		selectedOption[key] = true;
		return key;
	});

	return { selected: [...selected], name, selectedOption: { ...selectedOption } };
	// return { selected, name };
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
			selectedOption,
			selectAll: false
		};
		this.handleMultiSelect = this.handleMultiSelect.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		return { ...findSelected(props, state) };
	}

	// eslint-disable-next-line react/sort-comp
	handleMultiSelect(e) {
		const { target } = e;
		const dataValue = target.getAttribute('data-value');
		const { onSelect, options } = this.props;

		let { selectedOption, selectAll } = this.state;
		const checked = Boolean(e.target.checked);

		// logic for select/deSelect all
		if (dataValue === SELECT_ALL.value) {
			options.forEach(option => {
				if (!option.isDisabled) selectedOption[option.value] = checked;
			});
			selectAll = !selectAll;
		} else {
			options.forEach(option => {
				if (option.value === dataValue) {
					selectedOption[dataValue] = checked;
				}
				// to uncheck select all if any of th eoption is unchecked
				if (!checked) {
					selectAll = false;
				}
				return option;
			});
		}

		const selected = Object.keys(selectedOption).filter(key => selectedOption[key]);
		onSelect(selected);
		this.setState({
			selectAll
		});
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
		const { name, selected, selectedOption, selectedChartKey, selectAll } = this.state;
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
			pullRight,
			isMainReportingPanel
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
					{!isMainReportingPanel && (
						<div className="checkbox-wrapper" key={`${'select-all'}check`}>
							<Checkbox
								className={''}
								data-value={SELECT_ALL.value}
								data-name={SELECT_ALL.name}
								data-key={dataKey}
								onChange={e => {
									this.handleMultiSelect(e);
								}}
								checked={selectAll}
							>
								{SELECT_ALL.label}
							</Checkbox>
						</div>
					)}

					{options.map((option, key) => {
						const checked = selectedOption[option.value] ? true : false;
						if (option.isDisabled) {
							return (
								<div
									className={
										isMainReportingPanel
											? 'checkbox-wrapper reporting_reportby'
											: 'checkbox-wrapper'
									}
									key={`${option.name}check`}
								>
									<OverlayTrigger overlay={tooltip} key={`id-${key}`}>
										<Checkbox
											className=""
											data-value={option.value}
											data-name={option.name}
											data-key={dataKey}
											onChange={e => {
												this.handleMultiSelect(e);
											}}
											disabled
										>
											{option.name} {selectedOption[option.value]}
										</Checkbox>
									</OverlayTrigger>
								</div>
							);
						}
						return (
							<div
								className={
									isMainReportingPanel ? 'checkbox-wrapper reporting_reportby' : 'checkbox-wrapper'
								}
								key={`${option.name}check`}
							>
								<Checkbox
									className=""
									data-value={option.value}
									data-name={option.name}
									data-key={dataKey}
									onChange={e => {
										this.handleMultiSelect(e);
									}}
									checked={checked}
									disabled={isMainReportingPanel && !checked && selected.length >= 3}
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

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, FormControl } from 'react-bootstrap';

class FilterBox extends React.Component {
	state = {
		showFilterBox: false,
		showTitlesView: false,
		selectedTitle: null,
		showSelectedValuesView: false,
		valueSearchString: '',
		// eslint-disable-next-line react/no-unused-state
		valuesToShow: [],
		filters: {}
	};

	filterBoxRef = React.createRef();

	componentDidMount() {
		const { availableFilters } = this.props;

		this.setState(() => {
			const newState = { filters: {} };
			// eslint-disable-next-line no-restricted-syntax
			for (const filter of availableFilters) {
				newState.filters[filter.prop] = { name: filter.name, values: [] };
			}

			return newState;
		});
	}

	setValueSearchString = e => {
		this.setState({ valueSearchString: e.target.value });
	};

	resetValueSearchString = () => {
		this.setState({ valueSearchString: '' });
	};

	getFilteredValues = (valuesToFilter, valueSearchString) => {
		if (valueSearchString) {
			return valuesToFilter.filter(({ name }) =>
				name.toLowerCase().includes(valueSearchString.toLowerCase())
			);
		}

		return valuesToFilter;
	};

	toggleSelectedValuesView = showSelectedValuesView => {
		/*
		all view
		- search filtered

		selected view
		- selected values
		- search filtered
		*/
		const {
			selectedTitle: { prop },
			filters
		} = this.state;
		const {
			[prop]: { values: selectedValues }
		} = filters;
		const { availableFilters } = this.props;
		const values = [...availableFilters.find(filter => filter.prop === prop).values];

		this.setState(() => {
			const newState = {};

			if (showSelectedValuesView) {
				newState.showSelectedValuesView = showSelectedValuesView;
				newState.valuesToShow = values.filter(
					({ name: value }) => selectedValues.indexOf(value) > -1
				);
			}

			if (!showSelectedValuesView) {
				newState.showSelectedValuesView = showSelectedValuesView;
				newState.valuesToShow = values;
			}

			if (Object.keys(newState).length) {
				return newState;
			}

			return null;
		});
	};

	handleSelectAllValues = (checked, prop, values) => {
		const { valueSearchString, showSelectedValuesView } = this.state;

		// eslint-disable-next-line no-param-reassign
		if (valueSearchString) values = this.getFilteredValues(values, valueSearchString);

		this.setState(
			state => {
				const {
					filters: {
						[prop]: { values: selectedValues }
					}
				} = state;

				if (checked) {
					return {
						filters: {
							...state.filters,
							[prop]: {
								...state.filters[prop],
								values: [
									...new Set([...state.filters[prop].values, ...values.map(obj => obj.name)])
								]
							}
						}
					};
				}

				if (!checked && selectedValues.length) {
					const newSelectedValues = selectedValues.filter(
						value => !values.some(valueObj => valueObj.name === value)
					);
					if (showSelectedValuesView) {
						return {
							filters: {
								...state.filters,
								[prop]: {
									...state.filters[prop],
									values: newSelectedValues
								}
							},
							valuesToShow: []
						};
					}
					return {
						filters: {
							...state.filters,
							[prop]: {
								...state.filters[prop],
								values: newSelectedValues
							}
						}
					};
				}

				return null;
			},
			() => {
				const { filters } = this.state;
				const { handleFilters } = this.props;

				handleFilters(filters);
			}
		);
	};

	handleValueSelect = ({ target: { checked } }, currProp, value) => {
		this.setState(
			state => {
				if (checked) {
					if (state.filters[currProp].values.indexOf(value) > -1) return null;
					return {
						filters: {
							...state.filters,
							[currProp]: {
								...state.filters[currProp],
								values: state.filters[currProp].values
									? [...state.filters[currProp].values, value]
									: [value]
							}
						}
					};
				}

				const index = state.filters[currProp].values.indexOf(value);
				if (index === -1) return null;

				const selectedValuesCopy = [...state.filters[currProp].values];
				selectedValuesCopy.splice(index, 1);
				return {
					filters: {
						...state.filters,
						[currProp]: { ...state.filters[currProp], values: selectedValuesCopy }
					}
				};
			},
			() => {
				const { filters } = this.state;
				const { handleFilters } = this.props;

				handleFilters(filters);
			}
		);
	};

	showFilterBox = () => {
		this.setState(
			state => ({ showFilterBox: true, showTitlesView: !state.selectedTitle }),
			() => document.addEventListener('mousedown', this.hideFilterBox)
		);
	};

	hideFilterBox = e => {
		if (this.filterBoxRef && !this.filterBoxRef.current.contains(e.target)) {
			this.setState(
				() => ({ showFilterBox: false, showTitlesView: false, selectedTitle: null }),
				() => {
					this.resetValueSearchString();
					document.removeEventListener('mousedown', this.hideFilterBox);
				}
			);
		}
	};

	showValuesView = filterObj => {
		const { name, prop } = filterObj;
		const { availableFilters } = this.props;
		const values = [...availableFilters.find(filter => filter.prop === prop).values];

		return this.setState({
			showTitlesView: false,
			selectedTitle: { name, prop },
			valuesToShow: values
		});
	};

	clearFilter = filterProp => {
		this.setState(
			state => ({
				filters: { ...state.filters, [filterProp]: { ...state.filters[filterProp], values: [] } }
			}),
			() => {
				const { filters } = this.state;
				const { handleFilters } = this.props;

				handleFilters(filters);
			}
		);
	};

	hideValuesView = () => {
		this.setState({ showTitlesView: true, selectedTitle: null, valuesToShow: [] }, () =>
			this.resetValueSearchString()
		);
	};

	renderAppliedFilters = () => {
		const { filters } = this.state;
		const activeFilterProps = Object.keys(filters).filter(
			filterProp => !!filters[filterProp].values.length
		);
		const appliedFiltersJSX = activeFilterProps.map(activeFilterProp => (
			<li key={activeFilterProp} className="filter">
				<span className="filter-name">{filters[activeFilterProp].name}</span>
				<span className="filter-clear" onClick={() => this.clearFilter(activeFilterProp)}>
					x
				</span>
			</li>
		));

		return !!appliedFiltersJSX.length && <ul className="applied-filters">{appliedFiltersJSX}</ul>;
	};

	renderTitlesView = () => {
		const { availableFilters } = this.props;

		return (
			<div className="list-view titles-view">
				<ul className="titles">
					{[...availableFilters].map(({ name, prop }) => (
						<li key={prop} onClick={() => this.showValuesView({ name, prop })} className="fb-title">
							<span className="text">{name}</span>
							&raquo;
						</li>
					))}
				</ul>
			</div>
		);
	};

	renderValuesView = () => {
		const {
			selectedTitle: { prop: currProp },
			filters,
			valueSearchString,
			valuesToShow,
			showSelectedValuesView
		} = this.state;
		const selectedValues = filters[currProp].values;

		return (
			<div className="list-view values-view">
				<div className="control-box u-padding-3">
					<div className="list-btns u-margin-b3">
						<span onClick={this.hideValuesView}>&laquo; back to filters</span>
					</div>
					<div className="list-btns views-btns u-margin-b3">
						<span
							onClick={() => this.toggleSelectedValuesView(false)}
							className={`all-values ${!showSelectedValuesView ? 'active ' : ''}u-margin-r3`}
						>
							All
						</span>
						<span
							onClick={() => this.toggleSelectedValuesView(true)}
							className={`selected-values ${showSelectedValuesView ? 'active' : ''}`}
						>
							Selected ({selectedValues.length})
						</span>
					</div>
					<div className="search-box u-margin-b3">
						<FormControl
							type="text"
							value={valueSearchString}
							placeholder="Search"
							onChange={this.setValueSearchString}
						/>
						{valueSearchString && (
							<span className="clear-btn" onClick={this.resetValueSearchString}>
								x
							</span>
						)}
					</div>
					<div className="list-btns select-btns">
						<span
							onClick={() => this.handleSelectAllValues(true, currProp, valuesToShow)}
							className="u-margin-r3"
						>
							Select All
						</span>
						<span onClick={() => this.handleSelectAllValues(false, currProp, valuesToShow)}>
							None
						</span>
					</div>
				</div>

				<ul className="values">
					{!!valuesToShow.length &&
						this.getFilteredValues(valuesToShow, valueSearchString).map(({ name: value }) => {
							if (value.length > 25) {
								return (
									// eslint-disable-next-line react/no-array-index-key
									<li key={value}>
										<Checkbox
											checked={selectedValues.indexOf(value) !== -1}
											onChange={e => this.handleValueSelect(e, currProp, value)}
											title={value}
										>
											{`${value.substring(0, 25)}...`}
										</Checkbox>
									</li>
								);
							}

							return (
								// eslint-disable-next-line react/no-array-index-key
								<li key={value}>
									<Checkbox
										checked={selectedValues.indexOf(value) !== -1}
										onChange={e => this.handleValueSelect(e, currProp, value)}
									>
										{value}
									</Checkbox>
								</li>
							);
						})}
				</ul>
			</div>
		);
	};

	render() {
		const { showFilterBox, selectedTitle, showTitlesView } = this.state;
		const { className } = this.props;

		return (
			<div ref={this.filterBoxRef} className={`filterbox-wrap${className ? ` ${className}` : ''}`}>
				<span className="filter-label">filter</span>
				{this.renderAppliedFilters()}
				<div className="add-new-filter">
					<span onClick={this.showFilterBox} className="add-new-filter-btn">
						+ add
					</span>

					{showFilterBox && (
						<div className="filterbox">
							{showTitlesView && this.renderTitlesView()}
							{selectedTitle && this.renderValuesView()}
						</div>
					)}
				</div>
			</div>
		);
	}
}

FilterBox.propTypes = {
	className: PropTypes.string,
	availableFilters: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			prop: PropTypes.string.isRequired,
			values: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })).isRequired
		})
	).isRequired,
	handleFilters: PropTypes.func.isRequired
};

FilterBox.defaultProps = {
	className: ''
};

export default FilterBox;

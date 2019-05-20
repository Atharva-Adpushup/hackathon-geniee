import React, { Component } from 'react';
import { Glyphicon, Button, Checkbox, DropdownButton } from 'react-bootstrap';
// import '../../../../Components/SelectBox/styles.scss';
// import { ajax } from '../../../../common/helpers';

class AsyncGroupSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			showFilterValues: false,
			filterValues: [],
			filterResult: [],
			selectedFilters: props.selectedFilters,
			selectedFilterKey: '',
			selectBoxLabel: '+Add'
		};
		this.toggleList = this.toggleList.bind(this);
		this.fetchSelectedFilterValues = this.fetchSelectedFilterValues.bind(this);
		this.hideFilterValues = this.hideFilterValues.bind(this);
		this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
		this.handleFilterValueSelect = this.handleFilterValueSelect.bind(this);
	}

	toggleList() {
		this.setState({ open: !this.state.open });
	}

	handleFilterValueSelect(checked, key) {
		const { selectedFilters, selectedFilterKey } = this.state;
		if (selectedFilters[selectedFilterKey]) {
			if (checked) selectedFilters[selectedFilterKey][key] = true;
			else delete selectedFilters[selectedFilterKey][key];
		}
		this.setState(
			{
				selectedFilters
			},
			() => {
				this.props.onFilterValueChange(selectedFilters);
			}
		);
	}

	fetchSelectedFilterValues(filter) {
		const { props } = this;
		const { selectedFilters } = this.state;
		props.getSelectedFilter(filter).then(response => {
			if (response && response.result && response.result.length > 0) {
				selectedFilters[filter.value] = selectedFilters[filter.value] || {};
				this.setState({
					filterValues: response.result,
					filterResult: response.result,
					selectedFilterKey: filter.value,
					selectedFilters,
					showFilterValues: true
				});
			}
		});
	}

	hideFilterValues() {
		this.setState({
			showFilterValues: false
		});
	}

	handleSearchTextChange(e) {
		let currentList = [];

		let newList = [];

		if (e.target.value !== '') {
			currentList = this.state.filterResult;

			newList = currentList.filter(item => {
				if (item.value) {
					const lc = item.value.toLowerCase();

					const filter = e.target.value.toLowerCase();

					return lc.includes(filter);
				}
				return false;
			});
		} else {
			newList = this.state.filterResult;
		}

		this.setState({
			filterValues: newList
		});
	}

	render() {
		const { state, props } = this;
		let selectBoxLabel = '';
		for (const filterKey in state.selectedFilters) {
			if (Object.keys(state.selectedFilters[filterKey]).length)
				selectBoxLabel += `${filterKey} ${
					Object.keys(state.selectedFilters[filterKey]).length
				} selected, \t `;
		}
		selectBoxLabel = selectBoxLabel || '+Add';
		return (
			<div className="custom-select-box-wrapper">
				<DropdownButton className="custom-select-box" aria-hidden="true" title={selectBoxLabel}>
					<div className={`react-select-box-off-screen  ${state.showFilterValues ? 'u-hide' : ''}`}>
						{props.filterList.map(filter => (
							<Button
								className="react-select-box-option"
								key={filter.value}
								disabled={filter.isDisabled}
								onClick={() => {
									this.fetchSelectedFilterValues(filter);
								}}
							>
								{filter.name}
								<Glyphicon glyph="menu-right" className="mR-5 float-right" />
							</Button>
						))}
					</div>
					<div
						className={`react-select-box-off-screen-1  ${!state.showFilterValues ? 'u-hide' : ''}`}
						aria-hidden="true"
					>
						<a
							className="react-select-box-option"
							style={{ cursor: 'pointer' }}
							onClick={this.hideFilterValues}
						>
							<Glyphicon glyph="menu-left" className="mR-5" />
							Back to filters
						</a>
						<input
							type="text"
							className="input inputSearch"
							placeholder="Search..."
							onChange={this.handleSearchTextChange}
							onSelect={e => e.stopPropagation()}
						/>
						<div className="filterValues">
							{state.filterValues.map(filterValue => (
								<Checkbox
									className="col-sm-12"
									key={filterValue.id}
									onChange={e => {
										this.handleFilterValueSelect(e.target.checked, filterValue.id);
									}}
									checked={state.selectedFilters[state.selectedFilterKey][filterValue.id] || false}
								>
									{filterValue.value}
								</Checkbox>
							))}
						</div>
					</div>
				</DropdownButton>
			</div>
		);
	}
}

export default AsyncGroupSelect;

import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
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
		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.fetchSelectedFilterValues = this.fetchSelectedFilterValues.bind(this);
		this.hideFilterValues = this.hideFilterValues.bind(this);
		this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
		this.handleFilterValueSelect = this.handleFilterValueSelect.bind(this);
	}

	handleClickOutside() {
		this.setState({ open: false });
	}
	toggleList() {
		this.setState({ open: !this.state.open });
	}

	handleFilterValueSelect(checked, key) {
		let { selectedFilters, selectedFilterKey } = this.state;
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
		ajax({
			method: 'GET',
			url: `http://staging.adpushup.com/CentralReportingWebService${filter.path}`
		}).then(res => {
			let { selectedFilters } = this.state;
			this.setState({
				showFilterValues: true
			});
			if (res.description == 'SUCCESS') {
				selectedFilters[filter.value] = selectedFilters[filter.value] || {};
				this.setState({
					filterValues: res.data.result,
					filterResult: res.data.result,
					selectedFilterKey: filter.value,
					selectedFilters
				});
			}
			console.log(res);
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
				const lc = item.value.toLowerCase();

				const filter = e.target.value.toLowerCase();

				return lc.includes(filter);
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
		for (let filterKey in state.selectedFilters) {
			if (Object.keys(state.selectedFilters[filterKey]).length)
				selectBoxLabel += `${filterKey} ${
					Object.keys(state.selectedFilters[filterKey]).length
				} selected, \t `;
		}
		selectBoxLabel = selectBoxLabel || '+Add';
		return (
			<div className="custom-select-box-wrapper">
				<DropdownButton
					className="custom-select-box"
					aria-hidden="true"
					title={selectBoxLabel}
					onClick={this.toggleList}
				>
					<div
						className={`react-select-box-off-screen  ${
							state.showFilterValues ? 'react-select-box-hidden' : ''
						}`}
					>
						{props.filterList.map(filter => {
							return (
								<Button
									className="react-select-box-option"
									key={filter.value}
									disabled={filter.isDisabled}
									onClick={() => {
										this.fetchSelectedFilterValues(filter);
									}}
								>
									{filter.label}
									<Glyphicon glyph="menu-right" className="mR-5 float-right" />
								</Button>
							);
						})}
					</div>
					<div
						className={`react-select-box-off-screen-1  ${
							!state.showFilterValues ? 'react-select-box-hidden' : ''
						}`}
						aria-hidden="true"
					>
						<a className="react-select-box-option" onClick={this.hideFilterValues}>
							<Glyphicon glyph="menu-left" className="mR-5" />
							Back to filters
						</a>
						<input
							type="text"
							className="input inputSearch"
							placeholder="Search..."
							onChange={this.handleSearchTextChange}
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

export default onClickOutside(AsyncGroupSelect);

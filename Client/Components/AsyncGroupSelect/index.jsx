import React, { Component } from 'react';
import { Glyphicon, Button, Checkbox, DropdownButton, Label, InputGroup } from 'react-bootstrap';
import { isEmpty } from 'lodash';
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
			selectBoxLabel: '+Add',
			isLoading: false
		};
		this.toggleList = this.toggleList.bind(this);
		this.fetchSelectedFilterValues = this.fetchSelectedFilterValues.bind(this);
		this.hideFilterValues = this.hideFilterValues.bind(this);
		this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
		this.handleFilterValueSelect = this.handleFilterValueSelect.bind(this);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.selectedFilters !== this.props.selectedFilters) {
			this.setState({ selectedFilters: this.props.selectedFilters });
		}
	}

	toggleList() {
		this.setState({ open: !this.state.open });
	}
	loader = () => (
		<div className="loaderwrapper spinner-small" data-id="loader" style={{ display: 'block' }}>
			<i className="fa fa-spinner" />
		</div>
	);

	handleFilterValueSelect(checked, key) {
		const { selectedFilters, selectedFilterKey } = this.state;
		selectedFilters[selectedFilterKey] = selectedFilters[selectedFilterKey] || {};
		if (checked) selectedFilters[selectedFilterKey][key] = true;
		else delete selectedFilters[selectedFilterKey][key];
		for (let filter in selectedFilters) {
			if (_.isEmpty(selectedFilters[filter])) delete selectedFilters[filter];
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
		this.setState({ isLoading: true });
		props.getSelectedFilter(filter).then(response => {
			if (
				response.status == 200 &&
				response.data &&
				response.data.result &&
				response.data.result.length > 0
			) {
				this.setState({
					filterValues: response.data.result,
					filterResult: response.data.result,
					selectedFilterKey: filter.value,
					selectedFilters,
					showFilterValues: true,
					isLoading: false
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
		let selectBoxLabels = [];
		for (const filterKey in state.selectedFilters) {
			if (Object.keys(state.selectedFilters[filterKey]).length) {
				let selectBoxLabelText = `${filterKey} ${
					Object.keys(state.selectedFilters[filterKey]).length
				} selected`;
				selectBoxLabels.push(
					<Label bsStyle="info" className="u-margin-r2" style={{ height: '19px' }}>
						{selectBoxLabelText}
						<Glyphicon
							glyph="remove"
							className="u-margin-l1"
							onClick={e => {
								e.stopPropagation();
								let { selectedFilters } = state;
								selectedFilters[filterKey] = {};
								this.setState({ selectedFilters });
							}}
						/>
					</Label>
				);
			}
		}
		selectBoxLabels = selectBoxLabels.length ? selectBoxLabels : '+Add';
		return (
			<InputGroup>
				<InputGroup.Addon>Filter</InputGroup.Addon>
				<div className="custom-select-box-wrapper">
					<DropdownButton
						id="async-group-select-dropdown"
						className=" custom-select-box u-padding-l2 "
						aria-hidden="true"
						title={<div className="aligner aligner--hStart  aligner--wrap">{selectBoxLabels}</div>}
					>
						{state.isLoading ? this.loader() : ''}
						<div
							className={`react-select-box-off-screen  ${state.showFilterValues ? 'u-hide' : ''}`}
						>
							{props.filterList.map(filter => (
								<Button
									className="react-select-box-option"
									style={{ border: 'none' }}
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
							className={`react-select-box-off-screen-1  ${
								!state.showFilterValues ? 'u-hide' : ''
							}`}
							aria-hidden="true"
						>
							<div>
								<a onClick={this.hideFilterValues} style={{ cursor: 'pointer' }}>
									<Glyphicon glyph="menu-left" className="mR-5" />
									Back to filters
								</a>
							</div>
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
										checked={
											state.selectedFilters[state.selectedFilterKey]
												? state.selectedFilters[state.selectedFilterKey][filterValue.id]
												: false
										}
									>
										{filterValue.value}
									</Checkbox>
								))}
							</div>
						</div>
					</DropdownButton>
				</div>
			</InputGroup>
		);
	}
}

export default AsyncGroupSelect;

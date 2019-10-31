import React from 'react';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import SelectBox from '../../../../Components/SelectBox/index';

class GlobalSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			filteredData: [],
			columnSearch: '',
			searchInput: ''
		};
	}

	handleChange = event => {
		const val = event.target.value;
		this.setState({ searchInput: val }, () => this.globalSearch());
		this.props.handleSetSearchInput(val);
	};

	globalSearch = () => {
		const { searchInput, columnSearch } = this.state;
		let filteredData = this.props.data.filter(value => {
			if (columnSearch) {
				return value[columnSearch]
					.toString()
					.toLowerCase()
					.includes(searchInput.toLowerCase());
			}
			return (
				value.accountEmail.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.domain.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.onboardingStatus.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.activeBidders.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.activeProducts.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.adManager.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.authEmail.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.dateCreated.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.inactiveBidders.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.publisherId.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.activeStatus.toLowerCase().includes(searchInput.toLowerCase()) ||
				value.siteId
					.toString()
					.toLowerCase()
					.includes(searchInput.toLowerCase()) ||
				value.revenueShare
					.toString()
					.toLowerCase()
					.includes(searchInput.toLowerCase())
			);
		});

		this.props.handleSetFilteredData(filteredData);
	};

	setColumnSearch = e => {
		this.setState({ columnSearch: e.target.value }, () => this.globalSearch());
	};

	render() {
		const { columns } = this.props;
		const { columnSearch } = this.state;

		return (
			<div className="u-margin-v4 u-padding-h4 ">
				<FieldGroup
					name="searchInput"
					value={this.state.searchInput || ''}
					label="Quick Search"
					onChange={this.handleChange}
					size={6}
					placeholder="Search in the table "
					className="u-padding-v4 u-padding-h4 "
				/>
			</div>
		);
	}
}

export default GlobalSearch;

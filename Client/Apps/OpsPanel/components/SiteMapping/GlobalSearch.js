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
				value.authEmail.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.onboardingStatus.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.accountEmail.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.adManager.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.domain.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.dateCreated.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.publisherId.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.activeStatus.toLowerCase().includes(searchInput.toLowerCase().trim()) ||
				value.siteId
					.toString()
					.toLowerCase()
					.includes(searchInput.toLowerCase().trim()) ||
				value.revenueShare
					.toString()
					.toLowerCase()
					.includes(searchInput.toLowerCase().trim())
			);
		});

		this.props.handleSetFilteredData(filteredData);
	};

	setColumnSearch = e => {
		this.setState({ columnSearch: e.target.value }, () => this.globalSearch());
	};

	render() {
		const { columns } = this.props;
		const { columnSearch, searchInput } = this.state;

		return (
			<div className="u-margin-v4 u-padding-h4 ">
				<FieldGroup
					name="searchInput"
					value={searchInput || ''}
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

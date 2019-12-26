import React from 'react';
import { FormGroup, InputGroup, FormControl } from '@/Client/helpers/react-bootstrap-imports';

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

			if (typeof value.activeProducts === 'string' && value.activeProducts === 'N/A') {
				value.activeProducts = [];
			}

			return value.activeBidders
				.map(val => val.toLowerCase().includes(searchInput.toLowerCase().trim()))
				.includes(true)
				? true
				: false ||
				  value.inactiveBidders
						.map(val => val.toLowerCase().includes(searchInput.toLowerCase().trim()))
						.includes(true)
				? true
				: false ||
				  value.activeProducts
						.map(val => val.toLowerCase().includes(searchInput.toLowerCase().trim()))
						.includes(true)
				? true
				: false ||
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
						.includes(searchInput.toLowerCase().trim());
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
				<p className="u-text-bold">Quick Search</p>
				<FormGroup>
					<InputGroup style={{ display: 'flex' }}>
						<select
							onChange={e => {
								e.persist();
								this.setColumnSearch(e);
							}}
							value={columnSearch}
							style={{ backgroundColor: '#eee' }}
						>
							<option value=""> All columns</option>
							{columns.map(col => {
								return <option value={col.accessor}>{col.Header}</option>;
							})}
						</select>
						<FormControl
							type="text"
							name="searchInput"
							value={searchInput || ''}
							onChange={this.handleChange}
							size={6}
							placeholder="Search in the table "
							className="u-padding-v4 u-padding-h4 "
						/>
					</InputGroup>
				</FormGroup>
			</div>
		);
	}
}

export default GlobalSearch;

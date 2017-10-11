import React, { Component } from 'react';
import SelectBox from '../../../Components/SelectBox/index.jsx';

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedPageGroup: null
		};
		this.pageGroupChanged = this.pageGroupChanged.bind(this);
	}

	pageGroupChanged(selectedPageGroup) {
		this.setState({ selectedPageGroup });
	}

	render() {
		const pageGroups = window.pageGroups;

		return (
			<div>
				<SelectBox
					value={this.state.selectedPageGroup}
					label="Select PageGroup"
					onChange={this.pageGroupChanged}
				>
					{pageGroups.map((pageGroup, index) => (
						<option key={index} value={index}>
							{pageGroup}
						</option>
					))}
				</SelectBox>
			</div>
		);
	}
}

export default ReportControls;

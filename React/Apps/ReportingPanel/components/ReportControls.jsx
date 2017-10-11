import React, { Component } from 'react';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import config from '../lib/config';
class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedPageGroup: null,
			selectedPlatform: null
		};
		this.pageGroupChanged = this.pageGroupChanged.bind(this);
		this.platformChanged = this.platformChanged.bind(this);
	}

	pageGroupChanged(selectedPageGroup) {
		this.setState({ selectedPageGroup });
	}

	platformChanged(selectedPlatform) {
		this.setState({ selectedPlatform });
	}

	render() {
		const pageGroups = window.pageGroups,
			{ platforms } = config;

		return (
			<div className="report-controls-wrapper">
				<Row>
					<Col sm={3}>
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
					</Col>
					<Col sm={3}>
						<SelectBox
							value={this.state.selectedPlatform}
							label="Select Platform"
							onChange={this.platformChanged}
						>
							{platforms.map((platform, index) => (
								<option key={index} value={index}>
									{platform}
								</option>
							))}
						</SelectBox>
					</Col>
					<Col sm={3}>date</Col>
					<Col sm={3}>button</Col>
				</Row>
			</div>
		);
	}
}

export default ReportControls;

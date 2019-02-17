import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard/index';
import SplitScreen from '../../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import { COMPONENT_TITLES } from '../../constants/index';

class Home extends Component {
	constructor(props) {
		super(props);
		const defaultNavItem = 1;
		this.state = {
			activeNav: defaultNavItem,
			title: COMPONENT_TITLES[defaultNavItem]
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value, title: COMPONENT_TITLES[value] });
	}

	renderControlConversionLeftPanel() {
		const buttonToggle = [
			{
				value: 1,
				text: 'AdSense'
			},
			{
				value: 2,
				text: 'Medianet'
			},
			{
				value: 3,
				text: 'Other'
			}
		];

		return (
			<div className="clearfix">
				<FieldGroup
					id="toggle-button-group"
					label="Select control ad type"
					type="toggle-button-group"
					buttonToggle={buttonToggle}
				/>

				<FieldGroup
					id="input-text-siteId"
					label="Enter site id"
					type="text"
					placeholder="For example 25019, 31000"
					className="u-width-half"
				/>

				<CustomButton variant="primary" className="" onClick={() => {}}>
					Convert
				</CustomButton>
			</div>
		);
	}

	renderContent() {
		const { activeNav } = this.state;
		switch (activeNav) {
			default:
			case 1:
				return (
					<SplitScreen
						leftChildren={this.renderControlConversionLeftPanel()}
						rightChildren={<h4 className="u-margin-t3 u-margin-b4 pull-right">Output</h4>}
					/>
				);
			case 2:
				return <div>Ad Layout component</div>;
		}
	}

	render() {
		const { title, activeNav } = this.state;
		return (
			<ActionCard title={title}>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Control Code Conversion</NavItem>
					<NavItem eventKey={2}>Visit Visual Editor</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;

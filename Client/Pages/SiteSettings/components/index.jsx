import React, { Component } from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import SplitScreen from '../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../Components/Layout/FieldGroup';
import CustomButton from '../../../Components/CustomButton/index';
import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';

library.add(
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle
);

class SiteSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleButtonClickHandler = this.handleButtonClickHandler.bind(this);
	}

	handleButtonClickHandler(inputParam) {
		const _ref = this;

		console.log('inputParam value', inputParam);
	}

	renderLeftPanel() {
		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4">AP Head Code</h4>

				<CustomButton
					variant="primary"
					className=""
					name="convertButton"
					onClick={this.handleButtonClickHandler}
				>
					Convert
				</CustomButton>
				<CustomButton
					variant="secondary"
					className="u-margin-l3"
					name="resetButton"
					onClick={this.handleButtonClickHandler}
				>
					Reset
				</CustomButton>
			</div>
		);
	}

	renderRightPanel() {
		const _ref = this;

		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4">Manage Blocklist</h4>
			</div>
		);
	}

	render() {
		return (
			<ActionCard title="My Sites">
				<SplitScreen
					rootClassName="u-padding-h4 u-padding-v5"
					leftChildren={this.renderLeftPanel()}
					rightChildren={this.renderRightPanel()}
				/>
			</ActionCard>
		);
	}
}

export default SiteSettings;

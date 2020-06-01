/* eslint-disable no-nested-ternary */
import React, { Component, Fragment } from 'react';

import {
	FormGroup,
	ControlLabel,
	FormControl,
	Panel,
	PanelGroup
} from '@/Client/helpers/react-bootstrap-imports';

import CustomButton from '../../../../../../Components/CustomButton/index.jsx';
import axiosInstance from '../../../../../../helpers/axiosInstance';

const DEFAULT_STATE = {
	beforeJsSnippet: '',
	isLoading: false
};

class SiteLevelBeforeJS extends Component {
	constructor(props) {
		super(props);

		this.state = {
			...DEFAULT_STATE
		};
	}

	componentDidMount() {
		const {
			sitesData,
			site: { siteId }
		} = this.props;

		const siteLevelData = sitesData[siteId];
		const { apConfigs = {} } = siteLevelData;
		const { beforeJs = '' } = apConfigs;

		this.setState({ beforeJsSnippet: atob(beforeJs) });
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSelect = value => {
		const {
			site: { siteId }
		} = this.props;
		this.setState({
			activeKey: value
		});
	};

	handleGenerate = () => {
		const { beforeJsSnippet } = this.state;

		const { site, showNotification } = this.props;
		const { siteId } = site;

		if (!beforeJsSnippet) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Please add the JS Snippet to Save',
				autoDismiss: 5
			});
		}

		return axiosInstance
			.post(`/site/siteLevelBeforeJs/${siteId}`, { beforeJs: btoa(beforeJsSnippet) })
			.then(res => {
				this.setState({ isLoading: false });
				return showNotification({
					mode: 'success',
					title: 'Success',
					message: `Settings saved Successfully`,
					autoDismiss: 5
				});
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Something Went Wrong',
					autoDismiss: 5
				});

				this.setState({ isLoading: false });
			});
	};

	renderView = () => {
		const { beforeJsSnippet, isLoading } = this.state;

		return (
			<div>
				<div className="u-margin-t4">
					<FormGroup controlId="beforeJsSnippet-input">
						<ControlLabel>Custom Script</ControlLabel>
						<FormControl
							componentClass="textarea"
							placeholder="Custom Script"
							name="beforeJsSnippet"
							onChange={this.handleChange}
							value={beforeJsSnippet}
							className="u-padding-v4 u-padding-h4"
						/>
					</FormGroup>
				</div>

				<CustomButton
					type="submit"
					variant="primary"
					className="pull-right u-margin-r3"
					showSpinner={isLoading}
					onClick={this.handleGenerate}
				>
					Save
				</CustomButton>
			</div>
		);
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { activeKey } = this.state;
		return (
			<div className="u-margin-t4">
				<PanelGroup
					accordion
					id={`siteLevelBeforeJs-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Panel eventKey="siteLevelBeforeJs">
						<Panel.Heading>
							<Panel.Title toggle>Script Injection </Panel.Title>
						</Panel.Heading>
						{activeKey === 'siteLevelBeforeJs' ? (
							<Panel.Body collapsible>{this.renderView()}</Panel.Body>
						) : null}
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default SiteLevelBeforeJS;

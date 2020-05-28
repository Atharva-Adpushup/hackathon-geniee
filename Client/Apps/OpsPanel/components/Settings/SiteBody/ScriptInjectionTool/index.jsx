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

class ScriptInjectionTool extends Component {
	constructor(props) {
		super(props);

		this.state = {
			...DEFAULT_STATE
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleReset = () => this.setState(DEFAULT_STATE);

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
				message: 'Both the snippets are mandatory',
				autoDismiss: 5
			});
		}

		return axiosInstance
			.post(`/site/scriptInjection/${siteId}`, { beforeJs: btoa(beforeJsSnippet) })
			.then(res => {
				this.setState({ isLoading: false }, this.handleReset);
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
					<FormGroup controlId="adsTxtSnippet-input">
						<ControlLabel>CustomJS Snippet</ControlLabel>
						<FormControl
							componentClass="textarea"
							placeholder="CustomJS Snippet"
							name="beforeJsSnippet"
							onChange={this.handleChange}
							value={beforeJsSnippet}
							className="u-padding-v4 u-padding-h4"
						/>
					</FormGroup>
				</div>

				<CustomButton
					variant="secondary"
					className="pull-right u-margin-r3"
					onClick={this.handleReset}
				>
					Reset
				</CustomButton>
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
					id={`scriptInjection-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Panel eventKey="scriptInjection">
						<Panel.Heading>
							<Panel.Title toggle>Script Injection</Panel.Title>
						</Panel.Heading>
						{activeKey === 'scriptInjection' ? (
							<Panel.Body collapsible>{this.renderView()}</Panel.Body>
						) : null}
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default ScriptInjectionTool;

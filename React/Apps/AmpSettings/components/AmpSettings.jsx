import React from 'react';
import ActionCard from '../../../Components/ActionCard.jsx';
import InputControl from './helper/InputControl.jsx';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/customToggleSwitch.jsx';
import Dropdown from './helper/Dropdown.jsx';
import commonConsts from '../lib/commonConsts';
import PageGroupSettings from './PageGroupSettings.jsx';
import SendAmpData from './SendAmpData.jsx';
import { ajax } from '../../../common/helpers';
//import '../styles.scss';
import { Grid, Row, Col, Alert, Button } from 'react-bootstrap';
class AmpSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			channels: []
		};
		this.fetchAmpSettings = this.fetchAmpSettings.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
	}
	fetchAmpSettings() {
		ajax({
			method: 'GET',
			url: '/user/site/16425/ampSettingsData'
		})
			.then(res => {
				this.setState({
					channels: res.channels
				});
			})
			.catch(res => {
				console.log(res);
			});
	}
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
	}
	renderInputControl(label, name, value) {
		console.log(label, value);
		return (
			<Row>
				<Col sm={5}>
					<div>{label}</div>
				</Col>
				<Col sm={7}>
					<input
						onChange={this.handleOnChange}
						className="form-control"
						type="text"
						placeholder={label}
						name={name}
						defaultValue={value}
					/>
				</Col>
			</Row>
		);
	}
	sendAmpData(event) {
		event.preventDefault();
		ajax({
			method: 'POST',
			url: '/user/site/16425/pagegroup/saveAmpSettings',
			data: JSON.stringify({
				url: window.location.href,
				channelData: {
					siteId: adp.config.siteId,
					platform: 'MOBILE',
					pagegroup: adp.config.pageGroup || null
				}
			})
		})
			.then(res => {
				console.log(res);
			})
			.catch(res => {
				console.log(res);
			});
	}
	componentDidMount() {
		this.fetchAmpSettings();
	}
	render() {
		return (
			<Row>
				<ActionCard title="AMP settings">
					<div className="settings-pane">
						<Row>
							<Col sm={6}>
								<form>
									<Heading title="Site Level Settings" />
									{this.renderInputControl('Settings', 'settings')}
									<Button className="btn-success" type="submit">
										Save
									</Button>
								</form>
								<hr />
								<SendAmpData channels={this.state.channels} />
							</Col>
							<Col sm={6}>
								<Heading title="Channel Level Settings" />
								{this.state.channels.map(channel => {
									return <PageGroupSettings channel={channel} key={channel.pageGroup} />;
								})}
							</Col>
						</Row>
					</div>
				</ActionCard>
			</Row>
		);
	}
}

export default AmpSettings;

import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import { ajax } from '../../../common/helpers';
class SendAmpData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pageGroup: '',
			conversionType: '',
			siteId: props.siteId,
			siteDomain: props.siteDomain
		};
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
		this.renderOtherFields = this.renderOtherFields.bind(this);
		this.send = this.send.bind(this);
	}
	renderInputControl(label, name, value) {
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
						value={value}
					/>
				</Col>
			</Row>
		);
	}
	renderOtherFields() {
		if (this.state.conversionType == 'pagegroup')
			return (
				<RowColSpan label="Select PageGroup">
					<select
						className="form-control"
						value={this.state.pageGroup}
						name="pageGroup"
						onChange={this.handleOnChange}
					>
						<option value="">Select Pagegroup</option>
						{this.props.channels.map((channel, index) => (
							<option value={channel.pageGroup} key={index}>
								{channel.pageGroup}
							</option>
						))}
					</select>
				</RowColSpan>
			);
		else if (this.state.conversionType == 'url')
			return (
				<div>
					{this.renderInputControl('URL(eg. http://abc.com/xyz)', 'url')}
					<RowColSpan label="Select PageGroup">
						<select
							className="form-control"
							value={this.state.pageGroup}
							name="pageGroup"
							onChange={this.handleOnChange}
						>
							<option value="">Select Pagegroup</option>
							{this.props.channels.map((channel, index) => (
								<option value={channel.pageGroup} key={index}>
									{channel.pageGroup}
								</option>
							))}
						</select>
					</RowColSpan>
				</div>
			);
		else return '';
	}
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
		console.log(name, value);
	}
	send(e) {
		let { siteId } = this.state, data, url;
		if (this.state.conversionType == 'site') {
			data = {
				website: this.state.siteDomain
			};
			url = 'http://autoamp.io/ampReconversion';
		} else if (this.state.conversionType == 'pagegroup') {
			data = {
				website: this.state.siteDomain,
				pagegroup: this.state.pageGroup || null
			};
			url = 'http://autoamp.io/ampReconversion';
		} else if (this.state.conversionType == 'url') {
			data = {
				url: this.state.url,
				channelData: {
					siteId: this.state.siteId,
					platform: 'MOBILE',
					pagegroup: this.state.pageGroup || null
				},
				force: true
			};
			url = 'http://autoamp.io/publishAmpJob';
		}
		e.preventDefault();
		ajax({
			method: 'POST',
			// url: 'http://localhost:4000/publishAmpJob',
			url: url,
			data: JSON.stringify(data)
		})
			.then(res => {
				console.log(res);
			})
			.catch(res => {
				console.log(res);
			});
	}
	render() {
		return (
			<form onSubmit={this.send}>
				<Heading title="Force AMP conversion" />
				<RowColSpan label="Select conversion level">
					<select
						className="form-control"
						value={this.state.conversionType}
						name="conversionType"
						onChange={this.handleOnChange}
					>
						<option value="">Select</option>
						<option value="site">Site</option>
						<option value="pagegroup">Pagegroup</option>
						<option value="url">URL</option>
					</select>
				</RowColSpan>
				{this.renderOtherFields()}
				<Button className="btn-success" type="submit">
					Send
				</Button>
			</form>
		);
	}
}

export default SendAmpData;

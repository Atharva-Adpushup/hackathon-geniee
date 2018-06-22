import React from 'react';
import { Grid, Row, Col, Alert, Button } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import { ajax } from '../../../common/helpers';
class SendAmpData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pageGroup: ''
		};
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
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
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
		console.log(name, value);
	}
	send(e) {
		e.preventDefault();
		ajax({
			method: 'POST',
			url: '/abc',
			data: JSON.stringify({
				pageGroup: this.state.pageGroup,
				url: this.state.url
			})
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
				<Heading title="Send AMP Data" />
				{this.renderInputControl('URL(eg. http://abc.com/xyz)', 'url')}
				<RowColSpan label="Select PageGroup">
					<select
						className="form-control"
						value={this.state.pageGroup}
						name="pageGroup"
						onChange={this.handleOnChange}
					>
						<option value="">Select Pagegroup</option>
						{this.props.channels.map(channel => (
							<option value={channel.pageGroup}>{channel.pageGroup}</option>
						))}
					</select>
				</RowColSpan>
				<Button className="btn-success" type="submit">
					Send
				</Button>
			</form>
		);
	}
}

export default SendAmpData;

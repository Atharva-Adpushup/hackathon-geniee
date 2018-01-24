import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { showNotification } from 'actions/uiActions';
import { savePersonalizationInfo } from 'actions/variationActions';
import { personalizationTypes } from '../../../../consts/commonConsts';
import SelectBox from 'shared/select/select.js';

class Personalization extends Component {
	constructor(props) {
		super(props);
		this.state = {
			countries: '',
			type: false
		};
		this.submitHandler = this.submitHandler.bind(this);
		this.checkCountries = this.checkCountries.bind(this);
	}
	checkCountries(countries) {
		return _.some(countries, country => (country.trim().length == 0 || country.trim().length >= 3 ? true : false));
	}
	submitHandler() {
		let { countries, type } = this.state;
		countries = countries.trim().length ? countries.split(',') : false;
		if (!type) {
			this.props.showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Type cannot be left blank'
			});
			return;
		} else if (!countries || this.checkCountries(countries)) {
			this.props.showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Country Code should not be left blank and should be 2 chars only'
			});
			return;
		}
		this.props.savePersonalizationInfo(this.props.variation, {
			geo: {
				type: this.state.type,
				values: _.map(countries, country => country.toUpperCase())
			}
		});
	}
	render() {
		return (
			<div>
				<h1 className="variation-section-heading">Personalization</h1>
				<Col xs={7}>
					<Row>
						<Col xs={5} className="u-padding-r10px">
							<strong>Type</strong>
						</Col>
						<Col xs={7} className="u-padding-l10px">
							<SelectBox
								value={this.state.type}
								label="Select Type"
								onChange={type => {
									this.setState({ type });
								}}
							>
								{personalizationTypes.map((item, index) => (
									<option key={item} value={item}>
										{item[0].toUpperCase() + item.substring(1)}
									</option>
								))}
							</SelectBox>
						</Col>
					</Row>
					<Row>
						<Col xs={5} className="u-padding-r10px">
							<strong>Countries</strong>
						</Col>
						<Col xs={7} className="u-padding-l10px">
							<input
								type="text"
								value={this.state.countries}
								placeholder="Enter Countries"
								className="inputBasic mB-10"
								onChange={ev => {
									this.setState({ countries: ev.target.value });
								}}
							/>
						</Col>
					</Row>
					<Row>
						<Col xs={7} xsPush={5}>
							<Col xs={3} style={{ padding: '0px' }}>
								<Button className="btn-lightBg btn-save btn-block" onClick={this.submitHandler}>
									Save
								</Button>
							</Col>
						</Col>
					</Row>
				</Col>
			</div>
		);
	}
}

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				showNotification: showNotification,
				savePersonalizationInfo: savePersonalizationInfo
			},
			dispatch
		)
)(Personalization);

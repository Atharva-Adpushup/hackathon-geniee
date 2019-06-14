import React from 'react';
import { Form, Modal, FormGroup, Col, ControlLabel } from 'react-bootstrap';
import CustomButton from '../../../Components/CustomButton';
import Selectbox from '../../../Components/Selectbox';
import countries from '../constants/countries';
import deviceWiseAdSizes from '../constants/deviceWiseAdSizes';

class BidderRuleModal extends React.Component {
	state = {
		bidderRule: {
			bidder: '',
			device: '',
			sizesSupported: [],
			country: '',
			status: null
		}
	};

	static getDerivedStateFromProps(props, state) {
		const { bidderRule } = props;

		if (bidderRule && !state.bidderRule.bidder) {
			return {
				bidderRule
			};
		}

		return null;
	}

	onSelect = (key, value) =>
		this.setState(state => ({ bidderRule: { ...state.bidderRule, [key]: value } }));

	renderPartnerSelectBox = () => {
		const { bidderRule } = this.state;
		const { getFilteredBidders } = this.props;
		const options = Object.entries(getFilteredBidders()).map(([value, name]) => ({ name, value }));

		return (
			<Selectbox
				id="bidder-rule-partner"
				options={options}
				selected={bidderRule ? bidderRule.bidder : null}
				onSelect={selectedValue => this.onSelect('bidder', selectedValue)}
			/>
		);
	};

	renderCountriesSelectBox = () => {
		const { bidderRule } = this.state;

		const options = Object.entries(countries).map(([value, name]) => ({ name, value }));

		return (
			<Selectbox
				id="bidder-rule-countries"
				options={options}
				selected={bidderRule ? bidderRule.country : null}
				onSelect={selectedValue => this.onSelect('country', selectedValue)}
			/>
		);
	};

	renderDevicesSelectBox = () => {
		const { bidderRule } = this.state;
		const options = [
			{ name: 'Desktop', value: 'desktop' },
			{ name: 'Tablet', value: 'tablet' },
			{ name: 'Phone', value: 'phone' }
		];

		return (
			<Selectbox
				id="bidder-rule-device"
				options={options}
				selected={bidderRule ? bidderRule.device : null}
				onSelect={selectedValue => this.onSelect('device', selectedValue)}
			/>
		);
	};

	renderAdSizesSelectBox = () => {
		const { bidderRule } = this.state;
		const { device } = bidderRule;

		if (!device) return false;

		const options = deviceWiseAdSizes[device].map(({ width, height }) => ({
			[`${width}x${height}`]: [width, height]
		}));

		return (
			<Selectbox
				id="bidder-rule-adSizes"
				options={options}
				selected={bidderRule ? device : null}
				onSelect={selectedValue => this.onSelect('device', selectedValue)}
			/>
		);
	};

	renderStatusSelectBox = () => {
		const { bidderRule } = this.state;
		const options = [{ name: 'Enable', value: true }, { name: 'Disable', value: false }];

		return (
			<Selectbox
				id="bidder-rule-status"
				options={options}
				selected={bidderRule ? bidderRule.status : null}
				onSelect={selectedValue => this.onSelect('status', selectedValue)}
			/>
		);
	};

	// eslint-disable-next-line no-unused-vars
	onSave = rule => {
		// save in db

		const { hideBidderRuleModal } = this.props;

		hideBidderRuleModal();
	};

	render() {
		const { show, hideBidderRuleModal, bidderRule } = this.props;
		const { bidderRule: bidderRuleState } = this.state;

		return (
			<Modal show={show} onHide={hideBidderRuleModal}>
				<Modal.Header closeButton>
					<Modal.Title>{!bidderRule ? 'Add Bidder Rule' : 'Update Bidder Rule'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSave}>
						<FormGroup>
							<Col componentClass={ControlLabel} sm={6}>
								Partner
							</Col>
							<Col sm={6}>{this.renderPartnerSelectBox()}</Col>
						</FormGroup>

						<FormGroup>
							<Col componentClass={ControlLabel} sm={6}>
								Country
							</Col>
							<Col sm={6}>{this.renderCountriesSelectBox()}</Col>
						</FormGroup>

						<FormGroup>
							<Col componentClass={ControlLabel} sm={6}>
								Device
							</Col>
							<Col sm={6}>{this.renderDevicesSelectBox()}</Col>
						</FormGroup>

						{!!bidderRuleState && !!bidderRuleState.device && (
							<FormGroup>
								<Col componentClass={ControlLabel} sm={6}>
									Select Ad Sizes
								</Col>
								<Col sm={6}>render selectbox for {bidderRuleState.device}</Col>
							</FormGroup>
						)}

						<FormGroup>
							<Col componentClass={ControlLabel} sm={6}>
								Status
							</Col>
							<Col sm={6}>{this.renderStatusSelectBox()}</Col>
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<CustomButton type="submit" onClick={hideBidderRuleModal}>
						{!bidderRule ? 'Add' : 'Update'}
					</CustomButton>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default BidderRuleModal;

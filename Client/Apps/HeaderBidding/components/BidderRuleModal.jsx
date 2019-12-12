import React from 'react';
import { Form, Modal, FormGroup, Col, ControlLabel, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import CustomButton from '../../../Components/CustomButton';
import SelectBox from '../../../Components/SelectBox';
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
		},
		errors: { global: '', bidder: '', sizesSupported: '', status: '' }
	};

	static getDerivedStateFromProps(props, state) {
		const { bidderRule } = props;

		if (bidderRule && !state.bidderRule.bidder) {
			return {
				bidderRule
			};
		}

		if (!bidderRule) {
			return {
				bidderRule: { ...state.bidderRule, status: true }
			};
		}

		return null;
	}

	onChange = selectedOptions => {
		const sizesSupported = selectedOptions.map(({ value }) => value);
		this.setState(state => ({ bidderRule: { ...state.bidderRule, sizesSupported } }));
	};

	onSelect = (key, value) =>
		this.setState(state => ({ bidderRule: { ...state.bidderRule, [key]: value || '' } }));

	onDeviceSelect = value =>
		this.setState(state => ({
			bidderRule: { ...state.bidderRule, device: value || '', sizesSupported: [] }
		}));

	onStatusSelect = value =>
		this.setState(state => ({ bidderRule: { ...state.bidderRule, status: value === 'true' } }));

	// eslint-disable-next-line no-unused-vars
	onFormSubmit = e => {
		e.preventDefault();

		const { saveBidderRule, bidderRule: bidderRuleFromProps } = this.props;
		const { bidderRule } = this.state;
		const { bidder, device, sizesSupported, country, status } = bidderRule;

		const errors = {
			global: '',
			bidder: '',
			sizesSupported: '',
			status: ''
		};

		if (!bidder) errors.bidder = 'Please select a bidder';
		if (!device && !country) errors.global = 'Please select device or country';
		if (device && (!Array.isArray(sizesSupported) || !sizesSupported.length))
			errors.sizesSupported = 'Please select Ad Sizes';
		if (bidderRuleFromProps && typeof status !== 'boolean')
			errors.status = 'Please select Rule Status';

		const hasError = !!Object.keys(errors).find(key => errors[key] !== '');
		if (hasError) {
			return this.setState({ errors });
		}

		return saveBidderRule(bidderRule);
	};

	renderPartnerSelectBox = () => {
		const { bidderRule } = this.state;
		const { getFilteredBidders } = this.props;
		const options = Object.entries(getFilteredBidders()).map(([value, name]) => ({ name, value }));

		return (
			<SelectBox
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
			<SelectBox
				id="bidder-rule-countries"
				wrapperClassName="countries-list-selectbox"
				options={options}
				selected={bidderRule ? bidderRule.country : null}
				onSelect={selectedValue => this.onSelect('country', selectedValue)}
				reset
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
			<SelectBox
				id="bidder-rule-device"
				options={options}
				selected={bidderRule ? bidderRule.device : null}
				onSelect={this.onDeviceSelect}
				reset
			/>
		);
	};

	renderAdSizesSelectBox = () => {
		const { bidderRule } = this.state;
		const { device, sizesSupported } = bidderRule;
		const value = sizesSupported.map(([width, height]) => ({
			label: `${width}x${height}`,
			value: [width, height]
		}));

		if (!device) return false;

		const filteredDeviceWiseAdSizes = deviceWiseAdSizes[device].filter(
			([width, height]) =>
				!sizesSupported.find(
					([selectedWidth, selectedHeight]) => width === selectedWidth && height === selectedHeight
				)
		);
		const options = filteredDeviceWiseAdSizes.map(([width, height]) => ({
			label: `${width}x${height}`,
			value: [width, height]
		}));

		return <Select isMulti options={options} value={value} onChange={this.onChange} />;
	};

	renderStatusSelectBox = () => {
		const { bidderRule } = this.state;
		const options = [
			{ name: 'Enable', value: String(true) },
			{ name: 'Disable', value: String(false) }
		];

		return (
			<SelectBox
				id="bidder-rule-status"
				options={options}
				selected={bidderRule ? String(bidderRule.status) : null}
				onSelect={this.onStatusSelect}
			/>
		);
	};

	render() {
		const { show, hideBidderRuleModal, bidderRule, savingBidderRule } = this.props;
		const { bidderRule: bidderRuleState, errors } = this.state;

		return (
			<Modal show={show} onHide={hideBidderRuleModal}>
				<Modal.Header closeButton>
					<Modal.Title>{!bidderRule ? 'Add Bidder Rule' : 'Update Bidder Rule'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{!!errors.global && <span className="u-text-error">{errors.global}</span>}
					<Form horizontal className="bidder-rule-form" onSubmit={this.onFormSubmit}>
						<FormGroup>
							<Col componentClass={ControlLabel} sm={6}>
								Partner *
							</Col>
							<Col sm={6}>
								{this.renderPartnerSelectBox()}
								{!!errors.bidder && <HelpBlock className="u-text-error">{errors.bidder}</HelpBlock>}
							</Col>
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
							<React.Fragment>
								<FormGroup>
									<Col componentClass={ControlLabel} sm={6}>
										Select Ad Sizes *
									</Col>
									<Col sm={6}>
										{this.renderAdSizesSelectBox()}
										{!!errors.sizesSupported && (
											<HelpBlock className="u-text-error">{errors.sizesSupported}</HelpBlock>
										)}
									</Col>
								</FormGroup>
							</React.Fragment>
						)}

						{bidderRule && (
							<FormGroup>
								<Col componentClass={ControlLabel} sm={6}>
									Status *
								</Col>
								<Col sm={6}>
									{this.renderStatusSelectBox()}
									{!!errors.status && (
										<HelpBlock className="u-text-error">{errors.status}</HelpBlock>
									)}
								</Col>
							</FormGroup>
						)}

						<FormGroup>
							<Col sm={6} smPush={6}>
								<CustomButton type="submit" showSpinner={savingBidderRule}>
									{!bidderRule ? 'Add' : 'Update'}
								</CustomButton>
							</Col>
						</FormGroup>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}
}

export default BidderRuleModal;

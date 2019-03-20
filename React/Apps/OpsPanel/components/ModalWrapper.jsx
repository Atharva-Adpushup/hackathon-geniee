import React from 'react';
import { Modal, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import { partnersList as partners, biddersParams } from '../configs/commonConsts';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import '../styles.scss';

function findBidder(data, bidderName) {
	return data.find(obj => obj.bidder === bidderName);
}

class ModalWrapper extends React.Component {
	constructor(props) {
		super(props);

		const { data } = props;

		const districtm = findBidder(data, 'districtm');
		const oftmedia = findBidder(data, 'oftmedia');
		const pulsepoint = findBidder(data, 'pulsepoint');
		const c1x = findBidder(data, 'c1x');
		const medianet = findBidder(data, 'medianet');
		const districtmDMX = findBidder(data, 'districtmDMX');
		const openx = findBidder(data, 'openx');
		const conversant = findBidder(data, 'conversant');
		const thirtyThreeAcross = findBidder(data, '33across');
		const ix = findBidder(data, 'ix');

		this.state = {
			partnersSelected: props.data.map(obj => obj.bidder) || [],
			currentPartner: '',
			districtm: {
				placementId: districtm ? districtm.params.placementId : ''
			},
			oftmedia: {
				placementId: oftmedia ? oftmedia.params.placementId : ''
			},
			pulsepoint: {
				cf: pulsepoint ? pulsepoint.params.cf : '',
				cp: pulsepoint ? pulsepoint.params.cp : '',
				ct: pulsepoint ? pulsepoint.params.ct : ''
			},
			c1x: {
				siteId: c1x ? c1x.params.siteId : ''
			},
			medianet: {
				cid: medianet ? medianet.params.cid : ''
			},
			districtmDMX: {
				dmxid: districtmDMX ? districtmDMX.params.dmxid : '',
				memberid: districtmDMX ? districtmDMX.params.memberid : ''
			},
			openx: {
				delDomain: openx ? openx.params.delDomain : '',
				unit: openx ? openx.params.unit : ''
			},
			conversant: {
				site_id: conversant ? conversant.params.site_id : '',
				secure: conversant ? conversant.params.secure : ''
			},
			'33across': {
				siteId: thirtyThreeAcross ? thirtyThreeAcross.params.siteId : '',
				productId: thirtyThreeAcross ? thirtyThreeAcross.params.productId : ''
			},
			ix: {
				siteId: ix ? ix.params.siteId : '',
				size: ix ? JSON.stringify(ix.params.size) : ''
			},
			error: ''
		};

		this.onNewSelect = this.onNewSelect.bind(this);
		this.onValChange = this.onValChange.bind(this);
		this.saveCollection = this.saveCollection.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.setState({
			[this.state.currentPartner]: {
				...this.state[this.state.currentPartner],
				[e.target.name]: e.target.type !== 'number' ? e.target.value : +e.target.value
			},
			error: ''
		});
	}

	onNewSelect(partnersSelected) {
		this.setState({ partnersSelected });
	}

	componentWillReceiveProps(nextProps) {
		const { data } = nextProps;

		const districtm = findBidder(data, 'districtm');
		const oftmedia = findBidder(data, 'oftmedia');
		const pulsepoint = findBidder(data, 'pulsepoint');
		const c1x = findBidder(data, 'c1x');
		const medianet = findBidder(data, 'medianet');
		const districtmDMX = findBidder(data, 'districtmDMX');
		const openx = findBidder(data, 'openx');
		const conversant = findBidder(data, 'conversant');
		const thirtyThreeAcross = findBidder(data, '33across');
		const ix = findBidder(data, 'ix');

		this.setState({
			partnersSelected: nextProps.data.map(obj => ({ value: obj.bidder, label: obj.bidder })) || [],
			currentPartner: '',
			districtm: {
				placementId: districtm ? districtm.params.placementId : ''
			},
			oftmedia: {
				placementId: oftmedia ? oftmedia.params.placementId : ''
			},
			pulsepoint: {
				cf: pulsepoint ? pulsepoint.params.cf : '',
				cp: pulsepoint ? pulsepoint.params.cp : '',
				ct: pulsepoint ? pulsepoint.params.ct : ''
			},
			c1x: {
				siteId: c1x ? c1x.params.siteId : ''
			},
			medianet: {
				cid: medianet ? medianet.params.cid : ''
			},
			districtmDMX: {
				dmxid: districtmDMX ? districtmDMX.params.dmxid : '',
				memberid: districtmDMX ? districtmDMX.params.memberid : ''
			},
			openx: {
				delDomain: openx ? openx.params.delDomain : '',
				unit: openx ? openx.params.unit : ''
			},
			conversant: {
				site_id: conversant ? conversant.params.site_id : '',
				secure: conversant ? conversant.params.secure : ''
			},
			'33across': {
				siteId: thirtyThreeAcross ? thirtyThreeAcross.params.siteId : '',
				productId: thirtyThreeAcross ? thirtyThreeAcross.params.productId : ''
			},
			ix: {
				siteId: ix ? ix.params.siteId : '',
				size: ix ? JSON.stringify(ix.params.size) : ''
			},
			error: ''
		});
	}

	saveCollection() {
		const partnersNotValidated = [];

		const collection = this.state.partnersSelected.map(partner => {
			Object.keys(this.state[partner.value]).forEach(param => {
				if (this.state[partner.value][param] === '') {
					partnersNotValidated.push(partner.value);
				}
			});

			let params = this.state[partner.value];
			if (partner.value === 'ix' && params && params.size) {
				params.size = JSON.parse(params.size);
			}

			return {
				bidder: partner.value,
				params
			};
		});

		if (partnersNotValidated.length !== 0) {
			this.setState({
				error: `Please fill all fields in following partners: ${partnersNotValidated.join(', ')}`
			});
			return;
		}

		this.props.toggle();

		this.props.addCollection(collection);
	}

	onValChange(currentPartner) {
		this.setState({ currentPartner });
	}

	render() {
		const { isOpen, toggle, heading } = this.props;

		const { partnersSelected, currentPartner } = this.state;

		return (
			<Modal show={isOpen} onHide={toggle}>
				<Modal.Header closeButton>
					<Modal.Title>{heading}</Modal.Title>
				</Modal.Header>
				<hr style={{ marginBottom: '10px', marginTop: '10px' }} />
				<Modal.Body>
					<form>
						<Row>
							<Col sm={4} style={{ paddingRight: 0 }}>
								<div style={{ fontSize: '1.4em', marginTop: '5px', fontWeight: 700 }}>Partners</div>
							</Col>
							<Col sm={8}>
								<Select
									name="partners"
									onChange={this.onNewSelect}
									options={partners}
									isMulti={true}
									value={partnersSelected}
								/>
							</Col>
						</Row>
						<br />
						{partnersSelected.length > 0 && (
							<Row>
								<Col sm={4} style={{ paddingRight: 0 }}>
									<div style={{ fontSize: '1.4em', marginTop: '5px', fontWeight: 700 }}>
										Select Current Partner
									</div>
								</Col>
								<Col sm={8}>
									<SelectBox
										value={currentPartner}
										onChange={this.onValChange}
										label="Choose Current Partner"
									>
										{partnersSelected.map(size => (
											<option key={size.value} value={size.value}>
												{size.label}
											</option>
										))}
									</SelectBox>
								</Col>
							</Row>
						)}
						{currentPartner && partnersSelected.length > 0 && (
							<div>
								{biddersParams[currentPartner].map(param => (
									<FormGroup key={param.name}>
										<ControlLabel>{param.name}</ControlLabel>
										<FormControl
											type={param.type === 'string' ? 'text' : 'number'}
											value={this.state[currentPartner][param.name]}
											placeholder={`Enter ${param.type}`}
											onChange={this.handleChange}
											name={`${param.name}`}
										/>
									</FormGroup>
								))}
							</div>
						)}
					</form>
					{this.state.error && (
						<Col sm={12}>
							<div className="message-wrapper">
								<div className="error-message">{this.state.error}</div>
							</div>
						</Col>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Row>
						<Col sm={2} style={{ paddingRight: 0 }}>
							<button className="btn btn-lightBg btn-default" onClick={this.saveCollection}>
								Save Collection
							</button>
						</Col>
					</Row>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default ModalWrapper;

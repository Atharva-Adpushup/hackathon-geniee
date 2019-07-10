import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';

import { sizeConfigOptions as options, devicesList, countryCollection } from '../configs/commonConsts';
import SelectBox from '../../../Components/SelectBox/index.jsx';

const MEDIA_QUERY = {
		DESKTOP: devicesList[0],
		TABLET: devicesList[1],
		MOBILE: devicesList[2]
	},
	SMALLCASE_CONSTS = {
		DESKTOP: 'desktop',
		TABLET: 'tablet',
		PHONE: 'phone',
		SIZE: 'size',
		COUNTRY: 'country'
	};

function findSizesSupported(name, data) {
	for (let i = 0; i < data.length; i++) {
		if (name === data[i].mediaQuery) {
			return data[i].sizesSupported;
		}
	}
	return [];
}

function findLabel(device) {
	switch (device) {
		case MEDIA_QUERY.DESKTOP:
			return SMALLCASE_CONSTS.DESKTOP;
		case MEDIA_QUERY.TABLET:
			return SMALLCASE_CONSTS.TABLET;
		case MEDIA_QUERY.MOBILE:
			return SMALLCASE_CONSTS.PHONE;
	}
}

export default class SettingsPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			device: MEDIA_QUERY.DESKTOP,
			[MEDIA_QUERY.DESKTOP]: [],
			[MEDIA_QUERY.TABLET]: [],
			[MEDIA_QUERY.MOBILE]: [],
			countryLabels: []
		};

		this.onValChange = this.onValChange.bind(this);
	}

	validationCheckWrapper(type) {
		let configs = [];

		switch (type) {
			case SMALLCASE_CONSTS.SIZE:
				devicesList.forEach(device => {
					configs.push({
						mediaQuery: device,
						sizesSupported: this.state[device].map(size => size.label.split('x').map(str => +str)),
						labels: [findLabel(device)]
					});
				});
				this.props.validationCheck(JSON.stringify({ sizeConfig: configs }), 'deviceConfig');
				break;

			case SMALLCASE_CONSTS.COUNTRY:
				configs = this.state.countryLabels.concat([]);
				this.props.validationCheck(JSON.stringify({ countryConfig: configs }), 'countryConfig');
				break;
		}
	}

	onValChange(device) {
		this.setState({ device });
	}

	onNewSelect(type, data) {
		switch (type) {
			case SMALLCASE_CONSTS.SIZE:
				this.setState({ [this.state.device]: data });
				break;

			case SMALLCASE_CONSTS.COUNTRY:
				const isData = !!(data && data.length),
					countryLabels = isData
						? data.reduce((accumulator, itemObject) => {
								accumulator.push(itemObject.value);
								return accumulator;
						  }, [])
						: [];

				this.setState({ countryLabels }, () => {
					console.log('complete state', this.state);
				});
				break;
		}
	}

	componentWillReceiveProps(nextProps) {
		const { fetchedData } = nextProps;

		const newDevice = fetchedData.length > 0 ? fetchedData[0].mediaQuery : MEDIA_QUERY.DESKTOP;

		this.setState({
			device: newDevice
		});

		fetchedData.forEach(data =>
			this.setState({
				[data.mediaQuery]: data.sizesSupported.map(arr => ({
					value: arr.join(' '),
					label: arr.join('x')
				}))
			})
		);
	}

	render() {
		const { device, countryLabels } = this.state;

		return (
			<div>
				<Row>
					<Col sm={4}>
						<SelectBox value={device} onChange={this.onValChange} label="Select Device">
							<option value={MEDIA_QUERY.DESKTOP}>Desktop</option>
							<option value={MEDIA_QUERY.TABLET}>Tablet</option>
							<option value={MEDIA_QUERY.MOBILE}>Phone</option>
						</SelectBox>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<Select
							name="sizesSupported"
							placeholder="Select supported sizes"
							onChange={this.onNewSelect.bind(this, SMALLCASE_CONSTS.SIZE)}
							options={options}
							isMulti={true}
							value={this.state[device]}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<button
							className="btn btn-lightBg btn-default"
							style={{ marginTop: 5 }}
							onClick={this.validationCheckWrapper.bind(this, SMALLCASE_CONSTS.SIZE)}
						>
							Validate Device config
						</button>
					</Col>
				</Row>
				<Row>
					<Col sm={6}>
						<p className="hb-settings-text" style={{ marginTop: 5 }}>
							<span className="text-well">labelAny: ["{findLabel(device)}"]</span>
						</p>
					</Col>
				</Row>

				{/* <h5 style={{ borderBottom: '1px solid #ccc' }} className="mTB-15 padding-b10px">
					Select country codes
				</h5>
				<Row>
					<Col sm={12}>
						<Select
							name="countriesSelect"
							placeholder="Select countries"
							onChange={this.onNewSelect.bind(this, SMALLCASE_CONSTS.COUNTRY)}
							options={countryCollection}
							isMulti={true}
							value={this.state[countryLabels]}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<button
							className="btn btn-lightBg btn-default"
							style={{ marginTop: 5 }}
							onClick={this.validationCheckWrapper.bind(this, SMALLCASE_CONSTS.COUNTRY)}
						>
							Validate Country config
						</button>
					</Col>
				</Row> */}
			</div>
		);
	}
}

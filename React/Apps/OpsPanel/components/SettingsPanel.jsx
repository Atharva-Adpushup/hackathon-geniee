import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';

import { sizeConfigOptions as options, devicesList } from '../configs/commonConsts';
import SelectBox from '../../../Components/SelectBox/index.jsx';

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
		case '(min-width: 1200px)':
			return 'desktop';
		case '(min-width: 768px) and (max-width: 1199px)':
			return 'tablet';
		case '(min-width: 0px) and (max-width: 767px)':
			return 'phone';
	}
}

export default class SettingsPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			device: '(min-width: 1200px)',
			'(min-width: 1200px)': [],
			'(min-width: 768px) and (max-width: 1199px)': [],
			'(min-width: 0px) and (max-width: 767px)': []
		};

		this.onValChange = this.onValChange.bind(this);
		this.validationCheckWrapper = this.validationCheckWrapper.bind(this);
		this.onNewSelect = this.onNewSelect.bind(this);
	}

	validationCheckWrapper() {
		const configs = [];

		devicesList.forEach(device => {
			configs.push({
				mediaQuery: device,
				sizesSupported: this.state[device].map(size => size.label.split('x').map(str => +str)),
				labels: [findLabel(device)]
			});
		});

		this.props.validationCheck(JSON.stringify({ sizeConfig: configs }), 'deviceConfig');
	}

	onValChange(device) {
		this.setState({ device });
	}

	onNewSelect(sizesSupported) {
		this.setState({ [this.state.device]: sizesSupported });
	}

	componentWillReceiveProps(nextProps) {
		const { fetchedData } = nextProps;

		const newDevice = fetchedData.length > 0 ? fetchedData[0].mediaQuery : '(min-width: 1200px)';

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
		const { device } = this.state;

		return (
			<div>
				<Row>
					<Col sm={4}>
						<SelectBox value={device} onChange={this.onValChange} label="Select Device">
							<option value={'(min-width: 1200px)'}>Desktop</option>
							<option value={'(min-width: 768px) and (max-width: 1199px)'}>Tablet</option>
							<option value={'(min-width: 0px) and (max-width: 767px)'}>Phone</option>
						</SelectBox>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<Select
							name="sizesSupported"
							placeholder="Select supported sizes"
							onChange={this.onNewSelect}
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
							onClick={this.validationCheckWrapper}
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
			</div>
		);
	}
}
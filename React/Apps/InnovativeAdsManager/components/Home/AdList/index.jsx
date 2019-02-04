import React, { Component } from 'react';
import { Table, Modal, Col, Row } from 'react-bootstrap';
import AdElement from './AdElement';
import { CustomButton, EmptyState } from '../../shared/index';
import Loader from '../../../../../Components/Loader';
import SelectBox from '../../../../../Components/SelectBox/index';
import {
	USER_AD_LIST_HEADERS,
	OPS_AD_LIST_HEADERS,
	STATUS_FILTER_OPTIONS,
	FORMAT_FILTER_OPTIONS
} from '../../../configs/commonConsts';

class AdList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
			modalData: { header: null, body: null, footer: null },
			filters: {
				pagegroups: {
					value: null,
					key: 'pagegroups',
					type: 'array'
				},
				isActive: {
					value: null,
					key: 'isActive',
					type: 'boolean'
				},
				format: {
					value: null,
					key: 'format',
					type: 'string',
					inFormatData: true
				}
			}
		};
		this.saveWrapper = this.saveWrapper.bind(this);
		this.modalToggle = this.modalToggle.bind(this);
		this.selectChangeHandler = this.selectChangeHandler.bind(this);
		this.renderFilters = this.renderFilters.bind(this);
	}

	componentDidMount() {
		if (this.props.loading) this.props.fetchAds({ siteId: window.iam.siteId });
	}

	saveWrapper() {
		return this.props.masterSave(window.iam.siteId, window.iam.isSuperUser);
	}

	modalToggle(data = {}) {
		this.setState({
			show: !this.state.show,
			modalData: {
				...this.state.modalData,
				...data
			}
		});
	}

	selectChangeHandler(key, value) {
		this.setState(state => ({
			...state,
			filters: { ...state.filters, [key]: { ...state.filters[key], value } }
		}));
	}

	filterAds = (filters, ads) => {
		const finalAds = [];
		ads.forEach(ad => {
			const keys = Object.keys(filters);
			const length = keys.length;
			let condition = true;
			let i = 0;

			for (i = 0; i < length; i += 1) {
				const filter = filters[keys[i]];
				if (condition === false) break;
				if (filter.value !== null) {
					const container = filter.inFormatData ? ad.formatData : ad;
					switch (filter.type) {
						case 'array':
							condition = condition && container[filter.key].includes(filter.value);
							break;
						default:
						case 'string':
						case 'boolean':
							condition = condition && container[filter.key] === filter.value;
							break;
					}
				}
			}
			if (condition) finalAds.push(ad);
		});
		return finalAds;
	};

	renderSelect = (value, label, changeHandler, array, disabled = false) => (
		<div className="mTB-15">
			<p>{label}</p>
			<SelectBox value={value} label={label} onChange={changeHandler} onClear={changeHandler} disabled={disabled}>
				{array.map((ele, index) => (
					<option key={`${label}-${index}`} value={ele.value}>
						{ele.name}
					</option>
				))}
			</SelectBox>
		</div>
	);

	renderFilters() {
		return (
			<div>
				<Row style={{ marginRight: '0px' }}>
					<CustomButton label={'Master Save'} handler={this.saveWrapper} />
				</Row>
				<div>
					<Col xs={4}>
						{this.renderSelect(
							this.state.filters.pagegroups.value,
							'Select Pagegroup',
							value => this.selectChangeHandler('pagegroups', value),
							window.iam.channels.map(channel => ({
								name: channel,
								value: channel
							}))
						)}
					</Col>
					<Col xs={4}>
						{this.renderSelect(
							this.state.filters.isActive.value,
							'Select Status',
							value => this.selectChangeHandler('isActive', value),
							STATUS_FILTER_OPTIONS
						)}
					</Col>
					<Col xs={4}>
						{this.renderSelect(
							this.state.filters.format.value,
							'Select Format',
							value => this.selectChangeHandler('format', value),
							FORMAT_FILTER_OPTIONS
						)}
					</Col>
					<div style={{ clear: 'both' }}>&nbsp;</div>
				</div>
			</div>
		);
	}

	render() {
		const { loading, ads, updateAd, modifyAdOnServer, meta, archiveAd, updateTraffic } = this.props;
		const { show, modalData, filters } = this.state;
		const HEADERS = window.iam.isSuperUser ? OPS_AD_LIST_HEADERS : USER_AD_LIST_HEADERS;
		const adsToRender = this.filterAds(filters, ads);
		const customStyle = {};

		if (loading) {
			return (
				<div style={{ height: '600px' }}>
					<Loader />
				</div>
			);
		} else if (!adsToRender.length) {
			return (
				<div>
					{window.isSuperUser ? this.renderFilters() : null}
					<EmptyState message="Seems kind of empty here" />
				</div>
			);
		}
		return (
			<div style={{ padding: '10px 10px', fontSize: '15px' }}>
				{window.isSuperUser ? this.renderFilters() : null}
				<Table striped bordered hover>
					<thead>
						<tr>
							{HEADERS.map(header => (
								<th key={`headerKey-${header}`}>{header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{adsToRender.map(ad =>
							ad.isActive || window.iam.isSuperUser ? (
								<AdElement
									key={`adElement-${ad.id}`}
									identifier={ad.id}
									ad={ad}
									style={customStyle}
									meta={meta}
									updateAd={updateAd}
									modifyAdOnServer={modifyAdOnServer}
									modalToggle={this.modalToggle}
									archiveAd={archiveAd}
									updateTraffic={updateTraffic}
								/>
							) : null
						)}
					</tbody>
				</Table>
				<Modal show={show} onHide={this.modalToggle}>
					<Modal.Header>
						<Modal.Title>{modalData.header}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{modalData.body}</Modal.Body>
					{modalData.footer ? <Modal.Body>{modalData.footer}</Modal.Body> : null}
					<div style={{ clear: 'both' }}>&nbsp;</div>
				</Modal>
			</div>
		);
	}
}

export default AdList;

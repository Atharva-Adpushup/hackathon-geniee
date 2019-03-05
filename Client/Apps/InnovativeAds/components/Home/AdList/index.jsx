import React, { Component } from 'react';
import { Table, Modal, Col, Row } from 'react-bootstrap';
import AdElement from './AdElement';
import CustomButton from '../../../../../Components/CustomButton/index';
import Empty from '../../../../../Components/Empty/index';
import Loader from '../../../../../Components/Loader';
import SelectBox from '../../../../../Components/Selectbox/index';
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
		const { loading, fetchAds, match } = this.props;
		if (loading) fetchAds({ siteId: match.params.siteId });
	}

	filterAds = (filters, ads) => {
		const finalAds = [];
		ads.forEach(ad => {
			const keys = Object.keys(filters);
			let condition = true;
			let i = 0;

			for (i = 0; i < keys.length; i += 1) {
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
							condition = condition && container[filter.key] === filter.value;
							break;
						case 'boolean':
							const toMatch = filter.value === "false" ? false : true;
							condition = condition && container[filter.key] === toMatch;
							break;
					}
				}
			}
			if (condition) finalAds.push(ad);
		});
		return finalAds;
	};

	resetFilters = () => {
		this.setState({
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
		});
	};

	modalToggle(data = {}) {
		const { show, modalData } = this.state;
		this.setState({
			show: !show,
			modalData: {
				...modalData,
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

	saveWrapper() {
		const { masterSave, user, match } = this.props;
		return masterSave(match.params.siteId, user.isSuperUser);
	}

	renderSelect = (value, label, changeHandler, array) => (
		<div className="u-margin-v4">
			<p>{label}</p>
			<SelectBox
				selected={value}
				onSelect={changeHandler}
				title={label}
				id={label.toUpperCase()}
				options={array}
			/>
		</div>
	);

	renderFilters() {
		const { filters } = this.state;
		const { channels, user } = this.props;
		return (
			<React.Fragment>
				<Row>
					{user.isSuperUser ? (
							<CustomButton variant="primary" className="pull-right" onClick={this.saveWrapper}>
								Master Save
							</CustomButton>
						) : null}
					<CustomButton variant="secondary" className="u-margin-r3 pull-right" onClick={this.resetFilters}>
						Reset Filters
					</CustomButton>
				</Row>
				<div>
					<Col xs={4} className="u-padding-l0">
						{this.renderSelect(
							filters.pagegroups.value,
							'Select Pagegroup',
							value => this.selectChangeHandler('pagegroups', value),
							channels.map(channel => ({
								name: channel,
								value: channel
							}))
						)}
					</Col>
					<Col xs={4}>
						{this.renderSelect(
							filters.isActive.value,
							'Select Status',
							value => this.selectChangeHandler('isActive', value),
							STATUS_FILTER_OPTIONS
						)}
					</Col>
					<Col xs={4} className="u-padding-r0">
						{this.renderSelect(
							filters.format.value,
							'Select Format',
							value => this.selectChangeHandler('format', value),
							FORMAT_FILTER_OPTIONS
						)}
					</Col>
					<div style={{ clear: 'both' }}>&nbsp;</div>
				</div>
			</React.Fragment>
		);
	}

	render() {
		const {
			loading,
			ads,
			updateAd,
			modifyAdOnServer,
			meta,
			archiveAd,
			updateTraffic,
			user,
			channels
		} = this.props;
		const { show, modalData, filters } = this.state;
		const HEADERS = user.isSuperUser ? OPS_AD_LIST_HEADERS : USER_AD_LIST_HEADERS;
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
				<div className="u-padding-4">
					{this.renderFilters()}
					<Empty message="Seems kind of empty here" />
				</div>
			);
		}
		return (
			<div className="u-padding-4">
				{this.renderFilters()}
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
							ad.isActive || user.isSuperUser ? (
								<AdElement
									key={`adElement-${ad.id}`}
									identifier={ad.id}
									ad={ad}
									style={customStyle}
									meta={meta}
									channels={channels}
									user={user}
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

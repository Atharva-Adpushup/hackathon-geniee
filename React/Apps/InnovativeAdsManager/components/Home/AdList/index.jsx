import React, { Component } from 'react';
import { Table, Modal, Col } from 'react-bootstrap';
import AdElement from './AdElement';
import { CustomButton, EmptyState } from '../../shared/index';
import Loader from '../../../../../Components/Loader';
import SelectBox from '../../../../../Components/SelectBox/index';
import { USER_AD_LIST_HEADERS, OPS_AD_LIST_HEADERS } from '../../../configs/commonConsts';

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

	filterAds = (filters, ads) =>
		ads
			.map(ad => {
				const keys = Object.keys(filters);
				let condition = true;
				let i = 0;
				const length = keys.length;
				for (i = 0; i < length; i += 1) {
					const filter = filters[keys[i]];
					if (condition === false) break;
					if (filter.value !== null) {
						switch (filter.type) {
							case 'array':
								condition = condition && ad[filter.key].includes(filter.value);
								break;
							case 'boolean':
								condition = condition && ad[filter.key] === filter.value;
								break;
							default:
								break;
						}
					}
				}
				return condition ? ad : false;
			})
			.filter(ele => ele !== false);

	renderSelect = (value, label, changeHandler, array, disabled = false) => (
		<div>
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
		const pagegroups = window.iam.channels.map(channel => ({
			name: channel,
			value: channel
		}));
		return (
			<div>
				<Col xs={4}>
					{this.renderSelect(
						this.state.filters.pagegroups.value,
						'Select Pagegroup',
						value => this.selectChangeHandler('pagegroups', value),
						pagegroups,
						this.state.isActive
					)}
				</Col>
				<Col xs={4}>
					{this.renderSelect(
						this.state.filters.isActive.value,
						'Select Status',
						value => this.selectChangeHandler('isActive', value),
						[
							{
								name: 'Active',
								value: true
							},
							{
								name: 'Archived',
								value: false
							}
						],
						this.state.pagegroups
					)}
				</Col>
				<Col xs={4}>
					<CustomButton label={'Master Save'} handler={this.saveWrapper} />
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
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

import React, { Component } from 'react';
import { Table, Modal } from 'react-bootstrap';
import AdElement from './AdElement';
import { CustomButton, EmptyState } from '../../shared/index';
import Loader from '../../../../../Components/Loader';
import { USER_AD_LIST_HEADERS, OPS_AD_LIST_HEADERS } from '../../../configs/commonConsts';

class AdList extends Component {
	constructor(props) {
		super(props);
		this.state = { show: false, modalData: { header: null, body: null, footer: null } };
		this.saveWrapper = this.saveWrapper.bind(this);
		this.modalToggle = this.modalToggle.bind(this);
	}
	componentDidMount() {
		if (this.props.loading) this.props.fetchAds({ siteId: window.siteId });
	}

	saveWrapper() {
		return this.props.masterSave(window.siteId, window.isSuperUser);
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

	render() {
		const { loading, ads, updateAd, modifyAdOnServer } = this.props;
		const { show, modalData } = this.state;
		const HEADERS = window.iam.isSuperUser ? OPS_AD_LIST_HEADERS : USER_AD_LIST_HEADERS;
		const customStyle = {};

		if (loading) {
			return (
				<div style={{ height: '600px' }}>
					<Loader />
				</div>
			);
		} else if (!ads.length) {
			return <EmptyState message="Seems kind of empty here" />;
		}
		return (
			<div style={{ padding: '10px 10px', fontSize: '15px' }}>
				{window.isSuperUser ? (
					<div>
						<CustomButton label={'Master Save'} handler={this.saveWrapper} />
						<div style={{ clear: 'both' }}>&nbsp;</div>
					</div>
				) : null}
				<Table striped bordered hover>
					<thead>
						<tr>
							{HEADERS.map(header => (
								<th key={`headerKey-${header}`}>{header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ads.map(ad =>
							!Object.prototype.hasOwnProperty.call(ad, 'isActive') ||
							ad.isActive ||
							window.iam.isSuperUser ? (
								<AdElement
									key={`adElement-${ad.id}`}
									identifier={ad.id}
									ad={ad}
									updateAd={updateAd}
									modifyAdOnServer={modifyAdOnServer}
									style={customStyle}
									modalToggle={this.modalToggle}
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
				</Modal>
			</div>
		);
	}
}

export default AdList;

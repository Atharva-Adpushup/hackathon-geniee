// In-content section component

import React, { PropTypes } from 'react';
import { reduxForm, change, registerField } from 'redux-form';
import { connect } from 'react-redux';
import _ from 'lodash';
import validate from './inContentValidations';
import { createIncontentSection } from 'actions/sectionActions';
import { showNotification } from 'actions/uiActions';
import { getCustomSizes } from 'selectors/siteSelectors';
import { commonSupportedSizes, nonPartnerAdSizes } from 'consts/commonConsts.js';
import { renderInContentAdder } from './renderMethods';

const form = reduxForm({
		form: 'inContentForm',
		validate
	}),
	getNotNearData = collection => {
		const computedArr = [];

		if (!collection || !collection.length) {
			return false;
		}

		collection.forEach(obj => {
			const notNearObj = {};

			notNearObj[obj.selector] = obj.pixels;
			computedArr.push(notNearObj);
		});

		return computedArr;
	},
	getSupportedSizes = (customSizes = []) => {
		const sizes = [];
		commonSupportedSizes.forEach(size => {
			size.sizes.forEach(adSize => {
				sizes.push(`${adSize.width} x ${adSize.height}`);
			});
		});

		if (currentUser.userType !== 'partner') {
			nonPartnerAdSizes.forEach(size => {
				size.sizes.forEach(adSize => {
					sizes.push(`${adSize.width} x ${adSize.height}`);
				});
			});
			customSizes.forEach(adSize => {
				sizes.push(`${adSize.width} x ${adSize.height}`);
			});
		}

		return _.uniq(sizes);
	};

class inContentForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { networkInfo: false, selectedElement: false };
		this.setNetwork = this.setNetwork.bind(this);
	}

	setNetwork(data) {
		this.setState({ networkInfo: data }, () => {
			/**
			 * Added to window because wasn't able to add network data to redux-form and no way to intercept handleSubmit call
			 * Added to window object so that can be accessed in the onSubmit handler below
			 */
			window.networkInfo = data;
			this.props.handleSubmit();
		});
	}

	setFocusElement(event) {
		let value = event.type == 'focus' ? event.target.name : false;
		this.setState({ selectedElement: value });
	}

	render() {
		const props = this.props;
		return (
			<div>
				{props.variation.contentSelector ? (
					renderInContentAdder(this, getSupportedSizes)
				) : (
					<div>
						<h1 className="variation-section-heading">Add Incontent Variation</h1>
						<p className="error-message" style={{ fontSize: '1em' }}>
							Please set your <strong>Content Selector</strong> in Info settings panel first to create
							in-content sections.
						</p>
					</div>
				)}
			</div>
		);
	}
}

inContentForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	showNotification: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
		...ownProps,
		customSizes: getCustomSizes(state),
		initialValues: {
			section: 1,
			float: 'none',
			minDistanceFromPrevAd: 200,
			adSize: getSupportedSizes()[0]
		}
	}),
	mapDispatchToProps = (dispatch, ownProps) => ({
		onSubmit: values => {
			let networkInfo = window.networkInfo;
			if (!networkInfo && !networkInfo.network) {
				dispatch(
					showNotification({
						mode: 'error',
						title: 'Network missing',
						message: 'Please select a network'
					})
				);
				return false;
			}
			console.log(networkInfo);
			const notNear = getNotNearData(values.notNear),
				isCustomZoneId = !!values.customZoneId,
				sectionPayload = {
					sectionNo: values.section,
					name: values.name,
					minDistanceFromPrevAd: values.minDistanceFromPrevAd,
					float: values.float,
					notNear,
					partnerData: {
						position: 0,
						firstFold: 0,
						asyncTag: 1,
						customZoneId: values.customZoneId ? values.customZoneId : ''
					}
				},
				adPayload = {
					adCode: btoa(values.adCode),
					adSize: values.adSize,
					network: networkInfo.network,
					networkData: {}
				};

			isCustomZoneId ? (adPayload.networkData.zoneId = values.customZoneId) : null;

			adPayload.networkData = {
				...adPayload.networkData,
				...networkInfo.networkData
			};
			dispatch(createIncontentSection(sectionPayload, adPayload, ownProps.variation.id));
		},
		showNotification: params => dispatch(showNotification(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));

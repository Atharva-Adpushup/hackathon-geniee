// In-content section component

import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import validate from './inContentValidations';
import { connect } from 'react-redux';
import { createIncontentSection } from 'actions/sectionActions';
import { commonSupportedSizes, nonPartnerAdSizes } from 'consts/commonConsts.js';
import _ from 'lodash';
import { renderInContentAdder } from './renderMethods';

const form = reduxForm({
	form: 'inContentForm',
	validate
}),
	getNotNearData = (collection) => {
		const computedArr = [];

		if (!collection || !collection.length) {
			return false;
		}

		collection.forEach((obj) => {
			const notNearObj = {};

			notNearObj[obj.selector] = obj.pixels;
			computedArr.push(notNearObj);
		});

		return computedArr;
	},
	getSupportedSizes = () => {
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
		}

		return _.uniq(sizes);
	};

class inContentForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { addCustomAdCode: false };
	}

	showCustomAdCodeBox() {
		this.setState({ addCustomAdCode: true });
	}

	hideCustomAdCodeBox() {
		this.setState({ addCustomAdCode: false });
	}

	render() {
		const props = this.props;
		return (
			<div>
				{
					props.activeChannel.contentSelector ? (
						renderInContentAdder(this, getSupportedSizes)
					) : (
						<div>
							<h1 className="variation-section-heading">Add Incontent Variation</h1>
							<p className="error-message" style={{ fontSize: '1em' }}>
								Please set your <strong>Content Selector</strong> in the channel settings first to create your in-content section.
							</p>
						</div>
					)
				}
			</div>
		);
	}
}


inContentForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
		...ownProps,
		initialValues: {
			section: 1,
			float: 'none',
			minDistanceFromPrevAd: 200,
			adSize: getSupportedSizes()[0]
		}
	}),

	mapDispatchToProps = (dispatch, ownProps) => ({
		onSubmit: (values) => {
			const notNear = getNotNearData(values.notNear),
				sectionPayload = {
					sectionNo: values.section,
					minDistanceFromPrevAd: values.minDistanceFromPrevAd,
					float: values.float,
					notNear
				},
				adPayload = {
					adCode: btoa(values.adCode),
					adSize: values.adSize
				};

			dispatch(createIncontentSection(sectionPayload, adPayload, ownProps.variation.id));
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));

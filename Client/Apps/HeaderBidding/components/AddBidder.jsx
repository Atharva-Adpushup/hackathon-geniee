/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Row, Col, Form, FormGroup, ControlLabel } from 'react-bootstrap';
import Selectbox from '../../../Components/Selectbox';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';

export default class AddBidder extends React.Component {
	state = {
		formFields: {},
		bidderConfig: {},
		params: {}
	};

	componentDidMount() {
		const {
			bidderConfig: {
				isApRelation,
				params: { global: globalParams, siteLevel: siteLevelParams }
			}
		} = this.props;

		const formFields = {
			bidderConfig: {
				relation: {
					name: 'Relation',
					dataType: 'string',
					inputType: 'selectBox',
					options: isApRelation
						? [{ name: 'AdPushup', value: 'adpushup' }, { name: 'Direct', value: 'direct' }]
						: [{ name: 'Direct', value: 'direct' }],
					defaultValue: isApRelation ? 'adpushup' : 'direct',
					isRequired: true,
					isEditable: true
				},
				bids: {
					name: 'Bids',
					dataType: 'string',
					inputType: 'selectBox',
					options: [{ name: 'Net', value: 'net' }, { name: 'Gross', value: 'gross' }],
					isRequired: true,
					isEditable: true
				},
				revenueShare: {
					name: 'Revenue Share',
					dataType: 'string',
					inputType: 'text',
					isRequired: false,
					isEditable: true
				}
			},
			params: {
				...globalParams,
				...siteLevelParams
			}
		};

		if (Object.keys(formFields).length) {
			this.setState(() => {
				const newState = { formFields };

				for (const paramKey in formFields) {
					newState[paramKey] = '';
				}

				return newState;
			});
		}
	}

	onBidderAdd = () => {};

	getBidderInputField = (/* paramConfig */ { inputType, options }, paramKey, stateKey) => {
		if (!inputType || !paramKey) return false;

		const {
			[stateKey]: { [paramKey]: currValue }
		} = this.state;

		switch (inputType) {
			case 'selectBox': {
				return (
					<Selectbox
						id={`hb-${paramKey}`}
						wrapperClassName="hb-input"
						selected={currValue}
						options={options}
						onSelect={value => {
							this.setState(state => ({ [stateKey]: { ...state[stateKey], [paramKey]: value } }));
						}}
					/>
				);
			}

			case 'text': {
				return (
					<InputBox
						type="text"
						name={`hb-${paramKey}`}
						classNames="hb-input"
						value={currValue || ''}
						onChange={({ target: { value } }) => {
							this.setState(state => ({ [stateKey]: { ...state[stateKey], [paramKey]: value } }));
						}}
					/>
				);
			}

			default:
				return false;
		}
	};

	renderFormFields = () => {
		const formFieldsJSX = [];

		const { formFields } = this.state;

		for (const collectionKey in formFields) {
			const collection = formFields[collectionKey];
			for (const fieldKey in collection) {
				if (!fieldKey) return;
				const fieldConfig = collection[fieldKey];

				formFieldsJSX.push(
					<FormGroup key={fieldKey} controlId={`hb-${fieldKey}`}>
						<Col componentClass={ControlLabel} sm={4}>
							{fieldConfig.name}
						</Col>
						<Col sm={8}>{this.getBidderInputField(fieldConfig, fieldKey, collectionKey)}</Col>
					</FormGroup>
				);
			}
		}

		// eslint-disable-next-line consistent-return
		return formFieldsJSX;
	};

	render() {
		const { bidderConfig, toggleView } = this.props;

		return (
			<div className="options-wrapper hb-add-bidder">
				<header>
					<h3>Add {bidderConfig.name}</h3>
					<span className="back" onClick={toggleView}>
						Back
					</span>
				</header>
				<Row>
					<Col md={4}>
						<h4>Partner Configuration</h4>
					</Col>
					<Col md={8}>
						<Form horizontal onSubmit={this.onBidderAdd}>
							{this.renderFormFields()}
							<FormGroup>
								<Col>
									<CustomButton type="submit" variant="primary">
										Add
									</CustomButton>
									<CustomButton type="button" variant="secondary" onClick={toggleView}>
										Cancel
									</CustomButton>
								</Col>
							</FormGroup>
						</Form>
					</Col>
				</Row>
			</div>
		);
	}
}

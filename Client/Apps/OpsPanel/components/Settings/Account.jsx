/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component, Fragment } from 'react';
import { Col } from 'react-bootstrap';

import { DFP_ACCOUNTS_DEFAULT } from '../../configs/commonConsts';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import CustomMessage from '../../../../Components/CustomMessage/index';
import Selectbox from '../../../../Components/Selectbox';

class Account extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const {
			adNetworkSettings = [],
			adServerSettings: {
				dfp: {
					activeDFPParentId = false,
					activeDFPNetwork = false,
					isThirdPartyAdx = false,
					activeDFPCurrencyCode = 'Not Set'
				} = {}
			} = {}
		} = user;
		const adsense = adNetworkSettings[0] || null;
		const adsensePubId = adsense ? adsense.pubId : null;
		const activeDFP =
			activeDFPNetwork && activeDFPParentId ? `${activeDFPNetwork}-${activeDFPParentId}` : null;
		let dfpAccounts = DFP_ACCOUNTS_DEFAULT;

		adNetworkSettings.forEach(network => {
			if (network.networkName === 'DFP') {
				const { dfpAccounts: DfpAccountsFromDoc } = network;
				const currentDfpAccounts = DfpAccountsFromDoc.map(account => ({
					name: `${account.code} - ${account.name || 'N/A'}`,
					value: `${account.code}-${account.dfpParentId}`
				}));
				dfpAccounts = currentDfpAccounts;
			}
		});

		this.state = {
			activeDFP,
			originalactiveDFP: activeDFP,
			isThirdPartyAdx,
			activeDFPCurrencyCode,
			adsensePubId,
			dfpAccounts
		};
	}

	handleToggle = (value, extra) => {
		let toUpdate = {};
		if (typeof extra === 'string') {
			toUpdate = {
				[extra]: value
			};
		} else {
			const identifier = extra.target.getAttribute('name').split('-')[0];
			toUpdate = {
				[identifier]: value
			};
		}

		this.setState({ ...toUpdate });
	};

	handleChange = event => {
		const { value } = event.target;
		this.setState({
			adsensePubId: value
		});
	};

	handleSave = () => {
		const { adsensePubId, activeDFP, originalactiveDFP, isThirdPartyAdx } = this.state;
		const { showNotification, updateUser, user } = this.props;
		const { adNetworkSettings = [], adServerSettings = {} } = user;

		if (originalactiveDFP === null && activeDFP === null) {
			return showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Please select an active DFP',
				autoDimiss: 10
			});
		} else if (originalactiveDFP === null && activeDFP !== null) {
			if (
				!window.confirm(
					'Setting Active DFP is an irrevocable action. Are you sure about the selected Active DFP? '
				)
			) {
				return false;
			}
		}

		const [activeDFPNetwork, activeDFPParentId] = activeDFP.split('-');
		const updatedadServerSettings = {
			...adServerSettings,
			dfp: { ...adNetworkSettings.dfp, isThirdPartyAdx, activeDFPNetwork, activeDFPParentId }
		};
		adNetworkSettings[0] = adNetworkSettings[0] || [];
		adNetworkSettings[0].pubId = adsensePubId;
		adNetworkSettings[0].networkName = adNetworkSettings[0].networkName || 'ADSENSE';

		return updateUser({
			key: 'adServerSettings',
			value: updatedadServerSettings
		})
			.then(() =>
				updateUser({
					key: 'adNetworkSettings',
					value: adNetworkSettings
				})
			)
			.then(() =>
				this.setState({
					originalactiveDFP: activeDFP
				})
			);
	};

	render() {
		const {
			adsensePubId,
			dfpAccounts,
			activeDFP,
			isThirdPartyAdx,
			activeDFPCurrencyCode,
			originalactiveDFP
		} = this.state;

		const isDFPSetup = !!activeDFP;

		return (
			<Col xs={12} style={{ margin: '0 auto' }}>
				{isDFPSetup ? null : (
					<CustomMessage
						type="error"
						header="Information"
						message="DFP Setup Incomplete. Please setup Publisher's DFP or Select AdPushup DFP below for Ad Syncing."
						rootClassNames="u-margin-b4"
						dismissible
					/>
				)}
				<FieldGroup
					name="adsensePubId-dfpSettings"
					value={adsensePubId}
					type="text"
					label="Adsense Pub Id"
					onChange={this.handleChange}
					size={6}
					id="adsensePubId-input"
					placeholder="Adsense Pub Id"
					className="u-padding-v4 u-padding-h4"
				/>
				{isDFPSetup && originalactiveDFP !== null ? (
					<FieldGroup
						name="Active DFP"
						value={activeDFP}
						isTextOnly
						textOnlyStyles={{
							display: 'inline-block',
							float: 'right',
							fontWeight: 'bold',
							border: '1px solid rgb(176, 174, 174)',
							padding: '5px 15px'
						}}
						label="Active DFP"
						size={6}
						id="activeDFP-text"
						className="u-padding-v4 u-padding-h4"
					/>
				) : (
					<Fragment>
						<p className="u-text-bold">Select DFP</p>
						<Selectbox
							onSelect={this.handleToggle}
							options={dfpAccounts}
							title="Select DFP Account"
							selected={activeDFP}
							id="accounts-dfp-select"
							wrapperClassName="u-margin-v4"
							dataKey="activeDFP"
						/>
					</Fragment>
				)}
				<FieldGroup
					name="Google Ad Manager Currency"
					value={activeDFPCurrencyCode}
					isTextOnly
					textOnlyStyles={{
						display: 'inline-block',
						float: 'right',
						fontWeight: 'bold',
						border: '1px solid rgb(176, 174, 174)',
						padding: '5px 15px'
					}}
					label="Google Ad Manager Currency"
					size={6}
					id="googleAdManager-input"
					className="u-padding-v4 u-padding-h4"
				/>
				<CustomToggleSwitch
					labelText="Third Party AdX"
					className="u-margin-t4 u-margin-b4 negative-toggle u-cursor-pointer"
					checked={isThirdPartyAdx}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="isThirdPartyAdx"
					id="js-isThirdPartyAdx"
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</Col>
		);
	}
}

export default Account;

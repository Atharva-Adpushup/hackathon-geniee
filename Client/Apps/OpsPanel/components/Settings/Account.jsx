/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component, Fragment } from 'react';
import { Col } from 'react-bootstrap';
import memoize from 'memoize-one';

import { DFP_ACCOUNTS_DEFAULT } from '../../configs/commonConsts';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import CustomMessage from '../../../../Components/CustomMessage/index';
import SelectBox from '../../../../Components/SelectBox';
import Loader from '../../../../Components/Loader/index';

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
			activeDFPNetwork && activeDFPParentId
				? `${activeDFPNetwork}-${activeDFPParentId}-${activeDFPCurrencyCode}`
				: null;
		let dfpAccounts = DFP_ACCOUNTS_DEFAULT;

		adNetworkSettings.forEach(network => {
			if (network.networkName === 'DFP') {
				const { dfpAccounts: DfpAccountsFromDoc } = network;
				const currentDfpAccounts = DfpAccountsFromDoc.map(account => ({
					name: `${account.code} - ${account.name || 'N/A'}`,
					value: `${account.code}-${account.dfpParentId}-${account.currencyCode}`
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
			dfpAccounts,
			loading: false
		};
	}

	getActiveDFPName = memoize((adNetworkSettings, code) => {
		let response = '103512698 - AdPushup Inc.';
		adNetworkSettings.forEach(network => {
			if (network.networkName === 'DFP') {
				const { dfpAccounts } = network;
				const filteredAccounts = dfpAccounts.filter(
					account => `${account.code}-${account.dfpParentId}-${account.currencyCode}` === code
				);
				if (filteredAccounts.length) {
					response = `${filteredAccounts[0].code} - ${filteredAccounts[0].name || 'N/A'}`;
				}
			}
		});
		return response;
	});

	handleToggle = (value, extra) => {
		let toUpdate = {};
		if (typeof extra === 'string') {
			const activeDFPCurrencyCode = value.split('-')[2];
			toUpdate = {
				[extra]: value,
				activeDFPCurrencyCode
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

		const [activeDFPNetwork, activeDFPParentId, activeDFPCurrencyCode] = activeDFP.split('-');
		const updatedadServerSettings = {
			...adServerSettings,
			dfp: {
				...adServerSettings.dfp,
				isThirdPartyAdx,
				activeDFPNetwork,
				activeDFPParentId,
				activeDFPCurrencyCode
			}
		};

		const originalAdsensePubId = adNetworkSettings[0] ? adNetworkSettings[0].pubId : null;
		const shouldUpdateAdNetworkSettings = !!(originalAdsensePubId || adsensePubId);

		if (shouldUpdateAdNetworkSettings) {
			adNetworkSettings[0] = adNetworkSettings[0] || {};
			adNetworkSettings[0].pubId = adsensePubId;
			adNetworkSettings[0].networkName = adNetworkSettings[0].networkName || 'ADSENSE';
		}

		this.setState({ loading: true });

		return updateUser([
			{
				key: 'adServerSettings',
				value: updatedadServerSettings
			},
			{
				key: 'adNetworkSettings',
				value: adNetworkSettings
			}
		]).then(() =>
			this.setState({
				originalactiveDFP: activeDFP,
				loading: false
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
			originalactiveDFP,
			loading
		} = this.state;
		const { user } = this.props;
		const { adNetworkSettings = [] } = user;
		const activeDFPName = this.getActiveDFPName(adNetworkSettings, activeDFP);

		const isDFPSetup = !!activeDFP;

		if (loading) return <Loader height="200px" />;

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
						value={activeDFPName}
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
						<SelectBox
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

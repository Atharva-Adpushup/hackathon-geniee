import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import Loader from '../../../../Components/Loader';
import AdListContainer from '../../containers/AdListContainer';
import CustomError from '../../../../Components/CustomError/index';
import {
	IA_NAV_ITEMS,
	IA_NAV_ITEMS_INDEXES,
	IA_NAV_ITEMS_VALUES
} from '../../configs/commonConsts';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirectUrl: ''
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	componentDidMount() {
		const { meta, fetchMeta, match, loading, fetchAds } = this.props;
		if (loading) fetchAds({ siteId: match.params.siteId });
		if (!meta.fetched) fetchMeta(match.params.siteId);
	}

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	getSiteId = () => {
		const {
			match: {
				params: { siteId }
			}
		} = this.props;

		return siteId;
	};

	handleNavSelect = value => {
		const siteId = this.getSiteId();
		const computedRedirectUrl = `/sites/${siteId}/apps/innovative-ads`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/manage`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();
		const { user: { adServerSettings: { dfp = null } = {} } = {} } = this.props;

		if (!dfp || !dfp.activeDFPNetwork)
			return (
				<CustomError message="To use this app, please select Google Account Manager. Contact AdPushup Ops for the same." />
			);

		switch (activeTab) {
			default:
			case IA_NAV_ITEMS_INDEXES.CREATE_ADS:
				return <AdCodeGeneratorContainer {...this.props} />;
			case IA_NAV_ITEMS_INDEXES.MANAGE_ADS:
				return <AdListContainer {...this.props} />;
		}
	}

	render() {
		const { meta, loading } = this.props;
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = IA_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<div>
				{!meta.fetched || loading ? (
					<Loader />
				) : (
					<React.Fragment>
						<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
							<NavItem eventKey={1}>{IA_NAV_ITEMS_VALUES.CREATE_ADS}</NavItem>
							<NavItem eventKey={2}>{IA_NAV_ITEMS_VALUES.MANAGE_ADS}</NavItem>
						</Nav>
						{this.renderContent()}
					</React.Fragment>
				)}
			</div>
		);
	}
}

export default Home;

/* eslint-disable no-param-reassign */
import { connect } from 'react-redux';
import {
	fetchInventoryTabAllAdUnits,
	updateInventoryTabAdUnits
} from '../../../actions/apps/opsPanel/toolsActions';
import { showNotification } from '../../../actions/uiActions';
import { fetchGlobalData } from '../../../actions/globalActions';
import AdUnitInventoryTab from '../components/Tools/Inventory';

const mapStateToProps = (state, ownProps) => {
	const {
		sites,
		tools: {
			inventoryAdUnits: { data: allAds = [], fetched: isInventoryFetched = false }
		},
		sites: { data: siteDataMap = {} } = {}
	} = state.global;

	const allAdUnits = [];
	const allAdsMap = allAds.reduce((adsMap, currentAd) => {
		const { adId } = currentAd;
		adsMap[adId] = currentAd;
		return adsMap;
	}, {});
	for (let index = 0; index < allAds.length; index += 1) {
		const data = allAds[index];
		if (data) {
			let siteDomain = siteDataMap[data.siteId].siteDomain || data.siteDomain;
			siteDomain = new URL(siteDomain);
			data.siteDomain = siteDomain.hostname;
			allAdUnits.push(data);
		}
	}

	return {
		allAds: allAdUnits,
		sites,
		isInventoryFetched: isInventoryFetched && sites.fetched,
		allAdsMap,
		...ownProps
	};
};

export default connect(mapStateToProps, {
	showNotification,
	fetchInventoryTabAllAdUnits,
	fetchGlobalData,
	updateInventoryTabAdUnits
})(AdUnitInventoryTab);

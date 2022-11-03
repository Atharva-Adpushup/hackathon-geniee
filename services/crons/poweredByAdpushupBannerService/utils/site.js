const CouchbasePromises = require('couchbase');
const moment = require('moment');
const couchbase = require('../../../../helpers/couchBaseService');
const config = require('../../../../configs/config');

const N1qlQuery = CouchbasePromises.N1qlQuery;

//Constants
const AD_UNIT_TYPES = {
	display: 'Display',
	sticky: 'Sticky',
	docked: 'Docked'
	// chainedDocked: 'Chained Docked Ads' This is excluded intentionally for now.
};

const AD_UNIT_DOC_TYPES = {
	chnl: 'Layout',
	fmrt: 'Innovative',
	tgmr: 'AP Tag'
};

// Couchbase Methods
/* The below function gets the siteList which have been added in last two years */
const getSites = async (timeStamp) => {
	const docQuery = N1qlQuery.fromString(`SELECT siteId
	FROM AppBucket site
	WHERE Meta().id LIKE "site::%"
	AND site.dateCreated >= ${timeStamp}
	AND site.apConfigs.disableAutoAdpushupLabel is NOT VALUED OR site.apConfigs.disableAutoAdpushupLabel = false`);

	const siteData = await couchbase.queryViewFromAppBucket(docQuery);

	if (!siteData || siteData.length < 1) return [];
	let siteArr = siteData.map(item => item.siteId);
	return siteArr;
};

/* Gets the ad units present in PWBA doc */
const getExistingAdUnits = async siteId => {
	const docQuery = N1qlQuery.fromString(`SELECT site.aptag, site.layout, site.sticky, site.docked
	FROM AppBucket as site
	WHERE META(site).id = "pwba::${siteId}"`);

	const adUnits = await couchbase.queryViewFromAppBucket(docQuery);

	if (adUnits.length > 0) {
		return adUnits[0];
	} else {
		return [];
	}
};

const getTgmrAds = async siteId => {
	const docQuery = N1qlQuery.fromString(`SELECT raw section.id
	FROM AppBucket as site
	Unnest ads as section
	WHERE META(site).id = "tgmr::${siteId}"`);

	const adUnits = await couchbase.queryViewFromAppBucket(docQuery);

	return adUnits;
};

/* The below functions removes the common ad units from sectionIdArr & existingUnits */
const removeDuplicateUnits = (sectionIdArr, existingUnits) => {
	if (existingUnits.length < 1) {
		return {
			enableAdArr: sectionIdArr,
			disableAdArr: []
		};
	}
	const enableAdArr = sectionIdArr.filter(id => !existingUnits.includes(id));
	const disableAdArr = existingUnits.filter(id => !sectionIdArr.includes(id));

	return {
		enableAdArr: enableAdArr,
		disableAdArr: disableAdArr
	};
};

const getActiveAds = async siteid => {
	const docQuery = N1qlQuery.fromString(`
	SELECT ad
	FROM AppBucket doc
	UNNEST doc.ads AS ad
	WHERE META(doc).id IN ["fmrt::${siteid}", "tgmr::${siteid}"]
	    AND doc.ads IS VALUED
	    AND ad.archivedOn IS MISSING
	    AND ad.isActive IS VALUED
	    AND ad.isActive = TRUE
	    AND ad.formatData IS VALUED`);

	const activeAdsData = await couchbase.queryViewFromAppBucket(docQuery);

	if (!activeAdsData || activeAdsData.length < 1) return null;
	const apTags = activeAdsData.map(item => item.ad);
	return apTags;
};

const updateFmrtDoc = async (siteId, sectionIdArr, existingUnits) => {
	if (!sectionIdArr || sectionIdArr.length < 1) return false;

	const { enableAdArr, disableAdArr } = removeDuplicateUnits(sectionIdArr, existingUnits);

	if ((!enableAdArr || enableAdArr.length < 1) && (!disableAdArr || disableAdArr.length < 1))
		return false;

	let queryString = `UPDATE AppBucket fmrt
	SET ad.poweredByBanner = TRUE FOR ad IN fmrt.ads WHEN ad.id IN [${enableAdArr.toString()}] END,
	ad.poweredByBanner = FALSE FOR ad IN fmrt.ads WHEN ad.id IN [${disableAdArr.toString()}] END
	WHERE META(fmrt).id = "fmrt::${siteId}"
		AND fmrt.ads IS VALUED
	RETURNING fmrt`;

	const docQuery = N1qlQuery.fromString(queryString);

	const fmrtDocData = await couchbase.queryViewFromAppBucket(docQuery);
	return !!fmrtDocData;
};

const updateTgmrDoc = async (siteId, sectionIdArr, existingUnits) => {
	if (!sectionIdArr || sectionIdArr.length < 1) return false;

	const { enableAdArr, disableAdArr } = removeDuplicateUnits(sectionIdArr, existingUnits);

	if ((!enableAdArr || enableAdArr.length < 1) && (!disableAdArr || disableAdArr.length < 1))
		return false;

	let queryString = `
		UPDATE AppBucket tgmr
		SET ad.poweredByBanner = TRUE FOR ad IN tgmr.ads WHEN ad.id IN [${enableAdArr.toString()}] END,
		ad.poweredByBanner = FALSE FOR ad IN tgmr.ads WHEN ad.id IN [${disableAdArr.toString()}] END
		WHERE META(tgmr).id = "tgmr::${siteId}"
			AND tgmr.ads IS VALUED
		RETURNING tgmr`;

	const docQuery = N1qlQuery.fromString(queryString);

	const tgmrDocData = await couchbase.queryViewFromAppBucket(docQuery);
	return !!tgmrDocData;
};

const updateChnlDoc = async (siteId, sectionIdArr, existingUnits) => {
	if (!sectionIdArr || sectionIdArr.length < 1) return false;

	const { enableAdArr, disableAdArr } = removeDuplicateUnits(sectionIdArr, existingUnits);

	if ((!enableAdArr || enableAdArr.length < 1) && (!disableAdArr || disableAdArr.length < 1))
		return false;

	let queryString = `UPDATE AppBucket chnl
	SET ad.poweredByBanner = TRUE 
	FOR ad IN OBJECT_VALUES(s.ads) 
	FOR s IN OBJECT_VALUES(v.sections) 
	FOR v IN OBJECT_VALUES(chnl.variations) 
	WHEN s.id IN [${enableAdArr.toString()}] END,
	ad.poweredByBanner = FALSE 
	FOR ad IN OBJECT_VALUES(s.ads) 
	FOR s IN OBJECT_VALUES(v.sections) 
	FOR v IN OBJECT_VALUES(chnl.variations) 
	WHEN s.id IN [${disableAdArr.toString()}] END
	WHERE META().id LIKE "chnl::${siteId}:%"
	RETURNING chnl`;

	const docQuery = N1qlQuery.fromString(queryString);

	const chnlDocData = await couchbase.queryViewFromAppBucket(docQuery);
	return !!chnlDocData;
};

// Site Utility Methods
const getMaxImpressionUnits = async (siteData, reportingData) => {
	if (!siteData) return null;
	try {
		const activeApps = siteData.apps || {};
		const channels = siteData.channels || [];
		const siteId = siteData.siteId;

		//Filtering units by ad unit type
		let { displayUnits, stickyUnits, dockedUnits } = sortAndFilterReportUnits(reportingData);

		// getActiveAds method fetches active ads from tgmr & fmrt docs
		let activeAds = await getActiveAds(siteId);

		if (!activeAds) return;
		let { allActiveApTags, allBottomStickeyAds, allActiveDockedAds } = filterActiveUnits(activeAds);

		let aptagSectionId = allActiveApTags.map(unit => unit.id.toUpperCase());

		let maxImpressionUnits = {};
		//if Ap tags are active. Get the max impression Ap tags
		if (activeApps.apTag && displayUnits.length > 0 && allActiveApTags.length > 0) {
			const maxApTagArr = getMaxImpressionAPTag(displayUnits, allActiveApTags, aptagSectionId);
			if (maxApTagArr.length > 0) {
				maxImpressionUnits['aptag'] = maxApTagArr;
			}
		}
		if (activeApps.layout && channels.length > 0 && displayUnits.length > 0) {
			const maxLayoutAdArr = getMaxImpressionLayoutAd(displayUnits, aptagSectionId);
			if (maxLayoutAdArr.length > 0) {
				maxImpressionUnits['layout'] = maxLayoutAdArr;
			}
		}

		//If innovative ads are active get the max impression bottom sticky, docked & chained docked units
		if (activeApps.innovativeAds) {
			const maxStickyAdArr = getMaxImpressionInnovativeAds(stickyUnits, allBottomStickeyAds);
			const maxDockedAdArr = getMaxImpressionInnovativeAds(dockedUnits, allActiveDockedAds);

			if (maxStickyAdArr.length > 0) {
				maxImpressionUnits['sticky'] = maxStickyAdArr;
			}
			if (maxDockedAdArr.length > 0) {
				maxImpressionUnits['docked'] = maxDockedAdArr;
			}
		}
		return maxImpressionUnits;
	} catch (err) {
		console.log('Powered By Adpushup banner service error :', err);
		return {};
	}
};

const sortAndFilterReportUnits = unitList => {
	//Sotring unitList as per impressions
	unitList.sort((a, b) => (a.network_impressions < b.network_impressions ? 1 : -1));

	//Sepetrating units as per adunit types
	let displayUnits = unitList.filter(item => item.ad_unit_type === AD_UNIT_TYPES.display);
	let stickyUnits = unitList.filter(item => item.ad_unit_type === AD_UNIT_TYPES.sticky);
	let dockedUnits = unitList.filter(item => item.ad_unit_type === AD_UNIT_TYPES.docked);

	return {
		displayUnits,
		stickyUnits,
		dockedUnits
	};
};

const filterActiveUnits = unitList => {
	const allActiveApTags = unitList.filter(
		item => item.isManual && item.formatData.type === 'display'
	);
	const allBottomStickeyAds = unitList.filter(
		item => item.formatData.type === 'sticky' && item.formatData.format === 'stickyBottom'
	);
	const allActiveDockedAds = unitList.filter(item => item.formatData.format === 'docked');

	return { allActiveApTags, allBottomStickeyAds, allActiveDockedAds };
};

const getMaxImpressionAPTag = (reportingUnits, activeUnits, activeApUnits) => {
	let maxImpressionUnit = [];
	let maxImpressionUnitFound = false;
	reportingUnits.forEach(unit => {
		if (maxImpressionUnitFound || !unit.section_id || !activeApUnits.includes(unit.section_id))
			return;
		let isMaxImpressionUnit = activeUnits.find(
			item => item.id.toUpperCase() === unit.section_id.toUpperCase()
		);
		if (isMaxImpressionUnit) {
			maxImpressionUnit.push({
				page_group: unit.page_group,
				device_type: unit.device_type,
				ad_unit_type: unit.ad_unit_type,
				section_id: unit.section_id,
				network_impressions: unit.network_impressions,
				id: isMaxImpressionUnit.id,
				ad_type: AD_UNIT_DOC_TYPES.tgmr,
				name: isMaxImpressionUnit.name
			});
			maxImpressionUnitFound = true;
		}
	});
	return maxImpressionUnit;
};

/**
 * It takes an array of reporting units and returns an array of reporting units with the highest
 * impressions for each page group and device type
 * @returns An array of objects.
 */
const getMaxImpressionLayoutAd = (reportingUnits, activeApUnits) => {
	let maxImpressionUnits = [];
	reportingUnits.forEach(unit => {
		if (
			!unit.section_id ||
			!unit.device_type ||
			!unit.page_group ||
			activeApUnits.includes(unit.section_id)
		)
			return;
		let unitFound = maxImpressionUnits.find(
			item => item.device_type === unit.device_type && item.page_group === unit.page_group
		);
		if (!unitFound) {
			maxImpressionUnits.push({
				page_group: unit.page_group,
				device_type: unit.device_type,
				ad_unit_type: unit.ad_unit_type,
				section_id: unit.section_id,
				network_impressions: unit.network_impressions,
				ad_type: AD_UNIT_DOC_TYPES.chnl,
				name: unit.section
			});
		}
	});
	return maxImpressionUnits;
};

const getMaxImpressionInnovativeAds = (reportingUnits, activeUnits) => {
	let maxImpressionUnits = [];
	if (!reportingUnits || !activeUnits) return maxImpressionUnits;
	reportingUnits.forEach(unit => {
		if (!unit.section_id || !unit.device_type || !unit.page_group) return;
		let unitFound = maxImpressionUnits.find(
			item => item.device_type === unit.device_type && item.page_group === unit.page_group
		);
		let activeUnitFound = activeUnits.find(item => item.id.toUpperCase() === unit.section_id);

		if (!unitFound && activeUnitFound) {
			maxImpressionUnits.push({
				page_group: unit.page_group,
				device_type: unit.device_type,
				ad_unit_type: unit.ad_unit_type,
				section_id: unit.section_id,
				network_impressions: unit.network_impressions,
				id: activeUnitFound.id,
				ad_type: AD_UNIT_DOC_TYPES.fmrt,
				name: activeUnitFound.name
			});
		}
	});
	return maxImpressionUnits;
};

const getFmrtSectionArr = adUnitObj => {
	const sectionArr = [];

	if (adUnitObj.sticky) {
		adUnitObj.sticky.forEach(item => {
			sectionArr.push(`"${item.id}"`);
		});
	}
	if (adUnitObj.docked) {
		adUnitObj.docked.forEach(item => {
			sectionArr.push(`"${item.id}"`);
		});
	}
	return sectionArr;
};

const getTgmrSectionArr = adUnitObj => {
	const sectionArr = [];
	if (adUnitObj.aptag) {
		adUnitObj.aptag.forEach(item => {
			item.id ? sectionArr.push(`"${item.id}"`) : sectionArr.push(`"${item.section_id}"`);
		});
	}
	return sectionArr;
};

const getChnlSectionArr = adUnitObj => {
	const sectionArr = [];
	if (adUnitObj.layout) {
		adUnitObj.layout.forEach(item => {
			item.id ? sectionArr.push(`"${item.id}"`) : sectionArr.push(`"${item.section_id}"`);
		});
	}
	return sectionArr;
};

const enablePoweredByBannerFlag = async (siteData, adUnits, existingUnits) => {
	try {
		//Enable flag for adunits with CB query
		const siteId = siteData.siteId;
		const activeApps = siteData.apps || {};

		if (activeApps.apTag) {
			const tgmrSectionIdArr = getTgmrSectionArr(adUnits);
			const existingTgmrIdArr = getTgmrSectionArr(existingUnits);
			if (tgmrSectionIdArr.length > 0)
				await updateTgmrDoc(siteId, tgmrSectionIdArr, existingTgmrIdArr);
		}
		if (activeApps.layout) {
			//update layout doc
			const chnlSectionIdArr = getChnlSectionArr(adUnits);
			const existingchnlSectionIdArr = getChnlSectionArr(existingUnits);
			if (chnlSectionIdArr.length > 0)
				await updateChnlDoc(siteId, chnlSectionIdArr, existingchnlSectionIdArr);
		}
		if (activeApps.innovativeAds) {
			const fmrtSectionIdArr = getFmrtSectionArr(adUnits);
			const existingfmrtSectionIdArr = getFmrtSectionArr(existingUnits);
			if (fmrtSectionIdArr.length > 0)
				await updateFmrtDoc(siteId, fmrtSectionIdArr, existingfmrtSectionIdArr);
		}

		// Add units in PWBA doc
		let docId = `pwba::${siteId}`;
		await couchbase.upsertDoc(config.couchBase.DEFAULT_BUCKET, docId, {
			...adUnits,
			siteId,
			dateCreated: moment().unix()
		});

		return;
	} catch (err) {
		console.log('Powered By Adpushup banner service error :', err);
	}
};

module.exports = {
	getMaxImpressionUnits,
	enablePoweredByBannerFlag,
	getSites,
	getExistingAdUnits
};

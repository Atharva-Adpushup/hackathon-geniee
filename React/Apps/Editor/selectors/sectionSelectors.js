import _ from 'lodash';
import { createSelector } from 'reselect';
import { getAllAds } from './adsSelectors';

const getAllSections = state => state.sectionByIds,
	getSectionsAdIds = (state, props) => state.sectionByIds[props.sectionId].ads,
	getSectionById = (state, props) => state.sectionByIds[props.sectionId],
	getSectionWithAds = createSelector([getSectionById, getAllAds], (section = { ads: [] }, allAds = []) => ({
		...section,
		ads: _.map(section.ads, adId => allAds[adId])
	}));

export { getAllSections, getSectionsAdIds, getSectionById, getSectionWithAds };

import _ from 'lodash';
import { createSelector } from 'reselect';


const getAllSections = (state) => state.sectionByIds,
	getSectionsAdIds = (state, props) => state.sectionByIds[props.sectionId].ads;

export { getAllSections, getSectionsAdIds };

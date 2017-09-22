import _ from 'lodash';
import { createSelector } from 'reselect';
import { getActiveChannel } from './channelSelectors';

const getAllAds = state => state.adByIds;

export { getAllAds };

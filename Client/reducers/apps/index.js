import { combineReducers } from 'redux';
import apTag from './apTag';
import innovativeAds from './innovativeAds';
import headerBidding from './headerBidding';
import amp from './amp';
import ampNew from './ampNew';
import pnp from './pnp';

export default combineReducers({ apTag, innovativeAds, headerBidding, amp, ampNew, pnp });

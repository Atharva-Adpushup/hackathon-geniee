import { combineReducers } from 'redux';
import apTag from './apTag';
import innovativeAds from './innovativeAds';
import headerBidding from './headerBidding';
import amp from './amp';
import ampNew from './ampNew';

export default combineReducers({ apTag, innovativeAds, headerBidding, amp, ampNew });

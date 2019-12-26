import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import HeaderBiddingContainer from './containers/HeaderBiddingContainer';
import '../../scss/apps/headerBidding/index.scss';

const HeaderBiddingWrap = props => (
	<Fragment>
		<DocumentTitle title="Header Bidding" />

		<HeaderBiddingContainer {...props} />
	</Fragment>
);

export default HeaderBiddingWrap;

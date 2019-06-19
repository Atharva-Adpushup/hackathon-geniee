import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import HeaderBiddingContainer from './containers/HeaderBiddingContainer';
import '../../scss/apps/headerBidding/index.scss';

const HeaderBiddingWrap = props => (
	<Fragment>
		<Helmet>
			<title>Header Bidding</title>
		</Helmet>

		<HeaderBiddingContainer {...props} />
	</Fragment>
);

export default HeaderBiddingWrap;

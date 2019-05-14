import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import HeaderBidding from './components/HeaderBidding';
// import '../../scss/pages/headerBidding/index.scss';

const HeaderBiddingWrap = props => (
	<Fragment>
		<Helmet>
			<title>Header Bidding</title>
		</Helmet>

		<HeaderBidding {...props} />
	</Fragment>
);

export default HeaderBiddingWrap;

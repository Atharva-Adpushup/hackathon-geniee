import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import _ from 'lodash';

const channelList = ({ channels = {}, onClick }) => {
	const getClass = name => {
		let ico = 'desktop';
		if (name === 'MOBILE') {
			ico = 'mobile';
		} else if (name === 'TABLET') {
			ico = 'tablet';
		}
		return ico;
	};
	channels = _.sortBy(channels, 'pageGroup');
	return (
		<div className="SelectParent channelLst">
			{_.map(channels, (channel, index) => (
				<Row key={index}>
					<Col className={getClass(channel.platform)} xs={2}>
						<i className={`fa fa-${getClass(channel.platform)}`} />
					</Col>
					<Col xs={6} className="overFlowTxt">
						<label className="mB-0">{channel.pageGroup}</label>
					</Col>
					<Col onClick={onClick.bind(null, channel.id)} xs={4}>
						<div className="btn-lightBg btn-Small btn">load</div>
					</Col>
				</Row>
			))}
		</div>
	);
};

channelList.propTypes = {
	channels: PropTypes.array.isRequired,
	onClick: PropTypes.func.isRequired
};

channelList.defaultProps = {
	onClick: channelId => console.log(channelId)
};

export default channelList;

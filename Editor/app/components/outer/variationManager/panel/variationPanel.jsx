import React, { PropTypes } from 'react';
import TabPanel from 'react-tab-panel';
import 'react-tab-panel/index.css';
import './styles.scss';
import IncontentAdder from './incontentSectionAdder';
import VariationOptions from './variationOptions';

class VariationPanel extends React.Component {
	render() {
		const { variation, channelId } = this.props;
		return (<div className="variation-settings">
			<TabPanel tabPosition="left">
				<div tabTitle="Info">
					<VariationOptions channelId={channelId} variation={variation} />
				</div>
				<div tabTitle="Sections">
					<div>Helllo </div>
				</div>
				<div tabTitle="Add Incontent Variation">
					<IncontentAdder channelId={channelId} variation={variation} />
				</div>
			</TabPanel>
		</div>);
	}
}


export default VariationPanel;

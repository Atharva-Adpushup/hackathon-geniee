import React, { PropTypes } from 'react';
import TabPanel from 'react-tab-panel';
import 'react-tab-panel/index.css';
import IncontentAdder from './incontentSectionAdder';

class VariationPanel extends React.Component {
	render() {
		const { variation } = this.props;
		return (<div className="variation-settings">
			<TabPanel tabPosition="left">
				<div tabTitle="Info" />
				<div tabTitle="Sections">
					<IncontentAdder variation={variation} />
				</div>
				<div tabTitle="Add Incontent Variation">
					<IncontentAdder variation={variation} />
				</div>
			</TabPanel>
		</div>);
	}
}


export default VariationPanel;

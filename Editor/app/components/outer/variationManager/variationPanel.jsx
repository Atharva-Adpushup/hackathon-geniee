import React, { PropTypes } from 'react';
import TabPanel from 'react-tab-panel';
import 'react-tab-panel/index.css';

class VariationPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTav: 0
		};
	}

	render() {
		const { variation } = this.props;
		return (<div className="variation-settings"><TabPanel tabPosition="left" onActivate={(index) => console.log(`Tab ${index} was activated!`)}>
			<div tabTitle="First tab">
				{variation.name}
			</div>

			<div tabTitle="Second tab">
				Lorem ipsum Sunt nisi sint.
			</div>
		</TabPanel></div>);
	}
}


export default VariationPanel;

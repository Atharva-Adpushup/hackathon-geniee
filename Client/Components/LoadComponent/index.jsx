import React from 'react';
import MixpanelHelper from '../../helpers/mixpanel';

class LoadComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			startTime: new Date().getTime()
		};
	}

	componentDidMount = () => {
		this.logTimeTaken(new Date().getTime());
	};

	logTimeTaken = finalTime => {
		const { componentName } = this.props;
		const { startTime } = this.state;
		const componentLoadTime = finalTime - startTime;
		const properties = {
			componentName,
			componentLoadTime,
			group: 'componentApiLoadMonitoring'
		};
		MixpanelHelper.trackEvent('Performance', properties);
	};

	render() {
		const { component: Component, customProps, title } = this.props;
		return <Component customProps={customProps} title={title} {...this.props} />;
	}
}

export default LoadComponent;

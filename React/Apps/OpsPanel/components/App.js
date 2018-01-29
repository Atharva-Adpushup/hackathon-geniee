import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import OpsPanel from './OpsPanel.jsx';
import Settings from './Settings/index';
import SitesMappingContainer from '../containers/sitesMappingContainer';
import LiveSitesMappingContainer from '../containers/liveSitesMappingContainer';
import GlobalMetricChartsContainer from '../containers/globalMetricChartsContainer';

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/ops" component={GlobalMetricChartsContainer} />
					<Route path="/ops/sitesMapping" component={SitesMappingContainer} />
					<Route path="/ops/liveSitesMapping" component={LiveSitesMappingContainer} />
					<Route path="/ops/settings/:siteId" component={Settings} />
					<Route path={`/ops/${window.siteId}/panel`} component={OpsPanel} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

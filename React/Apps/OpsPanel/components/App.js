import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LinkList from './LinkList';
import OpsPanel from './OpsPanel.jsx';
import SitesMappingContainer from '../containers/sitesMappingContainer';
class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/ops" component={LinkList} />
					<Route path="/ops/sitesMapping" component={SitesMappingContainer} />
					<Route path={`/ops/${window.siteId}/panel`} component={OpsPanel} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

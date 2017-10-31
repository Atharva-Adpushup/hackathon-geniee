import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LinkList from './LinkList';
import LiveSitesMapping from './LiveSitesMapping';

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/ops" component={LinkList} />
					<Route path="/ops/liveSitesMapping" component={LiveSitesMapping} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

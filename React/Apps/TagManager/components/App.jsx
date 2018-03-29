import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// import Home from './Home/index.jsx';
import HomeContainer from '../containers/HomeContainer.js';

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/tagManager/:siteId" component={HomeContainer} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

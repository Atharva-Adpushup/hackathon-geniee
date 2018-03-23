import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './Home/index.jsx';

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/tagManager" component={Home} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

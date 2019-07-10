import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import rootReducer from 'reducers/inner/index.js';

export default function() {
	const store = createStore(rootReducer, {}, compose(applyMiddleware(thunk)));

	return store;
}

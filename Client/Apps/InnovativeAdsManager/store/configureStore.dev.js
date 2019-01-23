import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import rootReducer from '../reducers/index';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function(initialState = {}) {
	const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunk)));
	return store;
}

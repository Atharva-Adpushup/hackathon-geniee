import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import rootReducer from '../reducers/index';
import { createLogger } from 'redux-logger';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const logger = createLogger({ diff: true });

export default function(initialState = {}) {
	const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunk, logger)));
	return store;
}

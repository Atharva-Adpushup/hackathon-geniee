import { combineReducers } from 'redux';
import user from './user';
import networkConfig from './networkConfig';
import networkWideRules from './networkWideRules';
import sites from './sites';
import ui from './ui';
import reports from './reports';
import urlreport from './urlReport';
import hbanalytics from './hbanalytics';
import notifications from './notifications';
import tools from './tools';
import associatedAccounts from './associatedAccounts';

export default combineReducers({
	user,
	networkConfig,
	sites,
	ui,
	reports,
	urlreport,
	hbanalytics,
	notifications,
	networkWideRules,
	tools,
	associatedAccounts
});

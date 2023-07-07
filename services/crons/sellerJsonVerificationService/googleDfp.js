const Dfp = require('node-google-dfp');

// Retrieves a list of companies using the Google DFP (DoubleClick for Publishers) API.
function getAllCompanies(userConfig, authConfig) {
	return new Promise((resolve, reject) => {
		var dfpUser = new Dfp.User(
			userConfig.networkCode,
			userConfig.appName,
			userConfig.dfpApiVersion
		);
		dfpUser.setSettings(authConfig);
		dfpUser.getService('CompanyService', function(err, companyService) {
			if (err) {
				return reject(err);
			}
			const statement = new Dfp.Statement("WHERE type = 'CHILD_PUBLISHER'");
			companyService.getCompaniesByStatement(statement, (err, result) => {
				if (err) {
					console.error(err);
					return reject(err);
				}
				const companies = result.rval.results;
				return resolve(companies);
			});
		});
	});
}

module.exports = {
	getAllCompanies
};

const Dfp = require("node-google-dfp");

class NetworkService {
  constructor(dfpConfig) {
    const { networkCode, appName, dfpApiVersion, authConfig } = dfpConfig;
    this.networkCode = networkCode;
    this.appName = appName;
    this.dfpApiVersion = dfpApiVersion;
    this.authConfig = authConfig;
    this.dfpUser = null;
    this.service = null;
  }

  initService() {
    return new Promise((resolve, reject) => {
      // create dfpUser instance and set auth settings
      this.dfpUser = new Dfp.User(
        this.networkCode,
        this.appName,
        this.dfpApiVersion
      );
      this.dfpUser.setSettings(this.authConfig);

      // this.service will be set to error object for async operation errors
      try {
        this.dfpUser.getService("NetworkService", (err, NetworkService) => {
          if (err) {
            this.service = err;
            return reject(err);
          } else {
            this.service = NetworkService;
            return resolve();
          }
        });
      } catch (ex) {
        this.service = ex;
        return reject(ex);
      }
    });
  }

  getAllNetworks() {
    return new Promise((resolve, reject) => {
      try {
        if (this.service instanceof Error) {
          // service has errored
          return reject(this.service);
        } else {
          // service initialized
          this.service.getAllNetworks((error, result) => {
			if (error) {
				return reject({ error });
			}		
            return resolve(result.rval || []);
          }); //
        }
      } catch (ex) {
        return reject(
          new Error(`network::${this.networkCode}::exception - ${ex.message}`)
        );
      }
    });
  }

}

module.exports = NetworkService;

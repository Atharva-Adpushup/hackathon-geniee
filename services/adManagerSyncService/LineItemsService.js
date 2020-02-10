const Dfp = require('node-google-dfp');

class LineItemService {
    constructor(dfpConfig) {
        const { network_code, app_name, version, ...authConfig } = dfpConfig;
        this.network_code = network_code;
        this.app_name = app_name;
        this.version = version;
        this.authConfig = authConfig;
        this.dfpUser = null;
        this.service = null;
        this.operationsQueue = [];
        this.initService();
    }

    async processPendingOperations() {
        try {
            while(this.operationsQueue.length) {
                // console.log('pending ops', this.operationsQueue.length);
                await this.operationsQueue.shift()();
            }
            return true;
        } catch(ex) {
            return ex;
        }
    }

    initService() {
        // create dfpUser instance and set auth settings
        // can throw exception for synchronous operations
        this.dfpUser = new Dfp.User(this.network_code, this.app_name, this.version);
        this.dfpUser.setSettings(this.authConfig);
        
        // this.service will be set to error object for async operation errors
        try {
            this.dfpUser
            .getService('LineItemService', async (err, lineItemService) => {
                if(err) {
                    console.error('Failed to get LineItemService', err);
                    this.service = err;
                } else {
                    this.service = lineItemService;
                    await this.processPendingOperations();
                }
            });
        } catch(ex) {
            console.error('Exception::init', ex);
            this.service = ex;
        }
    }

    getPricePriorityLineItems(offset, count) {
        return new Promise((resolve, reject) => {
            try {
                if(this.service === null) {
                    // service is not intialised yet
                    const task = async () => {
                        try {
                            return resolve(await this.getPricePriorityLineItems(offset, count));
                        } catch(ex) {
                            return reject(ex);
                        }
                    };
                    this.operationsQueue.push(task);
                } else if(this.service instanceof Error) {
                    // service has errored
                    return reject(this.service);
                } else {
                    // service initialized
                    console.log("\n\n", `network::${this.network_code}::getLineItems::`, {offset, count});
                    const statement = new Dfp.Statement(`WHERE LineItemType IN ('PRICE_PRIORITY', 'AD_EXCHANGE') LIMIT ${offset}, ${count}`);
                    this.service
                    .getLineItemsByStatement(statement, (err, results) => {
                        if(err) {
                            console.error('lineitems service error', err);
                            return reject(err);
                        }
                        const totalResults = results.rval.totalResultSetSize || 0;
                        console.log('totalResults=', totalResults);
                        const _results = totalResults === 0 || !results.rval.results || !results.rval.results.length ? [] : results.rval.results.map(({id}) => id);
                        return resolve({
                            results: _results,
                            total: totalResults
                        });
                    });
                }
            } catch(ex) {
                console.error("\n\n",'getLineItems::Error', `network::${this.network_code}`, "\n\n");
                return reject(new Error(`network::${this.network_code}::exception - ${ex.message}`));
            }
        });
    }

    getUniqueLineItemTypes () {
        return new Promise((resolve, reject) => {
            try {
                if(this.service === null) {
                    // service is not intialised yet
                    const task = async () => {
                        try {
                            return resolve(await this.getUniqueLineItemTypes());
                        } catch(ex) {
                            return reject(ex);
                        }
                    };
                    this.operationsQueue.push(task);
                } else if(this.service instanceof Error) {
                    // service has errored
                    return reject(this.service);
                } else {
                    const statement = new Dfp.Statement(`LIMIT 100`);
                    this.service
                    .getLineItemsByStatement(statement, (err, results) => {
                        if(err) {
                            console.error('lineitems service error', err);
                            return err;
                        }
                        const uniqueLineItemTypes = results.rval.results.reduce((acc, curr) => {
                            if(!acc.find(v => curr.lineItemType === v)) {
                                acc.push(curr.lineItemType);
                            }
                            return acc;
                        }, []);
                        console.log('unique lineitem types', uniqueLineItemTypes);
                        return uniqueLineItemTypes
                    });
                }
            } catch(ex) {
                console.error("\n\n",'getLineItems::Error', `network::${this.network_code}`, "\n\n");
                return reject(new Error(`network::${this.network_code}::exception - ${ex.message}`));
            }
        });
    };
}

module.exports = LineItemService;
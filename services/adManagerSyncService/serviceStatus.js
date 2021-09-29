const Database = require('./db');
const uuid = require('uuid');

class ServiceStatus {
    constructor(dbConfig, serviceStatusPingDelayMs, serviceStatusDocExpiryDays, logger) {
        this.statusDocId = 'adms::status';
        this.dbConfig = dbConfig;
        this.serviceStatusPingDelayMs = serviceStatusPingDelayMs;
        this.docExpirySecs = serviceStatusDocExpiryDays * 24 * 3600;
        this.logger = logger;
        this.pingTimer = null;
        this.db = new Database(this.dbConfig);
    }

    async isSyncRunning() {
        try {
            const { bucketName } = this.dbConfig;
            const toleranceMs = 10000;
            const qs = `SELECT lastUpdated 
                FROM ${bucketName} 
                WHERE meta().id = '${this.statusDocId}' 
                AND status = 'RUNNING'
                AND lastUpdated >= CLOCK_MILLIS() - ${toleranceMs}
            `;
            const {results, resultCount = 0} = await this.db.query(qs);
            return !!resultCount;
        } catch(ex) {
            throw ex;
        }
    }
    
    async setServiceStatusStarted() {
        try {
            const existingDoc = await this.db.getDoc(this.statusDocId);
            if(existingDoc) {
                await this.db
                .updatePartial(this.statusDocId, {
                    status: 'RUNNING', 
                    startedOn: +new Date(), 
                    lastUpdated: +new Date(),
                    completedOn: null,
                    errors: {}
                });
            } else {
                await this.db
                .insertDoc(this.statusDocId, {
                    docType: 'AdManagerSyncServiceStatus', 
                    status: 'RUNNING', 
                    startedOn: +new Date(), 
                    lastUpdated: +new Date(),
                    errors: {}
                });
            }
            return true;
        } catch(ex) {
            this.logger.error({message: 'startServiceStatusPing', debugData: {ex}});
            throw ex;
        }
    }
    
    async updateServiceStatusStopped(totalErrors) {
        try {
            await this.db
            .updatePartial(this.statusDocId, {
                status: 'FINISHED', 
                completedOn: +new Date(), 
                lastUpdated: +new Date(),
                errors: totalErrors
            });
            return true;
        } catch(ex) {
            this.logger.error({message: 'updateServiceStatusStopped', debugData: {ex}});
            throw ex;
        }
    }
    
    async updateServiceStatusRunning() {
        try {
            await this.db.updatePartial(this.statusDocId, { lastUpdated: +new Date() });
            return true;
        } catch(ex) {
            this.logger.error({message: 'startServiceStatusPing', debugData: {ex}});
            // @TODO: unable to update service status, should kill the sync process
        }
    }

    async startServiceStatusPing() {
        if(this.pingTimer) {
            clearInterval(this.pingTimer);
        }
        await this.setServiceStatusStarted();
        this.pingTimer = setInterval(this.updateServiceStatusRunning.bind(this), this.serviceStatusPingDelayMs);
    };
    
    async stopServiceStatusPing(totalErrors) {
        if(this.pingTimer) {
            clearInterval(this.pingTimer);
            await this.updateServiceStatusStopped(totalErrors);
        }
        return true;
    };
}

module.exports = ServiceStatus;
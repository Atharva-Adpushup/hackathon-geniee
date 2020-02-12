const Database = require('./db');
const uuid = require('uuid');

class ServiceStatus {
    constructor(dbConfig, serviceStatusPingDelayMs, logger) {
        this.dbConfig = dbConfig;
        this.serviceStatusPingDelayMs = serviceStatusPingDelayMs;
        this.logger = logger;
        this.statusDocId = null;
        this.pingTimer = null;
        this.db = new Database(this.dbConfig);
    }

    async isSyncRunning() {
        try {
            const { bucketName } = this.dbConfig;
            const toleranceMs = 5000;
            const qs = `SELECT meta().id, lastUpdated 
                FROM ${bucketName} 
                WHERE meta().id LIKE 'adms::%' 
                AND status = 'RUNNING'
                AND lastUpdated >= CLOCK_MILLIS() - $toleranceMs
            `;
            const {results, resultCount = 0} = await this.db.query(qs, {toleranceMs});
            return !!resultCount;
        } catch(ex) {
            console.error('isSyncRunning::ERROR', ex);
            throw ex;
        }
    }
    
    async setServiceStatusStarted() {
        try {
            const docId = `adms::${uuid.v4()}`;
            await this.db
            .insertDoc(docId, {
                docType: 'AdManagerSyncServiceStatus', 
                status: 'RUNNING', 
                startedOn: +new Date(), 
                lastUpdated: +new Date()
            });
            return docId;
        } catch(ex) {
            this.logger.error({message: 'startServiceStatusPing', debugData: {ex}});
            throw ex;
        }
    }
    
    async updateServiceStatusStopped() {
        try {
            await this.db
            .updatePartial(this.statusDocId, {
                status: 'FINISHED', 
                completedOn: +new Date(), 
                lastUpdated: +new Date()
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
        this.statusDocId = await this.setServiceStatusStarted();
        this.pingTimer = setInterval(this.updateServiceStatusRunning.bind(this), this.serviceStatusPingDelayMs);
    };
    
    async stopServiceStatusPing() {
        if(this.pingTimer) {
            clearInterval(this.pingTimer);
        }
        if(this.statusDocId) {
            return await this.updateServiceStatusStopped();
        }
        return true;
    };
}

module.exports = ServiceStatus;
const couchbase = require('couchbase');
const { N1qlQuery } = couchbase;

class Database {
    constructor({host, port, username, password, bucketName}) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.bucketName = bucketName;
        this.cluster = null;
        this.bucket = null;
    }

    connect() {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.cluster) {
                    this.cluster = new couchbase.Cluster(`couchbase://${this.host}?detailed_errcodes=1`);
                    this.cluster.authenticate(this.username, this.password);
                }
                if(!this.bucket) {
                    this.bucket = this.cluster.openBucket(this.bucketName, err => {
                        return reject(err);
                    });
                    //this.bucket.operationTimeout = 120 * 1000
                }
                return resolve(true);
            } catch(ex) {
                console.error('ERROR while connecting', ex);
                return reject(ex);
            }
        });
    }

    query(queryString, params) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                const query = N1qlQuery.fromString(queryString);
                this.bucket.query(query, params, (err, ...data) => {
                    if(err) return reject(err);
                    const results = data[0];
                    const {status, metrics: {resultCount}} = data[1];
                    return resolve({
                        results,
                        status,
                        resultCount
                    });
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    };

    getDoc(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                this.bucket.get(id, (err, res) => {
                    if(err) return resolve(false);
                    return resolve(res.value);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }

    insertDoc(id, data, expirySecs = 0) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                const options = {};
                if(expirySecs) {
                    options.expiry = expirySecs;
                }
                this.bucket.insert(id, data, options, (err) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }

    upsertDoc(id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                this.bucket.upsert(id, data, (err) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }

    updatePartial(id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                let mutateDoc = this.bucket.mutateIn(id);
                Object.keys(data).forEach(docKey => {
                    mutateDoc = mutateDoc.upsert(docKey, data[docKey]);
                });
                mutateDoc.execute((err) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }

    arrayConcat(id, path, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                this.bucket
                .mutateIn(id)
                .arrayAppendAll(path, data)
                .execute((err) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }

    replaceKey(id, path, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                this.bucket
                .mutateIn(id)
                .replace(path, data)
                .execute((err) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            } catch(ex) {
                return reject(ex);
            }
        });
    }
}

module.exports = Database;
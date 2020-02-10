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
                    this.cluster = new couchbase.Cluster(`${this.host}:${this.port}?detailed_errcodes=1`);
                    this.cluster.authenticate(this.username, this.password);
                }
                if(!this.bucket) {
                    this.bucket = this.cluster.openBucket(this.bucketName, err => {
                        return reject(err);
                    });
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

    insertDoc(id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!this.bucket) {
                    await this.connect();
                }
                this.bucket.insert(id, data, (err) => {
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
}

module.exports = Database;
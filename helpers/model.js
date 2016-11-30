var consts = require('../configs/commonConsts'),
	priorities = consts.enums.priorities,
	_ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	couchbase = require('../helpers/couchBaseService'),
	adpushup = require('../helpers/adpushupEvent'),
	Class = require('./class'),
	model = Class.extend(function () {
		this.data = {};
		this.keys = [];
		this.defaults = {};
		this.ignore = [];
		this.casValue = null;
		this.merging = false;
		this.clientKeys = null;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT; // If two objects have same value of mergingParamter, which should be given priority.
		this.mergingKey = null;
		this.mergeExtraKeys = false;
		this.classMap = {};
		this.rootMergingObjectKeys = ['apConfigs'];

		this.constructor = function (data, force) {
			if (data) {
				this.setAll(data, force);
			}
		};

		function getJSON(keys, func) {
			var json = {};
			_.forEach(keys, function (key) {
				if (Array.isArray(this.get(key)) && this.get(key)[0] instanceof model) {
					json[key] = _.map(this.get(key), function (otherObject) {
						return otherObject[func].call(otherObject);
					});
				} else {
					json[key] = this.get(key);
				}
			}.bind(this));
			return json;
		}

		this.toJSON = function () {
			return getJSON.call(this, Object.keys(this.data), 'toJSON');
		};

		this.toClientJSON = function () {
			var keys = this.clientKeys ? this.clientKeys : Object.keys(this.data);
			return getJSON.call(this, keys, 'toClientJSON');
		};

		this.setDefaults = function () {
			Object.keys(this.defaults).forEach(function (key) {
				if (typeof this.get(key) === 'undefined' || this.get(key) === null) {
					// force defaults as some time defaults are not in keys;
					this.set(key, this.defaults[key], true);
				}
			}.bind(this));
		};

		this.save = function () {
			var self = this, name = null;
			if (!this.data.dateCreated) {
				this.data.dateCreated = +moment().utc();
			}
			this.data.dateModified = +moment().utc();
			if (this.key.indexOf('site::') === 0) {
				name = 'site';
			} else if (this.key.indexOf('chnl::') === 0) {
				name = 'channel';
			} else if (this.key.indexOf('user::') === 0) {
				name = 'user';
			}

			return couchbase.connectToAppBucket().then(function (appBucket) {
				return !self.casValue ? appBucket.insertAsync(self.key, self.toJSON(), {}).then(function (obj) {
					self.casValue = obj.cas;
					if (name) {
						adpushup.emit(name + 'Saved', self);
					}
					return self;
				}) : appBucket.replaceAsync(self.key, self.toJSON(), {}).then(function (obj) {
					self.casValue = obj.cas;
					if (name) {
						adpushup.emit(name + 'Saved', self);
					}
					return self;
				});
			});
		};


		this.get = function (key) {
			return this.data[key];
		};

		this.extendObject = function(existingObj, newObj) {
			return extend(true, {}, existingObj, newObj);
		};

		this.mergeRootObject = function(key, newData) {
			var existingData = this.get(key);

			if (!existingData) { return newData; }

			return this.extendObject(existingData, newData);
		};

		/**
		 * OBJECTIVE: Merge nested objects that follows a particular schema (see /Applications/MAMP/htdocs/GenieeAdPushup/models/subClasses/channel/variation.js for schema)
		 * PURPOSE: An implementation was required to merge nested objects that follow a schema
		 * IMPLEMENTATION: Following is the algorithm procedure:
		 * 1) - Intersect root object keys of existing and new data
		 * 2) - Set final computed object base as a deep extend of new data
		 * 3) - Iterate over intersected keys and get existing and new object based on iterator key
		 * 4) - Union existing and newData object keys
		 * 5) - Iterate over these keys, perform 3 checks and set computed object based on them:
		 * 	    1) Deep Extend existing and new object if there is no schema
		 * 		   and iterator key is in 'rootMergingObjectKeys' array
		 *      2) Recursively call this method if key is in schema classMap
		 *      3) If key is in existing data but not present in new data,
		 *         set computed object property and its value as existing data property value
		 * 6) - Return computed merged nested object
		 * @param {existingData} server side data (saved in database)
		 * @param {newData} client side json (product's client side, background service etc.)
		 * @param {schema} a JSON structure that defines model
		 * @returns {object} merged nested object
		 */
		this.mergeObjectsRecursively = function(existingData, newData, schema) {
			var intersectedKeys = _.intersection(Object.keys(newData), Object.keys(existingData)),
				computedData = extend(true, {}, newData), self = this;

			_.forEach(intersectedKeys, function(intersectedKey) {
				var existingDataObj = existingData[intersectedKey],
					newDataObj = newData[intersectedKey],
					allIteratableKeys = _.union(Object.keys(existingDataObj), Object.keys(newDataObj));

				_.forEach(allIteratableKeys, function(propertyKey) {
					if (!schema && (self.rootMergingObjectKeys.indexOf(propertyKey) > -1)) {
						computedData[intersectedKey][propertyKey] = self.extendObject(existingDataObj[propertyKey], newDataObj[propertyKey]);
					} else if (schema && schema.classMap && schema.classMap[propertyKey]) {
						computedData[intersectedKey][propertyKey] = self.mergeObjectsRecursively(existingDataObj[propertyKey], newDataObj[propertyKey], schema.classMap[propertyKey]);
					} else if (existingDataObj[propertyKey] && !newDataObj[propertyKey]) {
						computedData[intersectedKey][propertyKey] = existingDataObj[propertyKey];
					}
				});
			});

			return computedData;
		}


		/**
		 * OBJECTIVE: Merge nested objects that follows a particular schema (see /Applications/MAMP/htdocs/GenieeAdPushup/models/subClasses/channel/variation.js for schema)
		 * IMPLEMENTATION: Merge nested objects' existing (database) and new (client) data by recursion
		 * @param {key} model key name
		 * @param {newData} client side json (product's client side, background service etc.)
		 * @param {schema} a JSON structure that defines model
		 * @returns {object} merged nested object
		 */
		this.mergeNestedObjects = function(key, newData, schema) {
			var existingData = this.get(key),
				computedData;

			if (!existingData) { return newData; }

			computedData = this.mergeObjectsRecursively(existingData, newData, schema);

			return extend(true, computedData, newData);
		};

		this.mergeArrayModel = function (existingArr, newArr) {
			var secondArr = (existingArr[0].mergingPriority === priorities.NEW_OBJECT) ? existingArr : newArr,
				firstArr = (existingArr[0].mergingPriority === priorities.NEW_OBJECT) ? newArr : existingArr;

			// If object doesn't have merging enabled
			// simply return override with newArr
			if (secondArr && secondArr.length > 0) {
				if (secondArr[0].merging === false) {
					return firstArr;
				}
			} else {
				return firstArr;
			}

			_.forEach(secondArr, function (second) {// loop over second array
				var flag = false;
				_.forEach(firstArr, function (first) {// loop over first array
					// if merging keys matched, e.g section md5 for both database and new array from editor matches
					if (second.get(first.mergingKey) === first.get(first.mergingKey)) {
						// if there are keys from server object to merge into new object,
						// like impression and clicks added by the java demons then merge add those in new object
						if (first.mergeExtraKeys) {
							_.forEach(_.difference(Object.keys(second.data), first.keys), function (key) {// find difference between allowed keys and keys of existing data
								first.set(key, second.get(key), true);// force fully set these keys as they might not be declared in allowed "keys" of an object
							});
						}
						flag = true;
						return false;
					}
				});
				// if current key was not matched inside the first array of object then add that object to dirst array,
				// but do this only if "serverKeysToMerge" is null. This is used where we want to keep objects from both server and client intact.
				// like in case of site "ads" we will not touch ads which are on server and will keep adding new one in the array which comes from server.
				if (!flag && secondArr[0].mergingPriority === priorities.EXISTING_OBJECT) {
					firstArr.push(second);
				}
			});
			return firstArr;
		};

		this.set = function (key, val, forceInsert) {
			var existingData = this.get(key),
				keys = val ? Object.keys(val) : [],
				isNoForceInsertion = (this.keys.length > 0 && !forceInsert),
				isValidKey = (this.keys.indexOf(key) !== -1 && (this.ignore.indexOf(key) === -1)),
				isKeyAnArrayModel = (Array.isArray(existingData) && existingData[0] && (existingData[0] instanceof model)),
				isKeyARootMergingObject = (existingData && (typeof(existingData) === 'object') && (this.rootMergingObjectKeys.indexOf(key) > -1));

			if (isNoForceInsertion) {
				if (isValidKey) {
					if (isKeyAnArrayModel) {
						this.data[key] = this.mergeArrayModel(existingData, Array.isArray(val) ? val : [val]);
					} else if (isKeyARootMergingObject) {
						this.data[key] = this.extendObject(existingData, val);
					} else {
						this.data[key] = val;
					}
				}
			} else {
				this.data[key] = val;
			}
		};

		this.loadSubClass = function (SubClass, newVals, force) {
			return _.mapValues(newVals, function (newVal) {
				return new SubClass(newVal, force);
			});
		};

		this.setAll = function (json, force) {
			var self = this;

			Object.keys(json).forEach(function (key) {
				if (self.classMap[key]) {
					self.set(key, self.mergeNestedObjects(key, json[key], self.classMap[key]), force);
				} else if (self.rootMergingObjectKeys.indexOf(key) > -1) {
					self.set(key, self.mergeRootObject(key, json[key]), force);
				} else {
					self.set(key, json[key], force);
				}
			}.bind(this));

			this.setDefaults();
		};

		this.delete = function (key) {
			delete this.data[key];
		};
	});
module.exports = model;

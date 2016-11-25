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

		this.merge = function (existingArr, newArr) {
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
			var existingData = this.get(key), keys = val ? Object.keys(val) : [];
			// if we use set function directly and existing array is empty and key is in classmap then convert value into
			// if (this.classMap[key] && ((Array.isArray(val) && val.length && !(val[0] instanceof model)) || (!Array.isArray(val) && val[keys[0]] && !(val[keys[0]] instanceof model)))) {
			// 	val = this.loadSubClass(this.classMap[key], Array.isArray(val) ? val : [val], forceInsert);
			// }

			if (this.keys.length > 0 && !forceInsert) {
				if (this.keys.indexOf(key) !== -1 && this.ignore.indexOf(key) === -1) {
					if (Array.isArray(existingData) && existingData[0] && existingData[0] instanceof model) {
						this.data[key] = this.merge(existingData, Array.isArray(val) ? val : [val]);
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

		this.mergeObjects = function(key, newData, schema) {
			var existingData = this.get(key),
				computedData = extend(true, {}, newData),
				intersectedVariationKeys, finalData;

			if (!existingData) { return newData; }

			intersectedVariationKeys = _.intersection(Object.keys(newData), Object.keys(existingData));
			computedData = _.pick(computedData, intersectedVariationKeys);

			_.forEach(computedData, function(variationObj, variationKey) {
				var existingDataVariationObj = existingData[variationKey],
					newDataVariationObj = computedData[variationKey],
					intersectedSectionsKeys;

				if (existingData.hasOwnProperty(variationKey) && existingDataVariationObj) {
					intersectedSectionsKeys = _.intersection(Object.keys(newDataVariationObj.sections), Object.keys(existingDataVariationObj.sections));
					computedData[variationKey].sections = _.pick(newDataVariationObj.sections, intersectedSectionsKeys);

					_.forEach(computedData[variationKey].sections, function(sectionObj, sectionKey) {
						var existingDataSectionObj = existingDataVariationObj.sections[sectionKey],
							newDataSectionObj = newDataVariationObj.sections[sectionKey],
							intersectedAdsKeys, computedAds = {};

						if (existingDataVariationObj.sections.hasOwnProperty(sectionKey) && existingDataSectionObj) {
							intersectedAdsKeys = _.intersection(Object.keys(newDataSectionObj.ads), Object.keys(existingDataSectionObj.ads));
							_.forEach(intersectedAdsKeys, function(adKey) {
								computedAds[adKey] = extend(true, existingDataSectionObj.ads[adKey], newDataSectionObj.ads[adKey]);
							});

							computedData[variationKey].sections[sectionKey].ads = computedAds;
						}
					});
				}
			});

			finalData = extend(true, computedData, newData);
			return finalData;
		};

		this.setAll = function (json, force) {
			Object.keys(json).forEach(function (key) {
				if (this.classMap[key]) {
					this.set(key, this.mergeObjects(key, json[key], this.classMap[key]), force);
				} else {
					this.set(key, json[key], force);
				}
			}.bind(this));

			this.setDefaults();
		};

		this.delete = function (key) {
			delete this.data[key];
		};
	});
module.exports = model;

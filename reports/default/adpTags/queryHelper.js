var Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ schema } = require('./constants'),
	queryHelper = () => {
		var common = {},
			firstQuery = {},
			secondQuery = {},
			__resetVariables = () => {
				common = {
					query: 'SELECT ',
					fields: {
						forUser: [],
						forOn: [],
						commonOn: []
					},
					level: {
						section: false,
						variation: false,
						pagegroup: false,
						site: true
					},
					where: [],
					groupBy: false,
					orderBy: false
				};
				firstQuery = {
					select: 'SELECT ',
					from: ` FROM ${schema.firstQuery.tables.apexSiteReport.table} ${
						schema.firstQuery.tables.apexSiteReport.alias
					} `,
					where: ' WHERE ',
					groupBy: ' GROUP BY ',
					orderBy: ' ORDER BY ',
					aggregate: [],
					nonAggregate: []
				};
				secondQuery = {
					select: 'SELECT ',
					from: ` FROM ${schema.secondQuery.tables.adpTagReport.table} ${
						schema.secondQuery.tables.adpTagReport.alias
					} `,
					where: ' WHERE ',
					groupBy: ' GROUP BY ',
					orderBy: ' ORDER BY ',
					aggregate: [],
					nonAggregate: [],
					extra: []
				};
				return Promise.resolve();
			},
			__reduceArrayToString = (array, defaultAlias, fetchAlias) => {
				let alias,
					response = '';
				_.forEach(array, ele => {
					alias = fetchAlias ? __getAlias(ele) || defaultAlias : defaultAlias;
					response += ` ${alias}.${ele}, `;
				});
				return `${response.slice(0, -2)} `;
			},
			__reduceArrayToStringAggregate = (array, alias) => {
				let response = ' ';
				_.forEach(array, (field, key) => {
					response += ` SUM(${alias}.${field}) AS ${field}, `;
				});
				return response.slice(0, -2);
			},
			__getAlias = (field, flag) => {
				// flag true for common
				let alias = false;
				switch (field) {
					case 'name':
					case 'axpgid':
						alias = schema.common.tables.pagegroup.alias;
						break;
					case 'variation_id':
					case 'axvid':
						alias = schema.common.tables.variation.alias;
						break;
					case 'section_md5':
					case 'axsid':
						alias = schema.common.tables.section.alias;
						break;
					case 'device_type':
						alias = false;
						// alias = schema.firstQuery.tables.apexSiteReport.alias;
						break;
					case 'display_name':
						alias = flag ? schema.secondQuery.alias : schema.secondQuery.tables.network.alias;
						break;
					case 'ntwid':
						alias = flag ? schema.secondQuery.alias : schema.secondQuery.tables.adpTagReport.alias;
						break;
					case 'platform':
						alias = flag ? schema.secondQuery.alias : schema.secondQuery.tables.adpTagReport.alias;
						break;
				}
				return alias;
			},
			__groupBy = () => {
				firstQuery.groupBy += __reduceArrayToString(
					firstQuery.nonAggregate,
					schema.firstQuery.tables.apexSiteReport.alias,
					true
				);
				secondQuery.groupBy += __reduceArrayToString(
					secondQuery.nonAggregate,
					schema.secondQuery.tables.adpTagReport.alias,
					true
				);

				if (common.level.section || common.level.variation || common.level.pagegroup) {
					let index = common.fields.forOn.indexOf('axsid');
					let slicedArray = common.fields.forOn.concat([]);
					// for On
					if (index != -1) {
						slicedArray.splice(index, 1);
						firstQuery.groupBy += ` ,${schema.firstQuery.tables.sectionReport.alias}.axsid `;
					}
					firstQuery.groupBy += `,${__reduceArrayToString(
						slicedArray,
						schema.firstQuery.tables.apexSiteReport.alias
					)}`;
					secondQuery.groupBy += `,${__reduceArrayToString(
						common.fields.forOn,
						schema.secondQuery.tables.adpTagReport.alias
					)}`;

					// for sending to user
					_.forEach(common.fields.forUser, (value, key) => {
						let currentAlias = __getAlias(value);
						firstQuery.groupBy += ` ,${currentAlias}.${value} `;
						secondQuery.groupBy += ` ,${currentAlias}.${value} `;
					});
				}

				return Promise.resolve();
			},
			__checkParamsPresent = () => {
				if (
					!firstQuery.aggregate.length &&
					!firstQuery.nonAggregate.length &&
					!secondQuery.aggregate.length &&
					!secondQuery.nonAggregate.length
				) {
					return Promise.reject('Invalid parameters');
				}
				return Promise.resolve();
			},
			__generateMainSelect = () => {
				let response = ' ';

				firstQuery.aggregate.length
					? (response += __reduceArrayToStringAggregate(firstQuery.aggregate, schema.firstQuery.alias))
					: null;
				firstQuery.nonAggregate.length
					? (response += `, ${__reduceArrayToString(firstQuery.nonAggregate, schema.firstQuery.alias)}`)
					: null;
				secondQuery.aggregate.length
					? (response += `, ${__reduceArrayToStringAggregate(
							secondQuery.aggregate,
							schema.secondQuery.alias
						)}`)
					: null;
				if (secondQuery.nonAggregate) {
					let disjointFields = _.difference(secondQuery.nonAggregate, firstQuery.nonAggregate);
					disjointFields.length
						? (response += `, ${__reduceArrayToString(disjointFields, schema.secondQuery.alias)}`)
						: null;
				}

				common.fields.forUser.length
					? (response += `, ${__reduceArrayToString(common.fields.forUser, schema.firstQuery.alias)}`)
					: null;
				return response;
			},
			__generateDate = () => `report_date BETWEEN @__from__ AND @__to__ `,
			__setLevel = data => {
				let index = 0;
				if (data.hasOwnProperty('section_md5') || (_.isArray(data) && data.indexOf('section_md5') != -1)) {
					common.level.section = true;
					index = 3;
				} else if (
					data.hasOwnProperty('variation_id') ||
					(_.isArray(data) && data.indexOf('variation_id') != -1)
				) {
					common.level.variation = true;
					index = 2;
				} else if (data.hasOwnProperty('name') || (_.isArray(data) && data.indexOf('name') != -1)) {
					common.level.pagegroup = true;
					index = 1;
				}
				index ? (common.fields.forUser = schema.common.fields.forUser.slice(0, index)) : null;
				index ? (common.fields.forOn = schema.common.fields.forOn.slice(0, index)) : null;
				return Promise.resolve(true);
			},
			__getLevel = () => {
				let keys = Object.keys(common.level),
					level = 'site';
				keys.some((value, index) => {
					if (common.level[value]) {
						level = value;
						return true;
					}
				});
				return level;
			},
			__completeRemainingSelect = () => {
				if (common.level.section || common.level.variation || common.level.pagegroup) {
					let index = common.fields.forOn.indexOf('axsid');
					let slicedArray = common.fields.forOn.concat([]);
					// for On
					if (index != -1) {
						slicedArray.splice(index, 1);
						firstQuery.select += ` ${schema.firstQuery.tables.sectionReport.alias}.axsid, `;
					}
					firstQuery.select += __reduceArrayToString(
						slicedArray,
						schema.firstQuery.tables.apexSiteReport.alias
					);
					secondQuery.select += __reduceArrayToString(
						common.fields.forOn,
						schema.secondQuery.tables.adpTagReport.alias
					);

					// for sending to user
					_.forEach(common.fields.forUser, (value, key) => {
						let currentAlias = __getAlias(value);
						firstQuery.select += ` ,${currentAlias}.${value} `;
						secondQuery.select += ` ,${currentAlias}.${value} `;
					});
				} else {
					firstQuery.select = firstQuery.select.slice(0, -2);
					secondQuery.select = secondQuery.select.slice(0, -2);
				}
			},
			__setCommonColumnsCondition = () => {
				let level = __getLevel();
				if (level == 'section') {
					firstQuery.where += ` AND ${schema.firstQuery.tables.apexSiteReport.alias}.axhsrid=${
						schema.firstQuery.tables.sectionReport.alias
					}.axhsrid `;
				}
				firstQuery.where += __generateCommonColumnsCondition(schema.firstQuery.tables.apexSiteReport.alias);
				secondQuery.where += __generateCommonColumnsCondition(schema.secondQuery.tables.adpTagReport.alias);
				return true;
			},
			__generateCommonColumnsCondition = (firstAlias, secondAlias) => {
				let query = ' ';
				if (common.fields.forOn.length) {
					_.forEach(common.fields.forOn, field => {
						let alias = secondAlias || __getAlias(field);
						query += ` AND ${firstAlias}.${field}=${alias}.${field} `;
					});
				}
				return query;
			},
			__setLevelFromGroupBy = data => {
				return !_.isArray(data) || !data.length ? Promise.resolve(false) : __setLevel(data);
			},
			__whereInParamsProcessing = (key, value) => {
				let lengthOfValue = value.length;
				let condition = `.${key} IN (`;
				for (i = 0; i < lengthOfValue; i++) {
					let name = `@__${key}_${i}__`;
					condition += `${name},`;
					common.where.push({
						name: name.substr(1),
						type: schema.where[key].type,
						value: value[i]
					});
				}
				condition = condition.slice(0, -1);
				condition += ')';
				return condition;
			},
			__tableSpecific = field => {
				// to set specific table conditions in case of joins
				switch (field) {
					case 'display_name':
						secondQuery.from += ` ,${schema.secondQuery.tables.network.table} ${
							schema.secondQuery.tables.network.alias
						}`;
						secondQuery.where += ` AND ${schema.secondQuery.tables.adpTagReport.alias}.ntwid=${
							schema.secondQuery.tables.network.alias
						}.ntwid`;
				}
			},
			__generateON = () => {
				let response = ' ';
				if (common.fields.commonOn.length) {
					_.forEach(common.fields.commonOn, (value, key) => {
						response += `${schema.firstQuery.alias}.${value}=${schema.secondQuery.alias}.${value} AND `;
					});
					return response.slice(0, -4);
				}
				return response;
			};
		return {
			select: (data, flag) => {
				let alias =
					common.level.section || flag
						? schema.firstQuery.tables.sectionReport.alias
						: schema.firstQuery.tables.apexSiteReport.alias;

				_.forEach(data, field => {
					let currentAliasForNonAggregate = __getAlias(field);

					// First Query
					if (schema.firstQuery.nonAggregate.indexOf(field) != -1) {
						firstQuery.select += ` ${
							currentAliasForNonAggregate
								? currentAliasForNonAggregate
								: schema.firstQuery.tables.apexSiteReport.alias
						}.${field}, `;
						firstQuery.nonAggregate.push(field);
					} else if (schema.firstQuery.aggregate.indexOf(field) != -1) {
						firstQuery.select += ` SUM(${alias}.${field}) AS ${field}, `;
						firstQuery.aggregate.push(field);
					}

					// Second Query
					if (schema.secondQuery.nonAggregate.indexOf(field) != -1) {
						secondQuery.select += ` ${
							currentAliasForNonAggregate
								? currentAliasForNonAggregate
								: schema.secondQuery.tables.adpTagReport.alias
						}.${field}, `;
						secondQuery.nonAggregate.push(field);
					} else if (schema.secondQuery.aggregate.indexOf(field) != -1) {
						secondQuery.select += ` SUM(${schema.secondQuery.tables.adpTagReport.alias}.${field}) AS ${
							field
						}, `;
						secondQuery.aggregate.push(field);
					}

					if (schema.common.fields.commonOn.indexOf(field) != -1) {
						common.fields.commonOn.push(field);
					}
					__tableSpecific(field);
				});
				return true;
			},
			from: () => {
				let index = false;
				if (common.level.section) {
					firstQuery.from += `, ${schema.firstQuery.tables.sectionReport.table} ${
						schema.firstQuery.tables.sectionReport.alias
					} `;
					index = 3;
				} else if (common.level.variation) {
					index = 2;
				} else if (common.level.pagegroup) {
					index = 1;
				}
				if (index) {
					let keysRequired = Object.keys(schema.common.tables).slice(0, index);
					let response = _.map(
						keysRequired,
						(value, key) => `${schema.common.tables[value].table} ${schema.common.tables[value].alias}`
					).join(', ');
					firstQuery.from += ` ,${response} `;
					secondQuery.from += ` ,${response} `;
				}
				return Promise.resolve();
			},
			where: data => {
				return __resetVariables()
					.then(() => {
						let from = data.from
							? moment(data.from).format('YYYY-MM-DD')
							: moment()
									.subtract(7, 'days')
									.format('YYYY-MM-DD');
						let to = data.to
							? moment(data.to).format('YYYY-MM-DD')
							: moment()
									.subtract(1, 'days')
									.format('YYYY-MM-DD');

						firstQuery.where += ` ${schema.firstQuery.tables.apexSiteReport.alias}.${__generateDate()} `;
						secondQuery.where += ` ${schema.secondQuery.tables.adpTagReport.alias}.${__generateDate()} `;

						common.where.push(
							Object.assign(schema.where.from, {
								value: from
							}),
							Object.assign(schema.where.to, {
								value: to
							})
						);
						delete data.from;
						delete data.to;
						return __setLevel(data);
					})
					.then(() => {
						function addToFirstWhere(alias, condition) {
							firstQuery.where += ` AND ${alias ? alias : schema.firstQuery.tables.apexSiteReport.alias}${
								condition
							} `;
						}

						function addToSecondWhere(alias, condition) {
							secondQuery.where += ` AND ${alias ? alias : schema.secondQuery.tables.adpTagReport.alias}${
								condition
							} `;
						}

						_.forEach(data, (value, key) => {
							let alias = __getAlias(key);
							let condition = `.${key}=@__${key}__`;
							if (_.isArray(value)) {
								condition = __whereInParamsProcessing(key, value);
							} else {
								common.where.push(
									Object.assign(schema.where[key], {
										value: value
									})
								);
							}
							if (
								schema.firstQuery.where.indexOf(key) !== -1 ||
								schema.secondQuery.where.indexOf(key) !== -1
							) {
								schema.firstQuery.where.indexOf(key) !== -1
									? addToFirstWhere(alias, condition)
									: addToSecondWhere(alias, condition);
							} else {
								addToFirstWhere(alias, condition);
								addToSecondWhere(alias, condition);
							}
						});
						return true;
					});
			},
			groupBy: data => {
				return __setLevelFromGroupBy(data)
					.then(response => {
						let uniqueGroupByFields = _.difference(data, schema.common.fields.groupBy),
							secondQueryUniqueNonAggregate = _.difference(
								secondQuery.nonAggregate,
								firstQuery.nonAggregate
							);
						common.groupBy = common.fields.forUser.length
							? ` GROUP BY ${__reduceArrayToString(common.fields.forUser, schema.firstQuery.alias)} `
							: ' GROUP BY ';
						firstQuery.nonAggregate.length
							? (common.groupBy += ` ${
									common.fields.forUser.length ? ' , ' : ' '
								} ${__reduceArrayToString(firstQuery.nonAggregate, schema.firstQuery.alias)}`)
							: null;
						secondQueryUniqueNonAggregate.length
							? _.forEach(secondQueryUniqueNonAggregate, (value, key) => {
									let alias = __getAlias(value, true);
									common.groupBy += ` , ${alias}.${value}`;
								})
							: null;
						uniqueGroupByFields.length
							? _.forEach(uniqueGroupByFields, (value, key) => {
									let alias = __getAlias(value, true);
									common.groupBy += ` , ${alias}.${value}`;
								})
							: null;
						return __groupBy();
					})
					.then(response => __completeRemainingSelect())
					.then(response => __setCommonColumnsCondition());
			},
			orderBy: data => {
				if (!_.isArray(data) || !data.length) {
					return Promise.resolve();
				}
				common.orderBy = ` ORDER BY ${__reduceArrayToString(data, schema.firstQuery.alias)} `;
				return Promise.resolve();
			},
			generateCompleteQuery: () => {
				return __checkParamsPresent().then(() => {
					// SELECT
					common.query += __generateMainSelect();

					// First Query
					common.query += ' FROM ( ';
					common.query += firstQuery.select;
					common.query += firstQuery.from;
					common.query += common.level.section
						? firstQuery.where.replace('c.axsid=g.axsid', 'd.axsid=g.axsid')
						: firstQuery.where;
					common.query += firstQuery.groupBy;
					common.query += ` ) ${schema.firstQuery.alias} `;

					// Second Query
					common.query += ' INNER JOIN ( ';
					common.query += secondQuery.select;
					common.query += secondQuery.from;
					common.query += secondQuery.where;
					common.query += secondQuery.groupBy;
					common.query += ` ) ${schema.secondQuery.alias} `;

					// ON
					common.query += `ON ${__generateON()}`;

					common.query += __generateCommonColumnsCondition(schema.firstQuery.alias, schema.secondQuery.alias);

					common.query += common.groupBy ? common.groupBy : ' ';
					common.query += common.orderBy ? common.orderBy : ' ';

					return {
						query: common.query,
						inputParameters: common.where.concat([])
					};
				});
			}
		};
	};

module.exports = queryHelper;

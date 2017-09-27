var Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ schema } = require('./constants'),
	common = {};
(firstQuery = {}),
	(secondQuery = {}),
	(queryHelper = {
		__resetVariables: () => {
			common = {
				query: 'SELECT ',
				fields: {
					forUser: [],
					forOn: []
				},
				level: {
					section: false,
					variation: false,
					pagegroup: false,
					site: true
				},
				where: [],
				groupBy: false
			};
			firstQuery = {
				select: 'SELECT ',
				from: ` FROM ${schema.firstQuery.tables.apexSiteReport.table} ${schema.firstQuery.tables.apexSiteReport
					.alias} `,
				where: ' WHERE ',
				groupBy: ' GROUP BY ',
				orderBy: ' ORDER BY ',
				aggregate: [],
				nonAggregate: []
			};
			secondQuery = {
				select: 'SELECT ',
				from: ` FROM ${schema.secondQuery.tables.adpTagReport.table} ${schema.secondQuery.tables.adpTagReport
					.alias} `,
				where: ' WHERE ',
				groupBy: ' GROUP BY ',
				orderBy: ' ORDER BY ',
				aggregate: [],
				nonAggregate: []
			};
			return Promise.resolve();
		},
		__reduceArrayToString: (array, alias) => {
			return (
				` ${alias}.` +
				_.reduce(
					array,
					(accumulator, value, key) =>
						value == undefined ? `${accumulator} ` : `${accumulator}, ${alias}.${value} `
				)
			);
		},
		__getAlias: field => {
			let alias = false;
			if (field == 'name') {
				alias = schema.common.tables.pagegroup.alias;
			} else if (field == 'variation_id') {
				alias = schema.common.tables.variation.alias;
			} else if (field == 'section_md5') {
				alias = schema.common.tables.section.alias;
			}
			return alias;
		},
		__groupBy: () => {
			firstQuery.groupBy += queryHelper.__reduceArrayToString(
				firstQuery.nonAggregate,
				schema.firstQuery.tables.apexSiteReport.alias
			);
			secondQuery.groupBy += queryHelper.__reduceArrayToString(
				secondQuery.nonAggregate,
				schema.secondQuery.tables.adpTagReport.alias
			);

			if (common.level.section || common.level.variation || common.level.pagegroup) {
				let index = common.fields.forOn.indexOf('axsid');
				let slicedArray = common.fields.forOn.concat([]);
				// for On
				if (index != -1) {
					slicedArray.splice(index, 1);
					firstQuery.groupBy += ` ,${schema.firstQuery.tables.sectionReport.alias}.axsid, `;
				}
				firstQuery.groupBy += `, ${queryHelper.__reduceArrayToString(
					slicedArray,
					schema.firstQuery.tables.apexSiteReport.alias
				)}`;
				secondQuery.groupBy += `, ${queryHelper.__reduceArrayToString(
					common.fields.forOn,
					schema.secondQuery.tables.adpTagReport.alias
				)}`;

				// for sending to user
				_.forEach(common.fields.forUser, (value, key) => {
					let currentAlias = queryHelper.__getAlias(value);
					firstQuery.groupBy += ` ,${currentAlias}.${value} `;
					secondQuery.groupBy += ` ,${currentAlias}.${value} `;
				});
			}

			return Promise.resolve();
		},
		__checkParamsPresent: () => {
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
		__generateMainSelect: () => {
			let response = ' ';

			firstQuery.aggregate.length
				? (response += queryHelper.__reduceArrayToString(firstQuery.aggregate, schema.firstQuery.alias))
				: null;
			firstQuery.nonAggregate.length
				? (response += `, ${queryHelper.__reduceArrayToString(
						firstQuery.nonAggregate,
						schema.firstQuery.alias
					)}`)
				: null;
			secondQuery.aggregate.length
				? (response += `, ${queryHelper.__reduceArrayToString(
						secondQuery.aggregate,
						schema.secondQuery.alias
					)}`)
				: null;
			if (secondQuery.nonAggregate) {
				let disjointFields = _.difference(secondQuery.nonAggregate, firstQuery.nonAggregate);
				disjointFields.length
					? (response += `, ${queryHelper.__reduceArrayToString(disjointFields, schema.secondQuery.alias)}`)
					: null;
			}

			common.fields.forUser.length
				? (response += `, ${queryHelper.__reduceArrayToString(common.fields.forUser, schema.firstQuery.alias)}`)
				: null;
			return response;
		},
		__generateDate: () => `report_date BETWEEN @__from__ AND @__to__ `,
		__setLevel: data => {
			let index = 0;
			if (data.hasOwnProperty('section_md5')) {
				common.level.section = true;
				index = 3;
			} else if (data.hasOwnProperty('variation_id')) {
				common.level.variation = true;
				index = 2;
			} else if (data.hasOwnProperty('name')) {
				common.level.pagegroup = true;
				index = 1;
			}
			index ? (common.fields.forUser = schema.common.fields.forUser.slice(0, index)) : null;
			index ? (common.fields.forOn = schema.common.fields.forOn.slice(0, index)) : null;
			return Promise.resolve();
		},
		select: data => {
			let alias = common.level.section
				? schema.firstQuery.tables.sectionReport.alias
				: schema.firstQuery.tables.apexSiteReport.alias;
			_.forEach(data, field => {
				if (schema.firstQuery.nonAggregate.indexOf(field) != -1) {
					firstQuery.select += ` ${schema.firstQuery.tables.apexSiteReport.alias}.${field}, `;
					firstQuery.nonAggregate.push(field);
				} else if (schema.firstQuery.aggregate.indexOf(field) != -1) {
					firstQuery.select += ` SUM(${alias}.${field}) AS ${field}, `;
					firstQuery.aggregate.push(field);
				}

				if (schema.secondQuery.nonAggregate.indexOf(field) != -1) {
					secondQuery.select += ` ${schema.secondQuery.tables.adpTagReport.alias}.${field}, `;
					secondQuery.nonAggregate.push(field);
				} else if (schema.secondQuery.aggregate.indexOf(field) != -1) {
					secondQuery.select += ` SUM(${schema.secondQuery.tables.adpTagReport
						.alias}.${field}) AS ${field}, `;
					secondQuery.aggregate.push(field);
				}
			});
			if (common.level.section || common.level.variation || common.level.pagegroup) {
				let index = common.fields.forOn.indexOf('axsid');
				let slicedArray = common.fields.forOn.concat([]);
				// for On
				if (index != -1) {
					slicedArray.splice(index, 1);
					firstQuery.select += ` ${schema.firstQuery.tables.sectionReport.alias}.axsid, `;
				}
				firstQuery.select += queryHelper.__reduceArrayToString(
					slicedArray,
					schema.firstQuery.tables.apexSiteReport.alias
				);
				secondQuery.select += queryHelper.__reduceArrayToString(
					common.fields.forOn,
					schema.secondQuery.tables.adpTagReport.alias
				);

				// for sending to user
				_.forEach(common.fields.forUser, (value, key) => {
					let currentAlias = queryHelper.__getAlias(value);
					firstQuery.select += ` ,${currentAlias}.${value} `;
					secondQuery.select += ` ,${currentAlias}.${value} `;
				});
			} else {
				firstQuery.select = firstQuery.select.slice(0, -2);
				secondQuery.select = secondQuery.select.slice(0, -2);
			}
			return true;
		},
		from: () => {
			let index = false;
			if (common.level.section) {
				firstQuery.from += `, ${schema.firstQuery.tables.sectionReport.table} ${schema.firstQuery.tables
					.sectionReport.alias} `;
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
			return queryHelper
				.__resetVariables()
				.then(() => {
					let from = data.from
						? moment(data.from).format('YYYY-MM-DD')
						: moment()
								.subtract(7, days)
								.format('YYYY-MM-DD');
					let to = data.to
						? moment(data.to).format('YYYY-MM-DD')
						: moment()
								.subtract(1, days)
								.format('YYYY-MM-DD');

					firstQuery.where += ` ${schema.firstQuery.tables.apexSiteReport
						.alias}.${queryHelper.__generateDate()} `;
					secondQuery.where += ` ${schema.secondQuery.tables.adpTagReport
						.alias}.${queryHelper.__generateDate()} `;

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

					return queryHelper.__setLevel(data);
				})
				.then(() => {
					_.forEach(data, (value, key) => {
						let alias = queryHelper.__getAlias(key);
						firstQuery.where += ` AND ${alias
							? alias
							: schema.firstQuery.tables.apexSiteReport.alias}.${key}=@__${key}__ `;
						secondQuery.where += ` AND ${alias
							? alias
							: schema.secondQuery.tables.adpTagReport.alias}.${key}=@__${key}__ `;
						common.where.push(
							Object.assign(schema.where[key], {
								value: value
							})
						);
					});

					common.level.section
						? (firstQuery.where += ` AND ${schema.firstQuery.tables.apexSiteReport.alias}.axhsrid=${schema
								.firstQuery.tables.sectionReport.alias}.axhsrid `)
						: null;

					return true;
				});
		},
		groupBy: data => {
			return queryHelper.__groupBy().then(() => {
				if (!data || !data.length) {
					return false;
				}
				common.groupBy = ` GROUP BY ${data.join(', ')} `;
				return false;
			});
		},
		generateCompleteQuery: () => {
			return queryHelper.__checkParamsPresent().then(() => {
				// SELECT
				common.query += queryHelper.__generateMainSelect();

				// First Query
				common.query += ' FROM ( ';
				common.query += firstQuery.select;
				common.query += firstQuery.from;
				common.query += firstQuery.where;
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
				common.query += 'ON a.report_date=b.report_date AND a.siteid=b.siteid';

				if (common.fields.forOn.length) {
					_.forEach(common.fields.forOn, field => {
						common.query += ` AND ${schema.firstQuery.alias}.${field}=${schema.secondQuery
							.alias}.${field} `;
					});
				}

				common.query += common.groupBy ? common.groupBy : ' ';

				return {
					query: common.query,
					inputParameters: common.where.concat([])
				};
			});
		}
	});

module.exports = queryHelper;

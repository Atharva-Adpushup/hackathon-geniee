var Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ schema } = require('./constants'),
	common = {};
(firstQuery = {}),
	(secondQuery = {}),
	(queryHelper = {
		resetVariables: () => {
			common = {
				query: 'SELECT ',
				fields: [],
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
				from: ` FROM ${schema.firstQuery.firstTable} ${schema.firstQuery.firstTableAlias} `,
				where: ' WHERE ',
				groupBy: ' GROUP BY ',
				orderBy: ' ORDER BY ',
				aggregate: [],
				nonAggregate: []
			};
			secondQuery = {
				select: 'SELECT ',
				from: ` FROM ${schema.secondQuery.table} `,
				where: ' WHERE ',
				groupBy: ' GROUP BY ',
				orderBy: ' ORDER BY ',
				aggregate: [],
				nonAggregate: []
			};
			return Promise.resolve();
		},
		generateDate: () => `report_date BETWEEN @__from__ AND @__to__ `,
		setLevel: data => {
			let index = 0;
			if (data.hasOwnProperty('axsid')) {
				common.level.section = true;
				index = 3;
			} else if (data.hasOwnProperty('axvid')) {
				common.level.variation = true;
				index = 2;
			} else if (data.hasOwnProperty('axpgid')) {
				common.level.pagegroup = true;
				index = 1;
			}
			index ? (common.fields = schema.commonFields.slice(0, index)) : null;
			return Promise.resolve();
		},
		select: data => {
			let alias = common.level.section ? schema.firstQuery.secondTableAlias : schema.firstQuery.firstTableAlias;
			_.forEach(data, field => {
				if (schema.firstQuery.nonAggregate.indexOf(field) != -1) {
					firstQuery.select += ` ${schema.firstQuery.firstTableAlias}.${field}, `;
					firstQuery.nonAggregate.push(field);
				} else if (schema.firstQuery.aggregate.indexOf(field) != -1) {
					firstQuery.select += ` SUM(${alias}.${field}) AS ${field}, `;
					firstQuery.aggregate.push(field);
				}

				if (schema.secondQuery.nonAggregate.indexOf(field) != -1) {
					secondQuery.select += ` ${field}, `;
					secondQuery.nonAggregate.push(field);
				} else if (schema.secondQuery.aggregate.indexOf(field) != -1) {
					secondQuery.select += ` SUM(${field}) AS ${field}, `;
					secondQuery.aggregate.push(field);
				}
			});
			if (common.level.section || common.level.variation || common.level.pagegroup) {
				firstQuery.select +=
					` ${schema.firstQuery.firstTableAlias}.` +
					_.reduce(
						common.fields,
						(accumulator, value, key) =>
							value == undefined
								? `${accumulator} `
								: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `
					);
				secondQuery.select += common.fields.join(', ');
			} else {
				firstQuery.select = firstQuery.select.slice(0, -1);
				secondQuery.select = secondQuery.select.slice(0, -1);
			}
			return true;
		},
		from: () => {
			common.level.section
				? (firstQuery.from += ` ,${schema.firstQuery.secondTable} ${schema.firstQuery.secondTableAlias} `)
				: null;
			return Promise.resolve();
		},
		where: data => {
			return queryHelper
				.resetVariables()
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

					firstQuery.where += ` ${schema.firstQuery.firstTableAlias}.${queryHelper.generateDate()} `;
					secondQuery.where += ` ${queryHelper.generateDate()} `;

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

					return queryHelper.setLevel(data);
				})
				.then(() => {
					_.forEach(data, (value, key) => {
						firstQuery.where += ` AND ${schema.firstQuery.firstTableAlias}.${key}=@__${key}__ `;
						secondQuery.where += ` AND ${key}=@__${key}__ `;
						common.where.push(
							Object.assign(schema.where[key], {
								value: value
							})
						);
					});

					common.level.section
						? (firstQuery.where += ` AND ${schema.firstQuery.firstTableAlias}.axhsrid=${schema.firstQuery
								.secondTableAlias}.axhsrid `)
						: null;

					return true;
				});
		},
		__groupBy: () => {
			firstQuery.groupBy +=
				` ${schema.firstQuery.firstTableAlias}.` +
				_.reduce(
					firstQuery.nonAggregate,
					(accumulator, value, key) =>
						value == undefined
							? `${accumulator} `
							: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `
				);
			secondQuery.groupBy += secondQuery.nonAggregate.join(', ');

			if (common.level.section || common.level.variation || common.level.pagegroup) {
				firstQuery.groupBy +=
					` ,${schema.firstQuery.firstTableAlias}.` +
					_.reduce(
						common.fields,
						(accumulator, value, key) =>
							value == undefined
								? `${accumulator} `
								: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `
					);
				secondQuery.groupBy += ` ,${common.fields.join(', ')}`;
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
			if (firstQuery.aggregate) {
				response +=
					` ${schema.firstQuery.alias}.` +
					_.reduce(
						firstQuery.aggregate,
						(accumulator, value, key) =>
							value == undefined
								? `${accumulator} `
								: `${accumulator}, ${schema.firstQuery.alias}.${value} `
					);
			}
			if (firstQuery.nonAggregate) {
				response +=
					` ,${schema.firstQuery.alias}.` +
					_.reduce(
						firstQuery.nonAggregate,
						(accumulator, value, key) =>
							value == undefined
								? `${accumulator} `
								: `${accumulator}, ${schema.firstQuery.alias}.${value} `
					);
			}
			if (secondQuery.aggregate) {
				response +=
					` ,${schema.secondQuery.alias}.` +
					_.reduce(
						secondQuery.aggregate,
						(accumulator, value, key) =>
							value == undefined
								? `${accumulator} `
								: `${accumulator}, ${schema.secondQuery.alias}.${value} `
					);
			}
			if (secondQuery.nonAggregate) {
				let disjointFields = _.difference(secondQuery.nonAggregate, firstQuery.nonAggregate);
				if (disjointFields.length) {
					response +=
						` ,${schema.secondQuery.alias}.` +
						_.reduce(
							disjointFields,
							(accumulator, value, key) =>
								value == undefined
									? `${accumulator} `
									: `${accumulator}, ${schema.secondQuery.alias}.${value} `
						);
				}
			}
			return response;
		},
		groupBy: data => {
			return queryHelper.__groupBy().then(() => {
				if (!data || !data.length) {
					return;
				}
				common.groupBy = ` GROUP BY ${groupBy.join(', ')} `;
				return;
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

				if (common.fields.length) {
					_.forEach(common.fields, field => {
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

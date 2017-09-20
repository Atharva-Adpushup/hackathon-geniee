var Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ schema } = require('./constans'),
	common = {};
	firstQuery = {},
	secondQuery = {},
	queryHelper = {
		resetVariables: () => {
			common = {
				query: "SELECT ",
				fields: [],
				level: {
					section: false,
					variation: false,
					pagegroup: false,
					site: true
				}
			};
			firstQuery = {
				select: "SELECT ",
				from: ` FROM ${schema.firstQuery.firstTable} ${schema.schema.firstQuery.firstTableAlias} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				aggregate: [],
				nonAggregate: []
			};
			secondQuery = {
				select: "SELECT ",
				from: ` FROM ${schema.secondQuery.table} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				aggregate: [],
				nonAggregate: []
			};
			return Promise.resolve();
		},
		generateDate: (from, to) => `report_date BETWEEN ${from} AND ${to} `,
		setFirstQueryLevel: (data) => {
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
			index ? common.commonFields = schema.commonFields.slice(0, index) : null;
			return Promise.resolve();
		},
		select: (data) => {
			return resetVariables()
			.then(() => {
				_.forEach(data, (field) => {
					if (schema.firstQuery.nonAggregate.index(field) != -1) {
						firstQuery.select += ` ${schema.schema.firstQuery.firstTableAlias}.${field}, `;
						firstQuery.nonAggregate.push(field);
					} else if (schema.firstQuery.aggregate.index(field) != -1) {
						firstQuery.select += ` SUM(${schema.schema.firstQuery.firstTableAlias}.${field}) AS ${field}, `;
						firstQuery.aggregate.push(field);
					}

					if (schema.secondQuery.nonAggregate.index(field) != -1) {
						secondQuery.select += ` ${field}, `;
						secondQuery.nonAggregate.push(field);
					} else if (schema.secondQuery.aggregate.index(field) != -1) {
						secondQuery.select += ` SUM(${field}) AS ${field}, `;
						secondQuery.aggregate.push(field);
					}
				});
				if (common.level.section || common.level.variation || common.level.pagegroup) {
					firstQuery.select += ` ${schema.firstQuery.firstTableAlias}.` + _.reduce(common.fields, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `);
					secondQuery.select +=  common.fields.join(', ');
				} else {
					firstQuery = firstQuery.slice(0, -1);
					secondQuery = secondQuery.slice(0, -1);
				}
				return true;
			});
		},
		from: () => {
			common.level.section
			? firstQuery.from += ` ${schema.firstQuery.secondTable} ${schema.firstQuery.secondTableAlias} `
			: null;
			return Promise.resolve();
		},
		where: (data) => {
			let from = data.from ? (date.from).format('YYYY-MM-DD') : moment().subtract(7, days).format('YYYY-MM-DD');
			let to = data.to ? (data.to).format('YYYY-MM-DD') : moment().subtract(1, days).format('YYYY-MM-DD');

			firstQuery.where += ` ${schema.schema.firstQuery.firstTableAlias}.${queryHelper.generateDate(from, to)} `;
			secondQuery.where += ` ${queryHelper.generateDate(from, to)} `;

			delete date.from;
			delete data.to;

			return setFirstQueryLevel(data)
			.then(() => {
				_.forEach(data, (value, key) => {
					firstQuery.where += ` ,${schema.schema.firstQuery.firstTableAlias}.${key}=@__${key}__ `;
					secondQuery.where += ` ,${key}=@__${key}__ `;
				});

				common.level.section
				? firstQuery.where += ` ,${schema.schema.firstQuery.firstTableAlias}.axhsrid=${schema.firstQuery.secondTableAlias}.axhsrid `
				: null;

				return true;
			});
		},
		__groupBy: (data) => {
			firstQuery.groupBy += ` ${schema.firstQuery.firstTableAlias}.` + _.reduce(firstQuery.aggregate, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `);
			secondQuery.groupBy += secondQuery.aggregate.join(', ');

			if (common.level.section || common.level.variation || common.level.pagegroup) {
				firstQuery.groupBy += ` ${schema.firstQuery.firstTableAlias}.` + _.reduce(common.fields, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.firstQuery.firstTableAlias}.${value} `);
				secondQuery.groupBy += common.fields.join(', ');
			}

			return Promise.resolve();
		},
		__checkParamsPresent: () => {
			if (
				!firstQuery.aggregate.length
				&& !firstQuery.nonAggregate.length
				&& !secondQuery.aggregate.length
				&& !secondQuery.nonAggregate.length
			) {
				return Promise.reject("Invalid parameters");
			}
			return Promise.resolve();
		},
		__generateMainSelect: () => {
			let response = " ";
			if (firstQuery.aggregate) {
				response += ` ${schema.firstQuery.alias}.` + _.reduce(firstQuery.aggregate, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.firstQuery.alias}.${value} `);
			}
			if (firstQuery.nonAggregate) {
				response += ` ${schema.firstQuery.alias}.` + _.reduce(firstQuery.nonAggregate, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.firstQuery.alias}.${value} `);
			}
			if (secondQuery.aggregate) {
				response += ` ${schema.secondQuery.alias}.` + _.reduce(secondQuery.aggregate, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.secondQuery.alias}.${value} `);
			}
			if (secondQuery.nonAggregate) {
				let disjointFields = _.difference(secondQuery.nonAggregate, firstQuery.nonAggregate);
				if (disjointFields.length) {
					response += ` ${schema.secondQuery.alias}.` + _.reduce(disjointFields, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${schema.secondQuery.alias}.${value} `);
				}
			}
			return response;
		},
		generateCompleteQuery: () => {
			return __checkParamsPresent()
			.then(() => {
				// SELECT
				common.query += __generateMainSelect();

				// First Query
				common.query += " FROM ( ";
				common.query += firstQuery.select
				common.query += firstQuery.from;
				common.query += firstQuery.where;
				common.query += firstQuery.groupBy;
				common.query += ` ) ${schema.firstQuery.alias} `;

				// Second Query
				common.query += " INNER JOIN ( ";
				common.query += secondQuery.select
				common.query += secondQuery.from;
				common.query += secondQuery.where;
				common.query += secondQuery.groupBy;
				common.query += ` ) ${schema.secondQuery.alias} `;

				// ON
				common.query += "ON a.report_date=b.report_date and a.siteid=b.siteid";
				
				if(common.fields.length)
				{
					_.forEach(common.fields, (field) => {
						common.query += ` and ${schema.firstQuery.alias}.${field}=${schema.secondQuery.alias}.${field} `;
					});
				}

				return common.query;
			});
		}
	}
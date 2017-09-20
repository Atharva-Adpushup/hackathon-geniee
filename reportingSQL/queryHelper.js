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
				commonFields: [],
				level: {
					section: false,
					variation: false,
					pagegroup: false,
					site: true
				}
			};
			firstQuery = {
				select: "SELECT ",
				from: ` ${schema.firstQuery.firstTable} ${schema.firstQuery.firstTableAlias} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				aggregate: [],
				nonAggregate: []
			};
			secondQuery = {
				select: "SELECT ",
				from: ` ${schema.secondQuery.table} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				aggregate: [],
				nonAggregate: []
			};
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
			_.forEach(data, (field) => {
				if (schema.firstQuery.nonAggregate.index(field) != -1) {
					firstQuery.select += ` ${schema.firstQuery.firstTableAlias}.${field}, `;
					firstQuery.nonAggregate.push(field);
				} else if (schema.firstQuery.aggregate.index(field) != -1) {
					firstQuery.select += ` SUM(${schema.firstQuery.firstTableAlias}.${field}) AS ${field}, `;
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
				firstQuery.select += ` ${firstQuery.firstTableAlias} ` + _.reduce(common.fields, (accumulator, value, key) => value == undefined ? `${accumulator} `: `${accumulator}, ${firstQuery.firstTableAlias}.${value} `);
				secondQuery.select +=  common.fields.join(', ');
			} else {
				firstQuery = firstQuery.slice(0, -1);
				secondQuery = secondQuery.slice(0, -1);
			}

		},
		where: (data) => {
			let from = data.from ? (date.from).format('YYYY-MM-DD') : moment().subtract(7, days).format('YYYY-MM-DD');
			let to = data.to ? (data.to).format('YYYY-MM-DD') : moment().subtract(1, days).format('YYYY-MM-DD');

			firstQuery.where += ` ${schema.firstQuery.firstTableAlias}.${queryHelper.generateDate(from, to)} `;
			secondQuery.where += ` ${queryHelper.generateDate(from, to)} `;

			delete date.from;
			delete data.to;

			return setFirstQueryLevel(data)
			.then(() => {
				_.forEach(data, (value, key) => {
					firstQuery.where += ` ,${schema.firstQuery.firstTableAlias}.${key}=@__${key}__ `;
					secondQuery.where += ` ,${key}=@__${key}__ `;
				});

				common.level.section
				? firstQuery.where += ` ,${schema.firstQuery.firstTableAlias}.axhsrid=${schema.firstQuery.secondTableAlias}.axhsrid `
				: null;

				return true;
			});
		},
		groupBy: (data) => {

		}
	}
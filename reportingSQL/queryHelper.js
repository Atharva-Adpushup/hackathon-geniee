var Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ schema } = require('./constans'),
	mainQuery = "";
	firstQuery = {},
	secondQuery = {},
	queryHelper = {
		resetVariables: () => {
			mainQuery = "SELECT ";
			firstQuery = {
				select: "SELECT ",
				from: ` ${schema.firstQuery.firstTable} ${schema.firstQuery.firstTableAlias} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				level: {
					section: false,
					variation: false,
					pagegroup: false,
					site: true
				},
				aggregate: [],
				nonAggreate: []
			};
			firstQuery = {
				select: "SELECT ",
				from: ` ${schema.secondQuery.table} `,
				where: " WHERE ",
				groupBy: " GROUP BY ",
				orderBy: " ORDER BY ",
				aggregate: [],
				nonAggreate: []
			};
		},
		generateDate: (from, to) => `report_date BETWEEN ${from} AND ${to} `,
		setFirstQueryLevel: (data) => {
			if (data.hasOwnProperty('axsid')) {
				firstQuery.level.section = true;
			} else if (data.hasOwnProperty('axvid')) {
				firstQuery.level.variation = true;
			} else if (data.hasOwnProperty('axpgid')) {
				firstQuery.level.pagegroup = true;
			}
			return Promise.resolve();
		},
		select: (data) => {
			_.forEach(data, (field) => {
				if (schema.firstQuery.nonAggregate.index(field) != -1) {
					firstQuery.select += ` ${schema.firstQuery.firstTableAlias}${field} `;
				}
			});
		},
		where: (data) => {
			let from = data.from ? (date.from).format('YYYY-MM-DD') : moment().subtract(7, days).format('YYYY-MM-DD');
			let to = data.to ? (data.to).format('YYYY-MM-DD') : moment().subtract(1, days).format('YYYY-MM-DD');

			firstQuery.where += ` ${schema.firstQuery.firstTableAlias}${queryHelper.generateDate(from, to)} `;
			secondQuery.where += ` ${queryHelper.generateDate(from, to)} `;

			delete date.from;
			delete data.to;

			return setFirstQueryLevel(data)
			.then(() => {
				_.forEach(data, (value, key) => {
					firstQuery.where += ` ,${schema.firstQuery.firstTableAlias}${key}=@__${key}__ `;
					secondQuery.where += ` ,${key}=@__${key}__ `;
				});

				firstQuery.level.section
				? firstQuery.where += ` ,${schema.firstQuery.firstTableAlias}.axhsrid=${schema.firstQuery.secondTableAlias}.axhsrid `
				: null;

				return true;
			});
		},
		groupBy: (data) => {

		}
	}
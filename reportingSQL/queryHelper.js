var Promise = require('bluebird'),
	_ = require('lodash'),
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
		select: (data) => {

		},
		where: (data) => {

		},
		groupBy: (data) => {
			
		}
	}
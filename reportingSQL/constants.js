/*
	Section wise reporting query. 
		The following query will fetch section level reporting data 
		- report_data, siteid, total_cpm, total_impressions, total_xpath_miss
		(More fields can be fetched but schema needs to append accordingly)
		
		It joins three tables : ApexHourlySiteReport, ApexSectionReport, AdpTagReport
		Revenue from AdpTagReport
		Impressions, Xpath_miss from ApexSectionReport
		Siteid, Date from ApexHourlySiteReport  
*/
const section_level_query = `
	SELECT
		a.report_date,
		a.siteid,
		a.total_impressions,
		a.total_xpath_miss,
		a.axpgid,
		a.axvid,
		a.axsid,
		b.total_cpm
	FROM (
		SELECT 
			c.report_date,
			c.siteid,
			c.axvid,
			c.axpgid,
			d.axsid,
			SUM(d.total_impressions) AS total_impressions,
			SUM(d.total_xpath_miss) AS total_xpath_miss
		FROM
			ApexHourlySiteReport c, ApexSectionReport d
		WHERE
			c.axvid=@__axvid__
			c.axpgid=@__axpgid__
			c.siteid=@__siteid__
			c.axsid=@__axsid__
			c.report_date BETWEEN @__from__ AND @__to__
			c.axhsrid=d.axhsrid
		GROUP BY
			c.report_date,
			c.siteid,
			c.axvid,
			c.axpgid,
			d.axsid
	) a
	INNER JOIN (
		SELECT
			report_date,
			siteid,
			axvid,
			axpgid,
			axsid,
			SUM(total_cpm) AS total_cpm
		FROM
			AdpTagReport
		WHERE
			axvid=@__axvid__
			axpgid=@__axpgid__
			axsid=@__axsid__
			siteid=@__siteid__
			report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			report_date,
			siteid,
			axvid,
			axpgid
	) b
	ON a.report_date=b.report_date and a.siteid=b.siteid and a.axpgid=b.axpgid and a.axvid=b.axvid and a.axsid=b.axsid
`;

/*
	Variation wise reporting query. 
		The following query will fetch variation level reporting data 
		- report_data, siteid, total_cpm, total_impressions, total_xpath_miss
		(More fields can be fetched but schema needs to append accordingly)
		
		It joins three tables : ApexHourlySiteReport, AdpTagReport
		Revenue from AdpTagReport
		Impressions, Xpath_miss, Siteid, Date from ApexHourlySiteReport  
*/
const variation_level_query = `
	SELECT
		a.report_date,
		a.siteid,
		a.total_impressions,
		a.total_xpath_miss,
		a.axpgid,
		a.axvid,
		b.total_cpm
	FROM (
		SELECT 
			c.report_date,
			c.siteid,
			c.axvid,
			c.axpgid,
			SUM(c.total_impressions) AS total_impressions,
			SUM(c.total_xpath_miss) AS total_xpath_miss
		FROM
			ApexHourlySiteReport c
		WHERE
			c.axvid=@__axvid__
			c.axpgid=@__axpgid__
			c.siteid=@__siteid__
			c.report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			c.report_date,
			c.siteid,
			c.axvid,
			c.axpgid,
	) a
	INNER JOIN (
		SELECT
			report_date,
			siteid,
			axvid,
			axpgid,
			SUM(total_cpm) AS total_cpm
		FROM
			AdpTagReport
		WHERE
			axvid=@__axvid__
			axpgid=@__axpgid__
			siteid=@__siteid__
			report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			report_date,
			siteid,
			axvid,
			axpgid
	) b
	ON a.report_date=b.report_date and a.siteid=b.siteid and a.axpgid=b.axpgid and a.axvid=b.axvid
`;

/*
	Pagegroup wise reporting query. 
		The following query will fetch pagegroup level reporting data 
		- report_data, siteid, total_cpm, total_impressions, total_xpath_miss
		(More fields can be fetched but schema needs to append accordingly)
		
		It joins three tables : ApexHourlySiteReport, AdpTagReport
		Revenue from AdpTagReport
		Impressions, Xpath_miss, Siteid, Date from ApexHourlySiteReport  
*/
const pagegroup_level_query = `
	SELECT
		a.report_date,
		a.siteid,
		a.total_impressions,
		a.total_xpath_miss,
		a.axpgid,
		b.total_cpm
	FROM (
		SELECT 
			c.report_date,
			c.siteid,
			c.axpgid,
			SUM(c.total_impressions) AS total_impressions,
			SUM(c.total_xpath_miss) AS total_xpath_miss
		FROM
			ApexHourlySiteReport c
		WHERE
			c.axpgid=@__axpgid__
			c.siteid=@__siteid__
			c.report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			c.report_date,
			c.siteid,
			c.axpgid,
	) a
	INNER JOIN (
		SELECT
			report_date,
			siteid,
			axpgid,
			SUM(total_cpm) AS total_cpm
		FROM
			AdpTagReport
		WHERE
			axpgid=@__axpgid__
			siteid=@__siteid__
			report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			report_date,
			axpgid,
			siteid
	) b
	ON a.report_date=b.report_date and a.siteid=b.siteid and a.axpgid=b.axpgid
`;

/*
	Site wise reporting query. 
		The following query will fetch site level reporting data 
		- report_data, siteid, total_cpm, total_impressions, total_xpath_miss
		(More fields can be fetched but schema needs to append accordingly)
		
		It joins three tables : ApexHourlySiteReport, AdpTagReport
		Revenue from AdpTagReport
		Impressions, Xpath_miss, Siteid, Date from ApexHourlySiteReport  
*/
const site_level_query = `
	SELECT
		a.report_date,
		a.siteid,
		a.total_impressions,
		a.total_xpath_miss,
		b.total_cpm
	FROM (
		SELECT 
			c.report_date,
			c.siteid,
			SUM(c.total_impressions) AS total_impressions,
			SUM(c.total_xpath_miss) AS total_xpath_miss
		FROM
			ApexHourlySiteReport c
		WHERE
			c.siteid=@__siteid__
			c.report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			c.report_date,
			c.siteid,
	) a
	INNER JOIN (
		SELECT
			report_date,
			siteid,
			SUM(total_cpm) AS total_cpm
		FROM
			AdpTagReport
		WHERE
			siteid=@__siteid__
			report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			report_date,
			siteid
	) b
	ON a.report_date=b.report_date and a.siteid=b.siteid
`;

const schema = {
	firstQuery: {
		aggregate: ['total_impressions', 'total_xpath_miss'],
		nonAggregate: ['report_date', 'siteid', 'device_type'],
		complusion: ['axvid', 'axpgid', 'axsid'],
		firstTable: "ApexHourlySiteReport",
		secondTable: "ApexSectionReport",
		firstTableAlias: "c",
		secondTableAlias: "d",
		alias: "a"
	},
	secondQuery: {
		aggregate: ['total_cpm'],
		nonAggregate: ['report_date', 'siteid'],
		complusion: ['axvid', 'axpgid', 'axsid'],
		table: "AdpTagReport",
		alias: "b"
	}
}

module.exports = { schema };
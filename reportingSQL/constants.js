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
/*
SELECT   a.total_impressions, a.total_xpath_miss ,  
a.report_date, a.siteid ,  b.total_cpm,  a.name, a.variation_id , a.section_md5  
FROM ( SELECT  c.report_date,  c.siteid,  SUM(d.total_impressions) AS total_impressions,  
SUM(d.total_xpath_miss) AS total_xpath_miss,  d.axsid,  c.axpgid, c.axvid  ,e.name  ,f.variation_id  
,g.section_md5  FROM ApexHourlySiteReport c , ApexSectionReport d  ,ApexPageGroup e, ApexVariation f, ApexSection g  
WHERE  c.report_date BETWEEN '2017-09-01' AND '2017-09-01'   AND c.siteid='28822'  
AND g.section_md5='429e5150-e40b-4afb-b165-93b8bde3cf21'  AND f.variation_id='2e68228f-84da-415e-bfcf-bfcf67c87570'  
AND e.name='MIC'  AND c.axhsrid=d.axhsrid  GROUP BY  c.report_date, c.siteid,  d.axsid,  c.axpgid, c.axvid  ,e.name  
,f.variation_id  ,g.section_md5  ) a  INNER JOIN ( SELECT  h.report_date,  h.siteid,  SUM(h.total_cpm) AS total_cpm,  
h.axpgid, h.axvid , h.axsid  ,e.name  ,f.variation_id  ,g.section_md5  FROM AdpTagReport h  ,ApexPageGroup e, 
ApexVariation f, ApexSection g  WHERE  h.report_date BETWEEN '2017-09-01' AND '2017-09-01'   AND h.siteid='28822'  
AND g.section_md5='429e5150-e40b-4afb-b165-93b8bde3cf21'  AND f.variation_id='2e68228f-84da-415e-bfcf-bfcf67c87570'  
AND e.name='MIC'  GROUP BY  h.report_date, h.siteid ,  h.axpgid, h.axvid , h.axsid  ,e.name  ,f.variation_id  
,g.section_md5  ) b ON a.report_date=b.report_date AND a.siteid=b.siteid AND a.axpgid=b.axpgid  AND a.axvid=b.axvid  
AND a.axsid=b.axsid
*/
const section_level_query = `
SELECT
	a.report_date,
	a.siteid,
	a.total_impressions,
	a.total_xpath_miss,
	a.name,
	a.variation_id,
	a.section_md5,
	b.total_cpm
FROM (
	SELECT 
		c.report_date,
		c.siteid,
		c.axvid,
		c.axpgid,
		d.axsid,
		e.name,
		f.variation_id,
		g.section_md5,
		SUM(d.total_impressions) AS total_impressions,
		SUM(d.total_xpath_miss) AS total_xpath_miss
	FROM
		ApexHourlySiteReport c, ApexSectionReport d, ApexPagegroup e, ApexVariation f, ApexSection g
	WHERE
		e.name=@__name__
		f.variation_id=@__variation_id
		g.section_md5=@__section_md5__
		c.siteid=@__siteid__
		c.report_date BETWEEN @__from__ AND @__to__
		c.axhsrid=d.axhsrid
	GROUP BY
		c.report_date,
		c.siteid,
		c.axvid,
		c.axpgid,
		d.axsid,
		e.name,
		f.variation_id,
		g.section_md5
) a
INNER JOIN (
	SELECT
		h.report_date,
		h.siteid,
		h.axvid,
		h.axpgid,
		h.axsid,
		SUM(h.total_cpm) AS h.total_cpm
	FROM
		AdpTagReport h, ApexPagegroup e, ApexVariation f, ApexSection g
	WHERE
		e.name=@__name__
		f.variation_id=@__variation_id
		g.section_md5=@__section_md5__
		h.siteid=@__siteid__
		h.report_date BETWEEN @__from__ AND @__to__
	GROUP BY
		h.report_date,
		h.siteid,
		h.axsid,
		h.axvid,
		h.axpgid,
		e.name,
		f.variation_id,
		g.section_md5
) b
ON a.report_date=b.report_date and a.siteid=b.siteid and a.axpgid=b.axpgid and a.axvid=b.axvid and a.axsid=b.axsid
GROUP BY
	a.section_md5,
	a.variation_id,
	a.name
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

let fetchSectionQuery = `SELECT axsid FROM ApexSection where section_md5=@__section_md5__ and siteid=@__siteid__`;
let fetchVariationQuery = `SELECT axvid FROM ApexVariation where variation_id=@__variation_id__ and siteid=@__siteid__`;
let fetchPagegroupQuery = `SELECT axpgid FROM ApexPageGroup where name=@__name__ and siteid=@__siteid__`;

const schema = {
	common: {
		fields: {
			forUser: ['name', 'variation_id', 'section_md5'],
			forOn: ['axpgid', 'axvid', 'axsid']
		},
		tables: {
			pagegroup: {
				table: 'ApexPageGroup',
				alias: 'e'
			},
			variation: {
				table: 'ApexVariation',
				alias: 'f'
			},
			section: {
				table: 'ApexSection',
				alias: 'g'
			}
		}
	},
	firstQuery: {
		aggregate: ['total_impressions', 'total_xpath_miss'],
		nonAggregate: ['report_date', 'siteid', 'device_type'],
		tables: {
			apexSiteReport: {
				table: 'ApexHourlySiteReport',
				alias: 'c'
			},
			sectionReport: {
				table: 'ApexSectionReport',
				alias: 'd'
			}
		},
		alias: 'a'
	},
	secondQuery: {
		aggregate: ['total_cpm'],
		nonAggregate: ['report_date', 'siteid'],
		tables: {
			adpTagReport: {
				table: 'AdpTagReport',
				alias: 'h'
			}
		},
		alias: 'b'
	},
	where: {
		name: {
			name: '__name__',
			type: 'NVARCHAR',
			value: false
		},
		variation_id: {
			name: '__variation_id__',
			type: 'VARCHAR',
			value: false
		},
		section_md5: {
			name: '__section_md5__',
			type: 'VARCHAR',
			value: false
		},
		siteid: {
			name: '__siteid__',
			type: 'INT',
			value: false
		},
		from: {
			name: '__from__',
			type: 'DATE',
			value: false
		},
		to: {
			name: '__to__',
			type: 'DATE',
			value: false
		}
	}
};

module.exports = { schema, fetchSectionQuery, fetchVariationQuery, fetchPagegroupQuery };

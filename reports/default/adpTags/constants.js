/*
	Comments need rectification. Will do that soon.
	Section wise reporting query. 
		The following query will fetch section level reporting data 
		- report_data, siteid, total_cpm, total_impressions, total_xpath_miss
		(More fields can be fetched but schema needs to append accordingly)
		
		It joins three tables : ApexHourlySiteReport, ApexSectionReport, AdpTagReport
		Revenue from AdpTagReport
		Impressions, Xpath_miss from ApexSectionReport
		Siteid, Date from ApexHourlySiteReport  

Select							WHERE						GROUP BY

report_date						from						report_date
siteid							to							siteid
total_xpath_miss				pagegroup					pagegroup
total_cpm						variation					variation
total_impressions				section						section
								device						device

*/

const SITE_TOP_URLS = `
SELECT TOP @__count__ c.url, sum(b.count) AS 'count'
FROM apexhourlysitereport a, apextopurlreport b, apextopurl c
WHERE a.axhsrid = b.axhsrid
	AND b.axtuid = c.axtuid
	AND report_date BETWEEN @__fromDate__ AND @__toDate__
	AND a.siteid = @__siteId__
GROUP BY c.url
ORDER BY 'count' DESC;
`;

const SITE_DEVICE_WISE_REVENUE_CONTRIBUTION = `
SELECT report_date, device_type, sum(total_gross_revenue) AS 'total_revenue', sum(total_revenue) AS 'revenue_after_cut'
FROM adptagreport
WHERE report_date BETWEEN @__fromDate__ AND @__toDate__
	AND siteid = @__siteId__
GROUP BY report_date, device_type;
`;

const SITE_PAGEGROUP_WISE_REVENUE_CONTRIBUTION = `
SELECT a.report_date, b.NAME AS 'name', sum(a.total_gross_revenue) AS 'total_revenue', sum(a.total_revenue) AS 'revenue_after_cut'
FROM AdpTagReport a, ApexPageGroup b
WHERE a.axpgid = b.axpgid
	AND a.report_date BETWEEN @__fromDate__ AND @__toDate__
	AND a.siteid = @__siteId__
GROUP BY a.report_date, b.NAME;
`;

const GLOBAL_NETWORK_WISE_PERFORMANCE = `
SELECT report_date, a.ntwid, name, sum(total_impressions) impressions, sum(total_revenue) revenue
FROM adptagreport a, network b
WHERE a.ntwid = b.ntwid
	AND a.report_date BETWEEN @__fromDate__ AND @__toDate__
GROUP BY a.report_Date, a.ntwid, name
ORDER BY a.report_date, a.ntwid, name;
`;

const GLOBAL_METRICS_PERFORMANCE = `
SELECT a.report_date, total_page_views, impressions, revenue
FROM (
SELECT report_date, sum(total_requests) AS total_page_views
FROM ApexHourlySiteReport
WHERE report_date BETWEEN @__fromDate__ AND @__toDate__
GROUP BY report_date
) a
LEFT JOIN (
SELECT report_date, sum(total_impressions) impressions, sum(total_revenue) revenue
FROM adptagreport
WHERE report_date BETWEEN @__fromDate__ AND @__toDate__
GROUP BY report_Date
) b ON a.report_date = b.report_date
ORDER BY report_date
`;

const PLATFORMS_KEYS = {
	0: 'UNKNOWN',
	1: 'MOBILE',
	2: 'DESKTOP',
	3: 'CONNECTED_TV',
	4: 'MOBILE',
	5: 'TABLET',
	6: 'CONNECTED_DEVICE',
	7: 'SET_TOP_BOX'
};

const REGEX_DATE_FORMAT = /\d{4}-\d{2}-\d{2}/;
const STRING_DATE_FORMAT = 'YYYY-MM-DD';

/**
SELECT
	SUM(a.total_requests) AS total_requests,
	a.report_date,
	a.siteid,
	SUM(b.total_revenue) AS total_revenue,
	SUM(b.total_impressions) AS total_impressions,
	b.display_name
FROM (
	SELECT
		SUM(c.total_requests) AS total_requests,
		c.report_date,
		c.siteid
	FROM ApexHourlySiteReport c
	WHERE
		c.report_date BETWEEN '2017-11-07' AND '2017-11-13'
		AND c.siteid = 31000
	GROUP BY
		c.report_date,
		c.siteid
) a
INNER JOIN (
	SELECT
		SUM(h.total_revenue) AS total_revenue,
		SUM(h.total_impressions) AS total_impressions,
		h.report_date,
		h.siteid,
		i.display_name
	FROM AdpTagReport h, Network i
	WHERE
		h.report_date BETWEEN '2017-11-07' AND '2017-11-13'
		AND h.siteid = 31000
		AND h.ntwid = i.ntwid
	GROUP BY
		h.report_date,
		h.siteid,
		h.display_name
) b
ON a.report_date = b.report_date AND a.siteid = b.siteid
GROUP BY
	a.report_date,
	a.siteid,
	b.display_name
*/

const fetchSectionQuery = `SELECT axsid, sec_key, section_md5 FROM ApexSection where siteid=@__siteid__`,
	fetchVariationQuery = `SELECT axvid, var_key, variation_id FROM ApexVariation where siteid=@__siteid__`,
	fetchPagegroupQuery = `SELECT axpgid, pg_key, name FROM ApexPageGroup where siteid=@__siteid__`,
	liveSitesQuery = `EXEC GetActiveSites @__from__,@__to__,@__threshold__`;

const schema = {
	common: {
		fields: {
			forUser: ['name', 'variation_id', 'section_md5'],
			forOn: ['axpgid', 'axvid', 'axsid'],
			commonOn: ['report_date', 'siteid', 'device_type'],
			where: ['name', 'variation_id', 'section_md5', 'report_date', 'siteid', 'device_type'],
			groupBy: ['section_md5', 'variation_id', 'name', 'device_type']
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
		aggregate: ['total_requests', 'total_xpath_miss', 'total_impressions'],
		nonAggregate: ['report_date', 'siteid', 'device_type'],
		where: ['mode'],
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
		aggregate: ['total_revenue', 'total_impressions', 'total_gross_revenue'],
		nonAggregate: ['report_date', 'siteid', 'ntwid', 'platform', 'device_type', 'display_name'],
		where: ['ntwid'],
		tables: {
			adpTagReport: {
				table: 'AdpTagReport',
				alias: 'h'
			},
			network: {
				table: 'Network',
				alias: 'i'
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
		},
		device_type: {
			name: '__device_type__',
			type: 'TINYINT',
			value: false
		},
		platform: {
			name: '__platform__',
			type: 'VARCHAR',
			value: false
		},
		ntwid: {
			name: '__ntwid__',
			type: 'INT',
			value: false
		},
		mode: {
			name: '__mode__',
			type: 'TINYINT',
			value: false
		}
	}
};

const ANAMOLY_PAGE_VIEW_IMPRESSION_XPATH_MISS = `
EXEC GetPVIXAnomaly @__weekStartDate__,@__weekEndDate__,@__yesterdayDate__,@__codeRemovedThreshold__,@__pageViewThreshold__,@__pageViewMinThreshold__,@__impressionThreshold__,@__impressionMinThreshold__,@__xpathMissThreshold__,@__xpathMissMinThreshold__`;

const ANAMOLY_CPM = `
EXEC GetCpmAnomaly @__weekStartDate__,@__weekEndDate__,@__yesterdayDate__,@__pageViewMinThreshold__,@__cpmThreshold__,@__cpmMinThreshold__`;

const ANAMOLY_DETERMINED_MODE = `
EXEC GetDMAnomaly  @__weekStartDate__,@__weekEndDate__,@__yesterdayDate__,@__pageViewMinThreshold__,@__determinedModeThreshold__,@__determinedModeMinThreshold__`;

module.exports = {
	schema,
	fetchSectionQuery,
	fetchVariationQuery,
	fetchPagegroupQuery,
	SITE_TOP_URLS,
	SITE_DEVICE_WISE_REVENUE_CONTRIBUTION,
	PLATFORMS_KEYS,
	REGEX_DATE_FORMAT,
	STRING_DATE_FORMAT,
	SITE_PAGEGROUP_WISE_REVENUE_CONTRIBUTION,
	liveSitesQuery,
	ANAMOLY_PAGE_VIEW_IMPRESSION_XPATH_MISS,
	ANAMOLY_CPM,
	ANAMOLY_DETERMINED_MODE,
	GLOBAL_NETWORK_WISE_PERFORMANCE,
	GLOBAL_METRICS_PERFORMANCE
};

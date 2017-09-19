const query = `
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
			a.report_date,
			a.siteid,
			a.axvid,
			a.axpgid,
			a/b.axsid,
			SUM(a/b.total_impressions) AS total_impressions,
			SUM(a/b.total_xpath_miss) AS total_xpath_miss
		FROM
			ApexHourlySiteReport a, ApexSectionReport b
		WHERE
			axvid=@__axvid__
			axpgid=@__axpgid__
			siteid=@__siteid__
			b.axsid=@__section__
			a.axhsrid=b.axhsrid
			report_date BETWEEN @__from__ AND @__to__
		GROUP BY
			report_date,
			siteid,
			axvid,
			axpgid
	) a
	INNER JOIN (
		SELECT
			report_date
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
			report_date
			axvid,
			axpgid
	) b
	ON a.axvid=b.axivd and a.axpgid=b.axpgid and a.report_date=b.report_date
`;
const SITE_METRICS_QUERY = `
Select 
	s.siteid as siteId,
	g.name as pageGroup,
	v.variation_id as variationId,
	s.device_type as platform,
	s.report_date as reportDate,
	sum(s.total_requests) as pageViews,
	sum(s.total_impressions) as impressions,
	sum(s.total_clicks) as clicks,
	sum(s.total_geniee_revenue) as revenue,
	sum(s.total_xpath_miss) as xpathMiss,
	sum(s.total_control_page_views) as controlPageViews,
	sum(s.total_tracked_requests) as trackedPageViews,
	sum(s.total_tracked_impressions) as trackedImpressions,
	sum(s.total_tracked_clicks) as trackedClicks,
	sum(s.total_tracked_xpath_miss) as trackedXpathMiss,
	sum(s.total_tracked_control_page_views) as trackedControlPageViews
from
	ApexHourlySiteReport s,
	ApexPageGroup g,
	ApexVariation v
where
	s.axpgid=g.axpgid and
	s.axvid=v.axvid and
	s.report_date BETWEEN @__startDate__ and @__endDate__ and 
	s.siteid in (@__siteId__) and 
	s.mode=@__mode__
group by
	s.siteid,
	g.name,
	v.variation_id,
	s.device_type,
	s.report_date
`;

module.exports = { SITE_METRICS_QUERY };

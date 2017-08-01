const GET_METRICS_QUERY = `
Select 
	s.siteid as siteId,
	g.name as pageGroup,
	v.variation_id as variationId,
	s.device_type as platform,
	s.report_date as reportDate,
	sum(total_requests) as pageViews,
	sum(total_impressions) as impressions,
	sum(total_clicks) as clicks,
	sum(total_geniee_revenue) as revenue
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

module.exports = { GET_METRICS_QUERY };

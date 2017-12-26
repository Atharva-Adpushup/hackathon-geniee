USE [central-sql]
GO
/****** Object:  StoredProcedure [dbo].[GetPVIXC]    Script Date: 11/12/2017 2:29:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[GetPVIXC] @product VARCHAR(15)
	,@fromDate DATE
	,@toDate DATE
	,@siteId INT
AS
BEGIN
	IF (@product = 'apex')
	BEGIN
		SELECT 'apex' product
			,report_date
			,siteid
			,sum(total_requests) pageviews
			,sum(total_impressions) impressions
			,sum(total_clicks) clicks
			,sum(total_xpath_miss) xpath_miss
		FROM ApexHourlySiteReport
		WHERE report_date BETWEEN @fromDate
				AND @toDate
			AND (
				(siteid = @siteId)
				OR @siteId IS NULL
				)
		GROUP BY report_date
			,siteid
		ORDER BY report_date
			,siteid
	END

	IF (@product = 'app')
	BEGIN
		SELECT 'app' product
			,report_date
			,siteid
			,sum(total_requests) pageviews
			,sum(total_impressions) impressions
			,sum(total_clicks) clicks
			,sum(total_xpath_miss) xpath_miss
		FROM AdpushupHourlySiteReport
		WHERE report_date BETWEEN @fromDate
				AND @toDate
			AND (
				(siteid = @siteId)
				OR @siteId IS NULL
				)
		GROUP BY report_date
			,siteid
		ORDER BY report_date
			,siteid
	END

	IF (@product = 'all')
	BEGIN
		SELECT 'apex' product
			,report_date
			,siteid
			,sum(total_requests) pageviews
			,sum(total_impressions) impressions
			,sum(total_clicks) clicks
			,sum(total_xpath_miss) xpath_miss
		FROM ApexHourlySiteReport
		WHERE report_date BETWEEN @fromDate
				AND @toDate
			AND (
				(siteid = @siteId)
				OR @siteId IS NULL
				)
		GROUP BY report_date
			,siteid
		
		UNION ALL
		
		SELECT 'app' product
			,report_date
			,siteid
			,sum(total_requests) pageviews
			,sum(total_impressions) impressions
			,sum(total_clicks) clicks
			,sum(total_xpath_miss) xpath_miss
		FROM AdpushupHourlySiteReport
		WHERE report_date BETWEEN @fromDate
				AND @toDate
			AND (
				(siteid = @siteId)
				OR @siteId IS NULL
				)
		GROUP BY report_date
			,siteid
		ORDER BY product
			,report_date
			,siteid
	END
END

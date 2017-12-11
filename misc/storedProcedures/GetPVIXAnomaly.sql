USE [central-sql]
GO
/****** Object:  StoredProcedure [dbo].[GetPVIXAnomaly]    Script Date: 11/12/2017 2:28:47 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[GetPVIXAnomaly] @weekStartDate DATE
	,@weekEndDate DATE
	,@yesterDayDate DATE
	,@codeRemovedThreshold INT
	,@pageViewThreshold INT
	,@pageViewMinThreshold INT
	,@impressionThreshold INT
	,@impressionMinThreshold INT
	,@xpathMissThreshold INT
	,@xpathMissMinThreshold INT
AS
BEGIN
	IF NOT EXISTS (
			SELECT *
			FROM sysobjects
			WHERE NAME = 'tempGetPVIXAnomalySiteTable'
				AND xtype = 'U'
			)
		CREATE TABLE tempGetPVIXAnomalySiteTable (siteId INT);
	ELSE
		TRUNCATE TABLE tempGetPVIXAnomalySiteTable;

	INSERT INTO tempGetPVIXAnomalySiteTable (siteId)
	SELECT siteid
	FROM ApexHourlySiteReport
	WHERE mode = 1
	GROUP BY siteid
	HAVING min(report_date) <= @weekStartDate;

	SELECT a.siteid 'siteId'
		,c.NAME 'siteName'
		,a.pageViews weekPageViews
		,a.impressions weekImpressions
		,a.xpathMiss * 100.00 / (a.xpathMiss + a.impressions) weekXpathMiss
		,b.pageViews yesterdayPageViews
		,b.impressions yesterdayImpressions
		,b.xpathMiss * 100.00 / (b.xpathMiss + b.impressions) yesterdayXpathMiss
		,CASE 
			WHEN (
					(b.pageViews IS NULL)
					OR (
						(b.pageViews < a.pageViews)
						AND ((a.pageViews - b.pageViews) > (a.pageViews * @codeRemovedThreshold / 100))
						)
					)
				THEN 'CodeRemoved'
			WHEN (
					(
						(b.pageViews < a.pageViews)
						AND ((a.pageViews - b.pageViews) > (a.pageViews * @pageViewThreshold / 100))
						)
					)
				THEN 'PageViewDrop'
			WHEN (
					(b.impressions IS NULL)
					OR (
						(b.impressions < a.impressions)
						AND ((a.impressions - b.impressions) > (a.impressions * @impressionThreshold / 100))
						)
					)
				THEN 'ImpressionDrop'
			WHEN (
					(b.xpathMiss IS NOT NULL)
					AND (((b.xpathMiss * 1.0 / (b.xpathMiss + b.impressions)) - (a.xpathMiss * 1.0 / (a.xpathMiss + a.impressions))) > ((a.xpathMiss * 1.0 / (a.xpathMiss + a.impressions)) * @xpathMissThreshold / 100))
					)
				THEN 'XpathIncrease'
			ELSE 'NoReason'
			END AS 'reason'
	FROM (
		SELECT a.siteId
			,avg(a.pageViews) pageViews
			,avg(a.impressions) impressions
			,avg(a.xpathMiss) xpathMiss
		FROM (
			SELECT report_date
				,siteId
				,sum(total_requests) pageViews
				,sum(total_impressions) impressions
				,sum(total_xpath_miss) xpathMiss
			FROM ApexHourlySiteReport
			WHERE report_date BETWEEN @weekStartDate
					AND @weekEndDate
				AND siteid IN (
					SELECT siteId
					FROM tempGetPVIXAnomalySiteTable
					)
				AND mode = 1
			GROUP BY report_date
				,siteId
			) a
		GROUP BY a.siteId
		HAVING avg(pageViews) >= @pageViewMinThreshold
			AND avg(impressions) >= @impressionMinThreshold
		) a
	LEFT JOIN (
		SELECT siteId
			,sum(total_requests) pageViews
			,sum(total_impressions) impressions
			,sum(total_xpath_miss) xpathMiss
		FROM ApexHourlySiteReport
		WHERE report_date = @yesterDayDate
			AND siteid IN (
				SELECT siteId
				FROM tempGetPVIXAnomalySiteTable
				)
			AND mode = 1
		GROUP BY report_date
			,siteId
		) b ON a.siteid = b.siteid
	LEFT JOIN site c ON a.siteid = c.siteid
	WHERE (
			(b.pageViews IS NULL)
			OR (
				(b.pageViews < a.pageViews)
				AND ((a.pageViews - b.pageViews) > (a.pageViews * @pageViewThreshold / 100))
				)
			)
		OR (
			(b.impressions IS NULL)
			OR (
				(b.impressions < a.impressions)
				AND ((a.impressions - b.impressions) > (a.impressions * @impressionThreshold / 100))
				)
			)
		OR (
			(b.xpathMiss IS NOT NULL)
			AND (((b.xpathMiss * 1.0 / (b.xpathMiss + b.impressions)) - (a.xpathMiss * 1.0 / (a.xpathMiss + a.impressions))) > ((a.xpathMiss * 1.0 / (a.xpathMiss + a.impressions)) * @xpathMissThreshold / 100))
			)
	ORDER BY c.NAME
		,a.siteid;

	DROP TABLE tempGetPVIXAnomalySiteTable;
END

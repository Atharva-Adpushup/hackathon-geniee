USE [central-sql]
GO
/****** Object:  StoredProcedure [dbo].[GetCpmAnomaly]    Script Date: 11/12/2017 2:27:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[GetCpmAnomaly] @weekStartDate DATE
	,@weekEndDate DATE
	,@yesterDayDate DATE
	,@pageViewMinThreshold INT
	,@cpmThreshold INT
	,@cpmMinValueThreshold INT
AS
BEGIN
	IF NOT EXISTS (
			SELECT *
			FROM sysobjects
			WHERE NAME = 'tempGetCpmAnomalySiteTable'
				AND xtype = 'U'
			)
		CREATE TABLE tempGetCpmAnomalySiteTable (siteId INT);
	ELSE
		TRUNCATE TABLE tempGetCpmAnomalySiteTable;

	INSERT INTO tempGetCpmAnomalySiteTable (siteId)
	SELECT siteid
	FROM AdpTagReport
	GROUP BY siteid
	HAVING min(report_date) <= @weekStartDate;

	DELETE
	FROM tempGetCpmAnomalySiteTable
	WHERE siteid IN (
			SELECT siteid
			FROM (
				SELECT report_date
					,siteid
					,sum(total_requests) page_views
				FROM ApexHourlySiteReport
				WHERE report_date BETWEEN @weekStartDate
						AND @weekEndDate
				GROUP BY report_date
					,siteid
				) a
			GROUP BY siteid
			HAVING avg(page_views) < @pageViewMinThreshold
			);

	SELECT c.NAME 'siteName'
		,a.siteid 'siteId'
		,a.cpm 'oldValue'
		,b.cpm 'newValue'
		,'CpmDrop' reason
	FROM (
		SELECT siteid
			,avg(a.cpm) cpm
		FROM (
			SELECT report_date
				,siteid
				,(sum(total_revenue) * 1000) / sum(total_impressions) cpm
			FROM AdpTagReport
			WHERE report_date BETWEEN @weekStartDate
					AND @weekEndDate
				AND siteid IN (
					SELECT siteId
					FROM tempGetCpmAnomalySiteTable
					)
			GROUP BY report_date
				,siteid
			HAVING sum(total_impressions) > 0
			) a
		GROUP BY siteid
		HAVING avg(a.cpm) >= @cpmMinValueThreshold
		) a
	LEFT JOIN (
		SELECT siteid
			,(sum(total_revenue) * 1000) / sum(total_impressions) cpm
		FROM AdpTagReport
		WHERE report_date = @yesterDayDate
			AND siteid IN (
				SELECT siteId
				FROM tempGetCpmAnomalySiteTable
				)
		GROUP BY siteid
		HAVING sum(total_impressions) > 0
		) b ON a.siteid = b.siteid
	LEFT JOIN site c ON a.siteid = c.siteid
	WHERE (
			(b.cpm < a.cpm)
			AND ((a.cpm - b.cpm) > a.cpm * @cpmThreshold / 100)
			)
	ORDER BY siteid;

	DROP TABLE tempGetCpmAnomalySiteTable;
END

USE [central-sql]
GO
/****** Object:  StoredProcedure [dbo].[GetDMAnomaly]    Script Date: 11/12/2017 2:28:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[GetDMAnomaly] @weekStartDate DATE
	,@weekEndDate DATE
	,@yesterDayDate DATE
	,@pageViewMinThreshold INT
	,@determinedModeThreshold INT
	,@determinedModeMinThreshold INT
AS
BEGIN
	

	IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tempGetDMAnomalySiteTable' and xtype='U')
    CREATE TABLE tempGetDMAnomalySiteTable (siteId INT);
	ELSE
	TRUNCATE TABLE tempGetDMAnomalySiteTable;

	INSERT INTO tempGetDMAnomalySiteTable (siteId)
	SELECT siteid
	FROM ApexHourlySiteReport
	WHERE mode = 1
	GROUP BY siteid
	HAVING min(report_date) <= @weekStartDate;


	DELETE
	FROM tempGetDMAnomalySiteTable
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


	SELECT c.name 'siteName'
	  ,a.siteid 'siteId'
	  ,a.modeCount 'oldValue'
	  ,b.modeCount 'newValue'
	  ,'DeterminedModeIncrease' reason
FROM (
SELECT siteid,avg(modeCount) modeCount
FROM (
	SELECT report_date
		,siteid
		,count(*) modeCount
	FROM ApexHourlySiteReport
	WHERE report_date BETWEEN  @weekStartDate AND @weekEndDate
		AND mode = 3
		AND siteid IN (SELECT siteId FROM tempGetDMAnomalySiteTable)
	GROUP BY report_date,siteid
	HAVING count(*) > @determinedModeMinThreshold
	) a
GROUP BY siteid) a
LEFT JOIN (
SELECT siteid
	,count(*) modeCount
FROM ApexHourlySiteReport
WHERE report_date = @yesterDayDate AND mode = 3
AND siteid IN (SELECT siteId FROM tempGetDMAnomalySiteTable)
GROUP BY siteid
) b ON a.siteid = b.siteid
LEFT JOIN site c ON a.siteid = c.siteid
WHERE ((b.modeCount IS NOT NULL) AND (b.modeCount > a.modecount) AND ((b.modeCount - a.modeCount) > b.modeCount * @determinedModeThreshold/100))

END

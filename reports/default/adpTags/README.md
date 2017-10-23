
SQL Reporting
===================

This module is used for **Console In-Editor** and **User Panel** reporting generation. You can use this module to generate query and fetch data for various levels.

## API
--------

### generate(parameters)
Generates query based on parameters and returns data from SQL Server.

**Example:**

- Site level | Group by Pagegroup
```
select: ['total_xpath_miss', 'total_revenue', 'total_impressions', 'report_date', 'siteid'],
where: {
	siteid: 28822
},
groupBy: ['pagegroup']
```

- Pagegroup level | Group by Variation
```
select: ['total_xpath_miss', 'total_revenue', 'total_impressions', 'report_date', 'siteid'],
where: {
	siteid: 28822,
	pagegroup: ['MIC']
},
groupBy: ['variation']
```
- Variation level | Group by Section
```
select: ['total_xpath_miss', 'total_revenue', 'total_impressions', 'report_date', 'siteid'],
where: {
	siteid: 28822,
	pagegroup: ['MIC'],
	variation: ['18ff8e93-77d6-4230-9cd3-7b6d87025ae4']
},
groupBy: ['section']
orderBy: ['report_date']
```

#### Parameters

**select**  {array} | **required**

- total_xpath_miss
- total_revenue 
- total_impressions
- report_date | **required**
- siteid | **required**
- device_type
- ntwid

**where** {object} | **required**

If date range is missing then by default last 7 days data is returned 

- siteid | **required**
- from
- to
- pagegroup {array}
- variation {array}
- section {array}
- device_type
- ntwid

**groupBy** {array}

Any value in **groupBy** should exist in **select** array 

- siteid
- report_date
- pagegroup
- variation
- section
- device_type
- ntwid

**orderBy** {array}

Any value in **orderBy** should exist in **select** array 

- siteid
- report_date
- pagegroup
- variation
- section
- device_type
- ntwid

### getPVS(siteid, type)

Returns **pagegroups** or **variations** or **sections** of a particular site.

**siteid**

Id of the site in the database 

**type**

Type of information required i.e.

Type     | Mapping
-------- | ---
1 | Pagegroup
2    | Variation
3     | Section
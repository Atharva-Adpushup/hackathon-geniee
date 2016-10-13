var url = '/ops/data/incontentSections';
function onClick(button) {
	var siteId = $('#siteId').val(),
		platformStart, platformEnd, pageGroupStart, pageGroupEnd, requestData, data,
		pageGroup = $('#pageGroupSelect').val(),
		platform = $('#platformSelect').val(),
		outputUrls = $('#outputURLs').is(':checked'),
		groupLevel = 5;
	if (outputUrls) {
		groupLevel = -1;
	}

	if (siteId === '') {
		alert('siteId should be set');
		return;
	}
	if (pageGroup === null || pageGroup === '') {
		alert('pageGroup is empty.. wait for it to be filled or enter valid siteId');
		return;
	}

	siteId = parseInt(siteId, 10);

	platformStart = platform; platformEnd = platform;
	pageGroupStart = pageGroup; pageGroupEnd = pageGroup;
	if (platform === 'ALL') { platformStart = ''; platformEnd = []; }
	if (pageGroup === 'ALL') { pageGroupStart = ''; pageGroupEnd = []; }

	requestData = {
		options: {
			range: { start: [siteId, pageGroupStart, platformStart, null, null, null], end: [siteId, pageGroupEnd, platformEnd, [], [], []], inclusive_end: true },
			groupLevel: groupLevel,
			reduce: true,
			limit: 999999
		}
	};

	if (groupLevel === -1) {
		requestData = {
			options: {
				range: { start: [siteId, pageGroupStart, platformStart, null, null, null], end: [siteId, pageGroupEnd, platformEnd, [], [], []], inclusive_end: true },
				reduce: false,
				limit: 999999
			}
		};
	}

	data = {
		data: JSON.stringify(requestData)
	};
	makeAjaxRequest(data, url, function(receivedData) { fillTable(receivedData); });
}



function fillTable(receivedData) {
	if (receivedData.response_type === 'good') {
		// console.log(JSON.stringify(receivedData));

		var rows = receivedData.msg;

		if (rows.length > 0) {
			var firstRow = rows[0].key;
			var resultInfoStr = 'Incontent Sections for SiteId : <strong>' + firstRow[0] + '</strong>';
			var resultInfoElement = document.createElement('p');
			$(resultInfoElement).html(resultInfoStr).addClass('smallFont');

			var table = null;

			console.log(JSON.stringify(firstRow));

			if (firstRow.length == 5) // no url to display
			{
				table = createTableWithHeaders(['PageGroup', 'Platform', 'Incontent Section Count', 'AA retries', 'url count']);
			}
			else if (firstRow.length == 7) // url and urlmap to display
			{
				table = createTableWithHeaders(['PageGroup', 'Platform', 'Incontent Section Count', 'AA retries', 'url', 'urlm_id', 'AA dates']);
			}

			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var key = row.key;
				var value = row.value;

				var tr = document.createElement('tr');

				var td1 = document.createElement('td');
				var td2 = document.createElement('td');
				var td3 = document.createElement('td');
				var td4 = document.createElement('td');
				var td5 = document.createElement('td');



				td1.innerHTML = key[1];
				td2.innerHTML = key[2];
				td3.innerHTML = key[3];
				td4.innerHTML = key[4]; // AA retries

				if (firstRow.length == 5) // no url to display
				{
					td5.innerHTML = value;
					$(tr).append(td1, td2, td3, td4, td5);
				}
				else {
					td5.innerHTML = key[5];

					var td6 = document.createElement('td'); // used in case of urlm
					td6.innerHTML = key[6];

					var td7 = document.createElement('td'); // the auto_analysis_value
					td7.innerHTML = getPrintableFromAutoAnalysisObj(value.autoAnalysis); // JSON.stringify(value.auto_analysis);

					$(tr).append(td1, td2, td3, td4, td5, td6, td7);
				}

				$(table).append(tr);

			}


			$(table).addClass('collapsedTable borderedTable paddedTable smallFont');
			$('#result').html(resultInfoElement).append(table);

			$(table).attr('id', 'table');
			$(table).addClass('display');

			$('#table').dataTable({
				paging: false,
				searching: true
			});

		}
		else {
			$('#result').html('<p>Nothing to show</p>');
		}
	}
	else {
		console.log(receivedData.msg);
	}

}

function getPrintableFromAutoAnalysisObj(obj) {
	var lastTried = obj.lastTried;
	var dateAnalyzed = obj.dateAnalyzed;
	var breakable = false;
	var str = '';
	if (lastTried != null) {
		var lastTriedDate = new Date(lastTried);
		str += 'lastTried : ' + lastTriedDate.toUTCString();
		breakable = true;
	}
	if (dateAnalyzed != null) {
		if (breakable) {
			str += '<br>';
		}
		var dateAnalyzedDate = new Date(dateAnalyzed);
		str += 'dateAnalyzed : ' + dateAnalyzedDate.toUTCString();

	}
	return str;
}

/* function populatePageGroupStart(excludeAll)  //works for both incontent and structured views since first 3 group elements are same
{
	var siteId = $('#siteId').val();
	if(siteId == '')
	{
		return;
	}
	siteId = parseInt(siteId);

	var requestData = {
			options:{
				range:{start:[siteId,null,null] , end:[siteId,[],[] ], inclusive_end:true},
				group_level:3,
				reduce:true,
				limit:1000
			}
		}

	var data = {
		action:action,
		data: JSON.stringify(requestData)
	}

	makeAjaxRequest(data, function(receivedData){ populatePageGroupEnd(receivedData, excludeAll) });
}

function populatePageGroupEnd(receivedData, excludeAll)
{
	if(receivedData.response_type === 'good')
	{

		var allPageGroupOption = document.createElement('option'); allPageGroupOption.value = "ALL"; allPageGroupOption.innerHTML = "ALL";

		var pageGroupArr = [];

		var rows = receivedData.msg.rows;

		for(var i=0; i<rows.length; i++)
		{
			var row = rows[i];
			var pageGroup = row.key[1];

			if(pageGroupArr.indexOf(pageGroup) < 0)
			{
				pageGroupArr.push(pageGroup);
				//console.log(pageGroup);
			}
		}

		if(!excludeAll)
			$('#pageGroupSelect').html(allPageGroupOption);

		for(var i=0; i<pageGroupArr.length; i++)
		{
			var option = document.createElement('option'); option.value=pageGroupArr[i]; option.innerHTML = pageGroupArr[i];
			$('#pageGroupSelect').append(option);

		}
	}

}*/

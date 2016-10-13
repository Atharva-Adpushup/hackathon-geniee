function makeAjaxRequest(data, url, onSuccess, onError)
{
	var dataToSend = { 'data' : JSON.stringify(data) };

	var onErrorDefaultFunc = function(e){
		console.log(e);
	}
	
	$.ajax({
		type:'POST',
		url: url,
		data: dataToSend,		
		success:onSuccess,
		error: (onError)? onError : onErrorDefaultFunc
	});
}

function makeAjaxRequestWithPromises(data, url, done, fail, always)
{
	var dataToSend = { 'data' : JSON.stringify(data) }

	var promise = $.ajax(
		{
			type : 'POST', 
			url : url,
			data : dataToSend
		}
		);

	if(typeof done == 'function')
	{
		promise.done(done);
	}
	if(typeof fail == 'function')
	{
		promise.fail(fail);
	}
	if(typeof always == 'function')
	{
		promise.always(always);
	}

	return promise;
}

function populatePageGroupStart(excludeAll){
	var urlToGetPageGroups = '/ops/data/getAutoAnalysisPageGroups'

	var siteId = $('#siteId').val();	
	if(siteId == '')
	{		
		return;
	}
	siteId = parseInt(siteId);

	$('#pageGroupSelect').html(''); // emptying it

	var requestData = {
		siteId : siteId
	}

	makeAjaxRequest( requestData, urlToGetPageGroups, function(receivedData){ populatePageGroupEnd(receivedData, excludeAll) } );
}

function populatePageGroupEnd(receivedData, excludeAll)
{
	if(receivedData.response_type === 'good')
	{
		var allPageGroupOption = document.createElement('option'); allPageGroupOption.value = "ALL"; allPageGroupOption.innerHTML = "ALL";
	
		var pageGroupArr = [];

		var rows = receivedData.msg;

		for(var i=0; i<rows.length; i++)
		{
			var row = rows[i];
			var pageGroup = row.key[1];
			
			if(pageGroupArr.indexOf(pageGroup) < 0)
			{
				pageGroupArr.push(pageGroup);				
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
	else
	{
		console.log(receivedData.msg);
	}
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    
}

function createTableWithHeaders(headers)
{
	var table = document.createElement('table');

	var thead = document.createElement('thead');

	var tr = document.createElement('tr');

	for(var i=0; i<headers.length; i++)
	{
		var header = headers[i];

		var th = document.createElement('th');

		th.innerHTML = header;

		tr.appendChild(th);
	}

	thead.appendChild(tr);
	table.appendChild(thead);

	return table;

}
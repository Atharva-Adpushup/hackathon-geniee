window.$ = require('./jquery.js');
window.jsonify = require('./jsonify.js');
window.filterHandler = require('./FilterHandler.js');
window.aggrHandler = require('./AggrHandler.js');
window.miscHandler = require('./MiscHandler.js');
window.uiHandler = require('./UIHandler.js');

var searchUIeditor = null;
var searchResultEditor = null;

var sourceMode = false;

var init = function(){

	window.NOT_SET = 'not_set';

	uiHandler.init();

	setStuff();

}

var search = function(){
	var indexName = $('#indexName').val();
	var docType = $('#docType').val();

	if(isEmpty(indexName))
	{
		alert("index name can't be empty");
		return;
	}

	$('#buttonSearch').prop('disabled', true);

	var searchQuery = '';
	if(sourceMode === true)
	{
		searchQuery = searchUIeditor.getText();
	}
	else
	{
		searchQuery = JSON.stringify(getSearchQueryFromJsonify());
	}

	var dataToSend = {index:indexName, docType:docType, searchQuery:searchQuery};

	var promise = $.ajax({
		type: "POST",      
		url: "/ops/data/elasticsearchSearcher",
		data: {data : JSON.stringify(dataToSend)}
	});

	promise.done(function(receivedData){
		if(receivedData.success === true)
		{
			if(receivedData.data)
			{
				var resultJson = receivedData.data;
				searchResultEditor.set(resultJson);
			}
		}
		else
		{
			alert( JSON.stringify(receivedData) );
		}
	});

	promise.fail(function(e){
		alert('failure : ' + JSON.stringify(e));
	});			

	promise.always(function(){
		$('#buttonSearch').prop('disabled', false);
	});

}

function setStuff()
{
	window.getValueFromInput = function(inputField)
	{
		var value = $(inputField).val();
		var toReturn = NOT_SET;

		if(value.length > 0)
		{
			
			if(!isNaN(value))  // if number
			{
				toReturn = Number(value);
			}
			else
			{
				if(value == 'true')
				{
					toReturn = true;
				}
				else if(value == 'false')
				{
					toReturn = false;
				}
				else
				{
					if(value.length > 2 && value.charAt(0) == value.charAt(value.length-1) && (value.charAt(0) == "'" || value.charAt(0) == '"') )
					{
						toReturn = value.substring(1,value.length-1);
					}
					else{
						toReturn = value;	
					}					
				}
			}
		}

		return toReturn;
	}




	var switchToSourceButton = document.getElementById('switchToSourceButton');
	$(switchToSourceButton).click(function(){
		if(confirm('This operation is irreversible as of now, confirm?'))
		{
			$('#searchUI').hide();
			$('#searchSourceContainer').show();
			$('#switchToSourceButton').hide();

			searchUIeditor.set(getSearchQueryFromJsonify());

			sourceMode = true;

		}
	});

	$('#buttonSearch').click(search);


	$('#searchSourceContainer').hide();

	var searchUI = document.getElementById('searchSource');
	var searchResults = document.getElementById('searchResults');

	searchUIeditor = new JSONEditor(searchUI, {mode: 'code'});
	searchResultEditor = new JSONEditor(searchResults, {mode: 'view', modes: ['code', 'view']});

}

window.onload = function(){
	
	init();
		
}


window.getSearchQueryFromJsonify = function()
{
	var f = filterHandler.resolve();
	var a = aggrHandler.resolve();
	var m = miscHandler.resolve();

	return $.extend(true, {}, f, a, m);
}

function isEmpty(val)
{
	if(val == null || val == '')
	{
		return true;
	}
	return false;
}

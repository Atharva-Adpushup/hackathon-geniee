var AggrHandler = function(){

	var AGGR_MAIN = 'aggrMain';
	var AGGR_PREFIX = 'aggr';
	var AGGR_START = 'aggrStart';
	var ID_AGGR_SELECT_DIALOG = 'id_aggr_select_dialog';
	var ID_ADD_AGGR_BUTTON_MAIN = 'id_add_aggr_button_main';

	var FIELD = 'field';
	var VALUE = 'value';
	

	var uuid = 0;

	var aggrMainJson = null;

	var getId = function()
	{
		uuid++;
		return AGGR_PREFIX + uuid;
	}

	var showAggrSelectDialog = function(){
		uiHandler.showDialog(ID_AGGR_SELECT_DIALOG);
	}

	var createAggrSelectDialog = function(){
		var d = document.createElement('div');
		
		$(d).addClass('centered blob');
		$(d).css('max-width', '20em');


		var p = uiHandler.createParaUI('select aggregation : ');

		var aggrButtons = [];
		for(a in AGGR_TYPES)
		{
			var b = createAggrSelectButton(a);
			$(b).css('margin', '0.2em');
			aggrButtons.push(b);			
		}

		var cancelButton = uiHandler.createButtonUI('cancel', uiHandler.hideDialog);

		$(d).append(p);
		$(d).append(aggrButtons);	
		$(d).append(uiHandler.createBrUI(), uiHandler.createBrUI(), cancelButton);

		d.id = ID_AGGR_SELECT_DIALOG;

		$('#dialogContainer').append(d);
	}

	var createAggrSelectButton = function(aggrName)
	{
		var button = uiHandler.createButtonUI(aggrName, function(){uiHandler.callOnDialogSuccessCallback(aggrName)});
		return button;
	}


	//general aggregation add event handler
	var onAggrAdded = function(node, parentNodeStr)
	{
		/*if(parentNodeStr === AGGR_MAIN)
		{
			$('#' + ID_ADD_AGGR_BUTTON_MAIN).hide();
		}*/
	}

	//general aggregation delete event handler
	var onAggrDeleted = function(node, parentNodeStr)
	{
		/*if(parentNodeStr === AGGR_MAIN)
		{
			$('#' + ID_ADD_AGGR_BUTTON_MAIN).show();
		}*/
	}

	var createAddAggrButton = function(parentNodeStr)
	{
		var onDialogSuccess = function(aggrSelectedStr)
		{
			var a = AGGR_TYPES[aggrSelectedStr].create(parentNodeStr, aggrSelectedStr);

			onAggrAdded(a.json, parentNodeStr);

			uiHandler.hideDialog();
		}

		var addAggrButton = uiHandler.createButtonUI('+ add aggr', function(){showAggrSelectDialog(); uiHandler.setOnDialogSuccessCallback(onDialogSuccess);});
		
		return addAggrButton;
	}

	var createAggrMain = function(){

		var aggrMain = document.createElement('div');
		aggrMain.id = AGGR_MAIN;
		aggrMainJson = jsonify.getNewNode();
		jsonify.addNode(AGGR_MAIN, aggrMainJson, null);

		var label = uiHandler.createParaUI('aggregations : ');
		var aggrStart = document.createElement('div');

		var br1 = uiHandler.createBrUI();

		var addAggrButton = createAddAggrButton(AGGR_MAIN);
		addAggrButton.id = ID_ADD_AGGR_BUTTON_MAIN;

		$(aggrStart).append(label, aggrMain, br1, addAggrButton);
		$('#searchUI').append(aggrStart);

		aggrMainJson.resolve = function(){
			var aggrObj = {};

			var children = aggrMainJson.children;
			for(var i=0; i<children.length; i++)
			{
				var childStr = children[i];
				var childNode = jsonify.getNode(childStr);				

				$.extend(true, aggrObj, childNode.resolve());
			}
			var json = {aggs : aggrObj };
			return json;
		}

		return aggrMainJson;
	}


	var createFilterAggr = function(parentNodeStr, aggrName)
	{
		var filterAggr = aggrMaker(parentNodeStr, aggrName);	

		var filterDiv = document.createElement('div');
		filterDiv.id = 'filter_div_' + filterAggr.id;	

		var filterStartNode = jsonify.getNewNode();
		jsonify.addNode(filterDiv.id, filterStartNode, null);

		var onFilterAdded = function(){
			$(filterAggr.selectFilterButton).hide();
		};

		var onFilterDeleted = function(){
			$(filterAggr.selectFilterButton).show();
			filterAggr.filter = null;
		};

		var onDialogSuccess = function(filterSelectedStr)
		{
			filterAggr.filter = filterHandler.addFilter(filterDiv.id, filterSelectedStr, onFilterAdded, onFilterDeleted);			
			uiHandler.hideDialog();
		}

		var selectFilterButton = uiHandler.createButtonUI('select filter', function(){filterHandler.showFilterSelectDialog(); uiHandler.setOnDialogSuccessCallback(onDialogSuccess);});

		filterAggr.addElements([selectFilterButton, filterDiv, uiHandler.createBrUI()]);  
		filterAggr.selectFilterButton = selectFilterButton; //for future ref

		filterAggr.json.resolveCustom = function(){
			var body = null;
			if(filterAggr.filter != null)
			{
				body = filterAggr.filter.json.resolve();
			}

			var toReturn = {};
			toReturn[aggrName] = body;
			return toReturn;
		}

		filterAggr.json.onDeleteCustom = function(){			
			jsonify.deleteNode(filterDiv.id);
		}

		return filterAggr;
	}

	var createTermsAggr = function(parentNodeStr, aggrName)
	{
		var termsAggr = aggrMaker(parentNodeStr, aggrName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var inputField = uiHandler.createInputTextUI('field value', null);

		var sizeLabel = uiHandler.createLabelUI('size : ');
		var sizeInput = uiHandler.createInputTextUI('10', null);

		termsAggr.addElements([fieldLabel, inputField , uiHandler.createBrUI(), sizeLabel, sizeInput, uiHandler.createBrUI() ]);

		termsAggr.json.resolveCustom = function(){
			var body = {field : getValueFromInput(inputField)};
			var sizeDefault = 10;
			var sizeIn = getValueFromInput(sizeInput);	
			if(!isNaN(sizeIn))
			{
				sizeDefault = sizeIn;
			}	

			body.size = sizeDefault;

			var toReturn = {};
			toReturn[aggrName] = body;
			return toReturn;
		}

		return termsAggr;
		
	}

	var createDateHistogramAggr = function(parentNodeStr, aggrName)
	{
		var dateHistogramAggr = aggrMaker(parentNodeStr, aggrName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var inputField = uiHandler.createInputTextUI('', null);

		var intervalLabel = uiHandler.createLabelUI('interval : ');
		var inputInterval = uiHandler.createInputTextUI('"1d", "1w"', null);

		var formatLabel = uiHandler.createLabelUI('format : ');
		var inputFormat = uiHandler.createInputTextUI('(optional)', null);

		dateHistogramAggr.addElements([
		fieldLabel, inputField, uiHandler.createBrUI(), 
		intervalLabel, inputInterval, uiHandler.createBrUI(),
		formatLabel, inputFormat, uiHandler.createBrUI()
		]);

		dateHistogramAggr.json.resolveCustom = function(){			
			var body = {field : $(inputField).val(), interval : getValueFromInput(inputInterval)};
			var toReturn = {};
			if($(inputFormat).val() != '')
			{
				body.format = $(inputFormat).val();
			}
			toReturn[aggrName] = body;
			return toReturn;
		}

		return dateHistogramAggr;
	}

	var createHistogramAggr = function(parentNodeStr, aggrName)
	{
		var histogramAggr = aggrMaker(parentNodeStr, aggrName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var inputField = uiHandler.createInputTextUI('', null);

		var intervalLabel = uiHandler.createLabelUI('interval : ');
		var inputInterval = uiHandler.createInputTextUI('', null);

		histogramAggr.addElements([
			fieldLabel, inputField, uiHandler.createBrUI(), intervalLabel, inputInterval, uiHandler.createBrUI()
		]);

		histogramAggr.json.resolveCustom = function(){
			var body = {field : $(inputField).val(), interval : getValueFromInput(inputInterval)};

			var toReturn = {};

			toReturn[aggrName] = body;
			return toReturn;
		}

		return histogramAggr;
	}

	var createNestedAggr = function(parentNodeStr, aggrName)
	{
		var nestedAggr = aggrMaker(parentNodeStr, aggrName);

		var pathLabel = uiHandler.createLabelUI('path : ');
		var pathInput = uiHandler.createInputTextUI('', null);

		nestedAggr.addElements([
			pathLabel, pathInput, uiHandler.createBrUI()
		]);

		nestedAggr.json.resolveCustom = function(){
			var body = {path : $(pathInput).val()};

			var toReturn = {};

			toReturn[aggrName] = body;
			return toReturn;
		}
		return nestedAggr;
	}

	var aggrMaker = function(parentNodeStr, aggrName)
	{
		var a = {};

		a.id = getId();

		a.parentNodeStr = parentNodeStr;
		a.aggrName = aggrName;

		a.json = jsonify.getNewNodeAndAdd(a.id, parentNodeStr);

		a.json.onDeleteCustom = function(){}; //implement per aggregation basis
		a.json.resolveCustom = function(){}; //implement per aggregation basis

		var dom = document.createElement('div');
		dom.id = a.id;

		var normalBgColor = '#eee';
		var mouseInBgColor = uiHandler.getNiceColor();

		$(dom).hover(function(){$(dom).css('background-color', mouseInBgColor);}, function(){$(dom).css('background-color', normalBgColor);})

		var para = uiHandler.createParaUI(aggrName + ' aggr : ');
		var deleteAggrButton = uiHandler.createButtonUI('- delete aggr', function(){
			if(confirm('confirm delete?')){
				a.json.onDelete();
				removeAggr(a.id);
				onAggrDeleted(a.id,parentNodeStr);
			}
		});

		var addSubAggrButton = createAddAggrButton(a.id);

		var inputField = uiHandler.createInputTextUI('aggr name (optional)', null);

		var insertAfterMeBr = uiHandler.createBrUI();

		$(dom).append(para, inputField, uiHandler.createBrUI(), insertAfterMeBr , uiHandler.createBrUI(), deleteAggrButton, uiHandler.createBrUI(), uiHandler.createBrUI(), addSubAggrButton, uiHandler.createBrUI(), uiHandler.createBrUI());

		a.addElements = function(elements)
		{
			$(elements).insertAfter(insertAfterMeBr);
		}

		$('#' + parentNodeStr).append(dom);
		a.dom = dom;

		a.json.onDelete = function(){
			var subAggregationsJson = null;
			var subAggregations = jsonify.getChildList(a.id);

			if(subAggregations.length > 0)
			{
				for(var i=0; i<subAggregations.length; i++)
				{
					var subAggr = subAggregations[i];
					subAggr.onDelete();
				}	
			}

			a.json.onDeleteCustom();
		}

		a.json.resolve = function(){
			//resolve sub aggregations and prepare json

			var subAggregationsJson = null;
			var subAggregations = jsonify.getChildList(a.id);

			if(subAggregations.length > 0)
			{
				subAggregationsJson = {};

				for(var i=0; i<subAggregations.length; i++)
				{
					var subAggr = subAggregations[i];
					$.extend(true, subAggregationsJson, subAggr.resolve());
				}				
			}
			//merge the sub aggregations with custom resolve

			// return the json

			var mainResolve = a.json.resolveCustom();

			if(subAggregationsJson != null)
			{
				mainResolve.aggs = subAggregationsJson;
			}

			var aggrName = $(inputField).val();
			if(aggrName == '')
			{
				aggrName = a.id;
			}

			var returnable = {};
			returnable[aggrName] = mainResolve;
			return returnable;
		}

		return a;
	}

	var removeAggr = function(aggrStr)
	{
		$('#'+aggrStr).remove();
		jsonify.deleteNode(aggrStr);
	}


	my = {};

	var AGGR_TYPES = my.AGGR_TYPES = {
		terms : {
			create : createTermsAggr
		},
		date_histogram : {
			create : createDateHistogramAggr
		},
		histogram : {
			create : createHistogramAggr
		},
		filter : {
			create : createFilterAggr
		},
		nested : {
			create : createNestedAggr
		}
	}


	

	my.init = function(){

		aggrMainJson = createAggrMain();
		
		createAggrSelectDialog();
	}

	my.resolve = function(){
		return aggrMainJson.resolve();
	}


	return my;
}

module.exports = AggrHandler();
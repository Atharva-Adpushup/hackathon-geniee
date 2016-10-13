var FilterHandler = function(){
	
	var FILTER_MAIN = 'filterMain';
	var FILTER_PREFIX = 'filter';
	var FILTER_START = 'filterStart';
	var ID_FILTER_SELECT_DIALOG = 'id_filter_select_dialog';
	var ID_ADD_FILTER_BUTTON_MAIN = 'id_add_filter_button_main';

	var FIELD = 'field';
	var VALUE = 'value';
	

	var uuid = 0;

	

	var filterMainJson = null;

	var getId = function()
	{
		uuid++;
		return FILTER_PREFIX + uuid;
	}

	var showFilterSelectDialog = function(){
		uiHandler.showDialog(ID_FILTER_SELECT_DIALOG);
	}

	var createFilterSelectDialog = function(){
		var d = document.createElement('div');
		
		$(d).addClass('centered blob');
		$(d).css('max-width', '20em');


		var p = uiHandler.createParaUI('select filter : ');

		var filterButtons = [];
		for(f in FILTER_TYPES)
		{
			var b = createFilterSelectButton(f);
			$(b).css('margin', '0.2em');
			filterButtons.push(b);			
		}

		var cancelButton = uiHandler.createButtonUI('cancel', uiHandler.hideDialog);

		$(d).append(p);
		$(d).append(filterButtons);	
		$(d).append(uiHandler.createBrUI(), uiHandler.createBrUI(), cancelButton);

		d.id = ID_FILTER_SELECT_DIALOG;

		$('#dialogContainer').append(d);
	}

	var createFilterSelectButton = function(filterName)
	{
		var button = uiHandler.createButtonUI(filterName, function(){uiHandler.callOnDialogSuccessCallback(filterName)});
		return button;
	}

	//general filter add event handler
	var onFilterAdded = function(node, parentNodeStr)
	{
		if(parentNodeStr === FILTER_MAIN)
		{
			$('#' + ID_ADD_FILTER_BUTTON_MAIN).hide();
		}
	}

	//general filter delete event handler
	var onFilterDeleted = function(node, parentNodeStr)
	{
		if(parentNodeStr === FILTER_MAIN)
		{
			$('#' + ID_ADD_FILTER_BUTTON_MAIN).show();
		}
	}

	var createAddFilterButton = function(parentNodeStr)
	{
		var onDialogSuccess = function(filterSelectedStr)
		{
			addFilter(parentNodeStr, filterSelectedStr);

			uiHandler.hideDialog();
		}

		var addFilterButton = uiHandler.createButtonUI('+ add filter', function(){showFilterSelectDialog(); uiHandler.setOnDialogSuccessCallback(onDialogSuccess);});
		
		return addFilterButton;
	}

	var addFilter = function(parentNodeStr, filterSelectedStr)
	{
		var f = FILTER_TYPES[filterSelectedStr].create(parentNodeStr, filterSelectedStr);

		onFilterAdded(f.json, parentNodeStr);		
		return f;
	}

	var createFilterMain = function(){

		var filterMain = document.createElement('div');
		filterMain.id = FILTER_MAIN;

		filterMainJson = jsonify.getNewNode();
		jsonify.addNode(FILTER_MAIN, filterMainJson, null);

		
		var label = uiHandler.createParaUI('filter : ');
		var filterStart = document.createElement('div');
		//filterStart.id = FILTER_START;

		var br1 = uiHandler.createBrUI();

		var addFilterButton = createAddFilterButton(FILTER_MAIN);// uiHandler.createButtonUI('+ add filter', onAddFilterButtonClick);
		addFilterButton.id = ID_ADD_FILTER_BUTTON_MAIN;

		$(filterStart).append(label, filterMain, br1, addFilterButton);

		$('#searchUI').append(filterStart);

		filterMainJson.resolve = function(){			
			var filterObj = {};
			
			var children = filterMainJson.children;
			for(var i=0; i<children.length; i++)
			{
				var childStr = children[i];
				var childNode = jsonify.getNode(childStr);
				filterObj = childNode.resolve();
				break; //since only one filter in filter main
			}

			var json = {query : {filtered: {filter : filterObj }}};
			return json;
		}

		return filterMainJson;

	}

	


	var createTermFilter = function(parentNodeStr, filterName)
	{		
		var termFilter = filterMaker(parentNodeStr, filterName);

		var inputField = uiHandler.createInputTextUI('field', null);
		var colonLabel = uiHandler.createLabelUI(':');
		var inputVal = uiHandler.createInputTextUI('value', null);
		var br1 = uiHandler.createBrUI(); var br2 = uiHandler.createBrUI();

		termFilter.addElements([inputField,colonLabel,inputVal,br1,br2]);

		termFilter.json.resolve = function(){
			var inputFieldVal = $(inputField).val();
			var inputValVal = getValueFromInput(inputVal);//$(inputVal).val();
			
			var json = {};
			json[inputFieldVal] = inputValVal;
			return {term : json}; 
		}

		return termFilter;
	}

	var createTermsFilter = function(parentNodeStr, filterName)
	{
		var termsFilter = filterMaker(parentNodeStr, filterName);

		var inputField = uiHandler.createInputTextUI('field', null);
		var colonLabel = uiHandler.createLabelUI(':');
		var inputVal = uiHandler.createInputTextUI('values (comma separated)', null);

		termsFilter.addElements([
			inputField, colonLabel, inputVal, uiHandler.createBrUI(), uiHandler.createBrUI()
		]);

		termsFilter.json.resolve = function(){
			var inputFieldVal = $(inputField).val();
			var inputValVal = getValueFromInput(inputVal);

			var json = {};
			var valArr = inputValVal.split(',');
			for(var i=0; i<valArr.length; i++)
			{
				valArr[i] = $.trim(valArr[i]);
			}

			json[inputFieldVal] = valArr;
			return {terms : json};
		}

		return termsFilter;
	}

	var createExistsFilter = function(parentNodeStr, filterName)
	{
		var existsFilter = filterMaker(parentNodeStr, filterName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var inputFieldVal = uiHandler.createInputTextUI('field value',null);

		existsFilter.addElements([fieldLabel, inputFieldVal, uiHandler.createBrUI(), uiHandler.createBrUI()]);

		existsFilter.json.resolve = function(){
			var inputFieldValue = getValueFromInput(inputFieldVal);
			var json = {field : inputFieldValue};
			return {exists : json};
		}
		return existsFilter;
	}

	var createRangeFilter = function(parentNodeStr, filterName)
	{
		var rangeFilter = filterMaker(parentNodeStr, filterName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var fieldInput = uiHandler.createInputTextUI('', null);

		var gteLabel = uiHandler.createLabelUI('gte : ');
		var lteLabel = uiHandler.createLabelUI('lte : ');

		var gteInput = uiHandler.createInputTextUI('(optional)', null);
		var lteInput = uiHandler.createInputTextUI('(optional)', null);

		rangeFilter.addElements([
			fieldLabel, fieldInput, uiHandler.createBrUI(), uiHandler.createBrUI(),
			gteLabel, gteInput, uiHandler.createBrUI(),
		 	lteLabel, lteInput, uiHandler.createBrUI(), uiHandler.createBrUI()
		 	]);

		rangeFilter.json.resolve = function(){

			var gteVal = getValueFromInput(gteInput);
			var lteVal = getValueFromInput(lteInput);

			var r = {};

			if(gteVal !== NOT_SET)
			{
				r.gte = gteVal;
			}
			if(lteVal !== NOT_SET)
			{
				r.lte = lteVal;
			}

			var json = {};

			json[getValueFromInput(fieldInput)] = r;
			return {range : json};
		}

		return rangeFilter;
	}

	var createPrefixFilter = function(parentNodeStr, filterName)
	{
		var prefixFilter = filterMaker(parentNodeStr, filterName);

		var inputField = uiHandler.createInputTextUI('field', null );
		var colonLabel = uiHandler.createLabelUI(':');
		var inputPrefix = uiHandler.createInputTextUI('prefix str', null);

		prefixFilter.addElements([
			inputField, colonLabel, inputPrefix, uiHandler.createBrUI(), uiHandler.createBrUI()
		]);

		prefixFilter.json.resolve = function(){
			var inputFieldVal = $(inputField).val();
			var inputPrefixVal = $(inputPrefix).val();

			var json = {};
			json[inputFieldVal] = inputPrefixVal;

			return {prefix : json};
		}

		return prefixFilter;
	}

	var createScriptFilter = function(parentNodeStr, filterName)
	{
		var scriptFilter = filterMaker(parentNodeStr, filterName);

		var scriptLabel = uiHandler.createLabelUI('script : ');
		var scriptInput = uiHandler.createTextArea();

		scriptFilter.addElements([scriptLabel, uiHandler.createBrUI(), scriptInput, uiHandler.createBrUI()]);

		scriptFilter.json.resolve = function(){
			return {script : {script : $(scriptInput).val()}};
		}

		return scriptFilter;
	}

	var createRegexpFilter = function(parentNodeStr, filterName)
	{
		var regexpFilter = filterMaker(parentNodeStr, filterName);

		var fieldLabel = uiHandler.createLabelUI('field : ');
		var fieldInput = uiHandler.createInputTextUI('', null);
		var regexInput = uiHandler.createInputTextUI('enter regex here', null);

		regexpFilter.addElements([fieldLabel, fieldInput, uiHandler.createBrUI(), uiHandler.createBrUI(), regexInput, uiHandler.createBrUI(), uiHandler.createBrUI()]);

		regexpFilter.json.resolve = function(){
			var r = {};
			r[getValueFromInput(fieldInput)] = { value :  $(regexInput).val()};

			return {regexp : r};
		}

		return regexpFilter;
	}



	var createBoolFilter = function(parentNodeStr, filterName)
	{
		var boolFilter = filterMaker(parentNodeStr, filterName);

		var must = createBoolComponent('must', boolFilter.id);
		var should = createBoolComponent('should', boolFilter.id);
		var mustNot = createBoolComponent('must_not', boolFilter.id);

		boolFilter.addElements([must.div, should.div, mustNot.div]);

		boolFilter.json.onDelete = function(){
			var mustChildren = jsonify.getChildList(must.id);
			var shouldChildren = jsonify.getChildList(should.id);
			var mustNotChildren = jsonify.getChildList(mustNot.id);

			var children = mustChildren.concat(shouldChildren).concat(mustNotChildren);

			for(var i=0; i<children.length; i++)
			{
				var child = children[i];
				child.onDelete();
			}

			jsonify.deleteNode(must.id); jsonify.deleteNode(should.id); jsonify.deleteNode(mustNot.id);		
		}

		boolFilter.json.resolve = function(){
			return {bool : {must : must.json.resolve(), should : should.json.resolve(), must_not : mustNot.json.resolve()}}
		}


		return boolFilter;

	}

	var createBoolComponent = function(comp, filterId)
	{
		var compDiv = document.createElement('div');
		var compDivId = comp + '_' + filterId;	compDiv.id = compDivId;
		var addFilterButton = createAddFilterButton(compDivId);
		$(compDiv).append(uiHandler.createLabelUI(comp + ' : '), addFilterButton, uiHandler.createBrUI(), uiHandler.createBrUI());

		var compJson = jsonify.getNewNode();
		jsonify.addNode(compDivId,compJson,null);		
		
		compJson.resolve = function(){
			var compArr = jsonify.getChildList(compDivId);
			var json = [];
			for(var i=0; i<compArr.length; i++)
			{
				var node = compArr[i];
				json.push(node.resolve());
			}
			return json;
		}

		return {
			div : compDiv,
			json : compJson,
			id : compDivId
		}
	}

	var filterMaker = function(parentNodeStr, filterName)
	{
		var f = {};

		f.id = getId();
		

		f.parentNodeStr = parentNodeStr;
		f.filterName = filterName;
		
		f.json = jsonify.getNewNodeAndAdd(f.id, parentNodeStr);

		var dom = document.createElement('div'); 
		dom.id = f.id;
		//$(dom).addClass('hoverfilter');
		var normalBgColor = '#eee'
		var mouseInBgColor = uiHandler.getNiceColor();

		$(dom).hover(function(){$(dom).css('background-color', mouseInBgColor);}, function(){$(dom).css('background-color', normalBgColor);})

		var para = uiHandler.createParaUI(filterName + ' filter : ');
		var deleteFilterButton = uiHandler.createButtonUI('- delete filter', function(){
			if(confirm('confirm delete?')) {
				f.json.onDelete(); 
				removeFilter(f.id);
				onFilterDeleted(f.id,parentNodeStr);

				if(f.onDelete != null)  // used for aggr 
				{
					f.onDelete();
				}
			}
		});
		
		$(dom).append(para, deleteFilterButton, uiHandler.createBrUI());
		
		

		f.addElements = function(elements)
		{
			$(elements).insertAfter(dom.firstChild);
		}
		
		$('#' + parentNodeStr).append(dom);

		f.dom = dom;

		return f;
	}


	var removeFilter = function(filterStr)
	{
		$('#'+filterStr).remove();
		jsonify.deleteNode(filterStr);
	}


	var my = {};

	var FILTER_TYPES = my.FILTER_TYPES = {
		term : {
			create : createTermFilter
		},		
		terms : {
			create : createTermsFilter
		},
		exists :{
			create : createExistsFilter
		},
		bool : {
			create : createBoolFilter
		},
		range : {
			create : createRangeFilter
		},
		prefix : {
			create : createPrefixFilter
		},
		script : {
			create : createScriptFilter
		},
		regexp : {
			create : createRegexpFilter
		}

	}


	my.addFilter = function(parentNodeStr, filterSelectedStr, onFilterAdded, onFilterDeleted)
	{
		var f = FILTER_TYPES[filterSelectedStr].create(parentNodeStr, filterSelectedStr);

		f.onDelete = onFilterDeleted;

		onFilterAdded();
		return f;
	}

	my.showFilterSelectDialog = showFilterSelectDialog;

	my.init = function(){

		filterMainJson = createFilterMain();

		addFilter(FILTER_MAIN, 'bool');
		
		createFilterSelectDialog();
	}

	my.resolve = function(){
		return filterMainJson.resolve();
	}

	

	return my;



}

module.exports = FilterHandler();
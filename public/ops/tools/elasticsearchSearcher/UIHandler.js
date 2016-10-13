var UIHandler = function(){

	
	var ID_AGGR_SELECT_DIALOG = 'id_aggr_select_dialog';

	var niceColors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

	var onDialogSuccess = null;


	my = {};

	my.createFilterSelectDialog = function(){
		var div = document.createElement('div');
		$(div).addClass('blob');
		div.style.width = '100px';
		div.style.height = '100px';
		
		$(div).append(createLabelUI('yoyoyo'), createSpaceUI(10), createLabelUI('yaw bitch'), createBrUI());
		$(div).append(createButtonUI('yo', function(){alert('hello world!')}));

		$('#dialogContainer').append(div);


	}

	
	my.getNiceColor = function () {	  
		var r = parseInt(Math.random() * 50 + 205);
		var g = parseInt(Math.random() * 50 + 205);
		var b = parseInt(Math.random() * 50 + 205);
		var col = "rgb(" + r + ',' + g + ',' + b + ')';		
		return col;
	  //return niceColors[(Math.random() * niceColors.length)|0];
	}

	my.createButtonUI = function(val,onClick)
	{
		var buttonUI = document.createElement('button');
		buttonUI.type = 'button';
		buttonUI.innerHTML = val;
		buttonUI.onclick = onClick;

		return buttonUI;
	}

	my.createLabelUI = function(val)
	{
		var label = document.createElement('span');		
		label.innerHTML = val;
		return label;
	}

	my.createParaUI = function(val)
	{
		var para = document.createElement('p');		
		para.innerHTML = val;
		return para;
	}

	my.createInputTextUI = function(placeholder, value)
	{
		var inputText = document.createElement('input');
		inputText.type = 'text';
		if(value != null)
			inputText.value = value;
		inputText.placeholder = placeholder;
		return inputText;
	}

	my.createTextArea = function()
	{
		var textArea = document.createElement('textarea');
		$(textArea).css('fontSize', '10px');
		return textArea;
	}

	my.createBrUI = function(){
		var br = document.createElement('br');
		return br;
	}

	my.createSpaceUI = function(n)
	{
		var span = document.createElement('span');
		var innerHTML = '';
		for(var i=0; i<n; i++)
		{
			innerHTML += '&nbsp';
		}
		span.innerHTML = innerHTML;
		return span;
	}

	my.showDialog = function(idToActivate){

		my.hideDialog(); // to unset all dialogs

		var dialogContainer = $('#dialogContainer');
		$(dialogContainer).css('display', 'flex');
		var dialogToActivate = $(dialogContainer).find('#'+ idToActivate);
		$(dialogToActivate).show();

		

	}

	my.setOnDialogSuccessCallback = function(onDs)
	{
		onDialogSuccess = onDs;
	}

	my.getOnDialogSuccessCallback = function(){
		return onDialogSuccess;
	}

	my.callOnDialogSuccessCallback = function(){
		if(onDialogSuccess != null)
			onDialogSuccess.apply(null, arguments);
	}

	my.hideDialog = function(){
		var dialogContainer = $('#dialogContainer');

		$(dialogContainer).children().hide();

		$(dialogContainer).css('display', 'none');

		onDialogSuccess = null;
	}

	my.createSearchUI = function() {
		var filterMain = document.createElement('div');
		filterMain.id = 'filterMain';

	}

	

	my.init = function(){
		my.hideDialog();

		filterHandler.init();

		aggrHandler.init();
		
		miscHandler.init();
		//create filterMain and aggrMain ui
		//create and add bool filter 

	}



	return my;
}

module.exports = UIHandler();
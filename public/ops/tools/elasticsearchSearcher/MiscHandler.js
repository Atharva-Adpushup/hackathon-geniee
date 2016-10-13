var MiscHandler = function()
{
	var size = null;

	//private methods

	var createSize = function(){

		var sizeMain = document.createElement('div');
		sizeMain.id = 'sizeMain';

		var sizeLabel = uiHandler.createLabelUI('size : ');
		var sizeInput = uiHandler.createInputTextUI('50');

		$(sizeMain).append(sizeLabel, sizeInput, uiHandler.createBrUI())

		var size = {};

		$('#searchUI').append(sizeMain);

		size.resolve = function(){

			var sizeVal = 50;
			var sizeInputVal = getValueFromInput(sizeInput);
			if(!isNaN(sizeInputVal) )
			{
				sizeVal = parseInt(sizeInputVal);
			}

			return {size : sizeVal}
		}

		return size;
	}


	// private methods end

	var my = {};

	my.init = function(){

		size = createSize();		
	}

	my.resolve = function(){
		return size.resolve();
	}


	return my;

}

module.exports = MiscHandler();
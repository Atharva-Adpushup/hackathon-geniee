var jsonify = function(){
	
	/*var json = {
		filterMain : {
			parent : null,
			children : ["filter1", "filter2"]
		},
		aggrMain : {
			parent : null,
			children : []
		},
		size : {
			value : 10
		},
		filter1:{
			parent : "filterMain",
			children : null
		},
		filter2:{
			parent : "filterMain",
			children : null
		}

	};*/

	var json = {};

	// private functions start


	var getDeleteNodeArr = function(str)
	{
		var nodeStr = str;
		var node = json[str];

		var deleteList = [nodeStr];

		/*var parent = json[node.parent];
		if(parent != null){
			json[node.parent].child = null //disconnect from parent
		}*/

		var children = node.children;
		if(children != null)
		{
			for(var i=0; i<children.length; i++)
			{
				var childStr = children[i];
				deleteList = deleteList.concat( getDeleteNodeArr(childStr) );
			}
		}	

		return deleteList;
	}



	// private functions end

	var my = {};

	my.getJson = function(){
		return json;
	}

	my.deleteNode = function(nodeStr){
		var deleteList = getDeleteNodeArr(nodeStr);

		var nodeToDelete = json[nodeStr];

		var parent = json[nodeToDelete.parent];
		if(parent != null){
			var indexOfChild = parent.children.indexOf(nodeStr);
			parent.children.splice(indexOfChild, 1);
		}

		while(deleteList.length > 0)
		{
			var toDelete = deleteList.pop();
			delete json[toDelete];
		}	

	}



	/*my.deleteFilter = function(filterStr)
	{
		var deleteList = getDeleteNodeArr(filterStr);

		var filterToDelete = json[filterStr];

		var parent = json[filterToDelete.parent];
		if(parent != null){
			var indexOfChild = parent.children.indexOf(filterStr);
			parent.children.splice(indexOfChild, 1);
		}

		while(deleteList.length > 0)
		{
			var toDelete = deleteList.pop();
			delete json[toDelete];
		}
	}*/

	my.addNode = function(nodeStr, node, nodeParentStr){

		if(nodeParentStr !== null)
		{
			var parentNode = json[nodeParentStr];
			if(parentNode != null)
			{
				var children = parentNode.children;

				if(children.indexOf(nodeStr) === -1)
				{
					children.push(nodeStr);
					node.parent = nodeParentStr;
					json[nodeStr] = node;
				}
			}
		}
		else
		{
			json[nodeStr] = node;			
		}		
	}

	my.getNode = function(nodeStr)
	{
		return json[nodeStr];
	}

	my.getNewNodeAndAdd = function(nodeStr, nodeParentStr){
		var newNode = my.getNewNode();
		my.addNode(nodeStr, newNode, nodeParentStr);
		return newNode;
	}

	my.getNewNode = function(){
		var newNode = {
			parent : null,
			children : [],
			resolve : function(){
				console.log("resolve not defined");
				return null;
			},
			onCreate : function(){

			},
			onDelete : function(){

			}
		}
		return newNode;
	}


	my.getChildList = function(nodeStr)
	{		
		var node = json[nodeStr];
		var childList = [];

		var children = node.children;
		if(children != null)
		{
			for(var i=0; i<children.length; i++)
			{
				var childStr = children[i];
				var childNode = json[childStr];
				childList.push(childNode);//add[childStr];
			}
		}
		return childList;	
	}

	/*my.forEachChild = function(ndeStr, func)
	{
		var nodeStr = ndeStr;
		var node = json[ndeStr];

		var children = node.children;
		if(children != null)
		{
			for(var i=0; i<children.length; i++)
			{
				var childStr = children[i];
				var child = json[child];

				//if(child != null)
				//{
					func(child);
					forEachChild(childStr, func);
				//}
				
				
			}
		}
	}*/

	return my;
}

module.exports = jsonify();
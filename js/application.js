'use strict';
 
(function () {
  $(document).ready(function () {
    // Initialises Tableau Data Extension
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
        refresh();
        unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
          refresh();
        });  
    }, function () { console.log('Error while Initializing: ' + err.toString()); });
  });
 
  function refresh() {

    var worksheetName = tableau.extensions.settings.get("worksheet");
    var categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
    var valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");

    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name===worksheetName;
    });

    worksheet.getSummaryDataAsync({ignoreSelection: true}).then(function(sumdata) {
      //findParameter();
      buildMenu(sumdata);
      var lables = [];
      var data = [];
      var worksheetData = sumdata.data;
      for (var i = 0; i<worksheetData.length; i++) {
      
        lables.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
        data.push(worksheetData[i][valueColumnNumber-1].value);
      }

      //$("#categories").text("");
      //$("#categories").append("<button class='btn btn-secondary btn-block'>"+lables.length+"</button>");
      //for (var i=0; i<lables.length; i++) {
      //  $("#categories").append("<button class='btn btn-secondary btn-block'>"+lables[i]+"</button>");

      //}
    });

    

    // Gets a list of the worksheets and adds them to the web page.
    $("#worksheets").text("");
    $("#worksheets").append("<button class='btn btn-secondary btn-block'>"+worksheetName+"</button>");
    //tableau.extensions.dashboardContent.dashboard.worksheets.forEach(function (worksheet) {
    //    $("#worksheets").append("<button class='btn btn-secondary btn-block'>"+worksheet.name+"</button>");
    //});
  }

  function configure() {
    const popupUrl=`${window.location.origin}/expandable-menu-extension/dialog.html`;
    let defaultPayload="";
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height:300, width:500 }).then((closePayload) => {
      refresh();
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
    });
  }
})();

function setParameter(parm,value) {
  tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
      var parameter = params.find(param => param.name === parm);
      parameter.changeValueAsync(value);
  });
}

//restructure the data and build something with it
function buildMenu(table) {
	
	//the data returned from the tableau API
	var columns = table.columns;
	var data = table.data;
	
	//convert to field:values convention
	function reduceToObjects(cols,data) {
		var fieldNameMap = $.map(cols, function(col) { return col.fieldName; });
		var dataToReturn = $.map(data, function(d) {
										return d.reduce(function(memo, value, idx) {
											memo[fieldNameMap[idx]] = value.value; return memo;
										}, {});
                  });
                  //console.log(fieldNameMap);
                  //console.log(dataToReturn);
		return dataToReturn;
	}
	
	var niceData = reduceToObjects(columns, data);
   
  //$("#categories").text("");
  //$("#categories").append("<button class='btn btn-secondary btn-block'>"+columns+"</button>");

	//create nested tree structure
	var menuTree = d3.nest()
		.key(function (d) {return d["Menu Group"];}).sortKeys(d3.ascending)
		.key(function (d) {return d["Dashboard Name"];}).sortKeys(d3.ascending)
		//.key(function (d) {return d["Link"];}).sortKeys(d3.ascending)
		//.rollup(function (leaves) {return leaves.length;})
		.entries(niceData);
    console.log(menuTree);
	//D3 layout menu list
	var menu = d3.select('#menuTree').selectAll('ul')
		.data(menuTree)
		.enter()
		.append('ul')
	
	//append list items
	function writeMenu(parentList) {
    //console.log("Starting to write menu");
    //console.log(parentList);
		var item = parentList
			.filter(function(d) { return d.key != "%null%";})
			.append('li')
			.text(function (d) {return d.key;})
			.classed("collapsed", true);
      //console.log("Parent List Defined");

		var children = parentList.selectAll('ul')
			.data(function (d) {return d.values})
      .enter()
      .append('ul');
    
    var item2 = children
    .filter(function(d) { return d.key != "%null%";})
    .append('li')
    .text(function (d) {return d.key;})
    .classed("collapsed", true)
    .attr("link",function (d) {return d3.values(d)[1][0].Link})
    .data(function (d) {return d.values});

    console.log(item2.data()[1]);  //.values[0].Link
    console.log(item2.attr('link'));
		//if (!children.empty()) {
		//	writeMenu(children);
		//}
	}
	writeMenu(menu);
	console.log("I made it here");
	//init collapible functions
	$('ul>li').siblings("ul").toggle();
	$('ul').not(':has(li)').remove(); //removes empty children with Null values. not a perfect approach, but easier for this demo
	$('ul>li').click(function () {
		console.log($(this));
		//expand if it has children
		if ($(this).siblings('ul').length) {
			$(this).toggleClass("collapsed");
			$(this).siblings("ul").slideToggle(300);
		}
		
		//apply parameter to change the viz
		var depth = $(this).parents("ul").length;
		if ($(this).text()=="Show Top Level") {
    
      //parameter.changeValueAsync(arg);
			//worksheets.changeParameterValueAsync("ReportLink","");
			//workbook.changeParameterValueAsync("levelInput",0);
		} else if (depth === 2) {
      console.log($(this).attr("link"));
      var theLink = d3.select($(this))
        //.text(function (d) {return d.key} )
        ;
      console.log(theLink);
      setParameter("ReportLink",$(this).attr("link"));
			//worksheets.changeParameterValueAsync("ReportLink",$(this).text());
			//workbook.changeParameterValueAsync("levelInput",depth);
		}
	});
}
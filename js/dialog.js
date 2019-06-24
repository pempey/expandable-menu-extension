'use strict';
 
(function () {
 
    $(document).ready(function () {
        tableau.extensions.initializeDialogAsync().then(function (openPayload) {
            buildDialog();
        });
    });
 
    function buildDialog() {
        let dashboard = tableau.extensions.dashboardContent.dashboard;
        dashboard.worksheets.forEach(function (worksheet) {
            $("#selectWorksheet").append("<option value='" + worksheet.name + "'>" + worksheet.name + "</option>");
        });
        
        
        var worksheetName = tableau.extensions.settings.get("worksheet");
        if (worksheetName != undefined) {
            $("#selectWorksheet").val(worksheetName);
            columnsUpdate();
            parametersUpdate();
        }
 
        $('#selectWorksheet').on('change', '', function (e) {
            columnsUpdate();
            parametersUpdate();
        });
        $('#cancel').click(closeDialog);
        $('#save').click(saveButton);
        $('.select').select2();
    }
 
    function columnsUpdate() {
 
        var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        var worksheetName = $("#selectWorksheet").val();
 
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === worksheetName;
        });      
 
        worksheet.getSummaryDataAsync({ maxRows: 1 }).then(function (sumdata) {
            var worksheetColumns = sumdata.columns;
            $("#selectCategoryField").text("");
            $("#selectReportField").text("");
            $("#selectURLField").text("");
            var counter = 1;
            worksheetColumns.forEach(function (current_value) {
                $("#selectCategoryField").append("<option value='" + current_value.fieldName + "'>"+current_value.fieldName+"</option>");
                $("#selectReportField").append("<option value='" + current_value.fieldName + "'>"+current_value.fieldName+"</option>");
                $("#selectURLField").append("<option value='" + current_value.fieldName + "'>"+current_value.fieldName+"</option>");
                counter++;
            });
            $("#selectCategoryField").val(tableau.extensions.settings.get("categoryColumnNumber"));
            $("#selectReportField").val(tableau.extensions.settings.get("reportColumnNumber"));
            $("#selectURLField").val(tableau.extensions.settings.get("URLFiled"));
        });
        
    }

    function parametersUpdate() {
        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
            parameters.forEach(function (p) {
                $("#selectLinkParameter").append("<option value='" + p.name + "'>"+p.name+"</option>");
            });
            $("#selectLinkParameter").val(tableau.extensions.settings.get("LinkParameter"));
        });
    }
 
    function reloadSettings() {
         
    }
 
    function closeDialog() {
        tableau.extensions.ui.closeDialog("10");
    }
 
    function saveButton() {
 
        tableau.extensions.settings.set("worksheet", $("#selectWorksheet").val());
        tableau.extensions.settings.set("categoryColumnNumber", $("#selectCategoryField").val());
        tableau.extensions.settings.set("reportColumnNumber", $("#selectReportField").val());
        tableau.extensions.settings.set("URLFiled", $("#selectURLField").val());
        tableau.extensions.settings.set("LinkParameter", $("#selectLinkParameter").val());
 
        tableau.extensions.settings.saveAsync().then((currentSettings) => {
            tableau.extensions.ui.closeDialog("10");
        });
    }
})();
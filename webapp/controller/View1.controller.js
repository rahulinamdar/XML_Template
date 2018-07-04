sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.test.Demo.controller.View1", {
		
			onItemPress:function(oEvent){
				var oSelected = oEvent.getParameter("listItem");
				var oContext = oSelected.getBindingContext();
				var sPath = oContext.getPath();
				var oModel = oContext.getModel();
				this.getOwnerComponent().getRouter().navTo("Detail",{guid:oModel.getProperty(sPath).Guid});
			}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/ui/core/Fragment"
], function(Controller, XMLTemplateProcessor, XMLPreprocessor, Fragment) {
	"use strict";

	return Controller.extend("com.test.Demo.controller.Detail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.test.Demo.view.Detail
		 */
			onInit: function() {
				var iOriginalBusyDelay,
				oViewModel = this.getOwnerComponent().getModel("viewModel");

                this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
				
				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					});
				
			},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.test.Demo.view.Detail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.test.Demo.view.Detail
		 */
		onAfterRendering: function() {
			if (!this.bFirstTime) {
				this.getOwnerComponent().getModel().metadataLoaded().then(function() {
					var oDataModel = this.getOwnerComponent().getModel();
					var oView = this.getView();
					var oMetaModel = oDataModel.getMetaModel();
					//The content of page is preprocessed by XML View templating
					var oFragment = XMLTemplateProcessor.loadTemplate("com.test.Demo.templates.Page", "fragment");
					oMetaModel.loaded().then(function() {
						var oProcessedFragment = XMLPreprocessor.process(oFragment, {
							caller: "XML-Fragment-templating"
						}, {
							bindingContexts: {
								meta: oMetaModel.getMetaContext("/Orders")
							},
							models: {
								meta: oMetaModel
							}
						});
						oFragment = sap.ui.xmlfragment({
							fragmentContent: oProcessedFragment
						}, this);
						oView.getAggregation("content")[0].addContent(oFragment);
						this.bFirstTime = true;
					}.bind(this));
				}.bind(this));
			}
		},
		
		onClickAssign:function(oEvent){
			oEvent.getSource().getDependents()[0].openBy(oEvent.getSource());
		},
		
		/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				this.navBack();
			},
			
			navBack : function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getOwnerComponent().getRouter().navTo("List", {}, true);
				}
			},
			

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sGuid =  oEvent.getParameter("arguments").guid,
					oDataModel = this.getOwnerComponent().getModel();
					
				oDataModel.metadataLoaded().then( function() {
						var sPath = this.getOwnerComponent().getModel().createKey("Orders", {
							Guid :  sGuid
						});

					this._bindView("/" + sPath);
				}.bind(this));
			},

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getOwnerComponent().getModel("viewModel"),
					oDataModel = this.getOwnerComponent().getModel();
					
				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getOwnerComponent().getModel("viewModel"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext();

                // refreshing the binding
				oElementBinding.refresh();

				// No data for the binding
				if (!oContext) {
					this.getOwnerComponent().getRouter().getTargets().display("notFound");
					return;
				}
				oViewModel.setProperty("/busy", false);
			}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.test.Demo.view.Detail
		 */
		//	onExit: function() {
		//
		//	}

	});

});
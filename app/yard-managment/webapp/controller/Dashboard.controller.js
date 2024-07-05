sap.ui.define([
	"./BaseController",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"

], function (Controller, Device, JSONModel, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
	"use strict";


	return Controller.extend("com.app.yardmanagment.controller.Dashboard", {

		onInit: function () {
		  var oModel = new JSONModel(sap.ui.require.toUrl("com/app/yardmanagment/model/data.json"));
		  this.getView().setModel(oModel);
		  var oModelV2 = this.getOwnerComponent().getModel("ModelV2");
          this.getView().byId("pageContainer").setModel(oModelV2);
          //json model for Assigning
		  const oLocalModel = new JSONModel({
			VDetails: {
				vehicleNo: "",
				driverName: "",
				phoneNumber: "",
				vehicleType: "",
				inTime: new Date(),
				parkinglot_lotId: "",
			},
			parkinglot: {
				parkingType: false
			}
		});
		this.getView().setModel(oLocalModel, "localModel");

		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		},
		statusTextFormatter: function(bStatus) {
            return bStatus ? "Empty" : "Not Empty"; // Modify as per your requirement
          },
        // for value help request
		onValueHelpRequest: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();

			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "com.app.yardmanagment.Fragments.Valuehelp",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pValueHelpDialog.then(function (oDialog) {
				oDialog.setModel(this.getView().getModel("ModelV2"));
				// Create a filter for the binding
				oDialog.getBinding("items").filter([new Filter("lotId", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sInputValue);
			}.bind(this));
		},

		onValueHelpDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("lotId", FilterOperator.Contains, sValue);

			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpDialogClose: function (oEvent) {
			var sDescription,
				oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				return;
			}

			sDescription = oSelectedItem.getDescription();

			this.byId("productInput").setSelectedKey(sDescription);

		},
		// when you click on Assign Button
		onAssignPressbtn : async function () {
            const oPayload = this.getView().byId("page2").getModel("localModel").getProperty("/");
            const { driverName, phoneNumber, vehicleNo, vehicleType } = this.getView().byId("page2").getModel("localModel").getProperty("/").VDetails;
            const oModel = this.getView().byId("pageContainer").getModel("ModelV2"); // Assuming "ModelV2" is your ODataModel
            const plotNo = this.getView().byId("productInput").getValue();
            oPayload.VDetails.parkinglot_lotId = plotNo
            if (!(driverName && phoneNumber && vehicleNo && vehicleType && vehicleType)) {
                MessageToast.show("Enter all details")
                return
            }
            var trimmedPhone = phoneNumber.trim();
 
            // Validate phone number
            var phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
            if (!(phoneRegex.test(trimmedPhone))) {
                MessageToast.show("Please enter a valid phone number");
                return;
            }
 
            var oVehicleExist = await this.checkVehicleNo(oModel, oPayload.VDetails.vehicleNo)
            if (oVehicleExist) {
                MessageToast.show("Vehicle already exsist")
                return
            };
            const plotAvailability = await this.checkPlotAvailability(oModel, plotNo);
            if (!plotAvailability) {
                sap.m.MessageToast.show("Plot not available for assignment.");
                return;
            }
 
            try {
                // Assuming createData method sends a POST request
                await this.createData(oModel, oPayload.VDetails, "/VDetails");
                //await this.createData(oModel, oPayload.VehicalDeatils, "/History");
                MessageToast.show(`${vehicleNo} allocated to Slot No ${plotNo}`)
                oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                    success: function () {
 
                    }.bind(this),
                    error: function (oError) {
 
                        sap.m.MessageBox.error("Failed to update: " + oError.message);
                    }.bind(this)
                });
                this.onclearPress;
            } catch (error) {
                console.error("Error:", error);
            }
        },
        checkVehicleNo: async function (oModel, sVehicleNo) {
    return new Promise((resolve, reject) => {
        oModel.read("/VDetails", {
            filters: [
                new Filter("vehicleNo", FilterOperator.EQ, sVehicleNo),
            ],
            success: function (oData) {
                if (oData.results.length > 0) {
                    resolve(oData.results[0]); // Return the first matching vehicle details
                } else {
                    resolve(null); // Resolve with null if vehicle does not exist
                }
            },
            error: function () {
                reject("An error occurred while checking vehicle existence.");
            }
        });
    });
},
        checkPlotAvailability: async function (oModel, plotNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/Parkinglot('" + plotNo + "')", {
                    success: function (oData) {
                        resolve(oData.parkingType);
                    },
                    error: function (oError) {
                        reject("Error checking plot availability: " + oError.message);
                    }
                });
            });
        },
        checkPlotEmpty: async function (oModel, sVehicalNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/VDetails", {
                    filters: [
                        new Filter("vehicleNo", FilterOperator.EQ, sVehicalNo),
 
                    ],
                    success: function (oData) {
                        resolve(oData.results.length > 0);
                    },
                    error: function () {
                        reject(
                            "An error occurred while checking username existence."
                        );
                    }
                })
            })
        },
 
        // Clear the local model's VehicalDeatils property
        onclearPress: function () {
            var oLocalModel = this.getView().getModel("localModel");
            oLocalModel.setProperty("/VDetails", {
                vehicleNo: "",
                driverName: "",
                phoneNumber: "",
                vehicleType: "",
                parkinglot_lotId: ""
            });
 
            // Clear any other necessary fields or models
            this.getView().byId("productInput").setValue("");
        }
	});
});
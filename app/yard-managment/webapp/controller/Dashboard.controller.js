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
                    inTime: "",
                    UnassignedDate: "",
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
        statusTextFormatter: function (bStatus) {
            return bStatus ? "Empty" : "Not Empty"; // Modify as per your requirement
        },
        // for value help request for Assigning
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
        // Value help for reservations.
        onValueHelpRequest1: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.app.yardmanagment.Fragments.ValueHelp",
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

        onValueHelpDialogSearch1: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("lotId", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpDialogClose1: function (oEvent) {
            var sDescription,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sDescription = oSelectedItem.getDescription();

            this.byId("productInput1").setSelectedKey(sDescription);

        },
        // when you click on Assign Button

        onAssignPressbtn: async function () {
            const oPayload = this.getView().byId("page2").getModel("localModel").getProperty("/");
            const { driverName, phoneNumber, vehicleNo, vehicleType } = oPayload.VDetails;
            const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
            const plotNo = this.getView().byId("productInput").getValue();
            oPayload.VDetails.parkinglot_lotId = plotNo;

            const intime = new Date;
            oPayload.VDetails.inTime = intime;

            if (!(driverName && phoneNumber && vehicleNo && vehicleType)) {
                sap.m.MessageToast.show("Enter all details");
                return;
            }

            var trimmedPhone = phoneNumber.trim();
            var phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                sap.m.MessageToast.show("Please enter a valid phone number");
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
                sap.m.MessageToast.show(`${vehicleNo} allocated to Slot No ${plotNo}`);

                // Update parking lot entity
                oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                    success: function () { },
                    error: function (oError) {
                        sap.m.MessageBox.error("Failed to update: " + oError.message);
                    }
                });

                // Clear fields or perform any necessary actions
                this.onclearPress();
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
                        resolve(oData.results.length > 0) 
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

        // Clear the local model's VDetails property
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
        },
        onUnassignPressbtn: async function() {
            try {
                const oPayload = this.getView().byId("page2").getModel("localModel").getProperty("/");
                const { driverName, phoneNumber, vehicleNo, vehicleType} = oPayload.VDetails;
                const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
                const plotNo = this.getView().byId("productInput").getValue();
                oPayload.VDetails.parkinglot_lotId = plotNo;

                const DT = new Date;
                oPayload.VDetails.UnassignedDate = DT;


                //create history
                await this.createData(oModel, oPayload.VDetails, "/History");
                
                // Unassign the vehicle from the plot
                await this.deleteData(oModel,  "/VDetails", vehicleNo);
                
        
                // Update parking lot entity to mark it as empty
                const updatedParkingLot = {
                    parkingType: true // Assuming false represents empty parking
                    // Add other properties if needed
                };
        
                oModel.update("/Parkinglot('" + plotNo + "')", updatedParkingLot, {

                    success: function() {
                        sap.m.MessageBox.success(`Vehicle ${vehicleNo} unassigned successfully. Parking lot ${plotNo} is empty.`);
                    },
                    error: function(oError) {
                        sap.m.MessageBox.error("Failed to update parking lot: " + oError.message);
                    }
                });
        
                // Clear fields or perform any necessary actions
                this.onclearPress();
        
            } catch (error) {
                console.error("Error:", error);
                sap.m.MessageBox.error("Failed to unassign vehicle: " + error.message);
            }
        },
    // For vehicle number
        vehiclenumber : function (oEvent) {
            debugger
            const oLocalModel = this.getView().byId("page2").getModel("localModel");
            const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
            const svehicleNo = oEvent.getParameter("value");
 
            oModel.read("/VDetails", {
                filters: [
                    new Filter("vehicleNo", FilterOperator.EQ, svehicleNo)
                ],
                success: function (oData) {
                    var aVehicles = oData.results;
                    if (aVehicles.length > 0) {
                        // Assuming there's only one record with unique vehicalNo
                        var oVehicle = aVehicles[0];
                        // Set other fields based on the found vehicle
                        oLocalModel.setProperty("/VDetails/vehicleNo", oVehicle.vehicleNo);
                        oLocalModel.setProperty("/VDetails/driverName", oVehicle.driverName);
                        oLocalModel.setProperty("/VDetails/phoneNumber", oVehicle.phoneNumber);
                        oLocalModel.setProperty("/VDetails/vehicleType", oVehicle.vehicleType);
                        oLocalModel.setProperty("/VDetails/inTime", oVehicle.inTime);
                        oLocalModel.setProperty("/VDetails/parkinglot_lotId", oVehicle.parkinglot_lotId);
                        oView.byId("productInput").setValue(oVehicle.parkinglot_lotId)
                        // Set other fields as needed
                    } else {
                        // Handle case where vehicle number was not found
                        sap.m.MessageToast.show("Vehicle number not found.");
                        // Optionally clear other fields
                        oLocalModel.setProperty("/VDetails/vehicleNo", "");
                        oLocalModel.setProperty("/VDetails/driverName", "");
                        oLocalModel.setProperty("/VDetails/phoneNumber", "");
                        oLocalModel.setProperty("/VDetails/vehicleType", "");
                        oLocalModel.setProperty("/VDetails/inTime", "");
                        // Clear other fields as needed
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageToast.show("Error fetching vehicle details: " + oError.message);
                }
 
            })
        },

        onReservePressbtn : async function() {

            const svehicleNo = this.getView().byId("InputVehicleno").getValue();
            const sdriverName = this.getView().byId("InputDriverName").getValue();
            const sphoneNumber = this.getView().byId("InputPhonenumber").getValue();
            const svehicleType = this.getView().byId("InputVehicletype").getValue();
            const sReservedDate = this.getView().byId("InputEstimatedtime").getValue();
            
            const oReserveModel = new JSONModel({
                Reservations: {
                    vehicleNo: svehicleNo,
                    driverName: sdriverName,
                    phoneNumber: sphoneNumber,
                    vehicleType: svehicleType,
                    ReservedDate: sReservedDate,
                    parkinglot_lotId: "",
                },
                parkinglot: {
                    parkingType: false
                }
            });
            this.getView().setModel(oReserveModel, "reserveModel");

            const oPayload = this.getView().byId("page7").getModel("reserveModel").getProperty("/");
            const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
            const plotNo = this.getView().byId("productInput1").getValue();
            oPayload.Reservations.parkinglot_lotId = plotNo;
            try {
                // Assuming createData method sends a POST request
                await this.createData(oModel, oPayload.Reservations, "/Reservations");
                sap.m.MessageToast.show(`${svehicleNo} Reserved to Slot No ${plotNo}`);

                // Update parking lot entity
                oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                    success: function () { },
                    error: function (oError) {
                        sap.m.MessageBox.error("Failed to update: " + oError.message);
                    }
                });

                // Clear fields or perform any necessary actions
                this.onclearPress1();
            } catch (error) {
                console.error("Error:", error);
            }
        },
        onclearPress1: function () {
            var oLocalModel = this.getView().getModel("reserveModel");
            oLocalModel.setProperty("/Reservations", {
                vehicleNo: "",
                driverName: "",
                phoneNumber: "",
                vehicleType: "",
                ReservedDate:"",
                parkinglot_lotId: ""
            });

            // Clear any other necessary fields or models
            this.getView().byId("productInput1").setValue("");
        },
    });
});
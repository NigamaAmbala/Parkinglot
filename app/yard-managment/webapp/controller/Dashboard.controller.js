sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",


], function (Controller, Device, JSONModel, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";


    return Controller.extend("com.app.yardmanagment.controller.Dashboard", {

        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("com/app/yardmanagment/model/data.json"));
            this.getView().setModel(oModel);
            var oModelV2 = this.getOwnerComponent().getModel("ModelV2");
            this.getView().byId("pageContainer").setModel(oModelV2);

            this._setParkingLotModel();
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

            var today = new Date();  // Get the current date

            // Get the date picker element by its ID ("InputEstimatedtime")
            var oDateTimePicker = this.getView().byId("InputEstimatedtime");

            // Set the minimum date for the date picker to today's date
            oDateTimePicker.setMinDate(today);

            // Set display format to show date and time
            //oDateTimePicker.setDisplayFormat("yyyy-MM-dd HH:mm:ss");

            // Optionally, set the initial value to the current datetime
            // oDateTimePicker.setDateValue(today);

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
            debugger
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

            if (!/^\d{10}$/.test(oPayload.VDetails.phoneNumber)) {
                this.getView().byId("driverPhoneInput").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                return;
            } else {
                this.getView().byId("driverPhoneInput").setValueState("None");
            }
            //validate vehicle number
            if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(oPayload.VDetails.vehicleNo)) {  // Example format: XX00XX0000
                this.getView().byId("idvehiclenoInput12").setValueState("Error").setValueStateText("Vehicle number format Should be like this 'AP21BE5678'.");
                return;
            } else {
                this.getView().byId("idvehiclenoInput12").setValueState("None");
            }

            // var trimmedPhone = phoneNumber.trim();
            // var phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
            // if (!phoneRegex.test(trimmedPhone)) {
            //     sap.m.MessageToast.show("Please enter a valid phone number");
            //     return;
            // }

            if (!/^\d{10}$/.test(phoneNumber)) {
                this.getView().byId("driverPhoneInput").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                return;
            } else {
                this.getView().byId("driverPhoneInput").setValueState("None");
            }

           //check modile number
            var bDriverNumberExists = await this.checkIfExists(oModel, "/VDetails", "phoneNumber", oPayload.VDetails.phoneNumber);
        
            if (bDriverNumberExists) {
                MessageBox.error("Phone number already exists.");
                return;
            }

            debugger
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
                const reservation = await this.checkReservation(oModel, vehicleNo);
                if (reservation) {
                    // Vehicle found in Reservations, proceed with assignment
                    // Create data in VDetails
                    await this.createData(oModel, oPayload.VDetails, "/VDetails");

                    sap.m.MessageToast.show(`${vehicleNo} allocated to Slot No ${plotNo}`);

                    // Update parking lot entity to indicate it's not available (e.g., set parkinglot_available = false)
                    oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                        success: function () { },
                        error: function (oError) {
                            sap.m.MessageBox.error("Failed to update: " + oError.message);
                        }
                    });

                    // Delete reservation entry
                    await this.deleteData(oModel, "/Reservations", vehicleNo);
                    sap.m.MessageToast.show(`${vehicleNo} assigned to Slot No ${plotNo}`);

                } else {

                    var isReserved = await this.checkParkingLotReservation(oModel, plotNo);
                    if (isReserved) {
                        sap.m.MessageBox.error(`Parking lot ${plotNo} is already reserved. Please select another parking lot.`, {
                            title: "Reservation Information",
                            actions: sap.m.MessageBox.Action.OK
                        });
                        return;
                    }

                    await this.createData(oModel, oPayload.VDetails, "/VDetails");
                    sap.m.MessageToast.show(`${vehicleNo} allocated to Slot No ${plotNo}`);

                    // Update parking lot entity
                    oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                        success: function () { },
                        error: function (oError) {
                            sap.m.MessageBox.error("Failed to update: " + oError.message);
                        }
                    });
                }
            } catch (error) {
                console.error("Error:", error);
            }
            this.onclearPress();
        },
        checkVehicleNo: async function (oModel, sVehicleNo) {
            debugger
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
        checkIfExists: async function (oModel, sEntitySet, sProperty, sValue) {
            return new Promise((resolve, reject) => {
                oModel.read(sEntitySet, {
                    filters: [new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.EQ, sValue)],
                    success: (oData) => {
                        resolve(oData.results.length > 0);
                    },
                    error: (oError) => {
                        reject(oError);
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
        checkReservation: async function (oModel, sVehicalNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/Reservations", {
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
        checkParkingLotReservation: async function (oModel, plotNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/Reservations", {
                    filters: [
                        new sap.ui.model.Filter("parkinglot_lotId", sap.ui.model.FilterOperator.EQ, plotNo)
                    ],
                    success: function (oData) {
                        resolve(oData.results.length > 0);
                    },
                    error: function () {
                        reject("An error occurred while checking parking lot reservation.");
                    }
                });
            });
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
        onUnassignPressbtn: async function () {
            try {
                const oPayload = this.getView().byId("page2").getModel("localModel").getProperty("/");
                const { driverName, phoneNumber, vehicleNo, vehicleType } = oPayload.VDetails;
                const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
                const plotNo = this.getView().byId("productInput").getValue();
                oPayload.VDetails.parkinglot_lotId = plotNo;

                const DT = new Date;
                oPayload.VDetails.UnassignedDate = DT;


                //create history
                await this.createData(oModel, oPayload.VDetails, "/History");

                // Unassign the vehicle from the plot
                await this.deleteData(oModel, "/VDetails", vehicleNo);


                // Update parking lot entity to mark it as empty
                const updatedParkingLot = {
                    parkingType: true // Assuming false represents empty parking
                    // Add other properties if needed
                };

                oModel.update("/Parkinglot('" + plotNo + "')", updatedParkingLot, {

                    success: function () {
                        sap.m.MessageBox.success(`Vehicle ${vehicleNo} unassigned successfully. Parking lot ${plotNo} is empty.`);
                    },
                    error: function (oError) {
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
        vehiclenumber: function (oEvent) {
            debugger;
            const oLocalModel = this.getView().byId("page2").getModel("localModel");
            const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
            const svehicleNo = oEvent.getParameter("value");

            // Function to set vehicle details in the local model
            const setVehicleDetails = (oVehicle) => {
                oLocalModel.setProperty("/VDetails/vehicleNo", oVehicle.vehicleNo);
                oLocalModel.setProperty("/VDetails/driverName", oVehicle.driverName);
                oLocalModel.setProperty("/VDetails/phoneNumber", oVehicle.phoneNumber);
                oLocalModel.setProperty("/VDetails/vehicleType", oVehicle.vehicleType);
                oLocalModel.setProperty("/VDetails/inTime", oVehicle.inTime);
                oLocalModel.setProperty("/VDetails/parkinglot_lotId", oVehicle.parkinglot_lotId);
                this.oView.byId("productInput").setValue(oVehicle.parkinglot_lotId)
            };

            // Function to clear vehicle details in the local model
            const clearVehicleDetails = () => {
                oLocalModel.setProperty("/VDetails/vehicleNo", "");
                oLocalModel.setProperty("/VDetails/driverName", "");
                oLocalModel.setProperty("/VDetails/phoneNumber", "");
                oLocalModel.setProperty("/VDetails/vehicleType", "");
                oLocalModel.setProperty("/VDetails/inTime", "");
                oLocalModel.setProperty("/VDetails/parkinglot_lotId", "");
            };

            // Read from VDetails entity
            oModel.read("/VDetails", {
                filters: [new Filter("vehicleNo", FilterOperator.EQ, svehicleNo)],
                success: function (oData) {
                    var aVehicles = oData.results;
                    if (aVehicles.length > 0) {
                        // Vehicle found in VDetails
                        var oVehicle = aVehicles[0];
                        setVehicleDetails(oVehicle);
                    } else {
                        // If not found in VDetails, check in Reservation
                        oModel.read("/Reservations", {
                            filters: [new Filter("vehicleNo", FilterOperator.EQ, svehicleNo)],
                            success: function (oData) {
                                var aReservations = oData.results;
                                if (aReservations.length > 0) {
                                    // Vehicle found in Reservation
                                    var oReservation = aReservations[0];
                                    // Assuming Reservation entity has similar fields
                                    var oVehicleDetails = {
                                        vehicleNo: oReservation.vehicleNo,
                                        driverName: oReservation.driverName,
                                        phoneNumber: oReservation.phoneNumber,
                                        vehicleType: oReservation.vehicleType,
                                        inTime: oReservation.reserveDate, // Adjust this field if necessary
                                        parkinglot_lotId: oReservation.parkinglot_lotId
                                    };
                                    setVehicleDetails(oVehicleDetails);
                                } else {
                                    // Vehicle not found in both entities
                                    sap.m.MessageToast.show("Vehicle number not found.");
                                    clearVehicleDetails();
                                }
                            }.bind(this),
                            error: function (oError) {
                                sap.m.MessageToast.show("Error fetching reservation details: " + oError.message);
                            }
                        });
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageToast.show("Error fetching vehicle details: " + oError.message);
                }
            });
        },

        onReservePressbtn: async function () {

            const svendorName = this.getView().byId("InputVedorname").getValue();
            const svehicleNo = this.getView().byId("InputVehicleno").getValue();
            const sdriverName = this.getView().byId("InputDriverName").getValue();
            const sphoneNumber = this.getView().byId("InputPhonenumber").getValue();
            const svehicleType = this.getView().byId("InputVehicletype").getValue();
            const sReservedDate = this.getView().byId("InputEstimatedtime");
            var sSelectedDateTime = sReservedDate.getDateValue();
 
            const oReserveModel = new JSONModel({

                Reservations: {
                    vendorName: svendorName,
                    vehicleNo: svehicleNo,
                    driverName: sdriverName,
                    phoneNumber: sphoneNumber,
                    vehicleType: svehicleType,
                    ReservedDate: sSelectedDateTime,
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
 
            if (!svehicleNo || !svehicleNo.match(/^[\w\d]{1,10}$/)) {
                sap.m.MessageBox.error("Please enter a valid vehicle number (alphanumeric, up to 10 characters).");
                return;
            }
 
            const vehicleExists = await this.checkVehicleExists(oModel, svehicleNo);
            if (vehicleExists) {
                sap.m.MessageBox.error("Vehicle number already Assigned. Please enter a different vehicle number.");
                return;
            }
             
            const plotAvailability = await this.checkPlotAvailability(oModel, plotNo);
            if (!plotAvailability) {
                sap.m.MessageToast.show("Plot not available for assignment.");
                return;
            }
            //valid phone number
            if (!/^\d{10}$/.test(sphoneNumber)) {
                this.getView().byId("InputPhonenumber").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                return;

            } else {
                this.getView().byId("InputPhonenumber").setValueState("None");
            }
            //validate vehicle number
            if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(svehicleNo)) {  // Example format: XX00XX0000
                this.getView().byId("InputVehicleno").setValueState("Error").setValueStateText("Vehicle number format Should be like this 'AP21BE5678'.");
                return;
            } else {
                this.getView().byId("InputVehicleno").setValueState("None");
            }

            var bDriverNumberExists = await this.checkIfExistsReserve(oModel, "/Reservations", "phoneNumber", sphoneNumber);
            var bVehicleNumberExists = await this.checkIfExistsReserve(oModel, "/Reservations", "vehicleNo", svehicleNo);
        
            if (bDriverNumberExists || bVehicleNumberExists) {
                sap.m.MessageBox.error("vehicle number or phone number already exists.");
                return;
            }
 
 
            var isReserved = await this.checkParkingLotReservation12(oModel, plotNo);
            if (isReserved) {
                sap.m.MessageBox.error(`Parking lot is already reserved. Please select another parking lot.`, {
                    title: "Reservation Information",
                    actions: sap.m.MessageBox.Action.OK
                });
                return;
            }
 
            try {
                // Assuming createData method sends a POST request
                await this.createData(oModel, oPayload.Reservations, "/Reservations");
                sap.m.MessageToast.show(`${svehicleNo} Reserved to Slot No ${plotNo}`);
 
                // Update parking lot entity
                // oModel.update("/Parkinglot('" + plotNo + "')", oPayload.parkinglot, {
                //     success: function () { },
                //     error: function (oError) {
                //         sap.m.MessageBox.error("Failed to update: " + oError.message);
                //     }
                // });
 
                // Clear fields or perform any necessary actions

                this.onclearPress1();

            } catch (error) {
                console.error("Error:", error);
            }

        },
        
        checkVehicleExists: async function (oModel, sVehicleNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/VDetails", {
                    filters: [
                        new Filter("vehicleNo", FilterOperator.EQ, sVehicleNo)
                    ],
                    success: function (oData) {
                        resolve(oData.results.length > 0);
                    },
                    error: function () {
                        reject("An error occurred while checking vehicle number existence.");
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
        checkIfExistsReserve: async function (oModel, sEntitySet, sProperty, sValue) {
            return new Promise((resolve, reject) => {
                oModel.read(sEntitySet, {
                    filters: [new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.EQ, sValue)],
                    success: (oData) => {
                        resolve(oData.results.length > 0);
                    },
                    error: (oError) => {
                        reject(oError);
                    }
                });
            });
        },
        checkParkingLotReservation12: async function (oModel, plotNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/Reservations", {
                    filters: [
                        new sap.ui.model.Filter("parkinglot_lotId", sap.ui.model.FilterOperator.EQ, plotNo)
                    ],
                    success: function (oData) {
                        resolve(oData.results.length > 0);
                    },
                    error: function () {
                        reject("An error occurred while checking parking lot reservation.");
                    }
                });
            });
        },
        onclearPress1: function () {
            var svendorName = this.getView().byId("InputVedorname").setValue();
            var svehicleNo = this.getView().byId("InputVehicleno").setValue();
            var sdriverName = this.getView().byId("InputDriverName").setValue();
            var sphoneNumber = this.getView().byId("InputPhonenumber").setValue();
            var svehicleType = this.getView().byId("InputVehicletype").setValue();
            var sReservedDate = this.getView().byId("InputEstimatedtime").setValue();
            var sParkingLot = this.getView().byId("productInput1").setValue();
        },
        onpressassignrd: async function () {
            debugger
            var oSelected = this.byId("idReserved").getSelectedItems();
            if (oSelected.length === 0) {
                MessageBox.error("Please Select atleast row to Assign");
                return
            };

            var oSelectedRow = this.byId("idReserved").getSelectedItem().getBindingContext().getObject();
            var orow = this.byId("idReserved").getSelectedItem().getBindingContext().getPath();
            const intime = new Date;
            var resmodel = new JSONModel({

                vehicleNo: oSelectedRow.vehicleNo,
                driverName: oSelectedRow.driverName,
                phoneNumber: oSelectedRow.phoneNumber,
                vehicleType: oSelectedRow.vehicleType,
                inTime: intime,
                parkinglot_lotId: oSelectedRow.parkinglot_lotId,

            });
            var temp = oSelectedRow.parkinglot_lotId;

            const oModel = this.getView().byId("pageContainer").getModel("ModelV2");
            debugger
            this.getView().byId("page8").setModel(resmodel, "resmodel");
            this.getView().byId("page8").getModel("resmodel").getProperty("/");
            oModel.create("/VDetails", resmodel.getData(), {
                success: function (odata) {
                    debugger
                    oModel.remove(orow, {
                        success: function () {
                            oModel.refresh()
                            oModel.update("/Parkinglot('" + temp + "')", { parkingType: false }, {
                                success: function () {
                                    sap.m.MessageBox.success(`Reserved Vehicle ${oSelectedRow.vehicleNo} assigned successfully to plot ${oSelectedRow.parkinglot_lotId}.`);
                                    oModel.refresh();
                                }, error: function () {
                                    sap.m.MessageBox.error("Unable to Update");
                                }

                            })
                        },
                        error: function (oError) {
                            sap.m.MessageBox.error("Failed to update : " + oError.message);
                        }

                    })

                },
                error: function (oError) {
                    sap.m.MessageBox.error("Failed to update : " + oError.message);
                }
            })

        },
        onGoPress: function () {

            const oView = this.getView(),
                oVehiclenoFilter = oView.byId("searchinput"),
                svehicleno = oVehiclenoFilter.getValue(),
                oTable = oView.byId("idReserved"),
                aFilters = [];

            svehicleno ? aFilters.push(new Filter("vehicleNo", FilterOperator.EQ, svehicleno)) : "";
            oTable.getBinding("items").filter(aFilters);
            this.onclearFilterPress();
        },
        onclearFilterPress: function () {

            const oView = this.getView(),


                oClearFname = oView.byId("searchinput").setValue()
            // oClearLname = oView.byId("idLNameFilterValue").setValue(),
            // oClearPhone = oView.byId("iPhoneFilterValue").setValue(),
            // oViewEmail = oView.byId("idEmailFilterValue").setValue();

        },
        _setParkingLotModel: function () {
            var oModel = this.getOwnerComponent().getModel("ModelV2");
            var that = this;

            oModel.read("/Parkinglot", {
                success: function (oData) {
                    console.log("Fetched Data:", oData);
                    var aItems = oData.results;
                    var availableCount = aItems.filter(item => item.parkingType === true).length;
                    var occupiedCount = aItems.filter(item => item.parkingType === false).length;

                    var aChartData = {
                        Items: [
                            {
                                parkingType: true,
                                Count: availableCount,
                                parkingType: "Available"
                            },
                            {
                                parkingType: false,
                                Count: occupiedCount,
                                parkingType: "Occupied"
                            }
                        ]
                    };
                    var oParkingLotModel = new JSONModel();
                    oParkingLotModel.setData(aChartData);
                    that.getView().setModel(oParkingLotModel, "ParkingLotModel");
                },
                error: function (oError) {
                    console.error(oError);
                }
            });
        },
        onEdit: function () {
            var oTable = this.byId("idAllocatedSlots");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                sap.m.MessageToast.show("Please select an item to edit.");
                return;
            }

            aSelectedItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                aCells.forEach(function (oCell) {
                    var aVBoxItems = oCell.getItems();
                    aVBoxItems[0].setVisible(false); // Hide Text
                    aVBoxItems[1].setVisible(true); // Show Input
                });
            });
            this.byId("editButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("cancelButton").setVisible(true);
        },
        onCancel: function () {
            var oTable = this.byId("idAllocatedSlots");
            var aSelectedItems = oTable.getSelectedItems();

            aSelectedItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                aCells.forEach(function (oCell) {
                    var aVBoxItems = oCell.getItems();
                    aVBoxItems[0].setVisible(true); // Show Text
                    aVBoxItems[1].setVisible(false); // Hide Input
                });
            });

            this.byId("editButton").setVisible(true);
            this.byId("saveButton").setVisible(false);
            this.byId("cancelButton").setVisible(false);
        },
        onSave: function () {
            const oView = this.getView();
            const oTable = this.byId("idAllocatedSlots");
            const aSelectedItems = oTable.getSelectedItems();
            const oSelected = oTable.getSelectedItem();

            if (oSelected) {
                const oContext = oSelected.getBindingContext().getObject();
                const sVehicle = oContext.vehicleNo;
                const sTypeofDelivery = oContext.vehicleType;
                const sDriverMobile = oContext.phoneNumber;
                const sDriverName = oContext.driverName;
                var sOldSlotNumber = oContext.parkinglot_lotId;

                // Assuming the user selects a new slot number from somewhere
                const oSelect = oSelected.getCells()[0].getItems()[1]; // Assuming the Select is the second item in the first cell
                const sSlotNumber = oSelect.getSelectedKey(); // Get selected slot number

                // Create a record in history (assuming this is what you want to do)
                const oNewUpdate = {
                    vehicleNo: sVehicle,
                    inTime: new Date(),
                    vehicleType: sTypeofDelivery,
                    driverName: sDriverName,
                    phoneNumber: sDriverMobile,
                    parkinglot: {
                        lotId: sSlotNumber
                    }
                };

                // Update VDetails record
                const oDataModel = this.getOwnerComponent().getModel("ModelV2");
                oDataModel.update("/VDetails('" + sVehicle + "')", oNewUpdate, {
                    success: function () {
                        // Update old Parkinglot to empty (parkingType: true -> false)
                        const updatedParkingLot = {
                            parkingType: true // Assuming true represents empty parking
                        };
                        oDataModel.update("/Parkinglot('" + sOldSlotNumber + "')", updatedParkingLot, {
                            success: function () {
                                // Update new Parkinglot to occupied (parkingType: false -> true)
                                const updatedNewParkingLot = {
                                    parkingType: false // Assuming false represents occupied parking
                                };
                                oDataModel.update("/Parkinglot('" + sSlotNumber + "')", updatedNewParkingLot, {
                                    success: function () {
                                        // Refresh table binding or do other necessary actions
                                        oTable.getBinding("items").refresh();
                                        sap.m.MessageBox.success("Slot updated successfully");
                                    },
                                    error: function (oError) {
                                        sap.m.MessageBox.error("Failed to update new slot: " + oError.message);
                                    }
                                });
                            },
                            error: function (oError) {
                                sap.m.MessageBox.error("Failed to update old slot: " + oError.message);
                            }
                        });
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Failed to update VDetails: " + oError.message);
                    }
                });
            }

            // Additional UI updates or actions after saving
            aSelectedItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                aCells.forEach(function (oCell) {
                    var aVBoxItems = oCell.getItems();
                    aVBoxItems[0].setVisible(true); // Hide Text
                    aVBoxItems[1].setVisible(false); // Show Input
                });
            });
            this.byId("editButton").setVisible(true);
            this.byId("saveButton").setVisible(false);
            this.byId("cancelButton").setVisible(false);
        },
        onNotificationPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();

            // create popover
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.app.yardmanagment.Fragments.Notifications",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.setModel(oModel);
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
            var oModel = this.getOwnerComponent().getModel("ModelV2");
            this.getView().byId("idnotificationDialog").setModel(oModel);

        },

        // for search help
        onSearch: function (event) {
            debugger
            var sQuery = event.getSource().getValue();
            var oTable = this.byId("idReserved");
            var oBinding = oTable.getBinding("items");
 
            if (oBinding) {
                var oFilter = new sap.ui.model.Filter([
                    new Filter("parkinglot_lotId", FilterOperator.Contains, sQuery),
                    new Filter("vehicleNo", FilterOperator.Contains, sQuery),
                    new Filter("driverName", FilterOperator.Contains, sQuery),
                    new Filter("phoneNumber", FilterOperator.Contains, sQuery),
                    new Filter("vendorName", FilterOperator.Contains, sQuery)
                ], false);
                oBinding.filter(oFilter);
            }
 
        },
        onSearch12: function (event) {
            debugger
            var sQuery = event.getSource().getValue();
            var oTable = this.byId("idAllocatedSlots");
            var oBinding = oTable.getBinding("items");
 
            if (oBinding) {
                var oFilter = new sap.ui.model.Filter([
                    new Filter("parkinglot_lotId", FilterOperator.Contains, sQuery),
                    new Filter("vehicleNo", FilterOperator.Contains, sQuery),
                    new Filter("driverName", FilterOperator.Contains, sQuery),
                    new Filter("phoneNumber", FilterOperator.Contains, sQuery)

                ], false);
                oBinding.filter(oFilter);
            }
 
        }
    });
});
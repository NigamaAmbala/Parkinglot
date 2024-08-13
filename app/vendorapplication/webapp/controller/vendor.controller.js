sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
function (Controller,JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.app.vendorapplication.controller.vendor", {
        onInit: function () {
            var today = new Date();  // Get the current date

            // Get the date picker element by its ID ("InputEstimatedtime")
            var oDateTimePicker = this.getView().byId("InputEstimatedtime");

            // Set the minimum date for the date picker to today's date
            oDateTimePicker.setMinDate(today);
        },
        onReservePressbtn: async function () {
            debugger
            var oView = this.getView();

            var sVendorName = oView.byId("InputVendorName").getValue();
            var sVehicleNo = oView.byId("InputVehicleno").getValue();
            var sDriverName = oView.byId("InputDriverName").getValue();
            var sPhoneNo = oView.byId("InputPhonenumber").getValue();
            var sVehicleType = oView.byId("InputVehicletype").getValue();
            var sParkingLot = oView.byId("idcombox1").getValue();
            var oDateTimePicker = oView.byId("InputEstimatedtime");
            var oSelectedDateTime = oDateTimePicker.getDateValue();

            var Reservemodel = new sap.ui.model.json.JSONModel({

                vendorName:sVendorName,
                vehicleNo: sVehicleNo,
                driverName: sDriverName, 
                phoneNumber: sPhoneNo,
                vehicleType: sVehicleType,
                parkinglot_lotId: sParkingLot,
                ReservedDate: oSelectedDateTime,
                notify:  `Vendor "${sVendorName}" reserved the " ${sParkingLot} " at "${oSelectedDateTime}"`,
                
            });

            this.getView().setModel(Reservemodel, "reservemodel");
            const oModel = this.getView().getModel("ModelV2");
            const oPayload = this.getView().getModel("reservemodel").getProperty("/");

            var isReserved = await this.checkParkingLotReservation12(oModel, sParkingLot);
            if (isReserved) {
                sap.m.MessageBox.error(`Parking lot ${sParkingLot} is already reserved. Please select another parking lot.`, {
                    title: "Reservation Information",
                    actions: sap.m.MessageBox.Action.OK
                });
                return;
            }
            //valid phone number
            if (!/^\d{10}$/.test(sPhoneNo)) {
                this.getView().byId("InputPhonenumber").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                return;
            } else {
                this.getView().byId("InputPhonenumber").setValueState("None");
            }
            //validate vehicle number
            if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(sVehicleNo)) {  // Example format: XX00XX0000
                this.getView().byId("InputVehicleno").setValueState("Error").setValueStateText("Vehicle number format Should be like this 'AP21BE5678'.");
                return;
            } else {
                this.getView().byId("InputVehicleno").setValueState("None");
            }
            // Check if vendor mobile number, driver mobile number, or vehicle number already exists
           
                var bDriverNumberExists = await this.checkIfExists(oModel, "/Reservations", "phoneNumber", sPhoneNo);
                var bVehicleNumberExists = await this.checkIfExists(oModel, "/Reservations", "vehicleNo", sVehicleNo);
            
                if (bDriverNumberExists || bVehicleNumberExists) {
                    sap.m.MessageBox.error("Vendor number, driver number, or vehicle number already exists.");
                    return;
                }
            // Create the reservation entry
            try {
                await this.createData(oModel, oPayload, "/Reservations");
                sap.m.MessageBox.success("Parking lot reserved  successfully");

                const updatedParkingLot = {
                    parkingType: "Reserved" // Assuming false represents empty parking
                    // Add other properties if needed
                };

                //Update parking lot entity
                oModel.update("/Parkinglot('" + sParkingLot + "')", updatedParkingLot, {
                    success: function () { },
                    error: function (oError) {
                        sap.m.MessageBox.error("Failed to update: " + oError.message);
                    }
                });


            } catch (error) {  
                sap.m.MessageBox.error("Failed to create reservation. Please try again.");
                console.error("Error creating reservation:", error);
            }
            this.onclearPress1();
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
        onclearPress1: function () {
            var oView = this.getView();
            var sVendorName = oView.byId("InputVendorName").setValue();
            var sVehicleNo = oView.byId("InputVehicleno").setValue();
            var sDriverName = oView.byId("InputDriverName").setValue();
            var sPhoneNo = oView.byId("InputPhonenumber").setValue();
            var sVehicleType = oView.byId("InputVehicletype").setValue();
            var sParkingLot = oView.byId("idcombox1").setValue();
            var oDateTimePicker = oView.byId("InputEstimatedtime").setValue();
        },
    });
});

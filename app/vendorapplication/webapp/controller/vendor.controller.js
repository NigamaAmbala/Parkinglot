sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
function (Controller,JSONModel, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.app.vendorapplication.controller.vendor", {
        onInit: function () {

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
                ReservedDate: oSelectedDateTime
                
            });

            this.getView().setModel(Reservemodel, "reservemodel");
            const oModel = this.getView().getModel("ModelV2");
            const oPayload = this.getView().getModel("reservemodel").getProperty("/");

            // const vehicleExists = await this.checkVehicleExists(oModel, sVehicleNo);
            // if (vehicleExists) {
            //     sap.m.MessageBox.error("Vehicle number already Assigned. Please enter a different vehicle number.");
            //     return;
            // }


            // Create the reservation entry
            try {
                await this.createData(oModel, oPayload, "/Reservations");
                sap.m.MessageBox.success("Parking lot reserved  successfully");
            } catch (error) {  
                sap.m.MessageBox.error("Failed to create reservation. Please try again.");
                console.error("Error creating reservation:", error);
            }
        },
        // checkVehicleExists: async function (oModel, sVehicleNo) {
        //     return new Promise((resolve, reject) => {
        //         oModel.read("/Reservations", {
        //             filters: [
        //                 new Filter("vehicleNo", FilterOperator.EQ, sVehicleNo)
        //             ],
        //             success: function (oData) {
        //                 resolve(oData.results.length > 0);
        //             },
        //             error: function () {
        //                 reject("An error occurred while checking vehicle number existence.");
        //             }
        //         });
        //     });
        // },
    });
});

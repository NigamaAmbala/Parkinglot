namespace my.parkinglots;

entity Parkinglot {
  key lotId : String;
    parkingType: Boolean;
    vehicledetails : Association to VDetails;
}

entity VDetails {
   Key vehicleNo : String;
   driverName : String;
   phoneNumber : String;
   vehicleType : String;
   inTime : DateTime;
   outTime : String;
   parkinglot : Association to Parkinglot;   
}


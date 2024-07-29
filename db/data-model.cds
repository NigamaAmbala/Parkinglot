namespace my.parkinglots;

entity Parkinglot {
  key lotId          : String;
      parkingType    : Boolean;
      vehicledetails : Association to VDetails;
}

entity VDetails {
  key vehicleNo      : String;
      driverName     : String;
      phoneNumber    : String;
      vehicleType    : String;
      inTime         : DateTime;
      UnassignedDate : String;
      parkinglot     : Association to Parkinglot;
}

entity History {
  key vehicleNo      : String;
      driverName     : String;
      phoneNumber    : String;
      vehicleType    : String;
      inTime         : DateTime;
      UnassignedDate : DateTime;
      parkinglot     : Association to Parkinglot;
      vehicledetails : Association to VDetails;
}

entity Reservations {
  key vehicleNo      : String;
      driverName     : String;
      phoneNumber    : String;
      vehicleType    : String;
      ReservedDate   : DateTime;
      parkinglot     : Association to Parkinglot;
      vehicledetails : Association to VDetails;
      vendorName     : String;
      vendorPhone    : String;
      notify         : String;

}

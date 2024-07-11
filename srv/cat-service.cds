using my.parkinglots as my from '../db/data-model';
@path: '/ParkinglotSRV/'
service CatalogService {
     entity Parkinglot as projection on my.Parkinglot;
     entity VDetails as projection on my.VDetails;
     entity History as projection on my.History;
     entity Reservations as projection on my.Reservations;
}

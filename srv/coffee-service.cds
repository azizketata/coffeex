using { coffeex as db } from '../db/schema';

service CoffeeService @(path:'/odata/v4') {

  @readonly entity Users        as projection on db.User;
  @readonly entity Machines     as projection on db.Machine;
  entity CoffeeTxes             as projection on db.CoffeeTx;
  entity RefillEvents           as projection on db.RefillEvent;

  action Tap(machineId : UUID, userId : UUID) returns db.CoffeeTx @requires:'User';
  action BatchPay() returns Integer @requires:'Admin';
  action Forecast() returns Integer @requires:'Admin';
} 
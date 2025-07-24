using { coffeex as db } from '../db/schema';

service CoffeeService @(path:'/odata/v4') {

  @readonly entity Users        as projection on db.User;
  @readonly entity Machines     as projection on db.Machine;
  entity CoffeeTx             as projection on db.CoffeeTx;
  entity RefillEvents           as projection on db.RefillEvent;

  @requires:'User'
  action Tap(machineId : UUID, userId : UUID) returns CoffeeTx;
  
  @requires:'Admin'
  action BatchPay() returns Integer;
  
  @requires:'Admin'
  action Forecast() returns Integer;

  @requires: 'User'
  action TopUp(amount: Decimal(10,2)) returns String;

} 
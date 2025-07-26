using { coffeex as db } from '../db/schema';
using { coffeex.views as views } from '../db/views';

service CoffeeService @(path:'/odata/v4') {

  @readonly 
  @cds.redirection.target: true
  entity Users        as projection on db.User;
  
  @readonly entity Machines     as projection on db.Machine;
  entity CoffeeTx             as projection on db.CoffeeTx;
  entity RefillEvents           as projection on db.RefillEvent;
  
  @readonly entity LowBalanceUsers as projection on views.LowBalanceUsers;

  @requires:'User'
  action Tap(machineId : UUID, userId : UUID) returns CoffeeTx;
  
  @requires:'Admin'
  action BatchPay() returns Integer;
  
  @requires:'Admin'
  action Forecast() returns Integer;
  
  @requires:'Admin'
  action CheckLowBalances() returns Integer;

  @requires: 'User'
  action TopUp(amount: Decimal(10,2)) returns String;

} 
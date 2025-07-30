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

  @requires:'authenticated-user'
  action Tap(machineId : UUID, userId : UUID) returns CoffeeTx;

  @requires:'authenticated-user'
  action TopUp(amount: Decimal(10,2)) returns String;
  
  @requires:'authenticated-user'
  action BatchPay() returns Integer;
  
  @requires:'Admin'
  action Forecast() returns Integer;
  
  @requires:'Admin'
  action ForecastBeans() returns array of {
    machineId: UUID;
    location: String;
    currentBeanLevel: Integer;
    estimatedBeansNextMonth: Integer;
    estimatedRefillsNeeded: Integer;
    normalCoffees: Integer;
    doubleCoffees: Integer;
  };

  @requires: 'authenticated-user'
  entity TopUpTransactions as projection on db.TopUpTransaction;
  
  @requires:'Admin'
  action CheckLowBalances() returns Integer;


  @requires: 'authenticated-user'
  function getCurrentUser() returns {
    userId: String;
    email: String;
    firstName: String;
    lastName: String;
    displayName: String;
  };
} 
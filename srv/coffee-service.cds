using { coffeex as db } from '../db/schema';
using { coffeex.views as views } from '../db/views';

service CoffeeService @(path:'/odata/v4') {


  @cds.redirection.target: true
  entity Users        as projection on db.User;
  
  entity Machines     as projection on db.Machine;
  entity CoffeeTx             as projection on db.CoffeeTx;
  entity RefillEvents           as projection on db.RefillEvent;
  
  entity LowBalanceUsers as projection on views.LowBalanceUsers;

  @requires:'authenticated-user'
  action Tap(machineId : UUID, userId : UUID, coffeeType : String(20) enum { NORMAL; DOUBLE; } default 'NORMAL') returns CoffeeTx;

  @requires:'authenticated-user'
  action TopUp(amount: Decimal(10,2)) returns String;
  
  @requires:'authenticated-user'
  action BatchPay() returns Integer;
  
  @requires:'admin'
  action Forecast() returns Integer;
  
  @requires:'authenticated-user'
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
  
  @requires:'admin'
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
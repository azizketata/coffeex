using namespace coffeex from '../db/schema';

service CoffeeService {
  entity Users      as projection on coffeex.User;
  entity Machines   as projection on coffeex.Machine;
  entity CoffeeTxes as projection on coffeex.CoffeeTx;
  entity RefillEvents as projection on coffeex.RefillEvent;

  action Tap(machineId : UUID, userId : UUID) returns CoffeeTx;
}

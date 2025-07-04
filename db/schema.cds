namespace coffeex;

entity User        { key userId : UUID; balance : Decimal(9,2); role : String; }
entity Machine     { key machineId : UUID; location : String; beanLevel : Integer; }
entity CoffeeTx    { key txId : UUID; userId : Association to User;
                     machineId : Association to Machine;
                     price : Decimal(5,2); paymentStatus : String; createdAt : Timestamp; }
entity RefillEvent { key eventId : UUID; machineId : Association to Machine;
                     qtyGram : Integer; time : Timestamp; }
using { managed } from '@sap/cds/common';
using { coffeex.jobs } from '../jobs/cron';

namespace coffeex;

entity User : managed {
  key userId     : UUID;
      email      : String(100);
      balance    : Decimal(9,2)  default 0;
      role       : String(30);
}

entity Machine : managed {
  key machineId  : UUID;
      location   : String(80);
      beanLevel  : Integer default 1000; // grams
      forecastDate : Date;               // next-empty prediction
}

entity CoffeeTx : managed {
  key txId       : UUID;
      user       : Association to User  on user.userId = userId;
      userId     : UUID;
      machine    : Association to Machine on machine.machineId = machineId;
      machineId  : UUID;
      price      : Decimal(5,2);
      paymentStatus : String(20) enum { OPEN; CAPTURED; FAILED; };
      coffeeType : String(20) enum { NORMAL; DOUBLE; } default 'NORMAL';
      beansUsed  : Integer default 7; // grams - 7g for normal, 14g for double
}

entity RefillEvent : managed {
  key eventId    : UUID;
      machine    : Association to Machine on machine.machineId = machineId;
      machineId  : UUID;
      qtyGram    : Integer;
}

entity TopUpTransaction : managed {
  key txId       : UUID;
      userId     : UUID;
      amount     : Decimal(10,2);
      status     : String(20) enum { PENDING; COMPLETED; FAILED; };
      paypalOrderId : String;
      createdAt  : Timestamp @default: current_timestamp;
}
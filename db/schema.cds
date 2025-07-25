using { managed } from '@sap/cds/common';
using { coffeex.jobs } from '../jobs/cron';

namespace coffeex;

entity User : managed {
  key userId     : UUID;
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
}

entity RefillEvent : managed {
  key eventId    : UUID;
      machine    : Association to Machine on machine.machineId = machineId;
      machineId  : UUID;
      qtyGram    : Integer;
}

entity TopUpTransaction {
  key txId       : UUID;
      userId     : UUID;
      amount     : Decimal(10,2);
      status     : String(20) enum { PENDING; COMPLETED; FAILED; };
      paypalOrderId : String;
      createdAt  : Timestamp @default: current_timestamp;
}
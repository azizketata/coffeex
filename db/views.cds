using { coffeex } from './schema';

namespace coffeex.views;

// View for users with low balance (< €5)
@readonly
entity LowBalanceUsers as 
  select from coffeex.User {
    userId,
    balance,
    role,
    createdAt,
    modifiedAt
  } where balance < 5.00; 
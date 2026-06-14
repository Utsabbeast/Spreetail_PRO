# CSV Anomaly Log & Database Schema

## The 12 Anomalies Detected

| Row | Description | Anomaly | Handling Action |
|-----|-------------|---------|----------------|
| 4/5 | Marina Bites Dinner | Duplicate entry with slightly different casing/punctuation | Dropped row 5 via UI confirmation step |
| 26 | Airport cab | Date formatted as `Mar-14` instead of DD-MM-YYYY | Auto-parsed `Mar-14` as March 14, 2026 |
| 20 | Aisha birthday cake | `unequal` split type, weights hidden in details | Extracted weights via regex |
| 14/31 | Pizza Friday / Brunch | Percentages sum to 110% | Rejected row; user must manually correct math |
| 22 | Parasailing | Guest "Kabir" included in split but not in group | Added guest cost to host (Dev) |
| 12 | House cleaning | Missing `paid_by` | Rejected row; requires payer |
| 25 | Parasailing refund | Negative amount (-30 USD) | Treated as group refund; offsets Dev's debts |
| 19/20/22/25 | Multiple USD entries | Currency is USD instead of INR | Converted to INR at fixed rate (1 USD = 83 INR) |
| 35/38 | Groceries / Electricity | Meera included in April splits despite moving out | Validated against `left_at`; excluded Meera from splits post-March 28 |
| 13/37 | Rohan paid back / Sam deposit | Settlements incorrectly logged as expenses | Created direct Settlement record instead of an Expense |
| 30 | Dinner Swiggy | Amount is 0 | Dropped row; no debt created |
| 41 | Furniture | `split_type` says equal but specific shares exist | Overrode type to use explicit shares |

## Database Schema

- **Group**: Core entity representing the flat.
- **User**: Django auth User.
- **GroupMember**: Junction table with `joined_at` and `left_at` to handle timeline constraints (Sam moving in, Meera moving out).
- **Expense**: Core transaction with `total_amount`, `date`, `paid_by`.
- **ExpenseSplit**: The exact amount owed by each participant.
- **Settlement**: Payments made directly to resolve debts (e.g. Sam's deposit, Rohan paying back).
- **UserBalance**: Materialized view representing a user's net standing in the group.

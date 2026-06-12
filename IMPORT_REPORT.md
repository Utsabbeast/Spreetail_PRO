# CSV Import Anomaly Report

*Note: This report details the anomaly detection protocols applied during bulk CSV expense ingestion.*

## Batch Import Log: `group_expenses_october.csv`
**Timestamp:** 2026-06-12 14:45:00 UTC
**Total Rows Processed:** 45
**Rows Successfully Imported:** 42
**Rows Rejected (Anomalies):** 3

### Detected Anomalies and Actions Taken

1. **Row 12: Invalid User Reference**
   - **Anomaly:** The CSV listed `Payer` as `JohnDoe#999`. No user exists in the system with Sequence Number `#999`.
   - **Action Taken:** Row 12 rejected. A validation error was returned to the user: *"User JohnDoe#999 does not exist in the database."*

2. **Row 28: Mathematical Split Mismatch**
   - **Anomaly:** The `Split Strategy` was set to `exact`, with a `Total Amount` of $100.00. However, the exact splits defined in the CSV were `$40.00` and `$50.00` (Sum: $90.00). The split amounts did not equal the total expense amount.
   - **Action Taken:** Row 28 rejected. The system enforced mathematical integrity and returned an error: *"The sum of exact split amounts ($90.00) must equal the total expense amount ($100.00)."*

3. **Row 35: Negative Expense Amount**
   - **Anomaly:** The `Total Amount` for a dinner expense was listed as `-$45.00`.
   - **Action Taken:** Row 35 rejected. The database schema strictly enforces positive `DecimalField` values for expenses. Error returned: *"Expense amount cannot be negative or zero."*

### Conclusion
The data integrity layer successfully blocked mathematically impossible splits and orphaned user references. All 42 valid rows were processed, generating the corresponding `ExpenseSplit` and `Settlement` records, and balances were updated according to the Greedy Simplification Algorithm.

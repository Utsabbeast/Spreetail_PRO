# Import Report

*Generated from `expenses_export.csv` ingestion run.*

## Summary
- **Total Rows Processed:** 42
- **Clean Rows Imported:** 26
- **Auto-Fixed Rows Imported:** 12
- **Rejected Rows (Require Manual Fix):** 4

## Detailed Log

**Row 12:**
- **Status:** 🔴 Rejected
- **Action:** Missing 'paid_by' user.

**Row 13:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Detected settlement disguised as an expense. Converted to Settlement record.

**Row 14:**
- **Status:** 🔴 Rejected
- **Action:** Percentages sum to 110%, not 100%.

**Row 19:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Converted USD to INR at rate 83.00.

**Row 20:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Converted USD to INR at rate 83.00.

**Row 22:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Converted USD to INR at rate 83.00. Guest 'Dev's friend Kabir' detected. Reallocating guest share to host (dev).

**Row 25:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Negative amount detected. Treating as a group refund. Converted USD to INR at rate 83.00.

**Row 26:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Auto-fixed 'Mar-14' date format to standard datetime.

**Row 27:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Missing currency defaulted to INR.

**Row 30:**
- **Status:** 🔴 Rejected
- **Action:** Zero amount expense detected. Dropping row.

**Row 31:**
- **Status:** 🔴 Rejected
- **Action:** Percentages sum to 110%, not 100%.

**Row 32:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Detected user moving out. Logged exit date.

**Row 35:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Excluded meera from split (moved out before this date).

**Row 37:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Detected settlement disguised as an expense. Converted to Settlement record.

**Row 41:**
- **Status:** 🟠 Auto-Fixed
- **Action:** Split type 'equal' overridden by explicit split details.

# 💰 Budget System — How It Works

## Overview

The budget system lets users set spending limits for different time periods. Every time an expense is recorded, the system automatically tracks how much of each budget has been used and triggers alerts when spending reaches critical thresholds — **60%**, **80%**, and **100%**.

---

## How a Budget is Created

A user creates a budget by specifying:

| Field      | Description                                                   | Example   |
| ---------- | ------------------------------------------------------------- | --------- |
| **amount** | The total spending limit                                      | ₹10,000   |
| **type**   | The budget period — `DAILY`, `WEEKLY`, `MONTHLY`, or `YEARLY` | `MONTHLY` |

Behind the scenes, two tracking fields are initialized automatically:

| Field              | Purpose                                            | Initial Value |
| ------------------ | -------------------------------------------------- | ------------- |
| **spent**          | How much has been spent against this budget so far | `0`           |
| **lastAlertLevel** | The highest alert threshold already triggered      | `null`        |

---

## What Happens When an Expense is Created

Every time a user creates a transaction with `type: "EXPENSE"` and `status: "COMPLETED"`, the following steps happen **atomically** (all-or-nothing inside a database transaction):

### Step 1 — Deduct from Account

The expense amount is subtracted from the linked account's balance.

### Step 2 — Update Budget Spending

**All** budgets belonging to the user are found, and the `spent` field on each is incremented by the expense amount.

### Step 3 — Check Alert Thresholds

For each budget, the system calculates:

```
usagePercent = (spent / budgetAmount) × 100
```

It then checks if usage has crossed any of these thresholds **for the first time**:

| Threshold | Meaning                                   |
| --------- | ----------------------------------------- |
| **60%**   | ⚠️ Warning — Over half the budget is used |
| **80%**   | 🔶 Alert — Budget is running low          |
| **100%**  | 🔴 Critical — Budget is fully exhausted   |

> [!IMPORTANT]
> Each threshold fires **only once**. The `lastAlertLevel` field remembers what was already triggered, so the user won't receive the same alert twice.

### Step 4 — Return Alert Data

If any thresholds were crossed, the API response includes a `budgetAlerts` array that can be used to send email notifications.

---

## Walkthrough Example

Let's say **Rahul** sets a **Monthly Budget of ₹10,000**.

```
Budget Created:
  amount: ₹10,000
  type: MONTHLY
  spent: ₹0
  lastAlertLevel: null
```

### Transaction 1 — Groceries: ₹3,000

| Field         | Value   |
| ------------- | ------- |
| Spent (after) | ₹3,000  |
| Usage         | **30%** |
| Alert?        | ❌ No   |

> 30% is below the first threshold (60%). No alert fired.

---

### Transaction 2 — Electronics: ₹4,000

| Field         | Value                        |
| ------------- | ---------------------------- |
| Spent (after) | ₹7,000                       |
| Usage         | **70%**                      |
| Alert?        | ✅ **60% threshold crossed** |

> Usage jumped from 30% → 70%, crossing the **60%** mark.  
> `lastAlertLevel` is updated to `60`.  
> 📧 Email: _"You've used 70% of your ₹10,000 monthly budget."_

---

### Transaction 3 — Dinner: ₹1,500

| Field         | Value                        |
| ------------- | ---------------------------- |
| Spent (after) | ₹8,500                       |
| Usage         | **85%**                      |
| Alert?        | ✅ **80% threshold crossed** |

> Usage went from 70% → 85%, crossing the **80%** mark.  
> `lastAlertLevel` is updated to `80`.  
> 📧 Email: _"You've used 85% of your ₹10,000 monthly budget. Only ₹1,500 remaining!"_

---

### Transaction 4 — Shopping: ₹2,000

| Field         | Value                         |
| ------------- | ----------------------------- |
| Spent (after) | ₹10,500                       |
| Usage         | **105%**                      |
| Alert?        | ✅ **100% threshold crossed** |

> Usage went from 85% → 105%, crossing the **100%** mark.  
> `lastAlertLevel` is updated to `100`.  
> 📧 Email: _"You've exceeded your ₹10,000 monthly budget! Total spent: ₹10,500."_

---

### Transaction 5 — Coffee: ₹500

| Field         | Value    |
| ------------- | -------- |
| Spent (after) | ₹11,000  |
| Usage         | **110%** |
| Alert?        | ❌ No    |

> All thresholds (60, 80, 100) have already been triggered.  
> `lastAlertLevel` is already `100`, so no new alert fires.

---

## Full Timeline Summary

| #   | Expense     | Amount | Total Spent | Usage % | Alert Triggered |
| --- | ----------- | ------ | ----------- | ------- | --------------- |
| 1   | Groceries   | ₹3,000 | ₹3,000      | 30%     | —               |
| 2   | Electronics | ₹4,000 | ₹7,000      | 70%     | ⚠️ 60%          |
| 3   | Dinner      | ₹1,500 | ₹8,500      | 85%     | 🔶 80%          |
| 4   | Shopping    | ₹2,000 | ₹10,500     | 105%    | 🔴 100%         |
| 5   | Coffee      | ₹500   | ₹11,000     | 110%    | —               |

---

## API Response Example

When a threshold is crossed, the transaction response includes alert data:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "_id": "661a...",
      "type": "EXPENSE",
      "amount": 4000,
      "category": "SHOPPING",
      "status": "COMPLETED"
    },
    "budgetAlerts": [
      {
        "budgetId": "660b...",
        "type": "MONTHLY",
        "usagePercent": 70,
        "alertLevel": 60,
        "budgetAmount": 10000,
        "spent": 7000
      }
    ]
  }
}
```

> [!TIP]
> The `budgetAlerts` array is only present when at least one threshold was crossed. Use this data to send email notifications via **Nodemailer**.

---

## Key Design Decisions

1. **All budgets are checked** — When an expense is made, every budget the user has (DAILY, WEEKLY, MONTHLY, YEARLY) gets updated. This way a single ₹5,000 expense can trigger alerts on the daily budget (if it's ₹6,000) without missing the monthly budget.

2. **Thresholds are checked in descending order (100 → 80 → 60)** — If a single large expense jumps from 50% to 90%, only the **80% alert** fires (the highest crossed threshold). The 60% alert is skipped since 80% is more relevant.

3. **Everything is atomic** — Budget updates happen inside the same MongoDB transaction as the account balance update. If anything fails, everything rolls back — no inconsistent state.

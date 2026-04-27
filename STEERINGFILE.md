# Backend Steering File

## Project: Expense Tracker (MERN + TypeScript + ESM)

---

# 1. Tech Stack

Runtime:

- Node.js (ESM mode)
- Express 5
- TypeScript

Database:

- MongoDB
- Mongoose

Authentication:

- JWT (Access + Refresh)

Utilities:

- asyncHandler (custom wrapper)
- responseTemplate (standard response format)
- http-errors

File uploads:

- Multer
- Cloudinary

External Integrations:

- Google APIs (Gemini / email)
- Axios

---

# 2. Project Structure (Feature-Based Modular)

src root:

accounts/
transactions/
budgets/
users/
middlewares/
utils/
config/
db/

Root files:

- server.ts
- constant.ts
- types.ts

Each feature module contains:

accounts/
accounts.controller.ts
accounts.model.ts
accounts.routes.ts
accountstypes.ts

Rule:
Each domain is self-contained.

Do NOT mix account logic inside transaction module.

---

# 3. Controller Philosophy (Current Architecture)

Since service layer is not yet implemented:

Controllers currently handle:

- Validation
- DB queries
- Ownership checks
- Response formatting

However:

Controllers must remain readable.
Avoid deeply nested logic.

When complexity increases:
Move business logic into:
accounts.service.ts
transactions.service.ts
etc.

---

# 4. Response Standard

All responses must use:

response(success, message, data)

Example:

res.status(200).json(
response(true, "Account created successfully", account)
)

Never send raw JSON without wrapper.

---

# 5. Authentication Rules

- Access token expiry short (recommended: 15m)
- Refresh token expiry long (7d)
- Refresh token stored in httpOnly cookie
- Access token sent in Authorization header

Never trust userId from frontend.
Always use:

req.user.\_id

---

# 6. ObjectId Rules

Never compare ObjectId using:

account.userId === req.user.\_id

Always use:

account.userId.equals(req.user.\_id)

or

account.userId.toString()

---

# 7. Account Module Rules

Account represents:

- Savings
- Current
- Wallet

When creating account:

- userId must be req.user.\_id
- Default balance = 0 if not provided
- Validate enum type strictly

When updating account:

- Validate ownership before update
- Never allow cross-user access

---

# 8. Transaction Safety Rules (CRITICAL)

Whenever:

- Creating transaction
- Updating balance
- Processing recurring payment

Must use MongoDB session:

1. Start session
2. Insert transaction
3. Update account balance
4. Commit transaction
5. Abort on failure

Financial consistency is top priority.

Balance must always reflect sum of transactions.

---

# 9. Budget Rules

Budget represents monthly expense cap.

On every EXPENSE:

- Calculate monthly total expense
- Compare with budget
- If exceeded:
  - Send alert email
  - Update lastAlertSent

Avoid spamming user with alerts.

---

# 10. Validation Rules

Never use:

!boolean

Instead:

value === undefined

For numbers:
value === undefined

For strings:
!string

Validate enums explicitly.

---

# 11. Error Handling

Use createHttpError.

Never expose raw stack trace.

All errors must pass through centralized error middleware.

---

# 12. Security

- Hash passwords using bcrypt
- Validate ObjectId before DB queries
- Use CORS properly
- Use cookie-parser securely
- Never log tokens in production

---

# 13. Performance Rules

Add indexes on:

- userId
- accountId
- createdAt

Avoid redundant queries like:

create()
then findById()

create() already returns document.

Prefer:

const account = await accountModel.create(...)

---

# 14. Coding Standards

- Use async/await only
- No .then()
- No deeply nested try/catch
- Use asyncHandler wrapper
- Keep functions small
- Use descriptive variable names

---

# 15. Future Refactor Plan

Phase 1 (Current):
Controller-driven logic.

Phase 2:
Introduce service layer per module.

accounts.service.ts
transactions.service.ts

Move:

- Balance logic
- Recurring logic
- Budget checks
- Aggregation queries

out of controllers.

---

# 16. Core Backend Philosophy

- Financial correctness > speed
- Clean modular architecture
- Ownership validation mandatory
- Never allow balance inconsistency
- Keep controllers thin
- Separate concerns gradually

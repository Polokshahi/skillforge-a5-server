### 2️⃣ Server (Backend) `README.md`


# ⚡ SkillForge Academy - REST API Backend

This repository houses the scalable and secure backend application layer powering the **SkillForge Academy** platform. It is engineered utilizing **Node.js**, **Express v5**, **TypeScript**, **Prisma ORM**, and a relational **PostgreSQL** database engine.

## 🚀 Live Links
- **Backend API Live URL:** [Insert Render/Railway Live URL here]
- **Frontend Live URL:** [Insert Vercel Live URL here]
- **Frontend Repository:** [Insert Frontend GitHub Link here]

---

## ⚡ Core Architecture & Functionality

1. **Production-Ready REST API:** Developed modular separation patterns partitioning routes, controllers, Prisma data queries, schema schemas, and structural security layers cleanly.
2. **Secure Authentication Ecosystem:** Implements absolute security protocols utilizing JWT token strings (`jsonwebtoken`), processed safely under server-managed browser structures using `cookie-parser`. Password hashes are securely scrambled utilizing `bcryptjs`.
3. **Role-Based Access Control (RBAC):** Middleware controls intercept incoming requests to strictly enforce authorization parameters based on user claims:
   - `Admin`: Unrestricted authorizations allowing CRUD routines across courses, modules, tracking data, and administrative reporting.
   - `User (Student)`: Bound exclusively to viewing public indexes, executing purchases, and tracking individual profiles.
4. **Data Middleware and Security Shields:** Protected against malicious scripts or attacks using `helmet` configurations, combined with resource rate throttling via `express-rate-limit` to neutralize brute-force vector attempts.
5. **Strict Data Validation:** Utilizes `zod` schemas on input vectors to block invalid body payloads immediately, delivering structured JSON validation exceptions smoothly to the client-side handlers.
6. **Payment Gateway Pipeline:** Implements native server SDK handling workflows via `stripe` to securely capture payments and unlock courses upon successful checkout callbacks.

---

## 🛠️ Technology Stack Used

- **Runtime & Framework:** Node.js & Express v5 (Beta)
- **Language Layer:** TypeScript (using `tsc` build configurations and runtime watching via `tsx`)
- **Database Engine:** PostgreSQL
- **ORM Tooling:** Prisma ORM
- **Security Tools:** JSONWebToken, BcryptJS, Helmet, Express-Rate-Limit, CORS
- **Validation Engine:** Zod
- **Utilities:** Cookie-Parser, Dotenv, Morgan Logger

---

## ⚙️ Local Setup Instructions

Follow these steps to run the backend application layer inside a local testing layout:

1. **Clone the repository:**

   git clone [your-backend-repo-url]
   cd [repo-folder-name]

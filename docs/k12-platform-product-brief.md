# K–12 Education Platform — Product & Architecture Brief

**Prepared by:** Jin Hyung Lee  
**Audience:** Internal founding team  
**Date:** May 2026  
**Jurisdiction:** Saskatchewan, Canada (K–12 public education sector)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Context](#2-market-context)
3. [Platform Strategy — Modular Architecture](#3-platform-strategy--modular-architecture)
4. [Core Product 1 — Facilities Booking Application](#4-core-product-1--facilities-booking-application)
5. [Core Product 2 — Parent Portal](#5-core-product-2--parent-portal)
6. [Cross-Cutting Technical Architecture](#6-cross-cutting-technical-architecture)
7. [Security, Privacy & Compliance](#7-security-privacy--compliance)
8. [Integrations Master List](#8-integrations-master-list)
9. [Reporting & Analytics Standards](#9-reporting--analytics-standards)
10. [Future Module Roadmap](#10-future-module-roadmap)
11. [Team & Operational Model](#11-team--operational-model)
12. [Go-to-Market — Central Platform & Sales](#12-go-to-market--central-platform--sales)
13. [Risk Considerations](#13-risk-considerations)

---

## 1. Executive Summary

This document outlines the product strategy, feature requirements, and technical architecture for a suite of modular software products targeting the Canadian K–12 education market, with an initial focus on Saskatchewan school divisions.

The core thesis is straightforward: school divisions operate with lean IT teams and tight budgets, yet are underserved by enterprise vendors whose products are expensive, over-engineered, and poorly integrated with each other. There is a real opportunity to deliver tightly scoped, well-designed, and affordable modular tools that solve immediate operational pain points — starting with **Facilities Booking** and a **Parent Portal** — while building toward a broader ecosystem sold through a central platform.

The suite is designed to be:

- **Modular** — schools buy only what they need, and modules integrate naturally with each other.
- **Maintainable** — a team of 4–5 developers and 1 IT administrator can own the full stack.
- **Secure and compliant** — built to Saskatchewan FOIPP Act and federal PIPEDA requirements from day one.
- **API-first** — every module exposes and consumes APIs, enabling integration with existing school software and third-party services.

---

## 2. Market Context

### 2.1 Saskatchewan K–12 Landscape

- Saskatchewan has approximately **28 school divisions** (public and separate), ranging from large urban divisions (Regina, Saskatoon) to small rural and northern divisions.
- Divisions are governed independently but share curriculum, provincial reporting requirements, and in some cases shared IT infrastructure.
- The Ministry of Education mandates specific student data and reporting standards, creating a compliance baseline all software must meet.
- Budget cycles are annual and tied to provincial funding. Purchasing decisions typically require division-level approval, often by a superintendent or board.

### 2.2 Problem Space

| Pain Point | Current State | Opportunity |
|---|---|---|
| Facilities scheduling | Spreadsheets, email chains, or outdated booking tools | Modern real-time booking with workflow automation |
| Parent communication | Static newsletters, phone calls, one-off emails | Unified parent portal with scoped, personalized information |
| Fee collection | Cash, cheques, or fragmented payment processors | Integrated POS and online payment with automated distribution |
| Data silos | SIS, finance, facilities, and communication tools don't talk | API-connected modules on a shared identity layer |
| Vendor lock-in | Large vendors (PowerSchool, Maplewood) dominate SIS | Modular alternatives that augment or replace legacy tools |

### 2.3 Competitive Differentiation

- **Local and sector-specific** — built for Saskatchewan, not adapted from a US product.
- **Interoperable** — designed to sit beside existing SIS/ERP systems rather than requiring a rip-and-replace.
- **Affordable** — SaaS pricing at a per-division or per-school tier that fits small-division budgets.
- **Responsive support** — a small, local team can respond to issues faster than any enterprise vendor.

---

## 3. Platform Strategy — Modular Architecture

### 3.1 The Central Platform

All modules are sold and accessed through a single **Central Platform** — a branded web application that acts as:

1. **Identity hub** — SSO entry point for all users (admins, school staff, parents, public).
2. **Module launcher** — a dashboard linking to all purchased modules for that division.
3. **Marketplace** — where divisions browse, trial, and purchase additional modules.
4. **Admin control plane** — division-level configuration, user management, and billing.

Think of it as a lightweight "app store plus portal" specific to the K–12 context — not a general SaaS marketplace, but a purposeful hub that makes the suite feel like one product rather than a collection of tools.

### 3.2 Module Independence and Integration

Each module is independently deployable and usable in isolation. However, when multiple modules are purchased, they share:

- **Shared Identity Layer** — SSO via a central identity provider (IdP); users log in once and access all modules.
- **Shared Data Bus** — lightweight event system (e.g., webhooks or message queue) allowing modules to react to each other's events (e.g., a payment confirmed in the Parent Portal triggers a notification in the Facilities module if relevant).
- **Shared Tenant Registry** — the platform knows which school division and which school(s) each user belongs to; all modules inherit this context.
- **Shared Reporting Engine** — modules emit structured events into a central reporting layer (described in Section 9).

### 3.3 Tenancy Model

The platform uses a **multi-tenant architecture scoped to school divisions**, with sub-tenancy at the individual school level within a division:

```
Platform Tenant
  └── School Division (e.g., Regina Catholic School Division)
        ├── School A (e.g., Bishop Filevich Collegiate)
        ├── School B (e.g., Holy Family School)
        └── School C ...
```

- Division admins have full access across all schools in their division.
- School admins have access scoped to their school.
- Parents/guardians have access scoped only to their own child(ren).
- All data is logically separated at the division level; data from Division A is never accessible to Division B.

---

## 4. Core Product 1 — Facilities Booking Application

### 4.1 Product Overview

A real-time facilities scheduling and booking system that replaces spreadsheets and email-based processes for managing school and division-owned spaces: gymnasiums, classrooms, auditoriums, fields, meeting rooms, and portable buildings.

The product has two primary interfaces:
- **Public-facing booking portal** — for external community groups, staff, and other parties to browse and request spaces.
- **Admin management console** — for division and school staff to configure facilities, manage requests, and oversee the calendar.

### 4.2 User Roles

| Role | Description |
|---|---|
| **Super Admin** | Division-level admin with access to all schools and all facilities. |
| **School Admin** | School-level admin managing only their school's facilities. |
| **Approver** | Staff member authorized to approve or deny booking requests (may be the same as School Admin). |
| **Internal Requester** | A logged-in staff member requesting a space for a school-sanctioned activity. |
| **External Requester** | A community member or external organization requesting use of a facility (authenticated via public form or SSO). |
| **Public Viewer** | Unauthenticated public user who can view facility availability calendars but cannot book. |

### 4.3 Public-Facing Portal — Feature Requirements

#### 4.3.1 Facility Catalog
- Display all bookable facilities across the division, filterable by school, facility type (gym, field, classroom, etc.), and amenities (projector, accessible, kitchen, etc.).
- Each facility has a detail page with:
  - Name, description, photos.
  - Capacity and amenities list.
  - Rules and conditions of use (displayed before booking).
  - Contact information for the approver.

#### 4.3.2 Real-Time Availability Calendar
- A calendar view (day, week, month) showing confirmed bookings as blocked time and available slots as open.
- Real-time updates: when a booking is confirmed by an admin, the slot is immediately reflected as unavailable to other viewers without a page refresh (WebSocket or server-sent events).
- Slots being actively reviewed (pending approval) should be visually distinct from confirmed bookings — the system should allow a configurable "hold" on a slot during the approval window to prevent double-booking requests for the same slot, with a timeout if the request is denied or expires.

#### 4.3.3 Booking Request Flow
- Unauthenticated external users complete a structured request form (name, organization, contact, purpose, insurance certificate upload if required, expected attendance).
- Authenticated internal users (staff) can book with a shorter form given their profile data is already known.
- Form can be powered by JotForm or a native form builder, depending on configuration.
- On submission, the requester receives an automated email/SMS acknowledgment with a reference number and expected response time.
- Requester can check the status of their request via a status page using their reference number (no login required for external users).

#### 4.3.4 Conflict Prevention
- The system enforces hard conflicts: a facility cannot be double-booked for the same slot.
- Soft conflicts (e.g., setup/teardown buffer times set by admin) are configurable per facility and are automatically applied.
- Recurring booking requests are supported and conflict-checked across the full series before submission.

### 4.4 Admin Management Console — Feature Requirements

#### 4.4.1 Facility Configuration
- Create, edit, and deactivate facilities.
- Define operating hours and blackout dates (e.g., school holidays, maintenance windows).
- Set booking rules per facility: minimum/maximum booking duration, advance notice required, insurance required, fee applicable.
- Upload and manage facility photos.
- Define amenities and equipment associated with each facility.

#### 4.4.2 Booking Request Management
- Unified inbox for all pending booking requests.
- Filterable by school, facility, date range, requester type, and status.
- Single-click approve or deny with a required note on denial.
- Bulk approval actions for recurring series.
- Internal notes field on each booking (not visible to requester).
- Reassign requests to a different approver.

#### 4.4.3 Calendar Management
- Admin calendar view showing all bookings across all facilities.
- Ability to create bookings directly (bypassing the approval workflow — for admin-initiated bookings).
- Drag-and-drop rescheduling of existing bookings (with automatic notification to the requester).
- View bookings by facility, by school, or division-wide.

#### 4.4.4 Notifications and Communications
- Automated email and SMS (via Twilio) notifications at each booking lifecycle stage: received, under review, approved, denied, reminder before booking date, post-booking follow-up.
- Admin-configurable notification templates.
- Bulk messaging: admin can send a custom message to all requesters booked at a given facility within a date range (e.g., for a facility closure).

#### 4.4.5 Reporting
- Utilization reports per facility: hours booked vs. available, by time period.
- Revenue reports if facility fees are applicable.
- Requester history: all bookings by a given external organization.
- Export to CSV and PDF.
- Dashboard widgets: today's bookings, pending approvals count, most-utilized facilities.

### 4.5 Integrations

| Integration | Purpose |
|---|---|
| **SSO (SAML 2.0 / OIDC)** | Internal staff and admin authentication via the division's existing identity provider (Active Directory, Azure AD). |
| **Twilio** | SMS and voice notifications throughout the booking lifecycle. |
| **JotForm** | Optional: use JotForm as the external-facing booking request form, with webhook delivery of submissions into the booking system. |
| **Jira** | Optional: when a booking is confirmed, automatically create a Jira issue for the facilities/maintenance team to prepare the space (lighting, setup, cleanup). Configurable issue type and project per facility. |
| **Central Platform API** | Booking events published to the shared platform event bus for cross-module consumption. |
| **iCal / Google Calendar** | Export booking confirmations as calendar events for requesters and internal staff. |

### 4.6 API Surface

The Facilities Booking module exposes a versioned REST API (`/api/v1/facilities/...`) for:

- `GET /facilities` — list all facilities with availability metadata.
- `GET /facilities/{id}/availability` — get availability for a facility over a date range.
- `POST /bookings` — submit a booking request programmatically.
- `GET /bookings/{id}` — retrieve booking status.
- `PATCH /bookings/{id}` — update a booking (admin only).
- `DELETE /bookings/{id}` — cancel a booking.
- `GET /reports/utilization` — pull utilization data (admin only, report scope).

All API endpoints require an API key scoped to the requesting division. Rate limiting and request logging are applied at the API gateway level.

---

## 5. Core Product 2 — Parent Portal

### 5.1 Product Overview

A unified web portal for parents and guardians to engage with their children's school experience — viewing grades, paying fees, reading school news, and managing their communication preferences — all in a single authenticated interface scoped tightly to their family.

The product has three interfaces:
- **Parent/Guardian Portal** — the primary consumer-facing interface.
- **Division/School Admin Console** — for division and school staff to manage content, payments, and communications.
- **Finance & Payment Dashboard** — for business office staff to manage payment processing, reconciliation, and distribution.

### 5.2 User Roles

| Role | Description |
|---|---|
| **Division Admin** | Full access to all schools, all settings, all financial data. |
| **School Admin** | Access scoped to their school: student lists, fees, news, events. |
| **Teacher** | Limited access: input grades (via integration), view their class roster. |
| **Business Office Staff** | Access to payment management, reports, and reconciliation only. |
| **Parent/Guardian** | Access scoped exactly to their registered child(ren). |

### 5.3 Multi-School, Multi-Student Scoping

This is a critical architectural requirement. A parent may have:

- One child at School A and another at School B within the same division.
- Children who switch schools mid-year.
- Shared custody arrangements where two guardians independently access the same student profile.

The scoping rules:

- A parent sees **only** their registered children; no other student data is ever accessible.
- When a parent views news, calendars, or events, the content is filtered to the schools their children attend.
- Fee items are scoped to the individual student — a parent with two children sees separate fee lists per child.
- When a parent logs in, they land on a **family dashboard** that lists each child, with the school name displayed clearly. They click into a child's profile to see that student's specific information.
- Shared-custody scenarios: both guardians can have independent accounts linked to the same student(s). Each account is separately managed; no cross-guardian data sharing.

### 5.4 Parent/Guardian Portal — Feature Requirements

#### 5.4.1 Family Dashboard
- Landing page after login showing all registered children as cards.
- Each child card shows: name, school, grade, unread notification count, outstanding fee amount.
- Quick actions: pay outstanding fees, view latest report card, open school news feed.

#### 5.4.2 Student Profile
- Student name, grade, homeroom teacher, school name, school year.
- Enrollment history (read-only).
- Photo (if uploaded by school).

#### 5.4.3 Grades and Academic Progress
- Pulled via API integration from the division's Student Information System (SIS) — e.g., PowerSchool, Maplewood, Destiny, or custom.
- Display: current term grades by subject, teacher comments, report cards as PDF download.
- Historical terms viewable.
- The portal does not store canonical grade data; it reads and caches from the SIS API on a configurable refresh interval.
- If SIS integration is not yet configured, this section displays a placeholder with an admin contact.

#### 5.4.4 Fee Management (Parent View)
- List of all outstanding and paid fees associated with the student.
- Fee categories: school supplies, field trips, extracurricular programs, hot lunch, technology fee, etc. (configurable by school admin).
- Each fee item shows: name, description, amount, due date, payment status.
- Parents can select individual fees or all outstanding fees to pay in a single transaction.
- On payment completion, a receipt is generated and emailed; the fee item is marked paid.
- Payment history tab: all past transactions with date, amount, description, and downloadable receipt.

#### 5.4.5 Online Payment Processing
- Integrated with **Square** for payment processing.
- Accepted methods: credit card, debit card. E-transfer option configurable per division.
- PCI-DSS compliant: card data is never stored on platform servers; Square's tokenization handles all sensitive data.
- Parents can save a payment method (via Square's tokenization) for faster future payments.
- Transaction fees: configurable per division — either absorbed by the school or passed to the parent (displayed as a line item before confirmation).

#### 5.4.6 School News and Announcements
- A news/announcement feed scoped to the schools the parent's children attend.
- Types: division-wide announcements, school-wide announcements, grade-level announcements, individual student notifications.
- Rich text content with support for embedded images and file attachments.
- News items can be flagged as requiring parent acknowledgment (parent must click "I have read this").
- School admin can schedule news items to publish at a future date/time.

#### 5.4.7 Calendar and Events
- School and division event calendar filtered to the parent's relevant schools.
- Event types: school days, holidays, PA days, field trips, school events (concerts, sports days), deadlines (fee due dates, form submission deadlines).
- Export to iCal / Google Calendar.
- Fee payment deadlines automatically appear on the calendar as events linked to the fee item.

#### 5.4.8 Notifications and Preferences
- Parents configure their notification preferences: email, SMS (via Twilio), or in-app.
- Notification triggers: new fee posted, payment due reminder, payment confirmed, new news item, grade updated, new event.
- Mass notification capability (admin-initiated, described in Section 5.5.4).

#### 5.4.9 Document Centre
- School-provided documents: handbooks, consent forms, supply lists, permission slips.
- Documents can be student-specific or school-wide.
- Permission slips: a document type that requires a parent e-signature or digital acknowledgment before it's marked complete.

### 5.5 Admin Console — Feature Requirements

#### 5.5.1 School Configuration
- Division admin configures schools: name, address, principal, contact info, logo, color scheme.
- Per-school feature toggles: enable/disable grades display, news feed, payments, documents.
- Academic year and term configuration.

#### 5.5.2 Student and Guardian Management
- Import student roster via CSV or SIS API sync.
- Manually associate parent/guardian accounts to students.
- Handle custody arrangements: flag students with split-custody; multiple guardians can be linked with configurable access levels (e.g., one guardian has payment access, both have read-only grade access).
- Student status management: active, graduated, transferred, withdrawn.

#### 5.5.3 Fee and Payment Management (Admin)
- Create fee items: name, category, amount, applicable students (all school, specific grade, specific students), due date, description.
- Fee assignment rules: auto-assign a fee to all students in Grade 5, or to students enrolled in a specific program.
- View payment status per fee item: paid count, outstanding count, total collected, total outstanding.
- Mark a fee as paid manually (for cash/cheque payments received at the school).
- Issue full or partial refunds through Square.
- Waive a fee for specific students with a reason note (for bursary or hardship situations).

#### 5.5.4 POS (Point of Sale) Integration
- A simple POS interface usable by school staff on a tablet or desktop.
- Staff search for a student by name or student ID.
- Select fee items to charge, or create a one-off charge.
- Accept payment via Square card reader (USB or Bluetooth-connected terminal), or record cash/cheque received.
- The POS is fully integrated with the same fee management system — payments made at the POS are reflected immediately in the parent's payment history and the admin's financial dashboard.

#### 5.5.5 Payment Distribution
- Fees collected flow into a central division account and are then distributed to designated sub-accounts or cost centres based on configurable rules:
  - Fee Category A → Athletics Fund.
  - Fee Category B → School Technology Budget.
  - Field trip fees → individual school's activity account.
- Distribution can be automatic (on payment completion) or batched (manual trigger by business office).
- Full audit trail: every distribution event is logged with timestamp, amount, fee source, and destination.
- Integration point with Business Central ERP for journal entry export (described in Section 8).

#### 5.5.6 News and Content Management
- Rich text editor for creating news items and announcements.
- Target audience selector: division-wide, specific school(s), specific grade(s), or specific student(s).
- Schedule publish date/time.
- Acknowledgment tracking: for items requiring parent acknowledgment, view which parents have and have not acknowledged.
- Draft, published, and archived states.

#### 5.5.7 Mass Notifications
- Compose and send notifications to a filtered parent audience: all parents in the division, all parents at a school, parents of students in a specific grade, or parents of students meeting a custom filter (e.g., outstanding fees over $50).
- Delivery channels: email, SMS (Twilio), in-app push notification.
- Scheduled sending.
- Delivery report: sent count, failed count, open rate (email).

#### 5.5.8 Forms and Consent Management
- Create digital forms: consent forms, permission slips, surveys.
- Distribute to specific student groups.
- Track completion status per student.
- Collect responses and export.
- Integration with JotForm as an alternative form engine if preferred.

### 5.6 Financial Reporting (Business Office)

- Daily, weekly, and monthly payment summary reports.
- Outstanding fees aging report: fees overdue by 0–30, 31–60, 60+ days.
- Fee collection rate by school, grade, or fee category.
- Square reconciliation report: match portal transactions to Square settlement records.
- Distribution ledger: record of all cost-centre distributions.
- Export to CSV, PDF, and Business Central journal entry format.

### 5.7 API Surface

The Parent Portal module exposes a versioned REST API for integration with external systems:

- `GET /students/{id}` — retrieve student profile data (for SIS sync).
- `POST /students/{id}/fees` — push a fee item programmatically (for ERP integration).
- `GET /students/{id}/payments` — retrieve payment history.
- `POST /notifications` — trigger a targeted notification programmatically.
- `GET /schools/{id}/news` — retrieve published news for a school.
- `POST /grades/sync` — trigger a grades refresh from the SIS.
- `GET /reports/payments` — pull payment data for a date range (business office scope).

---

## 6. Cross-Cutting Technical Architecture

### 6.1 Technology Stack Recommendation

The goal is to choose technologies that a team of 4–5 full-stack developers can own end-to-end without deep specialization — avoiding "pet" technologies that only one person understands.

| Layer | Recommendation | Rationale |
|---|---|---|
| **Frontend** | Next.js (React) with TypeScript | SSR for SEO and performance, strong ecosystem, excellent TypeScript support, one framework for all modules. |
| **Backend API** | Node.js with TypeScript (Hono or Fastify) | Lightweight, performant, same language as frontend reduces context switching. |
| **Database** | PostgreSQL | Relational model fits the structured, transactional nature of the domain (fees, bookings, students). Battle-tested, excellent hosting options. |
| **Cache / Real-Time** | Redis | Session storage, rate limiting, real-time slot availability pub/sub for the booking system. |
| **Authentication** | Auth0 or Keycloak (self-hosted) | Handles SSO (SAML, OIDC), MFA, and user management without building from scratch. Keycloak preferred if data residency is a hard requirement. |
| **Background Jobs** | BullMQ (Redis-backed) | Fee due date reminders, report generation, Twilio batch sends, SIS sync jobs. |
| **File Storage** | AWS S3 (Canadian region: ca-central-1) or Cloudflare R2 | Facility photos, student documents, report cards. Canadian data residency compliant. |
| **Hosting** | AWS (ca-central-1) or Railway / Render | Managed PostgreSQL (RDS), containerized app deployment. Canadian region for compliance. |
| **CI/CD** | GitHub Actions | Automated test runs, linting, build, and deployment on merge to main. |
| **Monitoring** | Sentry (error tracking) + Grafana/Prometheus (metrics) | Essential for a small team — know about issues before clients report them. |

### 6.2 Multi-Tenancy Implementation

- The database uses a **tenant isolation pattern**: every table that stores tenant-specific data includes a `division_id` column, and all queries include a `WHERE division_id = ?` clause enforced at the ORM/query builder level.
- A tenant context middleware on the API layer resolves the current division from the JWT and injects it into every request — no handler code manually passes tenant ID.
- A separate `school_id` column handles school-level scoping within a division, following the same pattern.
- Database row-level security (PostgreSQL RLS) provides a secondary enforcement layer as a defense-in-depth measure.

### 6.3 Real-Time Availability (Facilities Booking)

- When a booking request is submitted, the system creates a provisional hold on the slot (status: `PENDING`) and broadcasts a slot-unavailable event via Redis pub/sub.
- All connected public portal clients subscribed to that facility's availability channel receive the update via Server-Sent Events (SSE) and immediately show the slot as tentatively unavailable.
- On admin approval, the slot status moves to `CONFIRMED` and the event is re-broadcast.
- On admin denial, the slot is released and broadcast as available again.
- Holds have a configurable auto-expiry (e.g., 48 hours for pending approval) after which the slot is released if no decision has been made.

### 6.4 API Gateway and Authentication

- All API requests pass through a central API gateway that enforces:
  - JWT validation (issued by the identity provider).
  - Division-level API key validation (for machine-to-machine integrations).
  - Rate limiting per client.
  - Request/response logging for audit purposes.
- The gateway routes requests to the appropriate module backend.
- External API consumers (e.g., SIS pulling student data) authenticate via OAuth 2.0 client credentials flow.

### 6.5 Event Bus

- A lightweight internal event bus (Redis Streams or a simple webhook dispatcher) allows modules to emit and consume events without direct coupling:
  - Parent Portal emits `payment.confirmed` → Facilities module could check if a fee is linked to a booking.
  - Facilities module emits `booking.confirmed` → Jira ticket created, Twilio SMS sent.
  - Parent Portal emits `student.enrolled` → SIS sync triggered.
- Start simple with Redis Streams; graduate to a proper message broker (NATS or RabbitMQ) if event volume warrants it.

### 6.6 Database Schema Principles

- All tables include: `id` (UUID), `created_at`, `updated_at`, `deleted_at` (soft deletes — never hard-delete records).
- Soft deletes are critical: a student who withdraws, a fee that is waived, a booking that is cancelled — all must remain in the audit trail.
- Migrations managed with a versioned migration tool (Flyway or Drizzle ORM migrations).
- Foreign key constraints enforced at the database level, not just application level.

---

## 7. Security, Privacy & Compliance

### 7.1 Applicable Legislation

| Legislation | Scope |
|---|---|
| **Saskatchewan FOIPP Act** (Freedom of Information and Protection of Privacy Act) | All data collected, used, and disclosed by public school divisions. Requires purpose limitation, data minimization, and privacy impact assessments. |
| **Federal PIPEDA** (Personal Information Protection and Electronic Documents Act) | Applies to any commercial use of personal information. Relevant to the platform operator's relationship with divisions. |
| **PCI-DSS** | Applies to all payment card data handling. Compliance is largely delegated to Square (a certified PCI-DSS Level 1 service provider), but the platform must follow integration requirements. |

### 7.2 Data Residency

- All data must be stored in Canadian data centres.
- Primary hosting: AWS `ca-central-1` (Montreal) or `ca-west-1` (Calgary).
- No data in transit or at rest should traverse US-based infrastructure, including CDN edge nodes for sensitive endpoints.
- Cloudflare Workers or AWS CloudFront with Canadian region pinning for CDN-served static assets.

### 7.3 Authentication and Access Control

- **SSO mandatory** for all staff and admin roles via SAML 2.0 or OIDC, integrating with the division's Active Directory / Azure AD.
- **MFA required** for all admin roles (enforced at the identity provider level).
- **Parents/guardians** authenticate via email/password with MFA optional (strongly recommended, enforced configurable per division).
- **Role-based access control (RBAC)** enforced at both the API gateway and application layer: every API endpoint declares the minimum role required, and this is checked on every request.
- **Principle of least privilege**: no role has access to data it does not operationally require.
- Sessions expire after a configurable inactivity period (default 30 minutes for admin roles, 60 minutes for parent roles).

### 7.4 Data Encryption

- **In transit**: TLS 1.3 enforced on all connections. HSTS headers set. No HTTP fallback.
- **At rest**: AES-256 encryption for database storage (PostgreSQL encrypted tablespace or RDS encryption). S3 buckets encrypted with AWS KMS.
- **Sensitive fields**: student ID numbers, guardian contact information, and payment references are encrypted at the column level in addition to disk-level encryption.
- **Backups**: encrypted with a separate key; stored in a geographically separate Canadian region.

### 7.5 Audit Logging

- Every create, update, and delete action by any user is logged to an append-only audit log table: `who`, `what`, `when`, `before_value`, `after_value`.
- Audit logs are retained for a minimum of 7 years (FOIPP recommended retention).
- Audit log access is restricted to Super Admin and cannot be modified or deleted through the application.
- Admin-facing audit log viewer with search and export.

### 7.6 Privacy by Design

- **Data minimization**: collect only the data operationally necessary for each feature.
- **Purpose limitation**: data collected for fee payment is not used for analytics profiles.
- **Consent management**: parent notification preferences are opt-in by default for non-essential communications.
- **Right to access**: parents can request an export of all their personal data stored on the platform (automated export feature).
- **Retention policies**: configurable per division; student records are automatically flagged for review after the student's expected graduation year + configurable retention period.
- **Privacy Impact Assessment (PIA)**: a PIA should be completed before any new data element is added to the system, as required by FOIPP.

### 7.7 Vulnerability Management

- Automated dependency scanning (Dependabot or Snyk) on every pull request.
- OWASP Top 10 checklist reviewed at each major release.
- Annual third-party penetration test recommended, especially before onboarding large divisions.
- Responsible disclosure policy published on the platform website.
- No secrets in source code: all credentials and keys managed via environment variables and a secrets manager (AWS Secrets Manager or HashiCorp Vault).

---

## 8. Integrations Master List

| Integration | Module(s) | Type | Purpose |
|---|---|---|---|
| **Azure AD / Active Directory** | All | SSO (SAML/OIDC) | Staff and admin authentication |
| **Google Workspace** | All | SSO (OIDC) | Alternative identity provider for divisions using Google |
| **Twilio (SMS/Voice)** | Facilities, Parent Portal | REST API | Booking notifications, parent mass notifications, fee reminders |
| **Square** | Parent Portal | REST API + SDK | Online payment processing and POS |
| **JotForm** | Facilities, Parent Portal | Webhook | External-facing form submissions |
| **Jira** | Facilities | REST API | Maintenance/setup ticket creation on booking confirmation |
| **PowerSchool / Maplewood SIS** | Parent Portal | REST API | Grades sync, student roster import |
| **Microsoft Business Central** | Parent Portal (Finance) | REST API / CSV export | Journal entry export for fee distributions, ERP reconciliation |
| **iCal / Google Calendar** | Facilities, Parent Portal | iCal export | Booking and event exports |
| **AWS S3** | All | SDK | File and document storage |
| **SendGrid / AWS SES** | All | REST API | Transactional email delivery |
| **Sentry** | All | SDK | Error tracking and alerting |

---

## 9. Reporting & Analytics Standards

Every module ships with a baseline reporting capability following these standards:

### 9.1 Report Types (All Modules)

| Type | Description |
|---|---|
| **Operational Dashboard** | Real-time summary widgets on the admin home screen. Key counts, status summaries, and trend sparklines. |
| **Tabular Reports** | Paginated, sortable, filterable data tables. Exportable to CSV and PDF. |
| **Summary Reports** | Aggregated totals by time period, school, grade, or other dimension. |
| **Audit Reports** | Who did what, when. Available to Super Admin only. |

### 9.2 Central Reporting Engine

- All modules emit structured report events to a central reporting schema in PostgreSQL.
- A shared reporting API layer (`/api/v1/reports/...`) allows a future business intelligence tool (e.g., Power BI, Metabase) to query across modules.
- The reporting schema is read-only from the application perspective — the operational database writes to it via replication or scheduled sync.
- Metabase is recommended as an accessible internal analytics tool for a small team without dedicated data engineers.

### 9.3 Saskatchewan Ministry Reporting

- Identify Ministry of Education reporting requirements early; build data collection fields and export formats that align with provincial standards (e.g., OEN — Online Education Number — as a student identifier).
- Design reports to be extensible: new Ministry requirements should require adding a report template, not restructuring the underlying data model.

---

## 10. Future Module Roadmap

The following modules are scoped for future development phases. Each is a standalone product following the same architectural principles as the core two.

### 10.1 Resource Management
- Inventory tracking for school assets: Chromebooks, AV equipment, sports gear, textbooks.
- Check-out/check-in workflow.
- Maintenance request tracking.
- Integration with Facilities Booking to link equipment reservations to room bookings.

### 10.2 Library Management System
- Digital catalogue (MARC record support).
- Student check-out/return tracking.
- Overdue notifications (Twilio).
- Integration with Parent Portal to surface overdue items to parents.

### 10.3 Staffing and Substitute Management
- Daily absence reporting by staff.
- Substitute teacher pool management and automated outreach (call-out via Twilio, first-come first-served acceptance).
- Integration with HR (Business Central) for payroll reporting.

### 10.4 Form Builder
- A general-purpose digital form tool for school administration.
- Drag-and-drop builder for registration forms, consent forms, surveys, incident reports.
- Conditional logic, file upload, e-signature.
- Response export and conditional notifications.

### 10.5 Learning Management System (LMS)
- Course content delivery: assignments, quizzes, resources.
- Integration with existing SIS for class rosters.
- Grade passback to SIS.
- Designed to complement — not replace — existing LMS tools (Brightspace/D2L is common in Saskatchewan).

### 10.6 Student Information System (SIS) Lite
- A lightweight alternative to PowerSchool/Maplewood for smaller divisions.
- Student enrolment, demographics, attendance, and basic academic records.
- Full integration hub for all other platform modules.

### 10.7 AI Tools and Agent Interface
- An AI-assisted interface for administrators: natural language querying of reports ("How many students have outstanding fees over $100 at Bishop James Mahoney?").
- Parent-facing AI assistant for common questions (school hours, fee deadlines, events) without staff involvement.
- Teacher tools: AI-assisted feedback drafting, report card comment suggestions.
- Built on Claude API with strict data privacy controls — no student data sent to third-party AI without explicit division consent and data processing agreements.

### 10.8 Reporting and Analytics Suite
- Standalone reporting module pulling from all installed modules.
- Pre-built dashboards for division superintendents, principals, and business office.
- Custom report builder for power users.
- Power BI connector.

### 10.9 Central Division Portal
- A public-facing division website with: news, events, document library, school directory, links to all platform modules.
- CMS-backed, managed by division communications staff.
- Replaces static division websites with a managed, integrated portal.

### 10.10 Financial Systems and ERP Extensions
- **Purchase Requisition Module**: digital purchase request workflow with budget checking, approval routing, and PO generation for Business Central.
- **Business Central Extensions**: custom BC extensions for school-specific workflows (activity fee tracking, grant management, student activity accounts).
- **Budget Planning Tool**: annual budget drafting and variance tracking against actuals from Business Central.
- **Expense Reporting**: staff expense submission and approval, with Business Central journal entry export.

---

## 11. Team & Operational Model

### 11.1 Core Team

| Role | Responsibility |
|---|---|
| **2–3 Full-Stack Developers** | Feature development, API integrations, bug fixes. |
| **1 IT Administrator** | Infrastructure (AWS), CI/CD, security patching, monitoring. |
| **1 Business / Student Information Analyst** | Client onboarding, data migration, reporting requirements, SIS integration configuration. |

### 11.2 Development Practices

- **Git workflow**: main branch protected, all changes via pull request with one required reviewer.
- **Testing**: unit tests for business logic, integration tests for API endpoints, e2e tests (Playwright) for critical user flows (booking submission, payment).
- **Code review**: every PR reviewed for security concerns, not just correctness.
- **Documentation**: each module maintains an API reference (auto-generated from OpenAPI spec) and an admin user guide.
- **Dependency management**: weekly automated dependency update PRs via Dependabot; security patches applied within 48 hours.

### 11.3 Client Onboarding Process

1. Division signs agreement; tenant provisioned in platform.
2. SSO configured with the division's identity provider.
3. Student roster imported (CSV or SIS API).
4. Guardian accounts created/invited.
5. Admin training session (2 hours, recorded for async reference).
6. Pilot launch with one school before division-wide rollout.
7. 30-day hypercare period with direct developer support channel.

---

## 12. Go-to-Market — Central Platform & Sales

### 12.1 Pricing Model

- **Per-division subscription**, tiered by school count within the division:
  - Small division (1–5 schools): Base rate.
  - Medium division (6–15 schools): Base rate + per-school increment.
  - Large division (16+ schools): Negotiated enterprise rate.
- Each module is purchased separately; bundle discounts for 3+ modules.
- Annual contract, invoiced at the start of the fiscal year (aligns with school division budget cycles — April 1 in Saskatchewan).

### 12.2 Central Platform (Marketplace)

- The central platform serves as the sales and onboarding front-end.
- Division admins can log in, view their installed modules, and browse available modules with feature descriptions, screenshots, and pricing.
- **Trial access**: 30-day trial available for any module with no credit card required — lowers the barrier for budget-constrained divisions to evaluate before committing.
- **Module activation**: once purchased, a division admin can activate a module with a single click; no developer involvement required for standard configurations.

### 12.3 Target Customer Journey

1. **Awareness**: presence at Saskatchewan School Boards Association (SSBA) annual conference, SSTA (Saskatchewan Teachers' Federation) events, and MASA (Métis and other groups) education councils.
2. **Consideration**: a free demo environment pre-populated with sample data so IT directors and principals can experience the product without setup.
3. **Decision**: reference clients (early adopters) who can speak to peer school divisions; case studies published on the platform marketing site.
4. **Expansion**: land with one module (typically Facilities Booking — lower risk, visible ROI), then expand to Parent Portal and beyond.

---

## 13. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| FOIPP non-compliance resulting in a division being unable to adopt | High | High | Engage a Saskatchewan privacy lawyer for a legal review before launch; provide divisions with a Data Processing Agreement (DPA) template. |
| SIS API availability / data quality | Medium | High | Build defensive data sync: graceful degradation when SIS is unavailable, clear admin alerts, and a manual override for grade display. |
| Square payment failures or account holds | Low | High | Implement webhook-based payment confirmation (not just redirect-based), and maintain a manual fee-marking workflow as a fallback. |
| Key developer departure | Medium | High | Document all architectural decisions in an ADR (Architecture Decision Record) file; maintain runbooks for all infrastructure operations. |
| Division IT resistance to SSO integration | Medium | Medium | Provide a fallback local authentication option during onboarding; work with division IT to integrate SSO in phase 2. |
| Scope creep from client requests | High | Medium | A formal change request process; new features evaluated against the module roadmap; client-requested features considered for roadmap addition, not immediate one-off builds. |
| Competitive response from larger vendors | Low | Medium | Speed of iteration and local relationships are the moat; large vendors cannot match responsiveness at this budget level. |

---

*This document is a living brief. Sections will be updated as architectural decisions are finalized, client feedback is gathered, and the product roadmap evolves. Version control this document alongside the codebase.*

# AEGIS Protocol — Implementation Plan (V2 Upgrade)

> **RULE:** Do NOT change existing UI layout, sidebar, navbar, theme, colors, or typography.
> Only extend functionality and add new pages/components.

---

## TABLE OF CONTENTS

1. [Role Rename](#1-role-rename)
2. [Backend: Schema Changes](#2-backend-schema-changes)
3. [Backend: New Collections](#3-backend-new-collections)
4. [Backend: Updated Role Permissions](#4-backend-updated-role-permissions)
5. [Backend: New API Endpoints](#5-backend-new-api-endpoints)
6. [Backend: Seat Booking Data Model](#6-seat-booking-data-model)
7. [Backend: Attendance Tracking Logic](#7-attendance-tracking-logic)
8. [Backend: Marks Storage Logic](#8-marks-storage-logic)
9. [Backend: CGPA Calculation Logic](#9-cgpa-calculation-logic)
10. [Backend: Dummy Payment Flow](#10-dummy-payment-flow)
11. [Backend: Doubt Forum Schema](#11-doubt-forum-schema)
12. [Backend: Chat System Schema](#12-chat-system-schema)
13. [Frontend: New Pages](#13-frontend-new-pages)
14. [Frontend: New Routes](#14-frontend-new-routes)
15. [Frontend: New Components](#15-frontend-new-components)
16. [Frontend: Folder Placement](#16-frontend-folder-placement)
17. [Frontend: Existing Page Extensions](#17-frontend-existing-page-extensions)
18. [Frontend: API Integration Flow](#18-frontend-api-integration-flow)
19. [Frontend: Seat Selection UI](#19-frontend-seat-selection-ui)
20. [Frontend: Attendance & Marks UI](#20-frontend-attendance--marks-ui)
21. [Frontend: CGPA Display Logic](#21-frontend-cgpa-display-logic)

---

## 1. Role Rename

### Files to Update

| File | Change |
|------|--------|
| `backend/src/models/User.js` | `enum: ['student','faculty','authority','admin']` → `['student','faculty','managementMember','admin']` |
| `backend/src/middleware/role.js` | No code change needed (dynamic). Update all `authorize('authority')` calls. |
| `backend/src/routes/grievance.routes.js` | Replace every `'authority'` → `'managementMember'` |
| `backend/src/routes/auth.routes.js` | No change (admin-only routes stay) |
| `frontend/src/App.jsx` | Replace `'authority'` → `'managementMember'` in `allowedRoles` |
| `frontend/src/components/common/ProtectedRoute.jsx` | No code change (dynamic). |
| Database migration | Run: `db.users.updateMany({role:'authority'},{$set:{role:'managementMember'}})` |

---

## 2. Backend: Schema Changes

### 2.1 User.js — Modifications

```js
// REMOVE: department at top level for Admin role (keep for students/faculty)
// ADD these fields:
{
  idCardData: {
    cardNumber: String,
    issueDate: Date,
    expiryDate: Date,
    photoUrl: String,
    barcode: String,
  },
  feeStatus: {
    totalFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueDate: Date,
    payments: [{
      amount: Number,
      date: { type: Date, default: Date.now },
      transactionId: String,
      method: { type: String, enum: ['dummy','razorpay','bank'], default: 'dummy' },
      status: { type: String, enum: ['pending','completed','failed'], default: 'completed' }
    }]
  },
  busPass: {
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute' },
    validTill: Date,
    isActive: { type: Boolean, default: false }
  }
}
```

### 2.2 Course.js — Modifications

```js
// ADD these fields to existing courseSchema:
{
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'  // Admin-created = auto-approved
  },
  createdByRole: {
    type: String,
    enum: ['faculty', 'admin'],
  },
  requiredAttendance: {
    type: Number,
    default: 75,
    min: 0,
    max: 100
  },
  credits: {
    type: Number,
    default: 3
  }
}
```

### 2.3 BusSchedule.js — Modifications

```js
// ADD:
{
  driverName: { type: String, trim: true },
  driverPhone: { type: String, trim: true },
  busType: { type: String, enum: ['AC', 'Non-AC', 'Mini'], default: 'Non-AC' },
  seatLayout: {
    rows: { type: Number, default: 10 },
    seatsPerRow: { type: Number, default: 3 }
  }
}
```

---

## 3. Backend: New Collections

### 3.1 Attendance.js — `backend/src/models/Attendance.js`

```js
const attendanceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  records: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' }
  }]
}, { timestamps: true });

attendanceSchema.index({ course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ 'records.student': 1 });
```

### 3.2 Marks.js — `backend/src/models/Marks.js`

```js
const marksSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessments: [{
    type: { type: String, enum: ['quiz', 'midsem', 'endsem', 'assignment'], required: true },
    title: String,
    maxMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    weightage: { type: Number, default: 0 }  // percentage weight
  }],
  totalWeighted: { type: Number, default: 0 },
  grade: { type: String },
  gradePoint: { type: Number }
}, { timestamps: true });

marksSchema.index({ course: 1, student: 1 }, { unique: true });
```

### 3.3 Doubt.js — `backend/src/models/Doubt.js`

```js
const replySchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 2000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const doubtSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 3000 },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [replySchema],
  isResolved: { type: Boolean, default: false },
  tags: [String]
}, { timestamps: true });

doubtSchema.index({ course: 1, createdAt: -1 });
doubtSchema.index({ askedBy: 1 });
```

### 3.4 ChatMessage.js — `backend/src/models/ChatMessage.js`

```js
const chatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  read: { type: Boolean, default: false },
  conversationId: { type: String, required: true } // sorted `${minId}_${maxId}`
}, { timestamps: true });

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ sender: 1, receiver: 1 });
```

### 3.5 Payment.js — `backend/src/models/Payment.js`

```js
const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['tuition', 'bus', 'hostel', 'other'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String, unique: true },
  method: { type: String, enum: ['dummy', 'razorpay'], default: 'dummy' },
  description: String,
  dueDate: Date,
  paidAt: Date,
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

paymentSchema.index({ student: 1, status: 1 });
```

### 3.6 Certificate.js — `backend/src/models/Certificate.js`

```js
const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['course','internship','achievement','other'], required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  fileUrl: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

certificateSchema.index({ student: 1 });
```

### 3.7 SemesterReport.js — `backend/src/models/SemesterReport.js`

```js
const semesterReportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  courses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseCode: String,
    courseTitle: String,
    credits: Number,
    grade: String,
    gradePoint: Number
  }],
  sgpa: { type: Number, default: 0 },
  cgpa: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  totalCreditsEarned: { type: Number, default: 0 }
}, { timestamps: true });

semesterReportSchema.index({ student: 1, semester: 1 }, { unique: true });
```

---

## 4. Backend: Updated Role Permissions

| Action | Student | Faculty | ManagementMember | Admin |
|--------|---------|---------|-----------------|-------|
| Submit grievance | ✅ | ✅ | ❌ | ❌ |
| View/resolve grievances | Own only | Own only | ✅ | ✅ |
| Create course | ❌ | ✅ (needs admin approval) | ❌ | ✅ (auto-approved) |
| Approve course | ❌ | ❌ | ❌ | ✅ |
| Assign faculty to course | ❌ | ❌ | ❌ | ✅ |
| Mark attendance | ❌ | ✅ (own courses) | ❌ | ❌ |
| Assign marks | ❌ | ✅ (own courses) | ❌ | ❌ |
| View attendance analytics | ❌ | ✅ (own courses) | ❌ | ✅ |
| Manage doubt forum | View+Ask | ✅ (course-level) | ❌ | ❌ |
| Manage fees/payments | ❌ | ❌ | ✅ | ✅ |
| Send payment reminders | ❌ | ❌ | ✅ | ❌ |
| Upload bus schedule CSV | ❌ | ❌ | ✅ | ✅ |
| Add certificates | ❌ | ❌ | ✅ | ✅ |
| Manage ID cards | ❌ | ❌ | ✅ | ✅ |
| Book bus seat | ✅ | ✅ | ❌ | ❌ |
| View bus schedule | ✅ | ✅ | ✅ | ✅ |
| 1-to-1 chat | ✅(with all ) | ✅( with all) | ✅( with all) | ✅( with all) |
| Dummy payment | ✅ | ❌ | ❌ | ❌ |
| View CGPA/report | Own only | ✅(all students in own course) | ✅(all students) | ✅ |
| Download certificates | Own only | ❌ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ❌ | ✅ |
| Add opportunities | ❌ | ✅ | ✅ | ✅ |

---

## 5. Backend: New API Endpoints

### 5.1 Admin Endpoints — `admin.routes.js` (NEW)

```
GET    /api/admin/users                    — List all users (filter: role, department, search)
GET    /api/admin/users/:id                — Detailed user profile
DELETE /api/admin/users/:id                — Remove user
GET    /api/admin/grievances               — Global grievance list (filter: status, category, date)
POST   /api/admin/courses                  — Create course (auto-approved)
PATCH  /api/admin/courses/:id/approve      — Approve faculty-created course
PATCH  /api/admin/courses/:id/assign       — Assign faculty to course
POST   /api/admin/opportunities            — Add opportunity
```

### 5.2 Faculty Endpoints — `faculty.routes.js` (NEW)

```
GET    /api/faculty/courses                — My courses
GET    /api/faculty/courses/:id/students   — Students in my course (filter)
POST   /api/faculty/courses                — Create course (status='pending')
POST   /api/faculty/courses/:id/resources  — Add resource
PATCH  /api/faculty/courses/:id/attendance-req  — Set required attendance %
POST   /api/faculty/courses/:id/attendance — Mark attendance for a date
GET    /api/faculty/courses/:id/attendance — View attendance records
GET    /api/faculty/courses/:id/attendance/analytics — Attendance analytics
POST   /api/faculty/courses/:id/marks      — Assign/update marks (batch)
GET    /api/faculty/courses/:id/marks      — View all marks
GET    /api/faculty/courses/:id/doubts     — View course doubts
POST   /api/faculty/courses/:id/doubts/:doubtId/reply — Reply to doubt
PATCH  /api/faculty/courses/:id/doubts/:doubtId/resolve — Mark resolved
```

### 5.3 Management Member Endpoints — `management.routes.js` (NEW)

```
GET    /api/management/grievances          — View all grievances
PATCH  /api/management/grievances/:id/status — Resolve grievance
POST   /api/management/grievances/:id/comments — Add comment
GET    /api/management/payments            — View all fee payments
POST   /api/management/payments            — Create fee entry for student
POST   /api/management/payments/:id/remind — Send payment reminder
POST   /api/management/bus/schedule/csv    — Upload schedule via CSV
POST   /api/management/bus/details         — Add bus & driver details
POST   /api/management/certificates        — Add certificate to student  
GET    /api/management/certificates/:studentId — View student certificates
POST   /api/management/idcards             — Add/update student ID card data
GET    /api/management/idcards/:studentId  — View student ID card
```

### 5.4 Student Endpoints — `student.routes.js` (NEW)

```
GET    /api/student/courses/:id/doubts     — View all doubts in course
POST   /api/student/courses/:id/doubts     — Ask a doubt
GET    /api/student/chat/conversations     — List chat conversations
GET    /api/student/chat/:userId           — Get messages with a classmate
POST   /api/student/chat/:userId           — Send message
GET    /api/student/bus/schedule            — View bus schedule
POST   /api/student/bus/book               — Book bus seat
GET    /api/student/bus/bookings           — My bookings
POST   /api/student/payments/pay           — Make dummy payment
GET    /api/student/payments               — My payment history
GET    /api/student/profile                — View my detailed profile
PATCH  /api/student/profile                — Edit profile
GET    /api/student/report                 — Semester report
GET    /api/student/cgpa                   — CGPA data
GET    /api/student/certificates           — My certificates
GET    /api/student/certificates/:id/download — Download certificate
GET    /api/student/attendance/:courseId    — My attendance in a course
GET    /api/student/marks/:courseId         — My marks in a course
```

---

## 6. Seat Booking Data Model

**Existing models stay.** Enhancement:

```
BusSchedule.seatLayout = { rows: 10, seatsPerRow: 3 }  → totalSeats = rows × seatsPerRow

Booking (existing) already has: user, schedule, seatNumber, status, paymentId

Flow:
1. Student calls GET /api/student/bus/schedule → sees available buses
2. Student calls GET /api/transport/schedule/:id/seats → gets booked seat numbers
3. Frontend renders grid: rows × seatsPerRow, marks booked seats as disabled
4. Student picks seat → POST /api/student/bus/book { scheduleId, seatNumber }
5. Backend validates: seat not taken, schedule not full → creates Booking
6. availableSeats decremented atomically
```

---

## 7. Attendance Tracking Logic

```
1. Faculty opens course → selects date
2. Frontend loads enrolled students list
3. Faculty marks each student: present / absent / late
4. POST /api/faculty/courses/:id/attendance { date, records: [{student, status}] }
5. Backend creates Attendance doc (unique: course + date)
6. Analytics endpoint aggregates:
   - Per-student: (present_count / total_classes) × 100
   - Flags students below requiredAttendance %
   - Returns: { studentId, name, totalClasses, present, absent, late, percentage }
```

---

## 8. Marks Storage Logic

```
1. Faculty selects course → assessment type (quiz/midsem/endsem)
2. Enters marks per student (batch upload)
3. POST /api/faculty/courses/:id/marks { assessments: [{student, type, title, max, obtained, weightage}] }
4. Backend upserts Marks doc per student-course pair
5. Auto-calculates totalWeighted = Σ (obtained/max × weightage)
6. Grade mapping (configurable):
   totalWeighted >= 90 → 'AA' (10), >= 80 → 'AB' (9), >= 70 → 'BB' (8),
   >= 60 → 'BC' (7), >= 50 → 'CC' (6), >= 40 → 'CD' (5), < 40 → 'F' (0)
7. gradePoint stored in Marks doc
```

---

## 9. CGPA Calculation Logic

```
SGPA = Σ(gradePoint × credits) / Σ(credits) — for one semester
CGPA = Σ(SGPA × semesterCredits) / Σ(allCredits) — cumulative

Triggered:
- When faculty finalizes marks (all assessments graded)
- Admin/system generates SemesterReport
- Student GET /api/student/cgpa returns:
  {
    semesters: [{ semester, sgpa, courses: [...], totalCredits }],
    cgpa: 8.45,
    totalCreditsEarned: 96
  }
```

---

## 10. Dummy Payment Flow

```
1. ManagementMember creates payment entry: POST /api/management/payments
   { student, type, amount, dueDate, description }
2. Student sees pending payments: GET /api/student/payments
3. Student pays: POST /api/student/payments/pay { paymentId }
4. Backend:
   - Generates dummy transactionId = 'DUM_' + Date.now() + '_' + random
   - Sets status = 'completed', paidAt = now
   - Updates User.feeStatus.paidAmount += amount
   - Returns { success, transactionId }
5. Future: Replace dummy logic with Razorpay SDK integration
```

---

## 11. Doubt Forum Schema

Already defined in Section 3.3 (`Doubt.js`). Key relationships:

```
Doubt → belongs to Course
Doubt.askedBy → Student (User)
Doubt.replies[].author → Student or Faculty (User)

Access:
- Students: view doubts in enrolled courses, ask doubts, reply
- Faculty: view doubts in own courses, reply, mark resolved
```

---

## 12. Chat System Schema

Already defined in Section 3.4 (`ChatMessage.js`). Key design:

```
conversationId = sorted concatenation of two user IDs
  e.g., "6507a1b2..._6507a3c4..."

This enables:
- GET messages by conversationId (indexed, fast)
- List unique conversations: aggregate by conversationId
- Unread count: count where receiver=me AND read=false

Future upgrade: Replace REST polling with Socket.io for real-time
```

---

## 13. Frontend: New Pages

| # | Page File | Path | Role Access |
|---|-----------|------|-------------|
| 1 | `pages/admin/UserManagement.jsx` | `/admin/users` | Admin |
| 2 | `pages/admin/UserDetail.jsx` | `/admin/users/:id` | Admin |
| 3 | `pages/admin/GlobalGrievances.jsx` | `/admin/grievances` | Admin |
| 4 | `pages/admin/CourseApproval.jsx` | `/admin/courses/approval` | Admin |
| 5 | `pages/faculty/MyCourses.jsx` | `/faculty/courses` | Faculty |
| 6 | `pages/faculty/AttendanceManager.jsx` | `/faculty/attendance/:courseId` | Faculty |
| 7 | `pages/faculty/AttendanceAnalytics.jsx` | `/faculty/analytics/:courseId` | Faculty |
| 8 | `pages/faculty/MarksManager.jsx` | `/faculty/marks/:courseId` | Faculty |
| 9 | `pages/faculty/DoubtForum.jsx` | `/faculty/doubts/:courseId` | Faculty |
| 10 | `pages/management/GrievanceManager.jsx` | `/management/grievances` | ManagementMember |
| 11 | `pages/management/FeeManager.jsx` | `/management/fees` | ManagementMember |
| 12 | `pages/management/BusManager.jsx` | `/management/bus` | ManagementMember |
| 13 | `pages/management/CertificateManager.jsx` | `/management/certificates` | ManagementMember |
| 14 | `pages/management/IDCardManager.jsx` | `/management/idcards` | ManagementMember |
| 15 | `pages/student/DoubtForum.jsx` | `/doubts` → `/doubts/:courseId` | Student |
| 16 | `pages/student/Chat.jsx` | `/chats` | Student |
| 17 | `pages/student/ChatConversation.jsx` | `/chats/:userId` | Student |
| 18 | `pages/student/BusSchedule.jsx` | `/bus/schedule` | Student |
| 19 | `pages/student/SeatBooking.jsx` | `/bus/book/:scheduleId` | Student |
| 20 | `pages/student/Payments.jsx` | `/fees` | Student |
| 21 | `pages/student/SemesterReport.jsx` | `/report` | Student |
| 22 | `pages/student/CGPAView.jsx` | `/cgpa` | Student |
| 23 | `pages/student/Certificates.jsx` | `/certificates` | Student |

---

## 14. Frontend: New Routes

Add to `App.jsx` inside the protected `<Route>` block:

```jsx
{/* Admin Routes */}
<Route path="/admin/users" element={
  <ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>
} />
<Route path="/admin/users/:id" element={
  <ProtectedRoute allowedRoles={['admin']}><UserDetail /></ProtectedRoute>
} />
<Route path="/admin/grievances" element={
  <ProtectedRoute allowedRoles={['admin']}><GlobalGrievances /></ProtectedRoute>
} />
<Route path="/admin/courses/approval" element={
  <ProtectedRoute allowedRoles={['admin']}><CourseApproval /></ProtectedRoute>
} />

{/* Faculty Routes */}
<Route path="/faculty/courses" element={
  <ProtectedRoute allowedRoles={['faculty']}><MyCourses /></ProtectedRoute>
} />
<Route path="/faculty/attendance/:courseId" element={
  <ProtectedRoute allowedRoles={['faculty']}><AttendanceManager /></ProtectedRoute>
} />
<Route path="/faculty/analytics/:courseId" element={
  <ProtectedRoute allowedRoles={['faculty']}><AttendanceAnalytics /></ProtectedRoute>
} />
<Route path="/faculty/marks/:courseId" element={
  <ProtectedRoute allowedRoles={['faculty']}><MarksManager /></ProtectedRoute>
} />
<Route path="/faculty/doubts/:courseId" element={
  <ProtectedRoute allowedRoles={['faculty']}><FacultyDoubtForum /></ProtectedRoute>
} />

{/* Management Routes */}
<Route path="/management/grievances" element={
  <ProtectedRoute allowedRoles={['managementMember']}><GrievanceManager /></ProtectedRoute>
} />
<Route path="/management/fees" element={
  <ProtectedRoute allowedRoles={['managementMember']}><FeeManager /></ProtectedRoute>
} />
<Route path="/management/bus" element={
  <ProtectedRoute allowedRoles={['managementMember']}><BusManager /></ProtectedRoute>
} />
<Route path="/management/certificates" element={
  <ProtectedRoute allowedRoles={['managementMember']}><CertificateManager /></ProtectedRoute>
} />
<Route path="/management/idcards" element={
  <ProtectedRoute allowedRoles={['managementMember']}><IDCardManager /></ProtectedRoute>
} />

{/* Student Routes (replace placeholders) */}
<Route path="/doubts" element={
  <ProtectedRoute allowedRoles={['student']}><StudentDoubtForum /></ProtectedRoute>
} />
<Route path="/doubts/:courseId" element={
  <ProtectedRoute allowedRoles={['student']}><StudentDoubtForum /></ProtectedRoute>
} />
<Route path="/chats" element={
  <ProtectedRoute allowedRoles={['student']}><Chat /></ProtectedRoute>
} />
<Route path="/chats/:userId" element={
  <ProtectedRoute allowedRoles={['student']}><ChatConversation /></ProtectedRoute>
} />
<Route path="/bus/schedule" element={
  <ProtectedRoute allowedRoles={['student']}><BusScheduleView /></ProtectedRoute>
} />
<Route path="/bus/book/:scheduleId" element={
  <ProtectedRoute allowedRoles={['student']}><SeatBooking /></ProtectedRoute>
} />
<Route path="/report" element={
  <ProtectedRoute allowedRoles={['student']}><SemesterReport /></ProtectedRoute>
} />
<Route path="/cgpa" element={
  <ProtectedRoute allowedRoles={['student']}><CGPAView /></ProtectedRoute>
} />
<Route path="/certificates" element={
  <ProtectedRoute allowedRoles={['student']}><Certificates /></ProtectedRoute>
} />
```

---

## 15. Frontend: New Components

Create in `frontend/src/components/`:

```
components/
├── common/
│   ├── DataTable.jsx          — Reusable sortable/filterable table
│   ├── FilterBar.jsx          — Role/department/status filter bar
│   ├── Modal.jsx              — Reusable modal dialog
│   ├── FileUpload.jsx         — CSV/file upload component
│   └── EmptyState.jsx         — "No data" placeholder
├── academic/
│   ├── AttendanceGrid.jsx     — Attendance marking grid
│   ├── AttendanceChart.jsx    — Chart for analytics (bar/pie)
│   ├── MarksTable.jsx         — Editable marks table
│   └── GradeCard.jsx          — Individual grade display card
├── transport/
│   ├── SeatMap.jsx            — Bus seat grid with selection
│   └── SeatLegend.jsx         — Available/booked/selected legend
├── chat/
│   ├── ChatBubble.jsx         — Single message bubble
│   ├── ChatInput.jsx          — Message input bar
│   └── ConversationList.jsx   — List of chat conversations
├── doubts/
│   ├── DoubtCard.jsx          — Single doubt display
│   └── ReplyThread.jsx        — Replies under a doubt
└── payments/
    ├── PaymentCard.jsx        — Single payment display
    └── PaymentModal.jsx       — Dummy payment confirmation
```

---

## 16. Frontend: Folder Placement

```
frontend/src/
├── api/
│   └── axios.js               ← NO CHANGE
├── components/
│   ├── common/                ← ADD: DataTable, FilterBar, Modal, FileUpload, EmptyState
│   ├── layout/                ← NO CHANGE
│   ├── academic/              ← NEW FOLDER
│   ├── transport/             ← NEW FOLDER
│   ├── chat/                  ← NEW FOLDER
│   ├── doubts/                ← NEW FOLDER
│   └── payments/              ← NEW FOLDER
├── context/
│   └── AuthContext.jsx        ← NO CHANGE
├── pages/
│   ├── auth/                  ← NO CHANGE
│   ├── dashboard/             ← MINOR EXTENSION (role-based cards)
│   ├── grievances/            ← MINOR EXTENSION (managementMember role)
│   ├── academic/              ← NO CHANGE
│   ├── internship/            ← NO CHANGE
│   ├── profile/               ← MINOR EXTENSION (editable fields)
│   ├── transport/             ← NO CHANGE (keep existing)
│   ├── admin/                 ← NEW FOLDER
│   ├── faculty/               ← NEW FOLDER
│   ├── management/            ← NEW FOLDER
│   └── student/               ← NEW FOLDER
```

---

## 17. Frontend: Existing Page Extensions

### 17.1 `Dashboard.jsx`
- Add role-based quick-action cards:
  - Admin: "Manage Users", "Approve Courses", "Global Grievances"
  - Faculty: "My Courses", "Mark Attendance", "Doubt Forum"
  - ManagementMember: "Grievances", "Fees", "Bus Management"
  - Student: "My CGPA", "Doubts", "Certificates", "Bus Booking"
- Keep existing layout/styling, just add conditional card sections

### 17.2 `Profile.jsx`
- Make fields editable for students (personalInfo, skills, projects)
- Show CGPA summary card
- Show certificates section with download links
- Show ID card data (read-only for student)

### 17.3 `GrievanceList.jsx`
- Replace `'authority'` check with `'managementMember'`
- No other UI changes

### 17.4 `Navbar.jsx`
- Add role-based navigation links (conditionally rendered)
- Admin: "Users", "Approvals"
- Faculty: "My Courses", "Attendance"
- ManagementMember: "Grievances", "Fees", "Bus"
- Student: "Doubts", "Chat", "Bus", "Fees", "Report"

---

## 18. Frontend: API Integration Flow

```
1. All API calls go through existing `api/axios.js` (token auto-attached)
2. Each new page fetches data in useEffect on mount
3. Pattern for every page:
   
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     const fetch = async () => {
       try {
         const res = await api.get('/endpoint');
         setData(res.data.data);
       } catch (err) {
         toast.error(err.response?.data?.message || 'Error');
       } finally {
         setLoading(false);
       }
     };
     fetch();
   }, []);

4. Mutations (POST/PATCH) follow:
   - Show loading state on button
   - Call API
   - On success: toast.success + refetch or update local state
   - On error: toast.error with server message

5. No new Axios instances — reuse existing `api` import
```

---

## 19. Frontend: Seat Selection UI

```
Component: SeatMap.jsx

Logic:
1. Fetch booked seats: GET /api/transport/schedule/:id/seats → [3, 7, 12, ...]
2. Fetch schedule details → seatLayout { rows, seatsPerRow }
3. Render CSS grid: grid-template-columns: repeat(seatsPerRow, 1fr)
4. Each seat = button with seat number
5. States (CSS classes, using EXISTING color variables):
   - .seat-available  → clickable, default bg
   - .seat-booked     → disabled, greyed out
   - .seat-selected   → highlighted (user's pick, uses existing accent color)
6. On click: toggle selected seat (allow only 1 selection)
7. Confirm button → POST /api/student/bus/book { scheduleId, seatNumber }
8. Show aisle gap between seat columns via CSS gap

No layout/theme redesign — just a new component inside existing page structure.
```

---

## 20. Frontend: Attendance & Marks UI

### Attendance (Faculty View)
```
AttendanceManager.jsx:
1. Date picker (native input type="date")
2. Table: Student Name | Roll No | Present ○ | Absent ○ | Late ○
3. Radio buttons per student per row
4. "Submit Attendance" button → POST to backend
5. Uses existing table styles from index.css

AttendanceAnalytics.jsx:
1. Summary cards: Total Classes, Avg Attendance %
2. Table: Student Name | Total | Present | Absent | Late | %
3. Highlight rows below requiredAttendance% in red
4. Optional: simple bar chart (use <div> based CSS bars, no library needed)
```

### Marks (Faculty View)
```
MarksManager.jsx:
1. Dropdown: Select assessment type (Quiz/Midsem/Endsem)
2. Input: Assessment title, Max Marks
3. Table: Student Name | Roll No | Marks Obtained (input)
4. "Submit Marks" button → POST batch to backend
5. View tab: show all assessments with grades
```

### Student View
```
- Course detail page shows "My Attendance: 82%" badge
- Course detail page shows marks breakdown table
- Semester Report page: all courses, grades, SGPA
- CGPA page: semester-wise SGPA chart + cumulative CGPA
```

---

## 21. Frontend: CGPA Display Logic

```
CGPAView.jsx:

1. Fetch: GET /api/student/cgpa
2. Response: { semesters: [...], cgpa, totalCreditsEarned }
3. Display:
   ┌──────────────────────────────────────┐
   │  Overall CGPA: 8.45 / 10            │  ← Large card, existing accent color
   │  Credits Earned: 96                  │
   └──────────────────────────────────────┘
   
   Semester-wise table:
   | Semester | SGPA | Credits | Courses |
   |----------|------|---------|---------|
   | 1        | 8.2  | 24      | 6       |
   | 2        | 8.7  | 24      | 6       |
   
   Expandable: click semester → shows course-wise breakdown
   
4. All styled with existing CSS variables — no new design system needed
5. Uses existing card, table, and badge components
```

---

## BACKEND FILES TO CREATE (Summary)

```
backend/src/
├── models/
│   ├── Attendance.js          ← NEW
│   ├── Marks.js               ← NEW
│   ├── Doubt.js               ← NEW
│   ├── ChatMessage.js         ← NEW
│   ├── Payment.js             ← NEW
│   ├── Certificate.js         ← NEW
│   └── SemesterReport.js      ← NEW
├── controllers/
│   ├── admin.controller.js    ← NEW
│   ├── faculty.controller.js  ← NEW
│   ├── management.controller.js ← NEW
│   ├── student.controller.js  ← NEW
│   ├── doubt.controller.js    ← NEW
│   └── chat.controller.js     ← NEW
├── services/
│   ├── admin.service.js       ← NEW
│   ├── faculty.service.js     ← NEW
│   ├── management.service.js  ← NEW
│   ├── student.service.js     ← NEW
│   ├── doubt.service.js       ← NEW
│   ├── chat.service.js        ← NEW
│   └── cgpa.service.js        ← NEW
├── routes/
│   ├── admin.routes.js        ← NEW
│   ├── faculty.routes.js      ← NEW
│   ├── management.routes.js   ← NEW
│   └── student.routes.js      ← NEW
├── validators/
│   ├── admin.validator.js     ← NEW
│   ├── faculty.validator.js   ← NEW
│   ├── management.validator.js ← NEW
│   └── student.validator.js   ← NEW
└── middleware/
    └── csvParser.js           ← NEW (for bus schedule CSV upload)
```

---

## server.js — New Route Registrations

```js
// ADD to server.js:
const adminRoutes = require('./src/routes/admin.routes');
const facultyRoutes = require('./src/routes/faculty.routes');
const managementRoutes = require('./src/routes/management.routes');
const studentRoutes = require('./src/routes/student.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/student', studentRoutes);
```

---

## NEW npm DEPENDENCIES

### Backend
```
multer          — File upload handling (CSV, certificates)
csv-parser      — Parse bus schedule CSV files
socket.io       — (Future) Real-time chat
```

### Frontend
```
(none required — all built with existing stack)
```

---

## IMPLEMENTATION ORDER (Recommended)

1. **Phase 1:** Role rename (authority → managementMember) across all files
2. **Phase 2:** New models (Attendance, Marks, Doubt, ChatMessage, Payment, Certificate, SemesterReport)
3. **Phase 3:** Schema updates (User, Course, BusSchedule)
4. **Phase 4:** Backend services + controllers + routes (by role)
5. **Phase 5:** Frontend new pages (admin → faculty → management → student)
6. **Phase 6:** Frontend components (reusable first, then page-specific)
7. **Phase 7:** Route registration + Navbar updates
8. **Phase 8:** Integration testing & polish

---

*Generated for AEGIS Protocol V2 — Campus-Connect Platform*

# todo

/admins/elirantzadok@gmail.com

/synagogues/zFH6FhDnsJDjuQtF2ANq/prayerCards/elirantzadok@gmail.com
/synagogues/zFH6FhDnsJDjuQtF2ANq/prayerEventTypes/042f2582-509c-42d0-af24-a8fcdf51d09a

TODO:
add the peayer name in the home page
this page is not available yet
replace prayer with praying
isGabai vs isAdmin - change to useUser

kids over 13

DONE:

in SynagoguesPage remove the invite icon. in addition show the synagogue id only for admins and place it in a new row below the synagogue name

# Cursor Rules for Synagogue App (React + Firebase + Material UI + Formik + React Query)

📘 Synagogue Management App — Summary
🌍 Concept

A digital management platform for synagogues, designed to help community members, gabbaim, and administrators organize religious life.
The app is built with React, Firebase, and Material UI. It’s fully RTL (right-to-left), integrates the Hebrew calendar, and is tailored to Hebrew-speaking Jewish communities.
It brings together family-level religious data, prayer scheduling, community communication, and financial transparency — all in one system.
We build the app gradually

## Project Structure

- Pages must go in `src/pages/`
- Reusable components go in `src/components/`
- Custom hooks must go in `src/hooks/`
- Firebase config and API go in `src/services/`
- Style using inline `sx` prop (Material UI)
- Theme configuration (optional) in `src/theme/`

## Firebase

- Use Firebase for:
  - Authentication
  - Firestore (realtime database)

## Auth

- Implement authentication using Firebase Auth
- Protect private routes using an AuthProvider or PrivateRoute
- Place auth logic in a custom hook (`useAuth`) under `src/hooks/`

## Forms

- Use Formik for form state management
- Integrate Material UI form components
- Use validation with Formik or Yup
- Extract reusable form fields into `src/components`

## Styling

- Use Material UI for all UI components
- Use inline styles via the `sx` prop
- Ensure all pages are responsive with a mobile-first layout
- Use Material UI breakpoints (`xs`, `sm`, `md`, etc.)

## Data Fetching

- Use `useQuery` and `useMutation` from React Query
- Extract data logic into hooks (`src/hooks`)
- Never fetch data directly inside components

## Component Rules

- All components in `src/components/` must be reusable
- Components must accept props and not contain business logic
- Use MUI components and inline `sx` for styling
- computed fields always use useMemo

## Page Rules

- Each screen must be a single React component in `src/pages/`
- Pages may contain layout and orchestrate hooks/data fetching
- Pages must not contain deeply nested logic or reusable components

## Hooks

- Custom logic should go in `src/hooks/`
- Examples: `useAuth`, `useUserData`, `useFirestoreCollection`

## General

- Use TypeScript across all files
- Avoid default exports; use named exports
- Keep components under 200 lines when possible

Phase 1

Each adult has a prayer card with family details.
Children are recorded under the family — with birthdays, Hebrew dates, and religious milestones (bar mitzvah, bat mitzvah, brit mila, etc.).
Aliyot history (Torah reading assignments) is tracked per person.
Special prayer-related events (recurring or one-time) are stored with Hebrew dates and notes.
Gabaim are able to view all prayers, assign Aliya and view a sorted list of incomming events.

Firestore Schema:

admins/{email}

synagogues/{synId}
name (string, required)
createdAt (timestamp, required)
createdBy (email, required)

synagogues/{synId}/prayerEventTypes/{typeId}
name (string, required) # internal key e.g. "bar_mitzvah"
displayName (string, required) # human-friendly
recurrenceType (string, required: "none" | "yearly")
enabled (boolean, required)
description (string, optional)
displayOrder (number, optional)

synagogues/{synId}/aliyaTypes/{typeId}
name (string, required) # e.g. "kohen", "levi", "shlishi"
displayName (string, required)
weight (number, required, default 1)
enabled (boolean, required)
description (string, optional)
displayOrder (number, optional)

synagogues/{synId}/prayerCards/{email}
synagogues/{synId}/prayers/{email}
firstName (string, required)
lastName (string, required)
notes (string, optional)
aliyotHistory (array of maps, optional)
type (string, required)
hebrewDate (string, required)
notes (string, optional)
events (array of maps, optional)
type (string, required) - "birthdate" / "bar-mitzva" / "brith" / "azkara" / etc
hebrewDate (string, required)
notes (string, optional)
children

synagogues/{synId}/settings/1 (map, single document)
lookaheadDays (number, required, default 14)

Pahse 2 - Future

📅 Scheduling

Prayer times with flexible daily/weekly settings.

Torah lesson schedules, recurring (weekly/monthly) or one-time.

Events and aliyot can be prepared in advance — e.g., show relevant upcoming azkarot in the next 14 days.

📢 Community Communication

Announcements with importance level and ordering.

Financial reports published for transparency (e.g., donations, synagogue expenses).

👥 User & Role Management

Members (adults): manage their family and children.

Gabbaim: manage synagogue operations (announcements, schedules, aliyot, financial reports).

Admins: full control, including settings and role management.

Children: no login — their data lives under the family prayer card.

⚙️ Settings

Admins define available prayer event types (recurring or not, child-related or not).

Admins define aliya types with weights to rank aliyot (some are more prestigious).

Configurable rules for what gabbaim see in advance (e.g., “show upcoming events 14 days ahead”).

🔑 Invitations & Family Linking

Adults can invite:

New family members (e.g., add a child who got their own account).

Another adult to join their family.

Gabbaim can invite new gabbaim.

Admins can invite anyone.

Invitations carry metadata (family label, inviter info). Invitees approve with their UID.

Migration is handled: a child’s data can be linked to their new adult account when they grow up.

💰 Financial Transparency

Financial reports stored as documents with content + link.

Accessible by all members for transparency.

Editable only by gabbaim and admins.

📜 Business Rules (Plain English)
Families

Anyone in the synagogue can view families.

Adults can create their own family during onboarding.

Gabbaim/Admins can create or edit any family.

Adults can edit their own family (including children).

Deleting a family:

Members delete through a controlled flow (remove children/adults first).

Gabbaim/Admins can delete directly.

Memberships

Membership = link between a user and a synagogue with a role.

Users can create their own membership when joining.

Admins can create/update/delete any membership.

Users can delete their own membership.

Prayers

Every adult or child is represented by a prayer record.

Everyone in the synagogue can view prayers.

Adults can manage their own and their family’s prayers.

Gabbaim/Admins can manage any prayer.

Announcements

Everyone can read.

Only Gabbaim/Admins can post, edit, or delete.

Prayer Times & Torah Lessons

Everyone can read.

Only Gabbaim/Admins can create, edit, or delete.

Financial Reports

Everyone can read.

Only Gabbaim/Admins can create, edit, or delete.

Settings

Everyone can read.

Only Admins can create, edit, or delete (prayer event types, aliyot types, gabbai board).

Invitations

Adults can invite new members into their family.

Gabbaim can invite new gabbaim.

Admins can invite anyone.

Invitations must be accepted by the invitee themselves.

Inviter/Admin can cancel invitations.

✅ Bottom Line

The app creates a balance:

Transparency (everyone can view most synagogue content).

Empowerment (adults manage their own families).

Controlled authority (gabbaim manage synagogue operations, admins handle global settings).

## Firebase database schema

synagogues/{synId}/memberships/{uid}
role (string, required: "member" | "gabbai" | "admin")
familyId (string, required)
enabled (boolean, required, default true)
createdAt (timestamp, required)
updatedAt (timestamp, required)

synagogues/{synId}/invitations/{inviteId}
inviterUid (string, required)
inviterName (string, required)
familyId (string, optional, for family invites)
familyLabel (string, optional, shown to invitee)
inviteeRole (string, required: "member" | "gabbai" | "admin")
uidToMigrate (string, optional — when a child’s record becomes an adult account)
inviteeUid (string, optional — filled when accepted)
status (string, required: "pending" | "accepted" | "cancelled")
createdAt (timestamp, required)
expiresAt (timestamp, optional)

synagogues/{synId}/announcements/{id}
title (string, required)
content (string, required)
is_important (boolean, required, default false)
enabled (boolean, required, default true)
displayOrder (number, required, default 1)
createdAt (timestamp, required)
createdBy (uid, required)

synagogues/{synId}/prayer_times/{id}
title (string, required)
displayOrder (number, required, default 1)
enabled (boolean, required, default true)
notes (string, optional)
times (array of maps, optional)
title (string, required)
hour (string, required)
displayOrder (number, required, default 1)
enabled (boolean, required, default true)
notes (string, optional)

synagogues/{synId}/torah_lessons/{id}
title (string, required)
displayOrder (number, required, default 1)
enabled (boolean, required, default true)
notes (string, optional)
lessons (array of maps, optional)
title (string, required)
ledBy (string, required)
hour (string, required)
hebrewDate (string, required)
recurrenceType (string, required: "none" | "weekly" | "monthly")
displayOrder (number, required, default 1)
enabled (boolean, required, default true)
notes (string, optional)

synagogues/{synId}/financialReports/{reportId}
title (string, required)
displayOrder (number, required, default 1)
linkToDocument (string, required)
enabled (boolean, required, default true)
createdAt (timestamp, required)
createdBy (uid, required)
content (string, required)

synagogues/{synId}/donations/{donationId}
title (string, required) # e.g., "Monthly Donation", "Building Fund"
link (string, required) # PayBox or other payment link
notes (string, optional) # description of what donations are for
enabled (boolean, required, default true)
displayOrder (number, required, default 1)
createdAt (timestamp, required)
createdBy (uid, required)

## Firebase rules

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {

    // -------------------
    // Guards & Role Helpers
    // -------------------
    function isLoggedIn() {
      return request.auth != null;
    }

    function mb(synId) {
      return get(
        /databases/$(database)/documents/synagogues/$(synId)/memberships/$(request.auth.uid)
      ).data;
    }

    function isInSynagogue(synId) {
      return isLoggedIn() && mb(synId) != null && mb(synId).enabled == true;
    }

    function hasRole(synId, roles) {
      return isInSynagogue(synId) && mb(synId).role in roles;
    }

    function isAdmin(synId)          { return hasRole(synId, ["admin"]); }
    function isGabbai(synId)         { return hasRole(synId, ["gabbai"]); }
    function isGabbaiOrHigher(synId) { return hasRole(synId, ["gabbai","admin"]); }
    function isMember(synId)         { return hasRole(synId, ["member"]); }

    function isSameFamily(synId, targetMemberId) {
      let me = mb(synId);
      let t  = get(/databases/$(database)/documents/synagogues/$(synId)/prayers/$(targetMemberId)).data;
      return me != null && t != null && me.familyId == t.familyId;
    }

    function isAdult(role) {
      return role in ["member","gabbai","admin"];
    }

    // -------------------
    // DRY Type Helpers
    // -------------------
    function nonEmptyStr(v) {
      return v is string && v.size() > 0;
    }
    function optionalStr(v) {
      return v == null || v is string;
    }
    function optionalNonEmptyStr(v) {
      return v == null || nonEmptyStr(v);
    }
    function isBoolean(v) { return v is bool; }
    function isNumber(v)  { return v is number; }
    function isTimestamp(v) { return v is timestamp; }

    // -------------------
    // Nested Validators
    // -------------------
    function validTimeEntry(t) {
      return t is map &&
             nonEmptyStr(t.title) &&
             nonEmptyStr(t.hour) &&
             isNumber(t.displayOrder) &&
             isBoolean(t.enabled) &&
             optionalStr(t.notes);
    }

    function validLessonEntry(l) {
      return l is map &&
             nonEmptyStr(l.title) &&
             nonEmptyStr(l.ledBy) &&
             nonEmptyStr(l.hour) &&
             nonEmptyStr(l.hebrewDate) &&
             (l.recurrenceType in ["none","weekly","monthly"]) &&
             isNumber(l.displayOrder) &&
             isBoolean(l.enabled) &&
             optionalStr(l.notes);
    }

    // -------------------
    // Document Validators
    // -------------------
    function validAnnouncementDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             nonEmptyStr(d.content) &&
             nonEmptyStr(d.createdBy) &&
             isTimestamp(d.createdAt) &&
             isBoolean(d.is_important) &&
             isBoolean(d.enabled) &&
             isNumber(d.displayOrder);
    }

    function validPrayerTimesDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             isBoolean(d.enabled) &&
             optionalStr(d.notes) &&
             (!("times" in d) || d.times.all(t, validTimeEntry(t)));
    }

    function validTorahLessonsDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             isBoolean(d.enabled) &&
             optionalStr(d.notes) &&
             (!("lessons" in d) || d.lessons.all(l, validLessonEntry(l)));
    }

    function validFinancialReportDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             nonEmptyStr(d.linkToDocument) &&
             isBoolean(d.enabled) &&
             isTimestamp(d.createdAt) &&
             nonEmptyStr(d.createdBy) &&
             nonEmptyStr(d.content);
    }

    function validPrayerEventTypeDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.name) &&
             nonEmptyStr(d.displayName) &&
             (d.recurrenceType in ["none","yearly"]) &&
             isBoolean(d.enabled) &&
             optionalStr(d.description) &&
             (!("displayOrder" in d) || isNumber(d.displayOrder));
    }

    function validAliyaTypeDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.name) &&
             nonEmptyStr(d.displayName) &&
             isNumber(d.weight) &&
             isBoolean(d.enabled) &&
             optionalStr(d.description) &&
             (!("displayOrder" in d) || isNumber(d.displayOrder));
    }

    // -------------------
    // Collection Rules
    // -------------------
    match /synagogues/{synId}/families/{familyId} {
      allow read: if isInSynagogue(synId);
      allow create: if isLoggedIn() && isGabbaiOrHigher(synId);
      allow update: if isInSynagogue(synId) && (
        (isSameFamily(synId, request.auth.uid) && isAdult(mb(synId).role)) ||
        isGabbaiOrHigher(synId)
      );
      allow delete: if isGabbaiOrHigher(synId); // members use Cloud Function
    }

    match /synagogues/{synId}/memberships/{uid} {
      allow read: if isInSynagogue(synId);
      allow create: if isAdmin(synId) || (isLoggedIn() && request.auth.uid == uid);
      allow update: if isAdmin(synId);
      allow delete: if isAdmin(synId) || (isLoggedIn() && request.auth.uid == uid);
    }

    match /synagogues/{synId}/prayers/{memberId} {
      allow read: if isInSynagogue(synId);
      allow create: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && isSameFamily(synId, request.auth.uid));
      allow update: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && (request.auth.uid == memberId || isSameFamily(synId, memberId)));
      allow delete: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && (request.auth.uid == memberId || isSameFamily(synId, memberId)));
    }

    match /synagogues/{synId}/announcements/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validAnnouncementDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/prayer_times/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validPrayerTimesDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/torah_lessons/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validTorahLessonsDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/financialReports/{reportId} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validFinancialReportDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/settings/prayerEventTypes/{typeId} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isAdmin(synId) && validPrayerEventTypeDoc();
      allow delete: if isAdmin(synId);
    }

    match /synagogues/{synId}/settings/aliyaTypes/{typeId} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isAdmin(synId) && validAliyaTypeDoc();
      allow delete: if isAdmin(synId);
    }

    match /synagogues/{synId}/settings/gabbaiBoard {
      allow read: if isInSynagogue(synId);
      allow update: if isAdmin(synId);
    }

    match /synagogues/{synId}/invitations/{inviteId} {
      allow create: if isLoggedIn() && (
        (mb(synId) != null && isAdult(mb(synId).role) && request.resource.data.inviteeRole == "member") ||
        (isGabbai(synId) && request.resource.data.inviteeRole == "gabbai") ||
        isAdmin(synId)
      );

      allow read: if isInSynagogue(synId) && (
        request.auth.uid == resource.data.inviterUid ||
        request.auth.uid == resource.data.inviteeUid
      );

      allow update: if isLoggedIn() &&
        resource.data.status == "pending" &&
        request.resource.data.inviteeUid == request.auth.uid &&
        request.resource.data.status == "accepted" &&
        (!("expiresAt" in resource.data) || request.time <= resource.data.expiresAt);

      allow delete: if isLoggedIn() &&
        (request.auth.uid == resource.data.inviterUid || isAdmin(synId));
    }

}
}

## UI

[ Member View ]
────────────────────────────
🏠 Home
👨‍👩‍👧 My Family
├─ Family Overview
└─ Prayer Card (per person)
├─ Personal Details
├─ Events (Bar Mitzvah, Azkara, etc.)
└─ Aliyot History
📢 Announcements
📅 Schedules
├─ Prayer Times
└─ Torah Lessons
💰 Financial Reports
💳 Donations
────────────────────────────
Profile / Settings
Logout

📑 Pages by Role
synagogue-management page
global admin can create, update delete synangogues
bootstrap new synangogue by creating a family and adding the first gabbai

🏠 Home

Member: Overview of announcements, upcoming family events, upcoming synagogue events.

Gabbai: Same as member + shortcut to management pages (announcements, aliyot dashboard, schedules).

Admin: Same as gabbai + shortcut to settings and user management.

👨‍👩‍👧 My Family

Member:

Family Overview: list of adults + children.

Prayer Cards: view/edit self + children.

Add child, invite another adult, manage events & aliyot.

Gabbai:

Same as member.

Can also edit any family in the synagogue (not just their own).

Can delete families if needed.

Admin:

Same as gabbai, but also able to manage memberships across families.

🙏 Prayer Card (per person)

Member:

View/edit own + family members.

Events (recurring/one-time).

Aliyot history (read-only).

Gabbai:

View/edit any prayer card.

Assign aliyot.

See upcoming events for planning.

Admin:

Same as gabbai.

📢 Announcements

Member:

View announcements (read-only).

Gabbai:

Full CRUD (create, update, delete).

Mark as important.

Admin:

Same as gabbai.

📅 Schedules
Prayer Times

Member: View-only.

Gabbai: CRUD (manage prayer times).

Admin: Same as gabbai.

Torah Lessons

Member: View-only.

Gabbai: CRUD (manage lessons, recurrence).

Admin: Same as gabbai.

📖 Aliyot Dashboard

Member: ❌ Not visible.

Gabbai:

See upcoming aliyot needs.

Assign aliyot to members.

Search prayers across synagogue.

Admin: Same as gabbai.

💰 Financial Reports

Member: View-only.

Gabbai: CRUD (publish reports, upload links, add content).

Admin: Same as gabbai.

💳 Donations

Member:

See enabled donation links.

Click to donate via PayBox.

Gabbai:

Manage donations: create/update/delete.

Update links, notes, display order.

Admin: Same as gabbai.

⚙️ Settings

Member: ❌ Not visible.

Gabbai: ❌ Not visible (except for operational configs via gabbaiBoard if allowed).

Admin:

Manage prayer event types.

Manage aliya types (weight, enabled, display order).

Manage gabbai board config.

👥 User & Role Management

Member: ❌ Not visible.

Gabbai: ❌ Not visible.

Admin:

View all synagogue members.

Change roles (member ↔ gabbai ↔ admin).

Enable/disable memberships.

✉️ Invitations

Member:

Invite adults into their family.

Invite children transitioning to adult accounts.

Gabbai:

Invite gabbaim.

Admin:

Invite members, gabbaim, and admins.

Cancel invitations.

🧑 Profile / Settings

Member: Update own profile (name, email, password, Hebrew date if applicable).

Gabbai: Same as member.

Admin: Same as member.

❓ Help & Support

All roles: FAQ, contact synagogue support, report issues.

✅ Summary

Members: family-focused, read-only synagogue data.

Gabbaim: operations-focused, CRUD on announcements, schedules, reports, donations, aliyot.

Admins: full control, including settings and user/role management.

<!-- rules backup -->

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {

    // -------------------
    // Guards & Role Helpers
    // -------------------
    function isLoggedIn() {
      return request.auth != null;
    }


    function isAdmin() {
      return isLoggedIn() && exists(
        /databases/$(database)/documents/admins/$(request.auth.email)
      );
    }

    function isEmail(email) {
    	return isLoggedIn() && request.auth.email == email;
    }


    // -------------------
    // DRY Type Helpers
    // -------------------
    function nonEmptyStr(v) {
      return v is string && v.size() > 0;
    }
    function optionalStr(v) {
      return v == null || v is string;
    }
    function optionalNonEmptyStr(v) {
      return v == null || nonEmptyStr(v);
    }
    function isBoolean(v) { return v is bool; }
    function isNumber(v)  { return v is number; }
    function isTimestamp(v) { return v is timestamp; }

    // -------------------
    // Nested Validators
    // -------------------
    function validTimeEntry(t) {
      return t is map &&
             nonEmptyStr(t.title) &&
             nonEmptyStr(t.hour) &&
             isNumber(t.displayOrder) &&
             isBoolean(t.enabled) &&
             optionalStr(t.notes);
    }

    function validLessonEntry(l) {
      return l is map &&
             nonEmptyStr(l.title) &&
             nonEmptyStr(l.ledBy) &&
             nonEmptyStr(l.hour) &&
             nonEmptyStr(l.hebrewDate) &&
             (l.recurrenceType in ["none","weekly","monthly"]) &&
             isNumber(l.displayOrder) &&
             isBoolean(l.enabled) &&
             optionalStr(l.notes);
    }

    // -------------------
    // Document Validators
    // -------------------
    function validAnnouncementDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             nonEmptyStr(d.content) &&
             nonEmptyStr(d.createdBy) &&
             isTimestamp(d.createdAt) &&
             isBoolean(d.is_important) &&
             isBoolean(d.enabled) &&
             isNumber(d.displayOrder);
    }

    function validPrayerTimesDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             isBoolean(d.enabled) &&
             optionalStr(d.notes) &&
             (!("times" in d) || d.times.all(t, validTimeEntry(t)));
    }

    function validTorahLessonsDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             isBoolean(d.enabled) &&
             optionalStr(d.notes) &&
             (!("lessons" in d) || d.lessons.all(l, validLessonEntry(l)));
    }

    function validFinancialReportDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.title) &&
             isNumber(d.displayOrder) &&
             nonEmptyStr(d.linkToDocument) &&
             isBoolean(d.enabled) &&
             isTimestamp(d.createdAt) &&
             nonEmptyStr(d.createdBy) &&
             nonEmptyStr(d.content);
    }

    function validPrayerEventTypeDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.name) &&
             nonEmptyStr(d.displayName) &&
             (d.recurrenceType in ["none","yearly"]) &&
             isBoolean(d.enabled) &&
             optionalStr(d.description) &&
             (!("displayOrder" in d) || isNumber(d.displayOrder));
    }

    function validAliyaTypeDoc() {
      let d = request.resource.data;
      return nonEmptyStr(d.name) &&
             nonEmptyStr(d.displayName) &&
             isNumber(d.weight) &&
             isBoolean(d.enabled) &&
             optionalStr(d.description) &&
             (!("displayOrder" in d) || isNumber(d.displayOrder));
    }

    // -------------------
    // Collection Rules
    // -------------------

    match /admins/{email} {
    	allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /synagogues/{synId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    	}

    match /synagogues/{synId}/prayerCards/{email} {
      allow create, read, update, delete: if true;
    }

    match /synagogues/{synId}/prayerEventTypes/{id} {
      allow create, read, update, delete: if true;
    }

    match /synagogues/{synId}/aliyaTypes/{id} {
      allow create, read, update, delete: if true;
    }

    match /synagogues/{synId}/aliyaGroups/{id} {
      allow create, read, update, delete: if true;
    }

    match /synagogues/{synId}/prayers/{memberId} {
      allow read: if isInSynagogue(synId);
      allow create: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && isSameFamily(synId, request.auth.uid));
      allow update: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && (request.auth.uid == memberId || isSameFamily(synId, memberId)));
      allow delete: if isGabbaiOrHigher(synId) ||
                     (isLoggedIn() && (request.auth.uid == memberId || isSameFamily(synId, memberId)));
    }

    match /synagogues/{synId}/announcements/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validAnnouncementDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/prayer_times/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validPrayerTimesDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/torah_lessons/{id} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validTorahLessonsDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/financialReports/{reportId} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isGabbaiOrHigher(synId) && validFinancialReportDoc();
      allow delete: if isGabbaiOrHigher(synId);
    }

    match /synagogues/{synId}/prayerEventTypes/{typeId} {
      allow read: if true;
      allow create, update: if isAdmin(synId) && validPrayerEventTypeDoc();
      allow delete: if isAdmin(synId);
    }

    match /synagogues/{synId}/settings/aliyaTypes/{typeId} {
      allow read: if isInSynagogue(synId);
      allow create, update: if isAdmin(synId) && validAliyaTypeDoc();
      allow delete: if isAdmin(synId);
    }

    match /synagogues/{synId}/settings/gabbaiBoard {
      allow read: if isInSynagogue(synId);
      allow update: if isAdmin(synId);
    }

    match /synagogues/{synId}/invitations/{inviteId} {
      allow create: if isLoggedIn() && (
        (mb(synId) != null && isAdult(mb(synId).role) && request.resource.data.inviteeRole == "member") ||
        (isGabbai(synId) && request.resource.data.inviteeRole == "gabbai") ||
        isAdmin(synId)
      );

      allow read: if isInSynagogue(synId) && (
        request.auth.uid == resource.data.inviterUid ||
        request.auth.uid == resource.data.inviteeUid
      );

      allow update: if isLoggedIn() &&
        resource.data.status == "pending" &&
        request.resource.data.inviteeUid == request.auth.uid &&
        request.resource.data.status == "accepted" &&
        (!("expiresAt" in resource.data) || request.time <= resource.data.expiresAt);

      allow delete: if isLoggedIn() &&
        (request.auth.uid == resource.data.inviterUid || isAdmin(synId));
    }

}
}

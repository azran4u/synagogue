# Cursor Rules for React App (Firebase + Material UI + Formik + React Query)

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
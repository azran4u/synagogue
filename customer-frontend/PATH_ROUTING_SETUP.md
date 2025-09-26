# Multi-Tenant Path Parameter Setup

This application supports multi-tenant architecture where each synagogue is identified by a path parameter.

## URL Structure

### Production URLs

Each synagogue is accessible with a path parameter:

```
https://yourdomain.com/synagogue/{synagogue-id}/
```

Examples:

- `https://yourdomain.com/synagogue/main-synagogue/`
- `https://yourdomain.com/synagogue/central-synagogue/`
- `https://yourdomain.com/synagogue/test-synagogue/`

### Page URLs within a Synagogue

All pages are nested under the synagogue path:

```
https://yourdomain.com/synagogue/{synagogue-id}/prayer-card
https://yourdomain.com/synagogue/{synagogue-id}/prayer-times
https://yourdomain.com/synagogue/{synagogue-id}/tora-lessons
https://yourdomain.com/synagogue/{synagogue-id}/donations
https://yourdomain.com/synagogue/{synagogue-id}/financial-reports
```

## Development Setup

### Local Development

For local development, you can simulate synagogue routing using several methods:

#### Method 1: Using localStorage (Current Implementation)

1. Open the application at `http://localhost:5173`
2. The app will show a synagogue selector
3. Choose a synagogue to simulate the path parameter
4. The selected synagogue will be stored in localStorage

#### Method 2: Using Direct Paths

Access the app using the full path structure:

```
http://localhost:5173/synagogue/main-synagogue/
http://localhost:5173/synagogue/main-synagogue/prayer-card
```

## Production Setup

### Firebase Hosting Configuration

#### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Deployment

```bash
npm run build
firebase deploy --only hosting
```

### Custom Domain Setup

1. **Add Custom Domain**: In Firebase Console, go to Hosting → Add custom domain
2. **DNS Configuration**: Point your domain to Firebase hosting
3. **SSL Certificate**: Firebase automatically provides SSL certificates

## Synagogue Management

### Creating New Synagogues

1. **Admin Access**: Login as an admin user
2. **Navigate**: Go to "ניהול בתי כנסת" in the sidebar
3. **Create**: Click "הוסף בית כנסת" and enter the synagogue name
4. **Path**: The synagogue ID will be used in the URL path

### Synagogue URLs

Each synagogue will be accessible at:

```
https://yourdomain.com/synagogue/{synagogue-id}/
```

Examples:

- `https://yourdomain.com/synagogue/main-synagogue/`
- `https://yourdomain.com/synagogue/central-synagogue/`
- `https://yourdomain.com/synagogue/test-synagogue/`

## Technical Implementation

### Path Parameter Detection

The app automatically detects the synagogue ID from the URL path parameter and:

1. Extracts the synagogue ID from `/synagogue/{synId}/...`
2. Uses it to fetch synagogue data from Firestore
3. Provides context throughout the app

### Context Usage

```typescript
import { useSynagogueContext } from "../contexts/SynagogueContext";

const MyComponent = () => {
  const { synagogue, synagogueId } = useSynagogueContext();

  return (
    <div>
      <h1>{synagogue?.name}</h1>
      <p>Synagogue ID: {synagogueId}</p>
    </div>
  );
};
```

### Navigation with Path Parameters

```typescript
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

const MyComponent = () => {
  const { navigateWithSynId } = useSynagogueNavigate();

  const handleNavigation = () => {
    // This will preserve the synagogue path parameter
    navigateWithSynId("/prayer-card");
  };

  return <button onClick={handleNavigation}>Go to Prayer Card</button>;
};
```

### Data Isolation

Each synagogue's data is isolated in Firestore:

```
/synagogues/{synagogue-id}/
├── families/
├── memberships/
├── prayers/
├── announcements/
└── ...
```

## Development Testing

### Testing Different Synagogues

1. **Create Test Synagogues**:

   ```bash
   npm run seed:synagogue
   ```

2. **Switch Between Synagogues**:

   - Use the development selector
   - Or modify localStorage directly: `localStorage.setItem('dev-synId', 'synagogue-id')`
   - Or use different URLs with path parameters

3. **Test Path Parameter Routing**:
   - Navigate to `/synagogue/main-synagogue/`
   - Test all pages preserve the path parameter
   - Verify synagogue context is maintained

## Troubleshooting

### Common Issues

1. **Synagogue Not Detected**

   - Check URL path format: `/synagogue/{synId}/...`
   - Verify the synagogue exists in Firestore
   - Check browser console for errors

2. **Synagogue Not Found**

   - Verify the synagogue exists in Firestore
   - Check the synagogue ID matches the path parameter
   - Ensure proper Firestore security rules

3. **Development Issues**
   - Clear localStorage: `localStorage.removeItem('dev-synId')`
   - Check browser console for errors
   - Verify Firestore connection

### Testing Different Synagogues

1. **Create Test Synagogues**:

   ```bash
   npm run seed:synagogue
   ```

2. **Switch Between Synagogues**:
   - Use the development selector
   - Or modify localStorage directly
   - Or use different URLs with path parameters

## Security Considerations

1. **Firestore Rules**: Ensure proper security rules for multi-tenant data
2. **Authentication**: Each synagogue should have its own user management
3. **Data Isolation**: Verify data cannot leak between synagogues
4. **Admin Access**: Control who can create/manage synagogues

## Benefits of Path Parameter Routing

### Advantages

- **Clean URLs**: SEO-friendly and user-friendly URLs
- **Firebase Native**: Works perfectly with Firebase Hosting
- **Easy Testing**: Simple to test different synagogues
- **Flexible**: Easy to add/remove synagogue context
- **RESTful**: Follows REST API conventions
- **Cost Effective**: No additional domain costs

### Firebase Hosting Benefits

- **Global CDN**: Fast loading worldwide
- **Automatic SSL**: Free SSL certificates
- **Easy Deployment**: Simple deployment process
- **Custom Domains**: Support for custom domains
- **Rewrites**: SPA routing support

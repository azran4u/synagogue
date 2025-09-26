# Multi-Tenant Subdomain Setup

This application supports multi-tenant architecture where each synagogue gets its own subdomain.

## Development Setup

### Local Development with Subdomains

For local development, you can simulate subdomains using several methods:

#### Method 1: Using localStorage (Current Implementation)

1. Open the application at `http://localhost:5173`
2. The app will show a synagogue selector
3. Choose a synagogue to simulate the subdomain
4. The selected synagogue will be stored in localStorage

#### Method 2: Using /etc/hosts (Recommended for Testing)

1. Edit your `/etc/hosts` file:

   ```bash
   sudo nano /etc/hosts
   ```

2. Add entries for each synagogue:

   ```
   127.0.0.1 main-synagogue.localhost
   127.0.0.1 test-synagogue.localhost
   127.0.0.1 another-synagogue.localhost
   ```

3. Access the application using:
   - `http://main-synagogue.localhost:5173`
   - `http://test-synagogue.localhost:5173`
   - `http://another-synagogue.localhost:5173`

#### Method 3: Using Query Parameters

Access the app with a subdomain parameter:

```
http://localhost:5173?subdomain=main-synagogue
```

## Production Setup

### DNS Configuration

1. **Wildcard DNS**: Set up a wildcard DNS record:

   ```
   *.yourdomain.com → your-server-ip
   ```

2. **SSL Certificates**: Use Let's Encrypt with wildcard certificates:
   ```bash
   certbot certonly --manual --preferred-challenges dns -d "*.yourdomain.com"
   ```

### Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name *.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name *.yourdomain.com;

    ssl_certificate /path/to/wildcard.crt;
    ssl_certificate_key /path/to/wildcard.key;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName *.yourdomain.com
    ServerAlias *.yourdomain.com

    SSLEngine on
    SSLCertificateFile /path/to/wildcard.crt
    SSLCertificateKeyFile /path/to/wildcard.key

    ProxyPreserveHost On
    ProxyPass / http://localhost:5173/
    ProxyPassReverse / http://localhost:5173/
</VirtualHost>
```

## Synagogue Management

### Creating New Synagogues

1. **Admin Access**: Login as an admin user
2. **Navigate**: Go to "ניהול בתי כנסת" in the sidebar
3. **Create**: Click "הוסף בית כנסת" and enter the synagogue name
4. **Subdomain**: The synagogue ID will be used as the subdomain

### Synagogue URLs

Each synagogue will be accessible at:

```
https://{synagogue-id}.yourdomain.com
```

Examples:

- `https://main-synagogue.yourdomain.com`
- `https://test-synagogue.yourdomain.com`
- `https://central-synagogue.yourdomain.com`

## Technical Implementation

### Subdomain Detection

The app automatically detects the subdomain from the URL and:

1. Extracts the subdomain (first part before the domain)
2. Uses it as the synagogue ID
3. Fetches synagogue data from Firestore
4. Provides context throughout the app

### Context Usage

```typescript
import { useSynagogueContext } from "../contexts/SynagogueContext";

const MyComponent = () => {
  const { synagogue, subdomain, synagogueId } = useSynagogueContext();

  // Use synagogue data
  return <div>{synagogue?.name}</div>;
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

## Troubleshooting

### Common Issues

1. **Subdomain Not Detected**

   - Check DNS configuration
   - Verify wildcard SSL certificate
   - Ensure server is configured to handle subdomains

2. **Synagogue Not Found**

   - Verify the synagogue exists in Firestore
   - Check the synagogue ID matches the subdomain
   - Ensure proper Firestore security rules

3. **Development Issues**
   - Clear localStorage: `localStorage.removeItem('dev-subdomain')`
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
   - Or use different URLs with query parameters

## Security Considerations

1. **Firestore Rules**: Ensure proper security rules for multi-tenant data
2. **Authentication**: Each synagogue should have its own user management
3. **Data Isolation**: Verify data cannot leak between synagogues
4. **Admin Access**: Control who can create/manage synagogues

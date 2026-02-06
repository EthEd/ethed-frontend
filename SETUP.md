# EthEd Setup Guide

## Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.local .env.local.example
   ```

2. **Update the environment variables:**
   - `NEXTAUTH_SECRET`: Generate a secure secret key
   - `NEXTAUTH_URL`: Set to your domain (http://localhost:3001 for development)
   - `DATABASE_URL`: Your PostgreSQL database connection string

3. **Optional OAuth Providers:**
   - Add Google OAuth credentials for Google sign-in
   - Add GitHub OAuth credentials for GitHub sign-in
   - Add email server settings for magic link authentication

## Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create a database** named `ethed`
3. **Update DATABASE_URL** in `.env.local`
4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open http://localhost:3001
   - Use the demo login with any email/name for testing

## Authentication

The app includes a demo credentials provider for testing. In production, you should:
1. Remove the demo provider
2. Configure proper OAuth providers (Google, GitHub)
3. Set up email authentication if needed
4. Use a secure NEXTAUTH_SECRET

## Troubleshooting

- **NextAuth CLIENT_FETCH_ERROR**: Ensure NEXTAUTH_SECRET is set in .env.local
- **Database connection errors**: Check your DATABASE_URL format
- **OAuth errors**: Verify your OAuth provider credentials and callback URLs
# Multi-Tenant SaaS Notes Application

A full-stack Next.js application with multi-tenancy, role-based access control, and subscription gating. Built with Next.js 15, TypeScript, PostgreSQL, Prisma, and Tailwind CSS.

## 🏗️ Architecture

### Multi-Tenancy Strategy: Shared Schema
This application uses a **shared schema** approach for multi-tenancy, where all tenants share the same database schema but data is isolated using `tenantId` foreign keys. This approach was chosen for:

- **Simplicity**: Single database, easier to manage and scale
- **Cost-effectiveness**: No need for separate databases per tenant
- **Easy testing**: Single database for all test scenarios
- **Performance**: Shared connection pool and optimized queries
- **Maintenance**: Single schema to maintain and migrate

### Tenant Isolation
All data queries are automatically filtered by `tenantId` through:
- Middleware that extracts tenant information from JWT tokens
- API routes that enforce tenant isolation
- Database queries that include `tenantId` filters
- Frontend state management that respects tenant boundaries

## 🚀 Features

- **Multi-tenant Architecture**: Shared schema with tenant isolation
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Member roles
- **Subscription Gating**: Free (3 notes max) vs Pro (unlimited)
- **CRUD Operations**: Full notes management
- **Modern UI**: Built with Tailwind CSS and shadcn/ui
- **TypeScript**: Full type safety throughout
- **CORS Support**: Cross-origin resource sharing enabled

## 📊 Database Schema

```prisma
model Tenant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  plan      String   @default("free") // "free" | "pro"
  users     User[]
  notes     Note[]
  createdAt DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   // "Admin" | "Member"
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  notes     Note[]
  createdAt DateTime @default(now())
}

model Note {
  id        String   @id @default(cuid())
  title     String
  content   String?
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  authorId  String?
  author    User?    @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` → `{ "status": "ok" }`

### Authentication
- `POST /api/auth/login` → Login with email/password
- `GET /api/auth/me` → Get current user info

### Notes Management
- `GET /api/notes` → List tenant notes
- `POST /api/notes` → Create new note (respects subscription limits)
- `GET /api/notes/:id` → Get single note (tenant-isolated)
- `PUT /api/notes/:id` → Update note
- `DELETE /api/notes/:id` → Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` → Upgrade tenant to Pro (Admin only)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Yarn package manager

### 1. Install Dependencies
```bash
yarn install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/multi_tenant_notes?schema=public"

# JWT Secret (generate a strong secret for production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Generate Prisma client
yarn db:generate

# Run database migrations
yarn db:migrate

# Seed the database with test data
yarn db:seed
```

### 4. Start Development Server
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 🧪 Test Accounts

The seed script creates the following test accounts (password: `password` for all):

### Acme Corporation (Free Plan)
- **Admin**: `admin@acme.test`
- **Member**: `user@acme.test`

### Globex Corporation (Free Plan)
- **Admin**: `admin@globex.test`
- **Member**: `user@globex.test`

## 📱 Usage

### Login
1. Visit `http://localhost:3000`
2. Use any of the test accounts above
3. You'll be redirected to the notes dashboard

### Notes Management
- **Create**: Use the form on the left sidebar
- **Edit**: Click the edit icon on any note
- **Delete**: Click the delete icon on any note
- **View**: All notes are displayed in the main area

### Subscription Management
- **Free Plan**: Limited to 3 notes maximum
- **Upgrade**: Admins can upgrade to Pro for unlimited notes
- **Members**: See upgrade prompt but cannot upgrade themselves

## 🚀 Deployment on Vercel

### 1. Prepare for Deployment
```bash
# Build the application
yarn build

# Test the build locally
yarn start
```

### 2. Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong secret key
   - `NEXTAUTH_URL`: Your Vercel deployment URL

### 3. Database Migration
After deployment, run the migration on your production database:
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
yarn db:migrate

# Seed production data (optional)
yarn db:seed
```

## 🧪 Testing the API

### Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### Login
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

### Create Note
```bash
curl -X POST https://your-app.vercel.app/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My Note","content":"Note content"}'
```

### List Notes
```bash
curl https://your-app.vercel.app/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upgrade Tenant
```bash
curl -X POST https://your-app.vercel.app/api/tenants/acme/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"plan":"pro"}'
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Tenant Isolation**: All queries filtered by tenantId
- **Role-based Access**: Admin vs Member permissions
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable cross-origin policies

## 🏗️ Project Structure

```
multi-tenant/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── notes/         # Notes CRUD endpoints
│   │   └── tenants/       # Tenant management
│   ├── login/             # Login page
│   ├── notes/             # Notes dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── auth.ts           # JWT utilities
│   ├── db.ts             # Prisma client
│   ├── validations.ts    # Zod schemas
│   └── cors.ts           # CORS utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding
└── middleware.ts         # Authentication middleware
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check database permissions

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration (24 hours)
   - Ensure proper Authorization header format

3. **CORS Errors**
   - Verify CORS headers are set
   - Check preflight OPTIONS requests
   - Ensure proper origin configuration

4. **Build Errors**
   - Run `yarn db:generate` before building
   - Check TypeScript errors
   - Verify all environment variables

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the GitHub repository.
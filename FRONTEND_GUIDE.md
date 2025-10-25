# CMPC LIMS - Frontend Guide

## ✅ What We Built Today

### **1. Authentication System**
- ✅ JWT-based authentication with Zustand store
- ✅ Axios interceptors for automatic token management
- ✅ Protected routes with automatic redirect
- ✅ Login page with demo user quick access
- ✅ Session persistence in localStorage

### **2. Dashboard Page**
- ✅ Real-time metrics display (Requirements, Samples, Analysis, Storage, Users)
- ✅ Pending items counter for each category
- ✅ Recent activity feeds for Requirements, Samples, and Analysis
- ✅ Status badges with color coding
- ✅ Quick action buttons (placeholders for future features)
- ✅ Professional UI with responsive design

### **3. Complete Files Created**

**Types:**
- `src/types/auth.ts` - Authentication types (User, Login, AuthState)
- `src/types/dashboard.ts` - Dashboard data types

**Services:**
- `src/services/api.ts` - Axios instance with interceptors
- `src/services/auth.service.ts` - Authentication API calls
- `src/services/dashboard.service.ts` - Dashboard API calls

**State Management:**
- `src/stores/authStore.ts` - Zustand auth store

**Components:**
- `src/components/ProtectedRoute.tsx` - Route protection wrapper

**Pages:**
- `src/pages/LoginPage.tsx` - Login page with demo users
- `src/pages/DashboardPage.tsx` - Main dashboard

**Configuration:**
- `src/App.tsx` - Updated with routing

---

## 🚀 How to Run the Application

### **Backend (must be running first):**
```bash
cd backend
npm run dev:backend
```
Server runs on: http://localhost:3000

### **Frontend:**
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:5173

---

## 🔑 Demo Login Credentials

All users use the password: `password123`

### **Admin User:**
- Email: `admin@cmpc.cl`
- Role: ADMIN
- Access: Full system access

### **Investigator (María González):**
- Email: `maria.gonzalez@cmpc.cl`
- Role: INVESTIGADOR
- Plant: Planta Laja

### **Investigator (Pedro Silva):**
- Email: `pedro.silva@cmpc.cl`
- Role: INVESTIGADOR
- Plant: Planta Pacífico

### **Lab Technician (Ana Martínez):**
- Email: `ana.martinez@cmpc.cl`
- Role: LABORATORISTA
- Plant: Planta Laja

### **Lab Technician (Carlos Rodríguez):**
- Email: `carlos.rodriguez@cmpc.cl`
- Role: LABORATORISTA
- Plant: Planta Pacífico

### **Lab Chief (Lucía Fernández):**
- Email: `lucia.fernandez@cmpc.cl`
- Role: JEFE_LAB

---

## 📊 Dashboard Features

### **Metrics Cards:**
1. **Requerimientos** - Total requirements and pending count
2. **Muestras** - Total samples and pending count
3. **Análisis** - Total analysis and pending count
4. **Almacenamiento** - Total storage locations
5. **Usuarios** - Total active users

### **Recent Activity Sections:**
- **Requerimientos Recientes** - Latest requirements with status
- **Muestras Recientes** - Latest samples with QR codes
- **Análisis Recientes** - Latest analysis with status

### **Status Color Coding:**
- Gray: DRAFT
- Yellow: PENDIENTE
- Blue: EN_PROCESO
- Green: COMPLETADO
- Purple: ESPERADA
- Cyan: RECIBIDA
- Orange: EN_ANALISIS
- Emerald: ANALISIS_COMPLETO

---

## 🎯 Quick Test Flow

### **1. Start Services:**
```bash
# Terminal 1 - Backend
cd /path/to/cmpc-lims/backend
npm run dev:backend

# Terminal 2 - Frontend
cd /path/to/cmpc-lims/frontend
npm run dev
```

### **2. Access Application:**
Open browser: http://localhost:5173

### **3. Login:**
- Click on any demo user card on the login page
- Or manually enter credentials
- Click "Iniciar Sesión"

### **4. View Dashboard:**
- See real-time metrics from seeded data
- View recent activity
- Explore the interface

### **5. Logout:**
- Click "Cerrar Sesión" in the header

---

## 🔧 Technical Stack

### **Frontend:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Styling:** TailwindCSS
- **Notifications:** Sonner
- **UI Components:** shadcn/ui compatible

### **Backend:**
- **Framework:** NestJS 10
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **API Docs:** Swagger/OpenAPI

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── dashboard.service.ts
│   ├── stores/
│   │   └── authStore.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── dashboard.ts
│   ├── App.tsx
│   └── main.tsx
├── .env (configured)
└── package.json
```

---

## 🎨 UI Features

### **Login Page:**
- Split-screen design
- Left: Login form with demo user quick access
- Right: Branding and feature highlights
- Responsive (mobile-friendly)

### **Dashboard Page:**
- Header with user info and logout
- 5 metric cards with icons
- 3 recent activity sections
- 3 quick action buttons
- Clean, professional design
- Fully responsive

---

## 🔄 API Integration

All API calls go through the configured Axios instance (`src/services/api.ts`):

- **Base URL:** `http://localhost:3000/api`
- **Auto Token Injection:** Bearer token added to all requests
- **Auto 401 Handling:** Logout and redirect on unauthorized
- **Error Handling:** Centralized error management

### **Endpoints Used:**
- `POST /auth/login` - User authentication
- `GET /auth/profile` - Get user profile
- `GET /dashboard/overview` - Dashboard metrics
- `GET /dashboard/recent-activity` - Recent activity

---

## 🚧 Next Steps (Future Development)

1. **Requirements Management Page**
   - List, create, edit requirements
   - Filter and search
   - Status management

2. **Samples Tracking Page**
   - Sample registration
   - QR code scanning
   - Storage assignment
   - Status tracking

3. **Analysis Management Page**
   - Analysis creation
   - Results entry
   - PDF report upload
   - Status updates

4. **Storage Management Page**
   - Warehouse locations
   - Sample storage tracking
   - Expiration management

5. **Admin Panel**
   - User management
   - Plant management
   - Analysis type configuration

6. **QR Code Scanner**
   - Camera integration
   - Real-time scanning
   - Event registration

---

## 💡 Tips for Development

1. **Hot Reload:** Both frontend and backend support hot reload
2. **Check Console:** Use browser DevTools for debugging
3. **API Errors:** Check Network tab for failed requests
4. **State:** Use React DevTools to inspect Zustand store
5. **Database:** Use Prisma Studio to view data: `npm run prisma:studio`

---

## 📞 Demo Presentation Tips

### **For CMPC Stakeholders:**

1. **Show Login Flow:**
   - Demonstrate different user roles
   - Show password validation
   - Quick access with demo users

2. **Explain Dashboard:**
   - Point out real-time metrics
   - Show how status tracking works
   - Demonstrate responsive design

3. **Highlight Key Features:**
   - JWT authentication security
   - Role-based access (ready for implementation)
   - Modern, professional UI
   - Mobile-responsive design

4. **Technical Highlights:**
   - TypeScript for type safety
   - Zustand for efficient state management
   - Axios interceptors for clean API handling
   - TailwindCSS for maintainable styling

---

## ✅ Completion Checklist

- [x] Authentication system implemented
- [x] Login page with demo users
- [x] Dashboard with real metrics
- [x] Protected routes
- [x] Session persistence
- [x] Responsive design
- [x] Error handling
- [x] Professional UI/UX
- [x] Backend integration
- [x] Seeded demo data

---

**Status:** ✅ Login and Dashboard fully functional and ready for demo!

**Access:** http://localhost:5173
**Login:** Use any demo user with password `password123`

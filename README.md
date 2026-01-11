# AttendEasy - Smart College Attendance Management System

![AttendEasy Logo](public/favicon.png)

**AttendEasy** is a modern, comprehensive attendance management system designed for colleges and educational institutions. Built with React, TypeScript, and Vite, it offers a seamless experience for teachers to manage students, track attendance, record test marks, and generate timetables.

## 🌟 Features

### 📊 Dashboard
- Real-time statistics overview (students, subjects, attendance rates, average scores)
- Recent activity feed
- Student distribution by year
- Quick access to all major features

### 📱 QR-Based Attendance
- Generate time-limited QR codes for each subject
- Students scan QR codes to mark attendance
- Location-based verification (geofencing)
- Real-time attendance tracking
- Session history with detailed reports

### 👨‍🎓 Student Management
- Add, edit, and delete student records
- Import students via CSV
- Search and filter functionality
- Track student information (name, roll number, email, year)

### 📚 Subject Management
- Organize subjects by year and semester
- Add, edit, and delete subjects
- Subject code and name management
- Year-wise subject categorization

### 📝 Test Marks Management
- Create tests for specific subjects
- Record and update student marks
- Automatic grade calculation
- Filter by subject and test
- Performance analytics with color-coded grades

### 📅 Timetable Generator
- Configure lecture timings
- Set break durations
- Generate timetables for different years
- Customizable time slots

### 📤 Data Export
- Export attendance data to CSV
- Export marks data to CSV
- Combined reports
- Filter by year and subject

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd attenedeasy/class-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
# or
bun run build
```

The production-ready files will be in the `dist` folder.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **QR Code**: qrcode.react, html5-qrcode
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts

## 📁 Project Structure

```
class-companion/
├── public/              # Static assets
│   └── favicon.png     # App icon
├── src/
│   ├── components/     # React components
│   │   ├── attendance/ # Attendance-related components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── export/     # Data export components
│   │   ├── layout/     # Layout components
│   │   ├── marks/      # Marks management components
│   │   ├── students/   # Student management components
│   │   ├── subjects/   # Subject management components
│   │   ├── timetable/  # Timetable components
│   │   └── ui/         # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # App entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🎨 Key Components

### Teacher Dashboard (`/`)
The main interface for teachers with navigation to all features.

### Student Portal (`/student`)
A dedicated portal for students to view and mark attendance.

### Session History (`/sessions`)
View detailed attendance session history with geolocation data.

## 🔧 Configuration

### Customizing Colors
Edit `tailwind.config.ts` to customize the color scheme.

### Adding New Features
1. Create components in the appropriate folder under `src/components/`
2. Add types in `src/types/index.ts`
3. Update routing in `src/App.tsx`
4. Add navigation items in `src/components/layout/Sidebar.tsx`

## 📊 Data Management

Currently, the application uses in-memory state management with sample data. For production use, you should:

1. Integrate with a backend API
2. Add authentication and authorization
3. Implement persistent storage (database)
4. Add real-time updates using WebSockets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Known Issues

- Data is not persisted (in-memory only)
- No authentication system
- Location-based attendance requires HTTPS in production

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] User authentication (teacher/student roles)
- [ ] Database integration
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Attendance reports and analytics
- [ ] Parent portal
- [ ] Multi-language support

## 💡 Support

For support, please open an issue in the GitHub repository.

---

**Made with ❤️ for educational institutions**

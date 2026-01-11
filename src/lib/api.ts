import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error);

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        if (error.response) {
            throw new Error(error.response.data?.error?.message || 'Server error occurred');
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

// Authentication API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    verify: async () => {
        return api.get('/auth/verify');
    },
};

// Students API
export const studentsAPI = {
    getAll: async (year?: number) => {
        const params = year ? { year } : {};
        return api.get('/students', { params });
    },

    getById: async (id: string) => {
        return api.get(`/students/${id}`);
    },

    create: async (data: {
        name: string;
        rollNumber: string;
        year: number;
        email: string;
    }) => {
        return api.post('/students', data);
    },

    update: async (id: string, data: Partial<{
        name: string;
        rollNumber: string;
        year: number;
        email: string;
    }>) => {
        return api.put(`/students/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/students/${id}`);
    },
};

// Subjects API
export const subjectsAPI = {
    getAll: async (filters?: { year?: number; semester?: number }) => {
        return api.get('/subjects', { params: filters });
    },

    getById: async (id: string) => {
        return api.get(`/subjects/${id}`);
    },

    create: async (data: {
        name: string;
        code: string;
        year: number;
        semester: number;
    }) => {
        return api.post('/subjects', data);
    },

    update: async (id: string, data: Partial<{
        name: string;
        code: string;
        year: number;
        semester: number;
    }>) => {
        return api.put(`/subjects/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/subjects/${id}`);
    },
};

// Attendance API
export const attendanceAPI = {
    createSession: async (data: {
        subjectId: string;
        qrCode: string;
        startTime: string;
        endTime: string;
        locationLat?: number;
        locationLng?: number;
        allowedRadius?: number;
    }) => {
        return api.post('/attendance/sessions', data);
    },

    getSessions: async (filters?: { subjectId?: string; isActive?: boolean }) => {
        return api.get('/attendance/sessions', { params: filters });
    },

    getSessionById: async (id: string) => {
        return api.get(`/attendance/sessions/${id}`);
    },

    markAttendance: async (data: {
        sessionId: string;
        studentId: string;
        locationLat?: number;
        locationLng?: number;
        locationAccuracy?: number;
    }) => {
        return api.post('/attendance/mark', data);
    },

    getStudentAttendance: async (studentId: string, subjectId?: string) => {
        const params = subjectId ? { subjectId } : {};
        return api.get(`/attendance/student/${studentId}`, { params });
    },

    stopSession: async (id: string) => {
        return api.patch(`/attendance/sessions/${id}/stop`);
    },
};

// Marks API
export const marksAPI = {
    getAll: async (filters?: {
        studentId?: string;
        subjectId?: string;
        testName?: string;
    }) => {
        return api.get('/marks', { params: filters });
    },

    create: async (data: {
        studentId: string;
        subjectId: string;
        testName: string;
        maxMarks: number;
        obtainedMarks: number;
        testDate?: string;
    }) => {
        return api.post('/marks', data);
    },

    update: async (id: string, data: Partial<{
        obtainedMarks: number;
        maxMarks: number;
        testName: string;
    }>) => {
        return api.put(`/marks/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/marks/${id}`);
    },

    getStudentSummary: async (studentId: string) => {
        return api.get(`/marks/student/${studentId}/summary`);
    },
};

// Health check
export const healthCheck = async () => {
    return api.get('/health', { baseURL: 'http://localhost:3000' });
};

export default api;

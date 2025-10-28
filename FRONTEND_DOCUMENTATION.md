# SnapFix Frontend Documentation

## Table of Contents
1. [React.js Basics](#1-reactjs-basics)
2. [React App Architecture](#2-react-app-architecture)
3. [UI/UX & Styling](#3-uiux--styling)
4. [API Integration](#4-api-integration)
5. [Hooks Deep Dive](#5-hooks-deep-dive)
6. [Performance & Optimization](#6-performance--optimization)
7. [Debugging & Tools](#7-debugging--tools)
8. [Deployment & Environment](#8-deployment--environment)
9. [Project-Specific React Questions](#9-project-specific-react-questions)

---

## 1. React.js Basics

### What is React.js and why did you choose it for your project?

**React.js** is a JavaScript library for building user interfaces, particularly single-page applications (SPAs). It was developed by Facebook and is now maintained by Meta and the community.

**Why React.js was chosen for SnapFix:**

1. **Component-Based Architecture**: SnapFix has multiple distinct user roles (Student, Staff, Admin, Department Head) with different interfaces. React's component system allows us to create reusable UI components for each role while maintaining consistency.

2. **Virtual DOM**: With real-time ticket updates, status changes, and dynamic data loading, React's Virtual DOM ensures efficient re-rendering and optimal performance.

3. **Rich Ecosystem**: React's ecosystem provides excellent libraries for:
   - **React Router** for navigation between different user dashboards
   - **Axios** for API communication with the Java backend
   - **Context API** for global state management (authentication, user data)
   - **Chart.js** for analytics and reporting features

4. **TypeScript Integration**: React works seamlessly with TypeScript, providing type safety for our complex data structures (tickets, users, rewards).

5. **Community & Support**: Large community ensures long-term maintenance and extensive documentation.

### What is the difference between React and plain JavaScript?

| Aspect | Plain JavaScript | React.js |
|--------|------------------|----------|
| **DOM Manipulation** | Direct DOM manipulation | Virtual DOM with diffing algorithm |
| **State Management** | Manual state tracking | Built-in state management with hooks |
| **Reusability** | Functions and objects | Reusable components |
| **Data Flow** | Manual event handling | Unidirectional data flow (props down, events up) |
| **Performance** | Manual optimization | Automatic optimization through Virtual DOM |
| **Code Organization** | Procedural/functional | Component-based architecture |

**Example from SnapFix:**
```javascript
// Plain JavaScript approach (inefficient)
function updateTicketStatus(ticketId) {
  const ticketElement = document.getElementById(`ticket-${ticketId}`);
  const statusElement = ticketElement.querySelector('.status');
  statusElement.textContent = 'RESOLVED';
  statusElement.className = 'status resolved';
}

// React approach (efficient)
const TicketCard = ({ ticket, onStatusUpdate }) => {
  const [status, setStatus] = useState(ticket.status);
  
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onStatusUpdate(ticket.id, newStatus);
  };
  
  return (
    <div className={`status ${status.toLowerCase()}`}>
      {status}
    </div>
  );
};
```

### What is a component in React?

A **component** is a reusable piece of UI that can accept inputs (props) and return React elements describing what should appear on the screen.

**SnapFix Component Examples:**

1. **TicketCard Component** (`components/tickets/TicketList.tsx`):
```typescript
interface TicketCardProps {
  ticket: Ticket;
  onStatusUpdate: (ticketId: number, status: string) => void;
  userRole: UserRole;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onStatusUpdate, userRole }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{ticket.ticketId}</h3>
        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-gray-600 mt-2">{ticket.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">{ticket.category}</span>
        <span className="text-sm text-gray-500">{formatDate(ticket.createdAt)}</span>
      </div>
    </div>
  );
};
```

2. **Layout Component** (`components/layout/Layout.tsx`):
```typescript
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar userRole={user?.role} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### Difference between class components and functional components?

| Feature | Class Components | Functional Components |
|---------|------------------|----------------------|
| **Syntax** | ES6 classes | JavaScript functions |
| **State** | `this.state` and `this.setState()` | `useState` hook |
| **Lifecycle** | `componentDidMount`, `componentDidUpdate`, etc. | `useEffect` hook |
| **Props** | `this.props` | Function parameters |
| **Performance** | Slightly larger bundle | Smaller bundle size |
| **Hooks** | Cannot use hooks | Can use all hooks |
| **Modern React** | Legacy (still supported) | Recommended approach |

**SnapFix uses only Functional Components** with hooks for modern React development.

**Example comparison:**

```typescript
// Class Component (NOT used in SnapFix)
class OldTicketCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: false };
  }
  
  componentDidMount() {
    console.log('Component mounted');
  }
  
  toggleExpanded = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  }
  
  render() {
    return (
      <div onClick={this.toggleExpanded}>
        {this.state.isExpanded ? 'Expanded' : 'Collapsed'}
      </div>
    );
  }
}

// Functional Component (Used in SnapFix)
const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    console.log('Component mounted');
  }, []);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div onClick={toggleExpanded}>
      {isExpanded ? 'Expanded' : 'Collapsed'}
    </div>
  );
};
```

### What are props and state?

**Props** are read-only inputs passed down from parent components to child components. They are immutable within the child component.

**State** is internal data that belongs to a component and can change over time, causing re-renders when updated.

**SnapFix Examples:**

**Props Example** (`components/tickets/TicketDetails.tsx`):
```typescript
interface TicketDetailsProps {
  ticketId: string;           // Required prop
  onStatusUpdate?: (ticketId: string, status: string) => void; // Optional prop
  userRole: UserRole;         // Enum prop
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ 
  ticketId, 
  onStatusUpdate, 
  userRole 
}) => {
  // Props are read-only, cannot be modified
  console.log('Ticket ID:', ticketId);
  console.log('User Role:', userRole);
  
  return (
    <div>
      <h2>Ticket {ticketId}</h2>
      {userRole === UserRole.ADMIN && (
        <button onClick={() => onStatusUpdate?.(ticketId, 'RESOLVED')}>
          Mark as Resolved
        </button>
      )}
    </div>
  );
};
```

**State Example** (`components/tickets/CreateTicket.tsx`):
```typescript
const CreateTicket: React.FC = () => {
  // Multiple state variables
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State updates cause re-renders
  const handleInputChange = (field: keyof CreateTicketRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.roomNumber}
        onChange={(e) => handleInputChange('roomNumber', e.target.value)}
        className={errors.roomNumber ? 'border-red-500' : 'border-gray-300'}
      />
      {errors.roomNumber && (
        <p className="text-red-500 text-sm">{errors.roomNumber}</p>
      )}
    </form>
  );
};
```

### How do you pass data from parent to child and vice versa?

**Parent to Child (Props):**
```typescript
// Parent Component
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id}
          ticket={ticket}                    // Pass data down
          onStatusUpdate={handleStatusUpdate} // Pass function down
        />
      ))}
    </div>
  );
};

// Child Component
const TicketCard: React.FC<TicketCardProps> = ({ ticket, onStatusUpdate }) => {
  return (
    <div>
      <h3>{ticket.ticketId}</h3>
      <button onClick={() => onStatusUpdate(ticket.id, 'RESOLVED')}>
        Mark Resolved
      </button>
    </div>
  );
};
```

**Child to Parent (Callback Functions):**
```typescript
// Parent Component
const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // Function to handle data from child
  const handleTicketAssignment = async (ticketId: number, staffId: number) => {
    try {
      await dashboardApi.assignTicket(ticketId, staffId);
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignedTo: { id: staffId, name: 'Staff Name' } }
          : ticket
      ));
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  };
  
  return (
    <AssignTicketModal 
      ticket={selectedTicket}
      onAssign={handleTicketAssignment}  // Pass callback function
    />
  );
};

// Child Component
const AssignTicketModal: React.FC<AssignTicketModalProps> = ({ ticket, onAssign }) => {
  const handleAssign = (staffId: number) => {
    onAssign(ticket.id, staffId);  // Call parent function with data
  };
  
  return (
    <div>
      <button onClick={() => handleAssign(selectedStaffId)}>
        Assign Ticket
      </button>
    </div>
  );
};
```

### What is JSX and why do we use it?

**JSX (JavaScript XML)** is a syntax extension that allows you to write HTML-like code in JavaScript. It gets compiled to `React.createElement()` calls.

**Why JSX is used:**

1. **Readability**: JSX makes component structure more readable and intuitive
2. **Type Safety**: With TypeScript, JSX provides compile-time type checking
3. **Developer Experience**: Better IDE support with syntax highlighting and autocomplete
4. **Component Composition**: Easy to compose components and pass props

**SnapFix JSX Examples:**

```typescript
// Simple JSX
const WelcomeMessage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-blue-800">
        Welcome back, {userName}!
      </h1>
      <p className="text-blue-600 mt-2">
        You have 3 pending tickets to review.
      </p>
    </div>
  );
};

// Complex JSX with conditional rendering
const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case TicketStatus.IN_PROGRESS:
        return { color: 'bg-blue-100 text-blue-800', icon: '🔄' };
      case TicketStatus.RESOLVED:
        return { color: 'bg-green-100 text-green-800', icon: '✅' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {status.replace('_', ' ')}
    </span>
  );
};

// JSX with mapping and conditional rendering
const TicketList: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{ticket.ticketId}</h3>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-gray-600 mt-2">{ticket.description}</p>
            {ticket.assignedTo && (
              <p className="text-sm text-gray-500 mt-2">
                Assigned to: {ticket.assignedTo.name}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};
```

### What are hooks? Name a few commonly used ones.

**Hooks** are functions that let you use state and other React features in functional components. They always start with "use" and must be called at the top level of React functions.

**Commonly Used Hooks in SnapFix:**

1. **useState** - Manage component state
2. **useEffect** - Handle side effects and lifecycle events
3. **useContext** - Access React context
4. **useRef** - Access DOM elements and store mutable values
5. **useMemo** - Memoize expensive calculations
6. **useCallback** - Memoize functions to prevent unnecessary re-renders

**SnapFix Hook Examples:**

```typescript
// useState Hook
const CreateTicket: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
};

// useEffect Hook
const TicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getTicketDetails(ticketId);
        setTicket(response.data);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId]); // Dependency array - runs when ticketId changes
  
  // Cleanup effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Poll for updates every 30 seconds
      fetchTicket();
    }, 30000);
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
};

// useContext Hook
const Header: React.FC = () => {
  const { user, logout, userPoints } = useAuth(); // Custom hook using useContext
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold">SnapFix</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.name}</span>
          <span>Points: {userPoints}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </header>
  );
};

// useRef Hook
const ImageUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button onClick={handleFileSelect}>
        Select Image
      </button>
      {selectedFile && (
        <p>Selected: {selectedFile.name}</p>
      )}
    </div>
  );
};

// useMemo Hook
const Analytics: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const chartData = useMemo(() => {
    // Expensive calculation - only runs when tickets change
    return tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<TicketCategory, number>);
  }, [tickets]);
  
  return (
    <div>
      <h2>Ticket Analytics</h2>
      <pre>{JSON.stringify(chartData, null, 2)}</pre>
    </div>
  );
};

// useCallback Hook
const TicketCard: React.FC<{ ticket: Ticket; onUpdate: (id: number) => void }> = ({ 
  ticket, 
  onUpdate 
}) => {
  // Memoize the callback to prevent unnecessary re-renders
  const handleStatusUpdate = useCallback((newStatus: string) => {
    onUpdate(ticket.id);
  }, [ticket.id, onUpdate]);
  
  return (
    <div>
      <h3>{ticket.ticketId}</h3>
      <button onClick={() => handleStatusUpdate('RESOLVED')}>
        Mark Resolved
      </button>
    </div>
  );
};
```

### What is the Virtual DOM, and how does it improve performance?

**Virtual DOM** is a JavaScript representation of the real DOM kept in memory and synced with the "real" DOM through a process called reconciliation.

**How Virtual DOM improves performance:**

1. **Batching Updates**: Multiple state changes are batched into a single DOM update
2. **Diffing Algorithm**: Only changed elements are updated in the real DOM
3. **Efficient Re-rendering**: Components only re-render when their props or state change
4. **Minimal DOM Manipulation**: Reduces expensive DOM operations

**SnapFix Performance Example:**

```typescript
// Without Virtual DOM (inefficient)
const updateMultipleTickets = (tickets: Ticket[]) => {
  tickets.forEach(ticket => {
    const element = document.getElementById(`ticket-${ticket.id}`);
    element.querySelector('.status').textContent = ticket.status;
    element.querySelector('.priority').textContent = ticket.priority;
    // Multiple DOM manipulations for each ticket
  });
};

// With Virtual DOM (efficient)
const TicketList: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  // React batches all updates and only changes what's different
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

### How does React handle UI updates efficiently?

React uses several strategies for efficient UI updates:

1. **Reconciliation Process**: Compares new Virtual DOM with previous version
2. **Keys in Lists**: Helps React identify which items changed
3. **Component Memoization**: `React.memo()` prevents unnecessary re-renders
4. **State Batching**: Multiple state updates are batched together
5. **Lazy Loading**: Components are loaded only when needed

**SnapFix Efficiency Examples:**

```typescript
// Efficient list rendering with keys
const TicketList: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id} // Unique key for efficient updates
          ticket={ticket} 
        />
      ))}
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
const TicketCard = React.memo<TicketCardProps>(({ ticket, onUpdate }) => {
  return (
    <div className="ticket-card">
      <h3>{ticket.ticketId}</h3>
      <p>{ticket.description}</p>
    </div>
  );
});

// Lazy loading for better performance
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
};
```

---

## 2. React App Architecture

### How is your React app structured (folders, components)?

The SnapFix frontend follows a well-organized, scalable folder structure that separates concerns and promotes maintainability:

```
frontend/src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── AdminTickets.tsx
│   │   ├── AssignTicketModal.tsx
│   │   ├── StaffManagement.tsx
│   │   └── StudentManagement.tsx
│   ├── analytics/       # Analytics and reporting
│   │   └── Analytics.tsx
│   ├── auth/           # Authentication components
│   │   ├── Login.tsx
│   │   └── ProtectedRoute.tsx
│   ├── common/         # Shared components
│   │   ├── ImageViewerModal.tsx
│   │   └── PasswordInput.tsx
│   ├── dashboard/      # Dashboard components
│   │   └── Dashboard.tsx
│   ├── layout/         # Layout components
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── rewards/        # Rewards system
│   │   ├── RedeemedVoucherModal.tsx
│   │   ├── RewardDashboard.tsx
│   │   ├── Rewards.tsx
│   │   └── VoucherRedemptionModal.tsx
│   ├── staff/          # Staff-specific components
│   │   ├── StaffDashboard.tsx
│   │   ├── StaffSettings.tsx
│   │   └── StatusUpdateModal.tsx
│   ├── student/        # Student-specific components
│   │   └── StudentSettings.tsx
│   └── tickets/        # Ticket management
│       ├── AssignedTickets.tsx
│       ├── CreateTicket.tsx
│       ├── DuplicateWarningModal.tsx
│       ├── TicketDetails.tsx
│       ├── TicketDetailsModal.tsx
│       └── TicketList.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx
├── services/           # API service layer
│   ├── api.ts
│   ├── authService.ts
│   ├── rewardService.ts
│   ├── ticketService.ts
│   └── userService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── dateUtils.ts
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

**Architecture Benefits:**

1. **Role-Based Organization**: Components are grouped by user roles (admin, staff, student)
2. **Feature-Based Structure**: Related components are co-located (tickets, rewards, analytics)
3. **Separation of Concerns**: Services, types, and utilities are separated from UI components
4. **Scalability**: Easy to add new features without cluttering existing folders
5. **Maintainability**: Clear structure makes it easy to locate and modify components

### What is the role of App.js and index.js?

**index.tsx (Application Entry Point):**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

**Role of index.tsx:**
- **Application Bootstrap**: Initializes the React application
- **DOM Mounting**: Renders the App component to the DOM element with id "root"
- **Strict Mode**: Enables additional checks and warnings for development
- **Global Styles**: Imports global CSS styles
- **Performance Monitoring**: Sets up web vitals reporting

**App.tsx (Main Application Component):**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserRole } from './types';
// ... other imports

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            {/* ... other routes */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

**Role of App.tsx:**
- **Provider Setup**: Wraps the entire app with context providers (AuthProvider)
- **Routing Configuration**: Defines all application routes and their components
- **Layout Management**: Applies consistent layout structure across protected routes
- **Authentication**: Integrates authentication checks with route protection
- **Component Composition**: Orchestrates the main application structure

### How do you manage your API calls in the frontend?

SnapFix uses a centralized API management approach with multiple service layers:

**1. Centralized API Client (`services/api.ts`):**
```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

**2. Specialized Service Modules:**

**Authentication Service (`services/authService.ts`):**
```typescript
import { apiClient } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<string> {
    const response = await apiClient.post<string>('/auth/change-password', passwordData);
    return response.data;
  }
};
```

**Ticket Service (`services/ticketService.ts`):**
```typescript
import { apiClient } from './api';
import { Ticket, CreateTicketRequest, TicketComment } from '../types';

export const ticketService = {
  async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
    const formData = new FormData();
    
    if (ticketData.photo) {
      formData.append('photo', ticketData.photo);
    }
    formData.append('roomNumber', ticketData.roomNumber);
    formData.append('category', ticketData.category);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority || 'MEDIUM');

    const response = await apiClient.upload<Ticket>('/tickets', formData);
    return response.data;
  },

  async getTickets(): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>('/tickets');
    return response.data;
  },

  async getTicketDetails(ticketId: string): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
    return response.data;
  },

  async updateTicketStatus(ticketId: number, status: string): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(
      `/tickets/${ticketId}/status?status=${status}`
    );
    return response.data;
  },

  async addComment(ticketId: string, comment: string): Promise<void> {
    await apiClient.post(`/tickets/comments/${ticketId}?comment=${comment}`);
  },

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const response = await apiClient.get<TicketComment[]>(`/tickets/comments/${ticketId}`);
    return response.data;
  }
};
```

**3. API Management Benefits:**
- **Centralized Configuration**: Single point for base URL, headers, and error handling
- **Automatic Token Management**: Handles JWT token storage and inclusion in requests
- **Type Safety**: Full TypeScript support with typed responses
- **Error Handling**: Consistent error handling across all API calls
- **Request/Response Interceptors**: Automatic token refresh and error handling
- **Modular Services**: Each domain has its own service module

### How did you connect your frontend to the backend?

**1. Environment Configuration:**
```typescript
// Environment variable setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

**2. CORS Configuration:**
The backend is configured to accept requests from the frontend origin:
```java
// Backend CORS configuration
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
```

**3. Authentication Flow:**
```typescript
// Frontend authentication flow
const login = async (email: string, password: string) => {
  try {
    // 1. Send credentials to backend
    const response = await authService.login(email, password);
    
    // 2. Store JWT token
    localStorage.setItem('token', response.token);
    
    // 3. Update API client with new token
    updateApiClientToken(response.token);
    
    // 4. Update auth context
    setUser(response.user);
    setToken(response.token);
  } catch (error) {
    throw new Error('Login failed');
  }
};
```

**4. Request Authentication:**
```typescript
// Automatic token inclusion in requests
private async request<T>(endpoint: string, options: RequestInit = {}) {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add JWT token to all requests
  if (this.token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${this.token}`,
    };
  }

  const response = await fetch(url, config);
  // ... handle response
}
```

**5. Error Handling:**
```typescript
// Centralized error handling
try {
  const response = await apiClient.get<Ticket[]>('/tickets');
  setTickets(response.data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired, redirect to login
      logout();
      navigate('/login');
    } else {
      setError(error.message);
    }
  }
}
```

### How do you handle different pages (React Router)?

SnapFix uses React Router v6 for client-side routing with role-based access control:

**1. Router Setup:**
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with role-based access */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
                <Layout>
                  <StaffDashboard />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
```

**2. Protected Route Component:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        navigate('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};
```

**3. Navigation Examples:**
```typescript
// Programmatic navigation
const navigate = useNavigate();

const handleTicketClick = (ticketId: string) => {
  navigate(`/tickets/${ticketId}`);
};

const handleAdminAccess = () => {
  navigate('/admin');
};

// Link components
import { Link } from 'react-router-dom';

const NavigationMenu = () => {
  const { user } = useAuth();
  
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/tickets">Tickets</Link>
      {user?.role === UserRole.ADMIN && (
        <Link to="/admin">Admin Panel</Link>
      )}
      {user?.role === UserRole.STAFF && (
        <Link to="/staff">Staff Panel</Link>
      )}
    </nav>
  );
};
```

### What is React Router, and how do you navigate between components?

**React Router** is the standard routing library for React applications, enabling client-side routing without page refreshes.

**Navigation Methods in SnapFix:**

**1. Declarative Navigation (Links):**
```typescript
import { Link, NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
        <Link to="/tickets" className="nav-link">
          My Tickets
        </Link>
        <Link to="/tickets/create" className="nav-link">
          Create Ticket
        </Link>
        
        {/* Active link styling */}
        <NavLink 
          to="/rewards" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          Rewards
        </NavLink>
      </nav>
    </aside>
  );
};
```

**2. Programmatic Navigation:**
```typescript
import { useNavigate, useLocation } from 'react-router-dom';

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = () => {
    // Navigate to ticket details
    navigate(`/tickets/${ticket.ticketId}`);
  };

  const handleEdit = () => {
    // Navigate with state
    navigate(`/tickets/${ticket.ticketId}/edit`, {
      state: { ticket, returnTo: location.pathname }
    });
  };

  const handleBack = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="ticket-card">
      <h3>{ticket.ticketId}</h3>
      <button onClick={handleViewDetails}>View Details</button>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleBack}>Back</button>
    </div>
  );
};
```

**3. URL Parameters:**
```typescript
import { useParams } from 'react-router-dom';

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId);
    }
  }, [ticketId]);

  return (
    <div>
      <h2>Ticket Details: {ticketId}</h2>
      {ticket && (
        <div>
          <p>Description: {ticket.description}</p>
          <p>Status: {ticket.status}</p>
        </div>
      )}
    </div>
  );
};
```

**4. Query Parameters:**
```typescript
import { useSearchParams } from 'react-router-dom';

const TicketList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const status = searchParams.get('status');
  const category = searchParams.get('category');

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(filterType, value);
      } else {
        newParams.delete(filterType);
      }
      return newParams;
    });
  };

  return (
    <div>
      <select 
        value={status || ''} 
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      
      <select 
        value={category || ''} 
        onChange={(e) => handleFilterChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="PLUMBING">Plumbing</option>
        <option value="ELECTRICAL">Electrical</option>
      </select>
    </div>
  );
};
```

### Did you use Context API, Redux, or props drilling for state management?

**SnapFix uses Context API** for global state management, avoiding Redux complexity and props drilling:

**1. Context API Implementation:**
```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  userPoints: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserPoints: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // Login logic
  };

  const logout = () => {
    // Logout logic
  };

  const value: AuthContextType = {
    user,
    token,
    userPoints,
    login,
    logout,
    refreshUserPoints,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**2. Why Context API over Redux:**
- **Simplicity**: Less boilerplate code
- **Built-in**: No additional dependencies
- **TypeScript Support**: Excellent TypeScript integration
- **Smaller Bundle**: No Redux overhead
- **Sufficient for SnapFix**: Global state needs are minimal

**3. Why Context API over Props Drilling:**
```typescript
// Props drilling (avoided in SnapFix)
const App = () => {
  const [user, setUser] = useState(null);
  return <Layout user={user} setUser={setUser} />;
};

const Layout = ({ user, setUser }) => {
  return <Header user={user} setUser={setUser} />;
};

const Header = ({ user, setUser }) => {
  return <UserMenu user={user} setUser={setUser} />;
};

const UserMenu = ({ user, setUser }) => {
  return <button onClick={() => setUser(null)}>Logout</button>;
};

// Context API (used in SnapFix)
const App = () => {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
};

const Layout = () => {
  return <Header />;
};

const Header = () => {
  return <UserMenu />;
};

const UserMenu = () => {
  const { user, logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
};
```

### How do you manage global state or session info (like login)?

**Global State Management in SnapFix:**

**1. Authentication State:**
```typescript
// Global authentication state
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser(storedToken);
          setUser(userData);
          setToken(storedToken);
          updateApiClientToken(storedToken);
          await refreshUserPoints();
        } catch (error) {
          // Token invalid, clear auth state
          localStorage.removeItem('token');
          setToken(null);
          updateApiClientToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function updates global state
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      updateApiClientToken(response.token);
      await refreshUserPoints();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function clears global state
  const logout = () => {
    setUser(null);
    setToken(null);
    setUserPoints(0);
    localStorage.removeItem('token');
    updateApiClientToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      userPoints,
      login,
      logout,
      refreshUserPoints,
      isLoading,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**2. Session Persistence:**
```typescript
// Token persistence across browser sessions
const [token, setToken] = useState<string | null>(
  localStorage.getItem('token') // Restore from localStorage
);

// Update localStorage when token changes
const login = async (email: string, password: string) => {
  const response = await authService.login(email, password);
  setToken(response.token);
  localStorage.setItem('token', response.token); // Persist to localStorage
};

const logout = () => {
  setToken(null);
  localStorage.removeItem('token'); // Clear from localStorage
};
```

**3. Global State Usage:**
```typescript
// Any component can access global state
const Header: React.FC = () => {
  const { user, logout, userPoints, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <header>
      <div>Welcome, {user?.name}</div>
      <div>Points: {userPoints}</div>
      <button onClick={logout}>Logout</button>
    </header>
  );
};

const TicketList: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Fetch tickets based on user role
    if (user?.role === UserRole.ADMIN) {
      fetchAllTickets();
    } else {
      fetchUserTickets();
    }
  }, [user]);

  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**4. State Synchronization:**
```typescript
// Synchronize API client with global state
const updateApiClientToken = (token: string | null) => {
  if (token) {
    apiClient.setToken(token);
  } else {
    apiClient.clearToken();
  }
};

// Update global state when API calls succeed
const refreshUserPoints = async () => {
  try {
    const response = await rewardService.getRewardStats();
    if (response.success) {
      setUserPoints(response.data.totalPoints || 0);
    }
  } catch (error) {
    console.error('Failed to refresh user points:', error);
  }
};
```

---

## 3. UI/UX & Styling

### What styling method did you use (CSS modules, styled-components, Tailwind, etc.)?

**SnapFix uses Tailwind CSS** as the primary styling method, with additional support from Headless UI and custom CSS for specific components.

**Styling Stack:**
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Framer Motion** - Animation library
- **Custom CSS** - For specific component styling

**Why Tailwind CSS was chosen:**

1. **Rapid Development**: Utility classes enable fast UI development
2. **Consistency**: Enforces consistent spacing, colors, and typography
3. **Responsive Design**: Built-in responsive utilities
4. **Small Bundle Size**: Purges unused styles in production
5. **TypeScript Integration**: Excellent IntelliSense support
6. **Maintainability**: No CSS conflicts or specificity issues

**Tailwind Configuration (`tailwind.config.js`):**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**SnapFix Styling Examples:**

**1. Component Styling with Tailwind:**
```typescript
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {ticket.ticketId}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ticket.status === 'PENDING' 
            ? 'bg-yellow-100 text-yellow-800' 
            : ticket.status === 'RESOLVED'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {ticket.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">
        {ticket.description}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {ticket.category}
        </span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>
    </div>
  );
};
```

**2. Responsive Design with Tailwind:**
```typescript
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tickets</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">8</span>
            </div>
          </div>
        </div>
        
        {/* Responsive visibility */}
        <div className="hidden md:block bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {/* Activity content */}
        </div>
      </div>
    </div>
  );
};
```

**3. Form Styling with Tailwind:**
```typescript
const CreateTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });

  return (
    <form className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h2>
      
      <div className="space-y-6">
        {/* Room Number Input */}
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Room Number *
          </label>
          <input
            type="text"
            id="roomNumber"
            value={formData.roomNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter room number"
            required
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TicketCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={TicketCategory.PLUMBING}>Plumbing</option>
            <option value={TicketCategory.ELECTRICAL}>Electrical</option>
            <option value={TicketCategory.HOUSEKEEPING}>Housekeeping</option>
            <option value={TicketCategory.AC_WATER}>AC/Water</option>
            <option value={TicketCategory.OTHERS}>Others</option>
          </select>
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the issue in detail"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </form>
  );
};
```

### How did you make the UI responsive?

**SnapFix implements responsive design using Tailwind CSS's mobile-first approach:**

**1. Responsive Grid System:**
```typescript
const TicketGrid: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};

// Breakpoint breakdown:
// - Mobile (default): 1 column
// - Small (sm: 640px+): 2 columns
// - Large (lg: 1024px+): 3 columns
// - Extra Large (xl: 1280px+): 4 columns
```

**2. Responsive Layout Components:**
```typescript
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">SnapFix</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

**3. Responsive Typography:**
```typescript
const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Responsive heading sizes */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
        Dashboard
      </h1>
      
      {/* Responsive text sizes */}
      <p className="text-sm md:text-base lg:text-lg text-gray-600">
        Welcome to your SnapFix dashboard
      </p>

      {/* Responsive card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2">Total Tickets</h3>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">24</p>
        </div>
      </div>
    </div>
  );
};
```

**4. Responsive Navigation:**
```typescript
const Header: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img className="h-8 w-auto" src="/logo.png" alt="SnapFix" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SnapFix</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/tickets" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Tickets
            </Link>
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/tickets" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900">
                Tickets
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
```

### Did you use any UI library (Material UI, Bootstrap, etc.)?

**SnapFix uses Headless UI** as the primary UI library, with additional icon support from Heroicons:

**UI Library Stack:**
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Tailwind CSS** - Utility-first styling framework

**Why Headless UI over Material UI/Bootstrap:**

1. **Design Freedom**: Unstyled components allow complete design control
2. **Accessibility**: Built-in accessibility features
3. **Bundle Size**: Smaller than full UI libraries
4. **Tailwind Integration**: Perfect compatibility with Tailwind CSS
5. **Customization**: Easy to style with utility classes

**Headless UI Components in SnapFix:**

**1. Modal Components:**
```typescript
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const TicketDetailsModal: React.FC<{ 
  ticket: Ticket | null; 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ ticket, isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Ticket Details
                </Dialog.Title>
                
                {ticket && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Ticket ID: {ticket.ticketId}
                    </p>
                    <p className="mt-2 text-gray-900">
                      {ticket.description}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
```

**2. Dropdown Menus:**
```typescript
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {user?.name}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Settings
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full text-left px-4 py-2 text-sm`}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
```

**3. Tabs Component:**
```typescript
import { Tab } from '@headlessui/react';

const TicketTabs: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED');

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
            selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }`
        }>
          Pending ({pendingTickets.length})
        </Tab>
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
            selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }`
        }>
          In Progress ({inProgressTickets.length})
        </Tab>
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
            selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }`
        }>
          Resolved ({resolvedTickets.length})
        </Tab>
      </Tab.List>
      
      <Tab.Panels className="mt-2">
        <Tab.Panel className="rounded-xl bg-white p-3">
          <TicketList tickets={pendingTickets} />
        </Tab.Panel>
        <Tab.Panel className="rounded-xl bg-white p-3">
          <TicketList tickets={inProgressTickets} />
        </Tab.Panel>
        <Tab.Panel className="rounded-xl bg-white p-3">
          <TicketList tickets={resolvedTickets} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};
```

### How did you handle forms and validation?

**SnapFix implements comprehensive form handling with client-side validation:**

**1. Form State Management:**
```typescript
const CreateTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    } else if (!/^[A-Z0-9-]+$/i.test(formData.roomNumber)) {
      newErrors.roomNumber = 'Room number must contain only letters, numbers, and hyphens';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTicketRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketService.createTicket(formData);
      // Reset form
      setFormData({
        roomNumber: '',
        category: TicketCategory.PLUMBING,
        description: '',
        priority: TicketPriority.MEDIUM
      });
      // Show success message
    } catch (error) {
      setErrors({ submit: 'Failed to create ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields with validation */}
      <div>
        <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
          Room Number *
        </label>
        <input
          type="text"
          id="roomNumber"
          value={formData.roomNumber}
          onChange={(e) => handleInputChange('roomNumber', e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.roomNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., A-101, B-205"
        />
        {errors.roomNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the issue in detail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
};
```

**2. Custom Form Hook:**
```typescript
const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      const error = rule(values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Usage example
const LoginForm: React.FC = () => {
  const { login } = useAuth();
  
  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset
  } = useForm(
    { email: '', password: '' },
    {
      email: (value) => !value ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Invalid email' : null,
      password: (value) => !value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : null
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await login(values.email, values.password);
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          onBlur={() => setFieldTouched('email')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && touched.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={values.password}
          onChange={(e) => setValue('password', e.target.value)}
          onBlur={() => setFieldTouched('password')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && touched.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </button>
    </form>
  );
};
```

### How did you ensure consistent color theme and design?

**SnapFix maintains design consistency through a comprehensive design system:**

**1. Color Palette Definition:**
```typescript
// Design system colors
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary color
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  }
};
```

**2. Status Color System:**
```typescript
// Consistent status colors across the application
const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.PENDING:
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: '⏳'
      };
    case TicketStatus.IN_PROGRESS:
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: '🔄'
      };
    case TicketStatus.AT_SITE:
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        icon: '📍'
      };
    case TicketStatus.RESOLVED:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: '✅'
      };
    case TicketStatus.CLOSED:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: '🔒'
      };
    case TicketStatus.REJECTED:
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: '❌'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: '❓'
      };
  }
};

// Usage in components
const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const colorConfig = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorConfig.bg} ${colorConfig.text}`}>
      <span className="mr-1">{colorConfig.icon}</span>
      {status.replace('_', ' ')}
    </span>
  );
};
```

**3. Typography System:**
```typescript
// Consistent typography scale
const typography = {
  heading: {
    h1: 'text-4xl font-bold text-gray-900',
    h2: 'text-3xl font-bold text-gray-900',
    h3: 'text-2xl font-semibold text-gray-900',
    h4: 'text-xl font-semibold text-gray-900',
    h5: 'text-lg font-medium text-gray-900',
    h6: 'text-base font-medium text-gray-900',
  },
  body: {
    large: 'text-lg text-gray-700',
    base: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    xs: 'text-xs text-gray-500',
  },
  label: {
    base: 'text-sm font-medium text-gray-700',
    small: 'text-xs font-medium text-gray-600',
  }
};

// Usage example
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className={typography.heading.h5}>{title}</h3>
      <div className={typography.body.base}>{children}</div>
    </div>
  );
};
```

**4. Spacing and Layout System:**
```typescript
// Consistent spacing scale
const spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
};

// Consistent padding/margin
const padding = {
  card: 'p-4 md:p-6',
  section: 'px-4 py-6 md:px-6 md:py-8',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

// Usage in layout components
const Dashboard: React.FC = () => {
  return (
    <div className={padding.container}>
      <div className={`${spacing.lg} ${padding.section}`}>
        <h1 className={typography.heading.h1}>Dashboard</h1>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${spacing.md}`}>
          {/* Dashboard cards */}
        </div>
      </div>
    </div>
  );
};
```

**5. Component Design Patterns:**
```typescript
// Reusable button component with consistent styling
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Usage examples
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Create Ticket
</Button>

<Button variant="outline" size="sm" onClick={handleCancel}>
  Cancel
</Button>

<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

**6. Animation and Transitions:**
```typescript
// Consistent animation patterns using Framer Motion
import { motion } from 'framer-motion';

const AnimatedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      {children}
    </motion.div>
  );
};

// Page transition animations
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

---

## 4. API Integration

### How did you call backend APIs from React? (Axios, fetch?)

**SnapFix uses the native `fetch` API** for all backend communication, wrapped in a custom `ApiClient` class for centralized management.

**Why fetch over Axios:**

1. **Native Support**: No additional dependencies
2. **Bundle Size**: Smaller bundle without external libraries
3. **Modern API**: Built-in Promise support and async/await
4. **TypeScript Integration**: Excellent TypeScript support
5. **Customization**: Full control over request/response handling

**API Client Implementation (`services/api.ts`):**
```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add JWT token to all requests
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'An error occurred', response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred', 500);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new ApiError(errorData.message || `Upload failed with status ${response.status}`, response.status);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Upload failed', 500);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### Example of how you performed a GET or POST request.

**GET Request Example:**
```typescript
// Fetching tickets
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // GET request using ApiClient
        const response = await apiClient.get<Ticket[]>('/tickets');
        setTickets(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to fetch tickets');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**POST Request Example:**
```typescript
// Creating a new ticket
const CreateTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // POST request using ApiClient
      const response = await apiClient.post<Ticket>('/tickets', formData);
      
      // Success - reset form and show success message
      setFormData({
        roomNumber: '',
        category: TicketCategory.PLUMBING,
        description: '',
        priority: TicketPriority.MEDIUM
      });
      
      // Navigate to ticket details or show success notification
      console.log('Ticket created:', response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create ticket');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
          Room Number
        </label>
        <input
          type="text"
          id="roomNumber"
          value={formData.roomNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};
```

**File Upload Example:**
```typescript
// Uploading ticket with image
const CreateTicketWithImage: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM,
    photo: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      if (formData.photo) {
        uploadData.append('photo', formData.photo);
      }
      uploadData.append('roomNumber', formData.roomNumber);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);
      uploadData.append('priority', formData.priority);

      // Upload request using ApiClient
      const response = await apiClient.upload<Ticket>('/tickets', uploadData);
      console.log('Ticket created with image:', response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File input */}
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
          Photo (Optional)
        </label>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Other form fields */}
      {/* ... */}
    </form>
  );
};
```

### How do you handle asynchronous calls (async/await or promises)?

**SnapFix uses async/await** for all asynchronous operations, providing cleaner and more readable code compared to promise chains.

**Async/Await Patterns in SnapFix:**

**1. Basic Async/Await:**
```typescript
const fetchUserData = async (userId: number): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// Usage in component
const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserData(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
};
```

**2. Parallel Async Operations:**
```typescript
const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null as AdminStats | null,
    recentTickets: [] as Ticket[],
    notifications: [] as Notification[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Execute multiple async operations in parallel
        const [statsResponse, ticketsResponse, notificationsResponse] = await Promise.all([
          apiClient.get<AdminStats>('/tickets/admin/stats'),
          apiClient.get<Ticket[]>('/tickets/recent'),
          apiClient.get<Notification[]>('/notifications')
        ]);

        setDashboardData({
          stats: statsResponse.data,
          recentTickets: ticketsResponse.data,
          notifications: notificationsResponse.data
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <StatsCard stats={dashboardData.stats} />
      <RecentTickets tickets={dashboardData.recentTickets} />
      <Notifications notifications={dashboardData.notifications} />
    </div>
  );
};
```

**3. Sequential Async Operations:**
```typescript
const TicketWorkflow: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [workflowData, setWorkflowData] = useState({
    ticket: null as Ticket | null,
    comments: [] as TicketComment[],
    assignedStaff: null as User | null
  });

  useEffect(() => {
    const loadTicketWorkflow = async () => {
      try {
        // Sequential operations where each depends on the previous
        const ticketResponse = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
        const ticket = ticketResponse.data;
        
        // Load comments after getting ticket
        const commentsResponse = await apiClient.get<TicketComment[]>(`/tickets/comments/${ticketId}`);
        
        // Load assigned staff if ticket is assigned
        let assignedStaff = null;
        if (ticket.assignedTo) {
          const staffResponse = await apiClient.get<User>(`/users/${ticket.assignedTo.id}`);
          assignedStaff = staffResponse.data;
        }

        setWorkflowData({
          ticket,
          comments: commentsResponse.data,
          assignedStaff
        });
      } catch (error) {
        console.error('Failed to load ticket workflow:', error);
      }
    };

    loadTicketWorkflow();
  }, [ticketId]);

  return (
    <div>
      <TicketDetails ticket={workflowData.ticket} />
      <CommentsList comments={workflowData.comments} />
      {workflowData.assignedStaff && (
        <AssignedStaff staff={workflowData.assignedStaff} />
      )}
    </div>
  );
};
```

**4. Error Handling with Async/Await:**
```typescript
const handleTicketUpdate = async (ticketId: string, updateData: Partial<Ticket>) => {
  try {
    const response = await apiClient.put<Ticket>(`/tickets/${ticketId}`, updateData);
    
    // Success handling
    console.log('Ticket updated successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    // Error handling
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return { success: false, error: 'Invalid data provided' };
        case 401:
          return { success: false, error: 'Authentication required' };
        case 403:
          return { success: false, error: 'Permission denied' };
        case 404:
          return { success: false, error: 'Ticket not found' };
        case 500:
          return { success: false, error: 'Server error occurred' };
        default:
          return { success: false, error: error.message };
      }
    }
    
    return { success: false, error: 'Network error occurred' };
  }
};

// Usage in component
const TicketUpdateForm: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = async (updateData: Partial<Ticket>) => {
    setIsUpdating(true);
    setUpdateResult(null);

    const result = await handleTicketUpdate(ticketId, updateData);
    setUpdateResult(result);
    setIsUpdating(false);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ status: 'IN_PROGRESS' });
    }}>
      {/* Form content */}
      {updateResult && (
        <div className={`p-4 rounded-md ${
          updateResult.success 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {updateResult.success ? 'Ticket updated successfully!' : updateResult.error}
        </div>
      )}
    </form>
  );
};
```

### How do you manage loading and error states while fetching data?

**SnapFix implements comprehensive loading and error state management:**

**1. Loading State Management:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiClient.get<Ticket[]>('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = () => {
    fetchTickets(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};
```

**2. Error State Management:**
```typescript
const TicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    status?: number;
    retryable: boolean;
  } | null>(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
      setTicket(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          message: err.message,
          status: err.status,
          retryable: err.status >= 500 || err.status === 0
        });
      } else {
        setError({
          message: 'An unexpected error occurred',
          retryable: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleRetry = () => {
    fetchTicket();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading ticket details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Ticket</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {error.retryable && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">{ticket.ticketId}</h2>
      <p className="text-gray-600">{ticket.description}</p>
    </div>
  );
};
```

**3. Optimistic Updates:**
```typescript
const TicketStatusUpdate: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const [optimisticStatus, setOptimisticStatus] = useState(ticket.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    // Optimistic update - update UI immediately
    setOptimisticStatus(newStatus);
    setIsUpdating(true);
    setError(null);

    try {
      // Make API call
      await apiClient.put(`/tickets/${ticket.id}/status?status=${newStatus}`);
      
      // Success - optimistic update was correct
      console.log('Status updated successfully');
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticStatus(ticket.status);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update status');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <select
        value={optimisticStatus}
        onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
        disabled={isUpdating}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
      >
        <option value={TicketStatus.PENDING}>Pending</option>
        <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
        <option value={TicketStatus.RESOLVED}>Resolved</option>
      </select>

      {isUpdating && (
        <span className="ml-2 text-sm text-gray-500">Updating...</span>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};
```

### How do you handle CORS issues?

**SnapFix handles CORS through proper backend configuration and frontend request handling:**

**1. Backend CORS Configuration:**
```java
// Backend CORS configuration (Spring Boot)
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://snapfix-frontend.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

// Controller-level CORS
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TicketController {
    // Controller methods
}
```

**2. Frontend CORS Handling:**
```typescript
// API Client with CORS handling
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for CORS
      mode: 'cors', // Enable CORS
      ...options,
    };

    // Add JWT token
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle CORS preflight
      if (response.status === 0) {
        throw new ApiError('CORS error: Unable to connect to server', 0);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'Request failed', response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error: Check CORS configuration', 0);
      }
      throw error;
    }
  }
}
```

**3. CORS Error Handling:**
```typescript
const handleApiCall = async () => {
  try {
    const response = await apiClient.get<Ticket[]>('/tickets');
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 0) {
        // CORS or network error
        console.error('CORS Error:', error.message);
        // Show user-friendly message
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      if (error.status === 401) {
        // Unauthorized - token might be invalid
        // Redirect to login
        window.location.href = '/login';
        return;
      }
    }
    
    throw error;
  }
};
```

**4. Development vs Production CORS:**
```typescript
// Environment-based CORS configuration
const getApiBaseUrl = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'development') {
    return 'http://localhost:8080/api';
  } else if (env === 'production') {
    return 'https://api.snapfix.com/api';
  }
  
  return process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
};

// CORS debugging in development
if (process.env.NODE_ENV === 'development') {
  // Add CORS debugging
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log('Making request to:', args[0]);
    try {
      const response = await originalFetch(...args);
      console.log('Response status:', response.status);
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  };
}
```

### How does your frontend know if the backend request failed?

**SnapFix implements comprehensive error detection and handling:**

**1. HTTP Status Code Handling:**
```typescript
class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Error detection in API client
private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, config);
    
    // Check if request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      
      throw new ApiError(
        errorData.message || 'Request failed',
        response.status,
        errorData.errors
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    // Handle network errors
    throw new ApiError('Network error occurred', 0);
  }
}
```

**2. Component-Level Error Handling:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<{
    type: 'network' | 'server' | 'auth' | 'validation';
    message: string;
    details?: any;
  } | null>(null);

  const fetchTickets = async () => {
    try {
      setError(null);
      const response = await apiClient.get<Ticket[]>('/tickets');
      setTickets(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        // Categorize errors based on status code
        switch (err.status) {
          case 0:
            setError({
              type: 'network',
              message: 'Unable to connect to server. Please check your internet connection.',
              details: err.message
            });
            break;
          case 401:
            setError({
              type: 'auth',
              message: 'Your session has expired. Please log in again.',
              details: err.message
            });
            // Redirect to login
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 403:
            setError({
              type: 'auth',
              message: 'You do not have permission to access this resource.',
              details: err.message
            });
            break;
          case 404:
            setError({
              type: 'server',
              message: 'The requested resource was not found.',
              details: err.message
            });
            break;
          case 422:
            setError({
              type: 'validation',
              message: 'Invalid data provided.',
              details: err.errors
            });
            break;
          case 500:
            setError({
              type: 'server',
              message: 'Server error occurred. Please try again later.',
              details: err.message
            });
            break;
          default:
            setError({
              type: 'server',
              message: err.message || 'An unexpected error occurred',
              details: err.message
            });
        }
      } else {
        setError({
          type: 'network',
          message: 'An unexpected error occurred',
          details: err
        });
      }
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          {error.type === 'network' && <WifiOffIcon className="mx-auto h-12 w-12" />}
          {error.type === 'auth' && <LockClosedIcon className="mx-auto h-12 w-12" />}
          {error.type === 'server' && <ExclamationTriangleIcon className="mx-auto h-12 w-12" />}
          {error.type === 'validation' && <ExclamationCircleIcon className="mx-auto h-12 w-12" />}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error.type === 'network' && 'Connection Error'}
          {error.type === 'auth' && 'Authentication Error'}
          {error.type === 'server' && 'Server Error'}
          {error.type === 'validation' && 'Validation Error'}
        </h3>
        
        <p className="text-gray-600 mb-4">{error.message}</p>
        
        {error.type === 'network' && (
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**3. Global Error Boundary:**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to monitoring service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in App.tsx
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          {/* App content */}
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**4. Network Status Monitoring:**
```typescript
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection message
        console.log('Connection restored');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Usage in components
const TicketList: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (isOnline && wasOffline) {
      // Refresh data when connection is restored
      fetchTickets();
    }
  }, [isOnline, wasOffline]);

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            You're currently offline. Some features may not be available.
          </p>
        </div>
      )}
      
      {/* Ticket list content */}
    </div>
  );
};
```

---

## 5. Hooks Deep Dive

### What does useState() do?

**`useState()`** is a React hook that allows functional components to have state. It returns an array with two elements: the current state value and a function to update it.

**Basic Usage:**
```typescript
const [state, setState] = useState(initialValue);
```

**SnapFix Examples:**

**1. Simple State:**
```typescript
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="ticket-card">
      <h3>{ticket.ticketId}</h3>
      
      {isExpanded && (
        <div className="ticket-details">
          <p>{ticket.description}</p>
          <p>Status: {ticket.status}</p>
        </div>
      )}
      
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
};
```

**2. Complex State Object:**
```typescript
const CreateTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    roomNumber: '',
    category: TicketCategory.PLUMBING,
    description: '',
    priority: TicketPriority.MEDIUM
  });

  // Update specific field
  const handleInputChange = (field: keyof CreateTicketRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form>
      <input
        value={formData.roomNumber}
        onChange={(e) => handleInputChange('roomNumber', e.target.value)}
        placeholder="Room Number"
      />
      <textarea
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Description"
      />
    </form>
  );
};
```

**3. Multiple State Variables:**
```typescript
const TicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
        setTicket(response.data);
      } catch (err) {
        setError('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div>
      <h2>{ticket.ticketId}</h2>
      <p>{ticket.description}</p>
    </div>
  );
};
```

### What is the difference between state and props?

| Aspect | Props | State |
|--------|-------|-------|
| **Source** | Passed from parent component | Internal to component |
| **Mutability** | Read-only | Mutable |
| **Scope** | Component parameter | Component internal |
| **Updates** | Parent controls updates | Component controls updates |
| **Purpose** | Pass data down | Manage component data |

**SnapFix Example:**
```typescript
// Parent passes props to child
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]); // STATE
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket}  // PROPS - passed from parent
          onStatusUpdate={(id, status) => {
            // PROPS - function passed to child
            updateTicketStatus(id, status);
          }}
        />
      ))}
    </div>
  );
};

// Child receives props and manages its own state
const TicketCard: React.FC<{ 
  ticket: Ticket;  // PROPS - cannot be modified
  onStatusUpdate: (id: number, status: string) => void; 
}> = ({ ticket, onStatusUpdate }) => {
  const [isEditing, setIsEditing] = useState(false); // STATE - can be modified
  
  const handleStatusChange = (newStatus: string) => {
    // Update local state
    setIsEditing(false);
    // Call parent callback (prop)
    onStatusUpdate(ticket.id, newStatus);
  };
  
  return (
    <div>
      <span>{ticket.ticketId}</span>
      {isEditing ? (
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
  );
};
```

### What does useEffect() do? Give an example.

**`useEffect()`** is a hook that performs side effects in functional components. It runs after every render and can clean up after itself.

**Syntax:**
```typescript
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup code (optional)
  };
}, [dependencies]);
```

**SnapFix Examples:**

**1. Data Fetching on Mount:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  useEffect(() => {
    const fetchTickets = async () => {
      const response = await apiClient.get<Ticket[]>('/tickets');
      setTickets(response.data);
    };
    
    fetchTickets();
  }, []); // Empty array = runs once on mount

  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**2. Effect with Dependencies:**
```typescript
const TicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  
  useEffect(() => {
    const fetchTicket = async () => {
      const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
      setTicket(response.data);
    };
    
    fetchTicket();
  }, [ticketId]); // Runs whenever ticketId changes

  return (
    <div>
      <h2>{ticket?.ticketId}</h2>
      <p>{ticket?.description}</p>
    </div>
  );
};
```

**3. Cleanup Function:**
```typescript
const LiveTicketUpdates: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  
  useEffect(() => {
    // Set up polling interval
    const interval = setInterval(async () => {
      const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
      setTicket(response.data);
    }, 30000); // Poll every 30 seconds
    
    // Cleanup: clear interval on unmount or when ticketId changes
    return () => {
      clearInterval(interval);
    };
  }, [ticketId]);

  return (
    <div>
      <h2>{ticket?.ticketId}</h2>
      <p>Status: {ticket?.status}</p>
    </div>
  );
};
```

**4. Multiple Effects:**
```typescript
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      const response = await apiClient.get<AdminStats>('/tickets/admin/stats');
      setStats(response.data);
    };
    fetchStats();
  }, []);
  
  // Poll for notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await apiClient.get<Notification[]>('/notifications');
      setNotifications(response.data);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Log analytics event when user changes
  useEffect(() => {
    if (user) {
      console.log('User accessed admin dashboard:', user.email);
    }
  }, [user]);

  return (
    <div>
      <StatsOverview stats={stats} />
      <NotificationsList notifications={notifications} />
    </div>
  );
};
```

### What are the dependencies in useEffect()?

**Dependencies** are the values that `useEffect` watches. The effect re-runs when any dependency changes.

**Dependency Scenarios:**

**1. No Dependencies (Run Once):**
```typescript
useEffect(() => {
  console.log('Component mounted');
}, []); // Empty array = runs once on mount
```

**2. Single Dependency:**
```typescript
const TicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  useEffect(() => {
    fetchTicket(ticketId);
  }, [ticketId]); // Re-runs when ticketId changes
};
```

**3. Multiple Dependencies:**
```typescript
const TicketList: React.FC = ({ status, category }) => {
  useEffect(() => {
    fetchTickets({ status, category });
  }, [status, category]); // Re-runs when status OR category changes
};
```

**4. Missing Dependencies (Warning):**
```typescript
const TicketSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);
  
  useEffect(() => {
    // Warning: query is used but not in dependencies
    searchTickets(query).then(setResults);
    // ESLint warning: React Hook useEffect has a missing dependency: 'query'
  }, []); // Missing 'query' in dependency array
  
  // Correct version:
  useEffect(() => {
    searchTickets(query).then(setResults);
  }, [query]); // Include all dependencies
};
```

**5. Object/Array Dependencies:**
```typescript
const TicketFilters: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'PENDING',
    priority: 'MEDIUM'
  });
  
  useEffect(() => {
    // Object reference changes every render
    // Use useMemo or spread to create stable reference
    applyFilters(filters);
  }, [filters]); // Only re-runs when filters object reference changes
  
  // Better approach with destructured dependencies
  useEffect(() => {
    applyFilters(filters);
  }, [filters.status, filters.priority]); // Re-runs when values change
};
```

### Can you explain how re-rendering happens in React?

**Re-rendering** is when React updates the DOM to reflect new changes. Components re-render when:
1. State changes (via `useState` or `useReducer`)
2. Props change
3. Parent component re-renders
4. Context value changes

**Re-rendering Process:**
```
State/Props Change → Component Re-renders → New Virtual DOM Created
→ Compare with Previous Virtual DOM → Calculate Diff → Update Real DOM
```

**SnapFix Re-rendering Example:**
```typescript
const TicketCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('PENDING');
  
  console.log('TicketCounter rendered'); // Logs on every render
  
  // Re-renders when count or status changes
  const handleIncrement = () => {
    setCount(count + 1); // Causes re-render
  };
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus); // Causes re-render
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Status: {status}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={() => handleStatusChange('RESOLVED')}>
        Change Status
      </button>
    </div>
  );
};
```

**Preventing Unnecessary Re-renders:**
```typescript
// 1. React.memo for component memoization
const TicketCard = React.memo<TicketCardProps>(({ ticket, onUpdate }) => {
  return (
    <div>
      <h3>{ticket.ticketId}</h3>
      <button onClick={() => onUpdate(ticket.id)}>Update</button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.ticket.id === nextProps.ticket.id &&
         prevProps.ticket.status === nextProps.ticket.status;
});

// 2. useMemo for expensive calculations
const TicketStatistics: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const stats = useMemo(() => {
    // Expensive calculation - only re-runs when tickets changes
    return {
      pending: tickets.filter(t => t.status === 'PENDING').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      total: tickets.length
    };
  }, [tickets]);
  
  return (
    <div>
      <p>Pending: {stats.pending}</p>
      <p>Resolved: {stats.resolved}</p>
      <p>Total: {stats.total}</p>
    </div>
  );
};

// 3. useCallback for stable function references
const TicketList: React.FC = ({ tickets }) => {
  const handleStatusUpdate = useCallback((ticketId: number, status: string) => {
    updateTicketStatus(ticketId, status);
  }, []); // Stable function reference
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket}
          onUpdate={handleStatusUpdate}
        />
      ))}
    </div>
  );
};
```

### What is custom hook? Did you make any?

**Custom hooks** are reusable functions that use React hooks to encapsulate logic. They start with "use".

**Custom Hooks in SnapFix:**

**1. useAuth Hook:**
```typescript
// Created in contexts/AuthContext.tsx
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usage in components
const Header: React.FC = () => {
  const { user, logout, userPoints } = useAuth();
  
  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <span>Points: {userPoints}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
};
```

**2. useFetch Hook:**
```typescript
const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<T>(url);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
};

// Usage
const TicketList: React.FC = () => {
  const { data: tickets, loading, error } = useFetch<Ticket[]>('/tickets');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {tickets?.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**3. useDebounce Hook:**
```typescript
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage in search component
const TicketSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Ticket[]>([]);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchResults = async () => {
        const response = await apiClient.get<Ticket[]>(
          `/tickets/search?q=${debouncedSearchTerm}`
        );
        setResults(response.data);
      };
      fetchResults();
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tickets..."
      />
      <div>
        {results.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};
```

**4. useLocalStorage Hook:**
```typescript
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue] as const;
};

// Usage
const UserSettings: React.FC = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};
```

**5. useToggle Hook:**
```typescript
const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return [value, { toggle, setTrue, setFalse }] as const;
};

// Usage
const TicketDetailsModal: React.FC = ({ ticketId }) => {
  const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false);
  
  return (
    <>
      <button onClick={setTrue}>View Details</button>
      {isOpen && (
        <Modal onClose={setFalse}>
          <TicketDetails ticketId={ticketId} />
        </Modal>
      )}
    </>
  );
};
```

---

## 6. Performance & Optimization

### How do you improve performance in React?

**Performance Optimization Strategies in SnapFix:**

**1. Code Splitting with React.lazy:**
```typescript
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const StaffDashboard = lazy(() => import('./components/staff/StaffDashboard'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

**2. Component Memoization with React.memo:**
```typescript
const TicketCard = React.memo<TicketCardProps>(({ ticket, onUpdate }) => {
  return (
    <div className="ticket-card">
      <h3>{ticket.ticketId}</h3>
      <p>{ticket.description}</p>
      <button onClick={() => onUpdate(ticket.id)}>Update</button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if ticket data actually changed
  return prevProps.ticket.id === nextProps.ticket.id &&
         prevProps.ticket.status === nextProps.ticket.status &&
         prevProps.ticket.description === nextProps.ticket.description;
});
```

**3. Expensive Calculation Memoization:**
```typescript
const AnalyticsDashboard: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  // Memoize expensive calculations
  const statistics = useMemo(() => {
    return {
      byStatus: tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: tickets.reduce((acc, ticket) => {
        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageResolutionTime: calculateAverageResolutionTime(tickets)
    };
  }, [tickets]);
  
  return (
    <div>
      <Chart data={statistics.byStatus} />
      <Chart data={statistics.byCategory} />
    </div>
  );
};
```

**4. Callback Memoization with useCallback:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // Memoize callback to prevent child re-renders
  const handleStatusUpdate = useCallback(async (ticketId: number, status: string) => {
    await apiClient.put(`/tickets/${ticketId}/status?status=${status}`);
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: status as TicketStatus } : ticket
    ));
  }, []);
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusUpdate={handleStatusUpdate}
        />
      ))}
    </div>
  );
};
```

### What is React.memo() and why is it used?

**React.memo()** is a higher-order component that memoizes a functional component, preventing re-renders unless props change.

**Why use React.memo:**
- Prevents unnecessary re-renders
- Improves performance for components with expensive renders
- Optimizes lists of components

**SnapFix Examples:**

**1. Simple Memoization:**
```typescript
const StatusBadge = React.memo<{ status: TicketStatus }>(({ status }) => {
  const colorConfig = getStatusColor(status);
  
  return (
    <span className={`px-2 py-1 rounded ${colorConfig.bg} ${colorConfig.text}`}>
      {status}
    </span>
  );
});

// Usage - only re-renders when status prop changes
<TicketCard 
  ticket={ticket} 
  statusBadge={<StatusBadge status={ticket.status} />}
/>
```

**2. Custom Comparison Function:**
```typescript
const TicketCard = React.memo<TicketCardProps>(
  ({ ticket, onUpdate }) => {
    return (
      <div className="ticket-card">
        <h3>{ticket.ticketId}</h3>
        <p>{ticket.description}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    return prevProps.ticket.id === nextProps.ticket.id &&
           prevProps.ticket.status === nextProps.ticket.status;
  }
);
```

### How do you prevent unnecessary re-renders?

**Preventing Unnecessary Re-renders:**

**1. useCallback for Event Handlers:**
```typescript
const TicketList: React.FC = () => {
  const handleClick = useCallback((ticketId: number) => {
    console.log('Clicked:', ticketId);
  }, []); // Stable function reference
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};
```

**2. useMemo for Derived Data:**
```typescript
const FilteredTicketList: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const [filter, setFilter] = useState('PENDING');
  
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.status === filter);
  }, [tickets, filter]);
  
  return (
    <div>
      {filteredTickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**3. Proper Key Usage in Lists:**
```typescript
// GOOD - Stable, unique keys
{tickets.map(ticket => (
  <TicketCard key={ticket.id} ticket={ticket} />
))}

// BAD - Index as key
{tickets.map((ticket, index) => (
  <TicketCard key={index} ticket={ticket} />
))}
```

### What is lazy loading and code splitting?

**Lazy loading** loads components only when needed, reducing initial bundle size.

**Code Splitting in SnapFix:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));
const Rewards = lazy(() => import('./components/rewards/Rewards'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### What are keys in lists and why are they important?

**Keys** help React identify which items have changed, been added, or removed.

**Why Keys are Important:**
```typescript
// Without proper keys - React can't efficiently update the list
{tickets.map(ticket => (
  <TicketCard ticket={ticket} /> // Missing key - React warns
))}

// With proper keys - React can efficiently update the list
{tickets.map(ticket => (
  <TicketCard key={ticket.id} ticket={ticket} />
))}

// With complex keys - for nested or composite data
{tickets.map(ticket => (
  <TicketCard 
    key={`${ticket.id}-${ticket.status}`} 
    ticket={ticket} 
  />
))}
```

---

## 7. Debugging & Tools

### How do you debug issues in React?

**Debugging Strategies in SnapFix:**

**1. Console Logging:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  useEffect(() => {
    console.log('Fetching tickets...');
    const fetchTickets = async () => {
      try {
        const response = await apiClient.get<Ticket[]>('/tickets');
        console.log('Tickets fetched:', response.data);
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    
    fetchTickets();
  }, []);
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

**2. React Developer Tools:**
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Profile performance

**3. Breakpoints in Browser:**
```typescript
const handleSubmit = async (formData: CreateTicketRequest) => {
  debugger; // Pauses execution here
  console.log('Form data:', formData);
  
  try {
    const response = await apiClient.post('/tickets', formData);
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**4. Error Boundaries for Debugging:**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Log to error tracking service
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Which tools do you use for debugging?

**Development Tools Stack:**
- **React DevTools**: Component inspection
- **Chrome DevTools**: Network, console, performance profiling
- **TypeScript**: Compile-time error detection
- **ESLint**: Code quality and potential bugs
- **VS Code**: IDE with React extensions

---

## 8. Deployment & Environment

### How do you build your React app for production?

**Production Build Process:**
```bash
# Build command in package.json
npm run build

# Creates optimized production build in /build directory
# Includes:
# - Minified JavaScript
# - Optimized CSS
# - Code splitting
# - Tree shaking
```

**Build Output:**
```bash
build/
├── index.html
├── static/
│   ├── css/
│   │   └── main.[hash].css    # Minified CSS
│   └── js/
│       ├── main.[hash].js     # Main bundle
│       └── [number].[hash].js # Code-split chunks
├── assets/
└── images/
```

### What's the difference between development and production builds?

| Aspect | Development | Production |
|--------|-------------|------------|
| **Size** | Larger bundles | Optimized bundles |
| **Minification** | No | Yes |
| **Source Maps** | Full | None or hidden |
| **Error Messages** | Detailed | Minimal |
| **Performance** | Slower | Optimized |
| **Hot Reload** | Yes | No |
| **Debugging** | Easier | Harder |

### What are environment variables in React (.env files)?

**Environment Variables:**

**1. .env Files:**
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true

# .env.production
REACT_APP_API_URL=https://api.snapfix.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
```

**2. Usage in Code:**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

if (DEBUG_MODE) {
  console.log('Debug mode enabled');
  console.log('API URL:', API_BASE_URL);
}
```

### Did you deploy your frontend anywhere?

**Deployment Options for SnapFix:**
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Scalable hosting
- **Docker**: Containerized deployment

---

## 9. Project-Specific React Questions

### What components did you create in your project?

**Major Components in SnapFix:**
1. **Authentication**: Login, ProtectedRoute
2. **Layout**: Layout, Header, Sidebar
3. **Tickets**: TicketList, TicketCard, CreateTicket, TicketDetails
4. **Admin**: AdminDashboard, AdminTickets, StaffManagement, StudentManagement
5. **Staff**: StaffDashboard, AssignedTickets, StatusUpdateModal
6. **Rewards**: RewardDashboard, Rewards, VoucherRedemptionModal
7. **Analytics**: Analytics charts and statistics
8. **Common**: ImageViewerModal, PasswordInput

### How does your React app interact with the backend?

**Interaction Flow:**
1. User action triggers component function
2. Component calls service method
3. Service sends HTTP request via ApiClient
4. ApiClient handles authentication and headers
5. Backend processes request and returns response
6. Service processes response
7. Component updates state with data
8. UI re-renders with new data

**Example Flow:**
```typescript
// User clicks button
const handleCreateTicket = async () => {
  // Component -> Service
  const response = await ticketService.createTicket(formData);
  
  // Service -> API
  // ApiClient -> Backend
  
  // Backend -> Response
  // Response -> Service -> Component
  
  // Component updates state
  setTickets(prev => [...prev, response.data]);
};
```

### How do you display data from the backend on your frontend?

**Data Display Flow:**
```typescript
const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  useEffect(() => {
    const fetchTickets = async () => {
      const response = await apiClient.get<Ticket[]>('/tickets');
      setTickets(response.data); // Store in state
    };
    fetchTickets();
  }, []);
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket} 
        />
      ))}
    </div>
  );
};
```

### What challenges did you face in React and how did you solve them?

**Challenges and Solutions:**

**1. State Management for Complex Data:**
- **Challenge**: Managing nested state updates
- **Solution**: Used Context API for global state, local state for component-specific data

**2. Performance with Large Lists:**
- **Challenge**: Rendering 100+ tickets caused lag
- **Solution**: Implemented virtualization with `React.memo` and pagination

**3. Memory Leaks with Intervals:**
- **Challenge**: Polling intervals not cleaned up
- **Solution**: Proper cleanup in `useEffect` return function

**4. Type Safety:**
- **Challenge**: JavaScript type errors
- **Solution**: Implemented TypeScript for type safety

### How do you handle forms, inputs, and user feedback?

**Form Handling:**
- Controlled components for all inputs
- Real-time validation
- Loading states during submission
- Success/error messages
- Form reset on successful submission

### How did you ensure smooth navigation and UX?

**UX Improvements:**
- Loading skeletons instead of spinners
- Optimistic updates for instant feedback
- Error boundaries for graceful error handling
- Smooth transitions with Framer Motion
- Responsive design for all screen sizes
- Consistent design system throughout

---

**Frontend Documentation Complete!** 

This comprehensive documentation covers all aspects of the SnapFix frontend implementation, from React basics to advanced performance optimization, deployment strategies, and project-specific implementations.

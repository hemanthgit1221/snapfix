import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  UserIcon, 
  EnvelopeIcon, 
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/api';
import PasswordInput from '../common/PasswordInput';

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add student form state
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    password: '',
    points: 0
  });
  const [addingStudent, setAddingStudent] = useState(false);

  // Fetch real student data from API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getStudents();
        console.log('Raw API response:', response);
        
        // Handle different response structures
        let studentData = [];
        if (response && response.data) {
          studentData = response.data;
        } else if (Array.isArray(response)) {
          studentData = response;
        }
        
        console.log('Processed student data:', studentData);
        
        // Transform API data to match Student interface and filter only students
        const transformedStudents: Student[] = studentData
          .filter((user: any) => user.role === 'STUDENT')
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            isActive: true, // Assume all users are active
            createdAt: user.createdAt || new Date().toISOString()
          }));
        
        setStudents(transformedStudents);
        console.log('✅ Student Management: Student data fetched:', transformedStudents);
      } catch (error) {
        console.error('❌ Failed to fetch student data:', error);
        // Fallback to empty array on error
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle adding new student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      alert('Please fill in all fields');
      return;
    }

    setAddingStudent(true);
    try {
      // Call API to create student
      const response = await dashboardApi.createStudent(newStudent);
      console.log('✅ Student created:', response);
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewStudent({ name: '', email: '', role: 'STUDENT', password: '', points: 0 });
      
      // Refresh student list
      window.location.reload(); // Simple refresh for now
      
      alert('Student created successfully!');
    } catch (error) {
      console.error('❌ Failed to create student:', error);
      alert('Failed to create student. Please try again.');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (updatedStudent: any) => {
    if (!editingStudent) return;

    try {
      const response = await dashboardApi.updateStudent(editingStudent.id, updatedStudent);
      console.log('Update response:', response);
      
      // Check if response has success property or if it's the user data directly
      if (response.success || (response as any).id) {
        window.location.reload(); // Refresh the list
        setShowEditModal(false);
        setEditingStudent(null);
        alert('Student updated successfully!');
      } else {
        alert('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      console.log('Attempting to delete student with ID:', studentId);
      const response = await dashboardApi.deleteStudent(studentId);
      console.log('Delete response:', response);
      
      // Check if response has success property or if it's the message directly
      if (response.success || response.data?.message || response.message) {
        window.location.reload(); // Refresh the list
        alert('Student deleted successfully!');
      } else {
        console.error('Unexpected delete response:', response);
        alert('Failed to delete student - unexpected response format');
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete student';
      alert(`Failed to delete student: ${errorMessage}`);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'ADMIN':
        return <UserIcon className="h-4 w-4" />;
      case 'STAFF':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Student Management</h1>
          <p className="text-gray-600 mt-2">Manage students and their points</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Student Management</h1>
            <p className="text-gray-600 mt-2">Manage students and their reward points</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
        </div>
      </motion.div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'No students have been added yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Your First Student
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.email}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(student.role)}`}>
                        {getRoleIcon(student.role)}
                        <span className="ml-1">{student.role.replace('_', ' ')}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <GiftIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600">{student.points} points</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditStudent(student)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Edit student"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete student"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Student</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newStudent.role}
                  onChange={(e) => setNewStudent({...newStudent, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Points</label>
                <input
                  type="number"
                  value={newStudent.points}
                  onChange={(e) => setNewStudent({...newStudent, points: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter initial points"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <PasswordInput
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  placeholder="Enter temporary password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingStudent ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <EditStudentForm
                student={editingStudent}
                onSave={handleUpdateStudent}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Edit Student Form Component
interface EditStudentFormProps {
  student: Student;
  onSave: (studentData: any) => void;
  onCancel: () => void;
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    role: student.role,
    points: student.points,
    password: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter full name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
        <select 
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        >
          <option value="STUDENT">Student</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Points *</label>
        <input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter points"
          min="0"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <PasswordInput
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Leave blank to keep current password"
        />
        <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password</p>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default StudentManagement;

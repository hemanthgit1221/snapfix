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
  GiftIcon,
  FlagIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/api';
import { userManagementService } from '../../services/userManagementService';
import PasswordInput from '../common/PasswordInput';

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  isFlagged?: boolean;
  isBlacklisted?: boolean;
  flaggedAt?: string;
  blacklistedAt?: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFlagging, setIsFlagging] = useState<number | null>(null);
  const [isBlacklisting, setIsBlacklisting] = useState<number | null>(null);
  const [showFlagConfirm, setShowFlagConfirm] = useState<number | null>(null);
  const [showBlacklistConfirm, setShowBlacklistConfirm] = useState<number | null>(null);
  
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
          .map((user: any) => {
            const isBlacklisted = Boolean(user.isBlacklisted);
            const isFlagged = Boolean(user.isFlagged);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              points: user.points || 0,
              isActive: !isBlacklisted, // Active only if not blacklisted
              createdAt: user.createdAt || new Date().toISOString(),
              isFlagged: isFlagged,
              isBlacklisted: isBlacklisted,
              flaggedAt: user.flaggedAt,
              blacklistedAt: user.blacklistedAt
            };
          });
        
        setStudents(transformedStudents);
        console.log('✅ Student Management: Student data fetched:', transformedStudents);
        console.log('🔍 Debug - Checking blacklisted students:', transformedStudents.map(s => ({ 
          name: s.name, 
          isBlacklisted: s.isBlacklisted, 
          isFlagged: s.isFlagged,
          isActive: s.isActive 
        })));
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

  const handleFlagUser = async (studentId: number) => {
    setShowFlagConfirm(null);
    setIsFlagging(studentId);
    try {
      await userManagementService.flagUser(studentId);
      // Refresh student list by re-fetching
      const response = await dashboardApi.getStudents();
      let studentData = [];
      if (response && response.data) {
        studentData = response.data;
      } else if (Array.isArray(response)) {
        studentData = response;
      }
      const transformedStudents: Student[] = studentData
        .filter((user: any) => user.role === 'STUDENT')
        .map((user: any) => {
          const isBlacklisted = Boolean(user.isBlacklisted);
          const isFlagged = Boolean(user.isFlagged);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            isActive: !isBlacklisted,
            createdAt: user.createdAt || new Date().toISOString(),
            isFlagged: isFlagged,
            isBlacklisted: isBlacklisted,
            flaggedAt: user.flaggedAt,
            blacklistedAt: user.blacklistedAt
          };
        });
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Failed to flag user:', error);
      alert('Failed to flag user. Please try again.');
    } finally {
      setIsFlagging(null);
    }
  };

  const handleUnflagUser = async (studentId: number) => {
    setIsFlagging(studentId);
    try {
      await userManagementService.unflagUser(studentId);
      // Refresh student list by re-fetching
      const response = await dashboardApi.getStudents();
      let studentData = [];
      if (response && response.data) {
        studentData = response.data;
      } else if (Array.isArray(response)) {
        studentData = response;
      }
      const transformedStudents: Student[] = studentData
        .filter((user: any) => user.role === 'STUDENT')
        .map((user: any) => {
          const isBlacklisted = Boolean(user.isBlacklisted);
          const isFlagged = Boolean(user.isFlagged);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            isActive: !isBlacklisted,
            createdAt: user.createdAt || new Date().toISOString(),
            isFlagged: isFlagged,
            isBlacklisted: isBlacklisted,
            flaggedAt: user.flaggedAt,
            blacklistedAt: user.blacklistedAt
          };
        });
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Failed to unflag user:', error);
      alert('Failed to unflag user. Please try again.');
    } finally {
      setIsFlagging(null);
    }
  };

  const handleBlacklistUser = async (studentId: number) => {
    setShowBlacklistConfirm(null);
    setIsBlacklisting(studentId);
    try {
      await userManagementService.blacklistUser(studentId);
      // Refresh student list by re-fetching
      const response = await dashboardApi.getStudents();
      let studentData = [];
      if (response && response.data) {
        studentData = response.data;
      } else if (Array.isArray(response)) {
        studentData = response;
      }
      const transformedStudents: Student[] = studentData
        .filter((user: any) => user.role === 'STUDENT')
        .map((user: any) => {
          const isBlacklisted = Boolean(user.isBlacklisted);
          const isFlagged = Boolean(user.isFlagged);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            isActive: !isBlacklisted,
            createdAt: user.createdAt || new Date().toISOString(),
            isFlagged: isFlagged,
            isBlacklisted: isBlacklisted,
            flaggedAt: user.flaggedAt,
            blacklistedAt: user.blacklistedAt
          };
        });
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Failed to blacklist user:', error);
      alert('Failed to blacklist user. Please try again.');
    } finally {
      setIsBlacklisting(null);
    }
  };

  const handleUnblacklistUser = async (studentId: number) => {
    setIsBlacklisting(studentId);
    try {
      await userManagementService.unblacklistUser(studentId);
      // Refresh student list by re-fetching
      const response = await dashboardApi.getStudents();
      let studentData = [];
      if (response && response.data) {
        studentData = response.data;
      } else if (Array.isArray(response)) {
        studentData = response;
      }
      const transformedStudents: Student[] = studentData
        .filter((user: any) => user.role === 'STUDENT')
        .map((user: any) => {
          const isBlacklisted = Boolean(user.isBlacklisted);
          const isFlagged = Boolean(user.isFlagged);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            isActive: !isBlacklisted,
            createdAt: user.createdAt || new Date().toISOString(),
            isFlagged: isFlagged,
            isBlacklisted: isBlacklisted,
            flaggedAt: user.flaggedAt,
            blacklistedAt: user.blacklistedAt
          };
        });
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Failed to unblacklist user:', error);
      alert('Failed to unblacklist user. Please try again.');
    } finally {
      setIsBlacklisting(null);
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
        return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30';
      case 'ADMIN':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30';
      case 'STAFF':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-poppins">Student Management</h1>
            <p className="text-blue-100 mt-2">Manage students and their reward points</p>
          </div>
        </motion.div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"></div>
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
        className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Student Management</h1>
            <p className="text-blue-100 mt-2">Manage students and their reward points</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg font-semibold flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
        </div>
      </motion.div>

      {/* Students List */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'No students have been added yet'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  Add Your First Student
                </motion.button>
              )}
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 bg-white/60 backdrop-blur-sm"
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
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-md">
                        <GiftIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{student.points} points</span>
                      </div>
                      {/* Show Active/Inactive only if not blacklisted and not flagged */}
                      {student.isBlacklisted !== true && student.isFlagged !== true && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          student.isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                      {/* Show Flagged badge only if not blacklisted */}
                      {student.isFlagged === true && student.isBlacklisted !== true && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                          <FlagIcon className="h-3 w-3 mr-1" />
                          Flagged
                        </span>
                      )}
                      {/* Show Blacklisted badge - this replaces Active/Flagged */}
                      {student.isBlacklisted === true && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                          <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                          Blacklisted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!student.isFlagged ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFlagConfirm(student.id)}
                      disabled={isFlagging === student.id}
                      className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 hover:from-amber-200 hover:to-orange-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                      title="Flag user"
                    >
                      <FlagIcon className="h-5 w-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUnflagUser(student.id)}
                      disabled={isFlagging === student.id}
                      className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 hover:from-blue-200 hover:to-indigo-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                      title="Unflag user"
                    >
                      <FlagIcon className="h-5 w-5" />
                    </motion.button>
                  )}
                  {!student.isBlacklisted ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowBlacklistConfirm(student.id)}
                      disabled={isBlacklisting === student.id}
                      className="p-2.5 bg-gradient-to-br from-red-100 to-pink-100 text-red-600 hover:from-red-200 hover:to-pink-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                      title="Blacklist user"
                    >
                      <ShieldExclamationIcon className="h-5 w-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUnblacklistUser(student.id)}
                      disabled={isBlacklisting === student.id}
                      className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                      title="Remove from blacklist"
                    >
                      <ShieldExclamationIcon className="h-5 w-5" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEditStudent(student)}
                    className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 hover:from-indigo-200 hover:to-purple-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Edit student"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2.5 bg-gradient-to-br from-red-100 to-pink-100 text-red-600 hover:from-red-200 hover:to-pink-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Delete student"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Student</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newStudent.role}
                  onChange={(e) => setNewStudent({...newStudent, role: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
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

      {/* Flag Confirmation Modal */}
      {showFlagConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/20"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Flag User</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to flag this user? Flagged users will be automatically blacklisted if they create another false ticket.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFlagConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFlagUser(showFlagConfirm)}
                disabled={isFlagging === showFlagConfirm}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isFlagging === showFlagConfirm ? 'Flagging...' : 'Flag User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blacklist Confirmation Modal */}
      {showBlacklistConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/20"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Blacklist User</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to blacklist this user? Blacklisted users will not be able to create new tickets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlacklistConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBlacklistUser(showBlacklistConfirm)}
                disabled={isBlacklisting === showBlacklistConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isBlacklisting === showBlacklistConfirm ? 'Blacklisting...' : 'Blacklist User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
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

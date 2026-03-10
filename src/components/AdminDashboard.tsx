import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Activity, Settings, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { playClick } from '../utils/audio';

export default function AdminDashboard() {
  const { getAllUsers, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً، غير مصرح لك بالدخول</h2>
        <p className="text-gray-500">هذه الصفحة مخصصة لمدير الموقع فقط.</p>
      </div>
    );
  }

  const handleDeleteUser = (username: string) => {
    playClick();
    if (username === 'admin') {
      alert('لا يمكن حذف حساب المدير الأساسي!');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${username}؟`)) {
      const updatedUsers = users.filter(u => u.username !== username);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h2>
        <p className="text-gray-600">مرحباً بك أيها المدير. يمكنك هنا إدارة المستخدمين ومراقبة نشاط الموقع.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">العمليات الناجحة (تقريبي)</p>
            <p className="text-2xl font-bold text-gray-900">1,284</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <Settings size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">حالة النظام</p>
            <p className="text-2xl font-bold text-gray-900">مستقر</p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">إدارة المستخدمين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المستخدم</th>
                <th className="px-6 py-4 font-medium">كلمة المرور</th>
                <th className="px-6 py-4 font-medium">الصلاحية</th>
                <th className="px-6 py-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{u.username}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{u.password}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u.username)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

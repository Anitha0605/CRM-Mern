import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api.js';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const data = await apiCall('/api/customers');
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchCustomers();
  } else {
    console.log('No token, redirecting to login');
    navigate('/');
  }
}, [navigate]);

  // ADD / UPDATE Customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        // UPDATE
        await apiCall(`/api/customers/${editingCustomer._id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // ADD NEW
        await apiCall('/api/customers', {
          method: 'POST',
          body: formData
        });
      }
      
      // Reset form & refresh list
      setFormData({ name: '', email: '', phone: '', company: '', address: '' });
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Customer operation error:', error);
    }
  };

  // EDIT Customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      address: customer.address || ''
    });
  };

  // DELETE Customer
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await apiCall(`/api/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', address: '' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CRM Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}!</p>
          </div>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ADD/EDIT FORM */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Customer Name *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                {editingCustomer && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CUSTOMERS TABLE */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Customers List ({customers.length})
            </h2>
            
            {customers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No customers yet. Add your first customer!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="p-4 text-left font-semibold text-gray-700">Name</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Email</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Phone</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Company</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="border-t hover:bg-gray-50 transition-all">
                        <td className="p-4 font-medium text-gray-900">{customer.name}</td>
                        <td className="p-4 text-gray-600">{customer.email || '-'}</td>
                        <td className="p-4 text-gray-600">{customer.phone || '-'}</td>
                        <td className="p-4 text-gray-600">{customer.company || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
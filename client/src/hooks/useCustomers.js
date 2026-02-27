import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/api';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const data = await createCustomer(customerData);
      setCustomers(prev => [data.customer, ...prev]);
      return data.customer;
    } catch (err) {
      throw new Error('Failed to create customer');
    }
  };

  const editCustomer = async (id, customerData) => {
    try {
      const data = await updateCustomer(id, customerData);
      setCustomers(prev => 
        prev.map(c => c._id === id ? data.customer : c)
      );
      return data.customer;
    } catch (err) {
      throw new Error('Failed to update customer');
    }
  };

  const removeCustomer = async (id) => {
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw new Error('Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    addCustomer,
    editCustomer,
    removeCustomer
  };
};

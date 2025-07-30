import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  CreditCard,
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm();

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Other'
  ];

  // Fetch expenses
  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await expenseService.getExpenses(params);
      setExpenses(response.expenses);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchExpenses(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchExpenses(1);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Process tags from comma-separated string to array
      const processedData = { ...data };
      if (data.tags) {
        processedData.tags = data.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, processedData);
        toast.success('Expense updated successfully!');
      } else {
        await expenseService.createExpense(processedData);
        toast.success('Expense added successfully!');
      }
      
      setShowModal(false);
      setEditingExpense(null);
      reset();
      fetchExpenses(pagination.currentPage);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle delete
  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        toast.success('Expense deleted successfully!');
        fetchExpenses(pagination.currentPage);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Open edit modal
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    reset({
      title: expense.title,
      amount: expense.amount,
      category: expense.category._id,
      description: expense.description || '',
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      paymentMethod: expense.paymentMethod,
      location: expense.location || '',
      tags: expense.tags?.join(', ') || '',
      isRecurring: expense.isRecurring,
      recurringType: expense.recurringType
    });
    setShowModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingExpense(null);
    reset({
      title: '',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Cash',
      location: '',
      tags: '',
      isRecurring: false,
      recurringType: 'Monthly'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Manage your expenses and track your spending.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Apply/Clear */}
            <button onClick={applyFilters} className="btn-primary">
              Apply
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Clear
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Category */}
              <div>
                <label className="form-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input"
                />
              </div>

              {/* Amount Range */}
              <div>
                <label className="form-label">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Max Amount</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className="input"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="input"
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <DollarSign className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first expense.</p>
              <button onClick={openAddModal} className="btn-primary">
                Add Your First Expense
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Title</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Payment Method</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <div>
                            <div className="font-medium text-gray-900">{expense.title}</div>
                            {expense.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {expense.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="font-semibold text-gray-900">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: expense.category.color }}
                            ></div>
                            <span className="text-sm text-gray-900">{expense.category.name}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(expense.date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center text-sm text-gray-900">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {expense.paymentMethod}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchExpenses(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchExpenses(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Enter expense title"
                  />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="form-label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`input ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="form-error">{errors.amount.message}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`input ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="form-error">{errors.category.message}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className={`input ${errors.date ? 'input-error' : ''}`}
                  />
                  {errors.date && <p className="form-error">{errors.date.message}</p>}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="form-label">Payment Method</label>
                  <select
                    {...register('paymentMethod')}
                    className="input"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    {...register('description')}
                    rows="3"
                    className="input"
                    placeholder="Optional description"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    {...register('location')}
                    className="input"
                    placeholder="Where did you spend this?"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    {...register('tags')}
                    className="input"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                {/* Recurring */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('isRecurring')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">Recurring expense</label>
                  </div>
                  
                  {watch('isRecurring') && (
                    <div className="mt-2">
                      <label className="form-label">Recurring Type</label>
                      <select
                        {...register('recurringType')}
                        className="input"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses; 
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Tag, 
  BarChart3, 
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: CreditCard },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`} 
        onClick={toggleSidebar}
      />
      
      {/* Sidebar */}
      <div className={`md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-50 ${
        isCollapsed ? 'md:w-16' : 'md:w-64'
      } ${isCollapsed ? 'hidden' : 'flex'} md:block`}>
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        {/* Toggle Button */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden md:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-2 pb-4 overflow-y-auto">
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon
                    className={`flex-shrink-0 h-5 w-5 ${
                      isCollapsed ? 'mx-auto' : 'mr-3'
                    }`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Quick Add Button */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button 
            className="flex-shrink-0 w-full group block"
            title={isCollapsed ? 'Quick Add Expense' : ''}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Quick Add Expense
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700">
                    Add a new expense quickly
                  </p>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar; 
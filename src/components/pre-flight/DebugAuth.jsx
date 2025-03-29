// Add this to a new file called DebugAuth.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DebugAuth = () => {
  const { currentUser, userRole } = useAuth();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">Auth Debugging</h2>
      <div className="space-y-2">
        <p><strong>Current User:</strong> {currentUser ? currentUser.email : 'Not logged in'}</p>
        <p><strong>User Role:</strong> {userRole || 'No role detected'}</p>
        <p><strong>User ID:</strong> {currentUser ? currentUser.uid : 'N/A'}</p>
      </div>
    </div>
  );
};

export default DebugAuth;
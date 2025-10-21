
    import React from 'react';
    import { Navigate } from 'react-router-dom';
    
    const Login = () => {
      // This component is now just a placeholder. 
      // The logic is handled by the redirect in AdminLayout.
      // We will redirect to the new login page.
      return <Navigate to="/admin/login" replace />;
    };
    
    export default Login;
  
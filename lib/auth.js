'use strict';

// Admin authentication & session management

function authenticateAdmin(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const salesUser = 'sales';

  if ((username === adminUser || username === salesUser) && password === adminPass) {
    const token = 'prv_session_token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    return {
      success: true,
      token,
      user: {
        name: username === adminUser ? 'Master Admin' : 'Sales Lead',
        role: username
      }
    };
  }

  return {
    success: false,
    message: 'Invalid admin username or password.'
  };
}

module.exports = {
  authenticate: authenticateAdmin,
  authenticateAdmin
};

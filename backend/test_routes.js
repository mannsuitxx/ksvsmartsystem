const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');

app.use('/api/student', studentRoutes);

console.log('Registered Routes for /api/student:');
app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`- ${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach(s => {
      if (s.route) {
        console.log(`- ${Object.keys(s.route.methods)} /api/student${s.route.path}`);
      }
    });
  }
});

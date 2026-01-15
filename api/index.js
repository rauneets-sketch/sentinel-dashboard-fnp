const { Hono } = require('hono')
const { handle } = require('@hono/node-server/vercel')

// Import the app - we'll need to convert this to CommonJS
const app = new Hono()

// Simple test route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sentinel Dashboard</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <h1>Sentinel Dashboard Loading...</h1>
      <p>If you see this, the serverless function is working!</p>
      <script>
        // Redirect to the actual dashboard
        window.location.href = '/dashboard';
      </script>
    </body>
    </html>
  `)
})

// API route for test results
app.get('/api/test-results', (c) => {
  return c.json({
    message: "API is working",
    timestamp: new Date().toISOString()
  })
})

module.exports = handle(app)
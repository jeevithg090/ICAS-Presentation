import { createServer } from '../server';

// Create the Express app
const app = createServer();

// Export the app as a Vercel serverless function
export default app;

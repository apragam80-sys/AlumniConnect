const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Alumni = require('./models/Alumni');
const alumniRoutes = require('./routes/alumni');
const matchRoutes = require('./routes/match');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alumni', alumniRoutes);
app.use('/api/match', matchRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AlumniConnect API is running.' });
});

// Mock Seeding Logic
const seedMockData = async () => {
  try {
    const count = await Alumni.countDocuments();
    if (count === 0) {
      console.log('No alumni found in database. Seeding mock alumni data...');
      const mockAlumni = [
        {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          graduationYear: 2020,
          major: 'Computer Science',
          currentRole: 'Senior Software Engineer',
          company: 'Google',
          location: 'Mountain View, CA',
          linkedIn: 'https://linkedin.com/in/janedoe',
          bio: 'Passionate about React, frontend architecture, and developer tooling. Happy to mentor students interested in web development.',
          skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Node.js']
        },
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          graduationYear: 2018,
          major: 'Software Engineering',
          currentRole: 'Backend Tech Lead',
          company: 'Amazon',
          location: 'Seattle, WA',
          linkedIn: 'https://linkedin.com/in/johnsmith',
          bio: 'Focused on distributed systems, databases, cloud architecture, and Node.js backend scalability.',
          skills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker', 'Python', 'Java']
        },
        {
          name: 'Alice Johnson',
          email: 'alice.j@example.com',
          graduationYear: 2022,
          major: 'Data Science',
          currentRole: 'Machine Learning Engineer',
          company: 'Meta',
          location: 'Menlo Park, CA',
          linkedIn: 'https://linkedin.com/in/alicej',
          bio: 'Graduated with a focus on data science and machine learning. Experienced with Python, TensorFlow, and PyTorch.',
          skills: ['Python', 'SQL', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Analysis']
        },
        {
          name: 'Bob Williams',
          email: 'bob.williams@example.com',
          graduationYear: 2019,
          major: 'Computer Engineering',
          currentRole: 'Product Manager',
          company: 'Microsoft',
          location: 'Redmond, WA',
          linkedIn: 'https://linkedin.com/in/bobwilliams',
          bio: 'Transitioned from software engineer to product manager. Ask me about product lifecycle, roadmap strategy, and cross-functional leadership.',
          skills: ['Product Management', 'Agile', 'Jira', 'SQL', 'System Design']
        },
        {
          name: 'Emily Brown',
          email: 'emily.brown@example.com',
          graduationYear: 2021,
          major: 'Information Systems',
          currentRole: 'Full Stack Developer',
          company: 'Stripe',
          location: 'New York, NY',
          linkedIn: 'https://linkedin.com/in/emilybrown',
          bio: 'Full stack engineer building payment integrations. Love React, Node.js, and working with modern APIs.',
          skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Ruby', 'API Design']
        }
      ];
      await Alumni.insertMany(mockAlumni);
      console.log('Database successfully seeded with 5 mock alumni profiles!');
    }
  } catch (error) {
    console.error('Error seeding mock data:', error);
  }
};

// Database Connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('CRITICAL: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedMockData();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Export the Express API for Vercel Serverless Functions
module.exports = app;

// Only start the server locally (Vercel will handle the routing natively)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}


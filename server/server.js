require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require("./config/db")
const cors = require('cors');
const morgan = require('morgan');
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require('./routes/urlRoutes');
const adminRoutes = require('./routes/adminRoutes');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT;
// const MONGODB_URI = process.env.MONGODB_URI ;

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('MongoDB connected');
// }).catch((err) => {
//   console.error('MongoDB connection error:', err);
// });

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/urls', urlRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(globalErrorHandler);

app.get('/', (req, res) => {
  res.send('URL Shortener Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

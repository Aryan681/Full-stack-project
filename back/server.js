require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routers/authRout');
const docsRoutes = require('./routers/docsRoute');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

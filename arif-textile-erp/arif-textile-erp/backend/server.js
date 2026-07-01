require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/parties', require('./routes/parties'));
app.use('/api/lookups', require('./routes/lookups'));
app.use('/api/rate-master', require('./routes/rateMaster'));
app.use('/api/receiving', require('./routes/receiving'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/packaging', require('./routes/packaging'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/pdf', require('./routes/pdf'));

app.get('/', (req, res) => res.send('Arif Textile ERP API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

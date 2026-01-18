const mongoose = require('mongoose');
require('dotenv').config();

require('./src/models/Booking');
require('./src/models/TourPackage');
require('./src/models/Agent');
require('./src/models/Lead');
require('./src/models/Feedback');

async function listCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully\n');

    console.log('Registered Models:');
    mongoose.modelNames().forEach(name => console.log('  - ' + name));

    console.log('\nDocument Counts:');
    for (const modelName of mongoose.modelNames()) {
      const model = mongoose.model(modelName);
      const count = await model.countDocuments();
      console.log('  - ' + modelName + ': ' + count);
    }

    console.log('\nEmail Service:');
    console.log(process.env.SENDGRID_API_KEY ? '  SendGrid configured' : '  Dev mode (console logging)');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listCollections();

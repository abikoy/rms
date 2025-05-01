const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_ONLINE;

async function fixIndexes() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('Connected to database');

    // Drop the old formNumber index
    await mongoose.connection.db.collection('resourcerequests').dropIndex('formNumber_1');
    console.log('Successfully dropped formNumber index');

    // Create new index for requestNumber if it doesn't exist
    await mongoose.connection.db.collection('resourcerequests').createIndex(
      { requestNumber: 1 },
      { unique: true }
    );
    console.log('Successfully created requestNumber index');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

fixIndexes();

const { app } = require('./app');
const { initModels } = require('./models/initModels');
const { db } = require('./utils/database.util');

const PORT = 4000;
initModels();

db.authenticate()
  .then(() => console.log('database authenticated'))
  .catch(err => console.log(err));

db.sync()
  .then(() => console.log('database synced'))
  .catch(err => console.log(err));

app.listen(PORT);

// MongoDB Connection
const mongoose = require('mongoose');

module.exports=function(){mongoose.connect('mongodb://127.0.0.1:27017/NextJobHub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
 }
// MongoDB Connection
const mongoose = require('mongoose');

module.exports=function(){mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
 }
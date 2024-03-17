// MongoDB Connection
const mongoose = require('mongoose');

module.exports=function(){mongoose.connect('mongodb+srv://nextjobhub:nextjobhub@nextjobhub.o87poyv.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
 }
require('express-async-errors');
const express = require('express');
const cors = require('cors');

// dot env confiq
require('dotenv').config()
const app = express();

// Enable CORS for all routes
app.use(cors());
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const path = require('path');
// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, 'public')));


//database
require('./db')();



app.get("/",(req,res)=>{
    return res.status(200).send({msg:"Welcome to NextJobHub"})
});



//middleware
const errorMiddleware = require("./middleware/errorMiddleware");

// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/login',require('./routes/loginRouter'))
app.use('/api/job',require('./routes/jobRouter'))
app.use('/api/companie',require('./routes/companiesRouter'))
app.use('/api/interview',require('./routes/interviewRouter'));
app.use('/api/applyJob',require('./routes/applyJobRouter'))
app.use('/api/sugest',require('./routes/suggestRouter'));
app.use('/api/allWebsiteCount',require('./routes/mainRoutes'));
app.use('/api/sendmail',require('./routes/sendmail'));
app.use('/api/saveJob',require('./routes/saveJobRouter'))


//validation middelware
app.use(errorMiddleware);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

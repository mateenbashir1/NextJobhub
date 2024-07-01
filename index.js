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
// app.use("./public",express.static("public"))
app.use(express.urlencoded({ extended: false }));

const path = require('path');
// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

const helmet = require('helmet');
app.use(helmet());

// rateLimit
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 60 // limit each IP to 100 requests per windowMs
});
// app.use(limiter);


//database
require('./db')();



app.get("/",(req,res)=>{
    return res.status(200).send({msg:"Welcome to NextJobHub"})
});



//middleware
const errorMiddleware = require("./middleware/errorMiddleware");

// Define routes
app.use('/api/users',limiter, require('./routes/users'));
app.use('/api/login',limiter,require('./routes/loginRouter'))
app.use('/api/job',limiter,require('./routes/jobRouter'))
app.use('/api/companie',limiter,require('./routes/companiesRouter'))
// app.use('/api/interview',require('./routes/interviewRouter'));
app.use('/api/applyJob',limiter,require('./routes/applyJobRouter'))
app.use('/api/sugest',require('./routes/suggestRouter'));
app.use('/api/allWebsiteCount',require('./routes/mainRoutes'));
app.use('/api/sendmail',require('./routes/sendmail'));
app.use('/api/saveJob',require('./routes/saveJobRouter'))
app.use('/api/posts',require('./routes/userPostRoutes'))
app.use('/api/hire',limiter,require('./routes/hireRouter'))


//validation middelware
app.use(errorMiddleware);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

require('express-async-errors');
const express = require('express');

// dot env confiq
require('dotenv').config()
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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


//validation middelware
app.use(errorMiddleware);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const express = require('express');
const env = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes  = require('./routes/UserRoutes')
const PORT = process.env.PORT ||  4001;
const app = express();

env.config();

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.log('Failed to connect to MongoDB'+ err.message);
})
app.use(cookieParser());
app.use(express.json());
app.use('/user' ,userRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is Running on Port : ${PORT}`)
})

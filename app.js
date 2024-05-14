const express = require('express');
const router=require('./routes/routing')
const requestLogger=require('./utilities/requestLogger')
const errorLogger=require('./utilities/errorLogger')

const app = express();
app.use(express.json());
app.use(requestLogger)
app.use('/',router)
app.use(errorLogger)
app.listen(3000, () => {
    console.log('App running on port 30000');
  });
  
module.exports=app;

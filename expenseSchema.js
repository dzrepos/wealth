const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/Wealthwise', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

//Schema
const expenseSchema = new mongoose.Schema(
  {
    amount: {
        type: Number,
    },
    date: {
        type: String       
    },
    description:{
        type: String        
    },
    category: {
        type: String        
    },
    bank_account_id: {
        type: String       
    },
    budget_amount: {
        type: Number       
    },
    goal:{
        type: String        
    },
    target_amount:{
        type: Number        
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

//Model
const expenseModel = mongoose.model('expenses', expenseSchema);

module.exports = expenseModel;

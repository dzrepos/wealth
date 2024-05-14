const userModel = require('../model/userSchema');
const jwt = require('jsonwebtoken');
const expenseModel = require('../model/expenseSchema');
const validator = require('../utilities/validator');
const secretkey = 'your-secret-key';
const exceljs = require('exceljs');

exports.userSignup = async (req, res, next) => {
    try {
        if (
            validator.validatePassword(req.body.password) &&
            validator.validateEmail(req.body.email)
        ) {
            const emailDuplicateCheck = await userModel.find({
                email: req.body.email,
            });
            if (emailDuplicateCheck.length <= 0) {
                const user = await userModel.create(req.body);
                res.status(201).json({
                    message: "User registered successfully",
                    data: {
                        user
                    }
                });
            } else {
                const err = new Error('User already exists with this email id');
                err.status = 400;
                throw err;
            }

        } else if (!validator.validatePassword(req.body.password)) {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;

        } else if (!validator.validateEmail(req.body.email)) {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

exports.userLogin = async (req, res, next) => {
    try {
        const userArr = await userModel.find({
            email: req.body.email,
            password: req.body.password,
        });
        if (userArr.length > 0) {
            const token = jwt.sign({ email: req.body.email }, secretkey);
            res.status(200).json({ token: token });
        } else {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

exports.userExpenses = async (req, res, next) => {
    try {
        if (req.body.amount && req.body.date && req.body.description && req.body.category) {
            const expenses = await expenseModel.create(req.body);
            res.status(201).json({
                message: "Expense added successfully",
                data: {
                    expenses
                }
            });
        } else {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

exports.userBank = async (req, res, next) => {
    try {
        if (req.body.bank_account_id) {
            const account = await expenseModel.create(req.body);
            res.status(200).json({
                message: "Expenses imported successfully",
                data: {
                    account
                }
            });
        } else {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};
exports.userBudget = async (req, res, next) => {
    try {
        if (req.body.budget_amount && req.body.category) {
            const budget = await expenseModel.create(req.body);
            res.status(201).json({
                message: "Budget set successfully",
                data: {
                    budget
                }
            });
        } else {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;
        }
    } catch (err) {     
        next(err);
    }
}
exports.userGoals = async (req, res, next) => {
    try {
        if (req.body.goal && req.body.target_amount) {
            const goals = await expenseModel.create(req.body);
            res.status(201).json({
                message: "Financial goal set successfully",
                data: {
                    goals
                }
            });
        } else {
            const err = new Error('Invalid request body');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        next(err);
    }
}

exports.userDashboard = async (req, res, next) => {
    try {
        const total_expenses = await expenseModel.aggregate([{
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1
            }
        }
        ]);
        const expenses_by_category = await expenseModel.aggregate([{
            $group: {
                _id: '$category',
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                total: 1
            }
        }
        ]);
        const expenses_by_month = await expenseModel.aggregate([
            {
                $match:{
                    date:{$exists:true,$ne:null}
                }

            },
            {
                $addFields: {
                    datestring: {
                        $toDate: "$date"
                    }
                }
            },
            
            {
            $group: {
                _id: {$dateToString:{format:"%Y-%m",date:"$datestring"}},
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $sort: {
                "_id.year": 1,"_id.month":1
            }
        }
        ]);
        return res.status(200).json({
            expenses_overview: {
                total_expenses,
                expenses_by_category,
                expenses_by_month
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.userExport = async (req, res, next) => {
  try {
    const expenses = await expenseModel.find();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");
    worksheet.addRow(["Category", "Amount"]);
    expenses.forEach((expense) => {
      worksheet.addRow([expense.category, expense.amount]);
    });
    const path = `expenses.xlsx`;
    await workbook.xlsx.writeFile(path);
    res.download(path);
    return res.status(200).json({
      message: "Excel or PDF file download",
    });
  } catch (err) {
    next(err);
  }
};

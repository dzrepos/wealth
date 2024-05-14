const fs = require('fs');
const {promisify} = require('util');
const appendFile = promisify(fs.appendFile);
let errorLogger = async (err,req, res, next) => {
   if(err){
        await appendFile('./errorLogger.txt', `Error occured @ ${Date()} - ${err.stack}\n`);
        let status=err.status ?err.status:500;
        res.status(status).json({
            status:'fail',
            message:err.message
        });
   }
}
module.exports=errorLogger;

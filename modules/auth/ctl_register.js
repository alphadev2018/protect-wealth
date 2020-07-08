var AccountSchema = require('../schemas/account_schema.js');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

module.exports.register = async function (req, res) {
 
    try {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        var userInfo = {
            user_name: req.body.userName,
            email :     req.body.email || null,
            password:   hash,
            account_type:   req.body.accountType == undefined ? 0 : req.body.accountType,
            account_status: 'Active',
            token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }

        var accountDoc = await AccountSchema.findOne({'email': userInfo.email});
        if (accountDoc == null) {
            accountDoc = await AccountSchema.create(userInfo);
            console.log("User is registered");
            res.status(201).json({success: true, doc: accountDoc});
        } else {
            console.log("User is alread exist");
            res.status(201).json({success: false, message: "User is already exist"});
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({success: false, error: error});
    }
    
}
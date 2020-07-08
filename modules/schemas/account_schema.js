var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');

autoIncrement.initialize(mongoose.connection);

var accountSchema = new Schema({
  user_name: String,
  email: { 
    type: String,
    required: true
  },
  password: {
    type: String,
    required : true
  },
  role: {
    type: String,
    default: "user"
  },
  recommend: Number,
  token: String,
  avatar: String,
  account_status: String,
  start_time: Date,
  end_time: Date,
},{
  usePushEach : true
});

accountSchema.plugin(autoIncrement.plugin, 'data_accounts');
accountSchema.plugin(passportLocalMongoose);

accountSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setHours(expiry.getHours() + 4);

  return jwt.sign({
    userId: this._id,
    userName: this.user_name,
    email: this.email,
    accountStatus: this.account_status,
    avatar : this.avatar,
    token: this.token,
    role: this.role,
    exp: parseInt(expiry.getTime() / 1000),
  }, this.token);
};

module.exports = mongoose.model('data_accounts', accountSchema);
const mongoose=require('mongoose');
const validor=require('validator');
const jwt= require('jsonwebtoken');
const _= require('lodash');
var UserSchema = new mongoose.Schema({
    email:{
      type:String,
      required:true,
      minlength:1,
      trim:true,
      unique:true,
      validate:{
        validator:validor.isEmail,
        message:'{VALUE} is not valid'
      }
    },
    password:{
      type:String,
      require:true,
      minlength:6
    },
    tokens:[{
      access:{
        type:String,
        required:true
      },
      token:{
        type:String,
        required:true
      }
    }]
  });
UserSchema.methods.toJSON= function (){
  var user= this;
  var userObject= user.toObject();
  return _.pick(userObject,['_id', 'email']);
}
UserSchema.methods.generateAuthToken= function (){
  var user =this;
  var access='auth';
  var token = jwt.sign({_id:user._id.toHexString(), access}, 'glenda1234').toString();
  user.tokens.push({ access,token });
  return user.save().then(()=>{
    return token;
  }).catch((e)=>{console.log(`Error ${e}`);});
}; // instant methods
UserSchema.statics.findByToken= function(token){
  var User=this;
  try{
    var decoded=jwt.verify(token, 'glenda1234');
  }catch(e){
    return Promise.reject();
  }
  return User.findOne({
    _id:decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
}
var User=mongoose.model('User',UserSchema);
module.exports={User}

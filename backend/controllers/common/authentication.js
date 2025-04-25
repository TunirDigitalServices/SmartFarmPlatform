const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../../models/User.js');
const { body, validationResult } = require('express-validator')

const login = async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    try {
        const user = new User({ 'email': email, 'deleted_at': null, 'is_valid': '1', 'is_active': '1'})
        .fetch({withRelated: [ {'subscriptions': (qb) => { qb.orderBy('end', 'desc'); }},{'farms': (qb) => { qb.where('deleted_at', null); }},{'sensors': (qb) => { qb.where('deleted_at', null); }}, {'farms.fields': (qb) => { qb.where('deleted_at', null); }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({status :"404" , type:"danger", message: "no_user"});
            if(result){
                const isPasswordCorrect = await bcrypt.compare(password, result.get('password'));
                if (!isPasswordCorrect) return res.status(400).json({status :"400", type:"danger", message: 'error_password' });
                const token = jwt.sign({ role: result.get('role'), email: result.get('email'), id: result.get('uid') }, process.env.SECRET_KEY, { expiresIn: "24h" });
                const refreshToken = jwt.sign({role: result.get('role'), email: result.get('email'), id: result.get('uid') }, process.env.SECRET_REFRESH_KEY, {
                  expiresIn: "90d",
                  });
                return res.status(200).json({ result: result, token: token, refreshToken: refreshToken });
            }

        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const refreshTokenValidate = async (req, res) => {
  const { email, role, uid, refreshToken } = req.body;
  const isValid = verifyRefresh(email, role, uid, refreshToken);
  if (!isValid) {
  return res
  .status(401)
  .json({ type: "danger", message: "Invalid token,try login again" });
  }
  const token = jwt.sign({ role: role, email: email, id: uid }, process.env.SECRET_KEY, { expiresIn: "24h" });

  return res.status(200).json({ type: "success", token: token });
};

const verifyRefresh =(email, role, uid, token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_REFRESH_KEY);
    if(decoded.email == email && decoded.role == role && decoded.id == uid)
    return true;
  } catch (error) {
    return false;
  }
}


const validateLogin =(method) => {
    switch (method) {
      case 'login': {
       return [ 
          body('password', 'empty_password').notEmpty(),
          body('email', 'email_not_valid').notEmpty().isEmail()
         ]   
      }
    }
  }
module.exports = {login, validateLogin, refreshTokenValidate} ;
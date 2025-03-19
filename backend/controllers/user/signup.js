const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../../models/User.js');
const sendToUse = require('./../../services/sendMail.js');
const { body, validationResult } = require('express-validator');

async function cryptToken() {
    const d = new Date()
    return await crypto.randomBytes(48).toString('hex')+"$-$$"+d.setHours(d.getHours() + 1);
}
  
async function cryptePassword(password) {
    return await bcrypt.hash(password, 12);
}

async function validateToken(token) {
    let test = true;
    if(token.indexOf("$-$$") < 0) test = false
    const dateToExpireLink = await (token.substring(token.indexOf("$-$$"))).replace('$-$$', '');
    const dNow = new Date()
    if(dNow > dateToExpireLink) test = false
    return test;
}

const signup = async (req, res) => {
    const { email, password, confirmPassword ,phone_number, name,offer_type,role } = req.body;//TODO add type offer (1,2)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
    }
    try {
        const user = new User({ 'email': email, 'deleted_at': null})
        .fetch({require: false})
        .then(async data => {
            if (data){
                if(data.get('is_valid') == 0 && data.get('activation_account_token') !== null){

                    const activation_account_token = await cryptToken();
                    data.set({activation_account_token: activation_account_token});
                    data.save();
                    sendToUse.sendmail(
                        data.get('email'), 
                        'signup',
                        {token: data.get('activation_account_token'), link: `${process.env.DOMAIN_FRONT}`}
                    );

                    return res.status(200).json({ type:"warnning", message: "account_exist_not_activate_new_mail_sended"});
                } else {
                    return res.status(200).json({ type:"danger", message: "exist_user"});
                }
            }
            if(data === null){
                if (password !== confirmPassword ) return res.status(500).json({ type:"danger", message: "password_notmatch" });
                const encryptedPassword = await cryptePassword(password);
                const activation_account_token = await cryptToken();
                let is_active = '1'
                if(offer_type === "2" || role === "ROLE_SUPPLIER"){
                    is_active = '0'
                    
                }
                let extrenalToken = null;
                await new User({ email, password: encryptedPassword, name,phone_number,offer_type,role, activation_account_token,is_active }).save()
                .then(async (result) => {
                    try {
                        if(result.get('role') === 'ROLE_SUPPLIER'){
                            let extrenalToken = result.get('uid')+result.get('id');
                            result.set({ external_api_token: extrenalToken });
                            result.save()
                        }
                        sendToUse.sendmail(
                            result.get('email'), 
                            'signup',
                            {token: result.get('activation_account_token'), link: `${process.env.DOMAIN_FRONT}`,offer : result.get('offer_type'),name :result.get('name'),role :result.get('role'),phone:result.get('phone_number') }
                        );
                    } catch (error) {
                        return res.status(500).json({ type:"danger", message: "error_send_mail" });
                    }
                    //const token = jwt.sign({ email: result.get('email'), id: result.get('id') }, process.env.SECRET_KEY, { expiresIn: "1h" });
                    return res.status(201).json({ type :"success" , result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: 'error_save_user' });
                });
            }

        });        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}


const validAccount = async (req, res) => {
    var tokenToValid = req.params.tovalid;
    let test = await  validateToken(tokenToValid, res);
    if(test === false) return res.status(500).json({ type:"danger", message: "error_link" });
    try {
        const user = new User({'activation_account_token': tokenToValid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_user" });
            result.set({ activation_account_token: null, is_valid: '1' });
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "Account confirmed" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_confirm_account" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_user" });
    }
};

const forgotPassword = async (req, res) => {
    const email  = req.body.email;
    const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
    try {
        const user = new User.getUserByEmail(email)
        .then(async result => {
            if (result == null) return res.status(500).json({ type:"danger", message: "no_user"});
            if(result){
                const change_password_token =  await cryptToken();
                result.set({ change_password_token: change_password_token});
                result.save()
                .then((data) => {
                    try {
                        sendToUse.sendmail(
                            result.get('email'), 
                            'forgotPassword',
                            {token: result.get('change_password_token'), link: `${process.env.DOMAIN_FRONT}`}
                        );
                    } catch (error) {
                        return res.status(500).json({ type:"danger", message: "error_send_mail" });
                    }

                    res.status(201).json({ type : "success", data });
                }).catch(err => {
                    res.status(500).json({ type:"danger", message: "error_forgot_password" });
                });
            }

        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_save_user" });
    }
}
const validLinkForgotPassword = async (req, res) => {
    var tovalidpassword = req.params.tovalidpassword;
    let test = await  validateToken(tovalidpassword);
    if(test === false) return res.status(500).json({ type:"danger", message: "error_link" });
    try {
        const user = new User({'change_password_token': tovalidpassword})
        .fetch({require: false})
        .then(async result => {
            if (result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            if (result) return res.status(201).json({ type:"success", result: result });
        }).catch(err => {
            res.status(500).json({ type:"danger", message: "error_forgot_password" });
        });
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_user" });
    }   
}

const validForgotPassword = async (req, res) => {
    const { email, password, confirmPassword, tokenValidPassword } = req.body;
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
  try {
      const user = new User.getUserByEmail(email)
      .then(async result => {
          if (result == null) return res.status(404).json({ type:"danger", message: "no_user"});
          if(result){
            if (password !== confirmPassword ) return res.status(400).json({ type:"danger", message: "password_notmatch_validpassword" });
            if (tokenValidPassword !== result.get('change_password_token')) return res.status(400).json({ type:"danger", message: "error_forgot_password" });
            const encryptedPassword = await cryptePassword(password);
            result.set({ password: encryptedPassword, change_password_token : null });
            result.save()
            .then((result) => {
                res.status(201).json({ type:"success", message: 'Your password has been changed.' });
            }).catch(err => {
                res.status(500).json({ type:"danger", message: 'error_save_user' });
            });
          }

      });        
  } catch (error) {
    res.status(500).json({ type:"danger", message: "error_save_user" });
  }
}
const validateSignup =(method) => {
  switch (method) {
    case 'signup': {
     return [ 
        body('name', 'name_empty').notEmpty(),
        body('password', 'password_min_length_error').isLength({ min: 6 }),
        body('email', 'email_not_valid').notEmpty().isEmail(),
        // body('offer_type', 'select_offer').notEmpty()
        ]   
    }
    case 'forgotPassword': {
        return [ 
           body('email', 'email_not_valid').notEmpty().isEmail()
        ]   
    }
    case 'validForgotPassword': {
        return [ 
            body('password', 'password_min_length_error').isLength({ min: 6 }),
            body('password', 'password_empty').notEmpty()
        ]   
    }
  }
}
module.exports = {signup, validateSignup, validAccount, forgotPassword, validLinkForgotPassword, validForgotPassword} ;
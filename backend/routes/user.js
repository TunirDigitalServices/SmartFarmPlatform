const express = require('express')
const {signup, validateSignup, validAccount, forgotPassword, validLinkForgotPassword, validForgotPassword} = require('../controllers/user/signup.js')
const {login, refreshTokenValidate, validateLogin} = require('../controllers/common/authentication.js')
// 
const router = express.Router();

router.post('/signup', validateSignup('signup'), signup);
router.post('/login', validateLogin('login'), login);
router.post('/refresh', refreshTokenValidate);
router.get('/valid-account/:tovalid',validAccount);
router.post('/forgot-password', validateSignup('forgotPassword'), forgotPassword);
router.get('/valid-forgot-password/:tovalidpassword', validLinkForgotPassword);
router.post('/change-password', validateSignup('validForgotPassword'), validForgotPassword);


module.exports = router;
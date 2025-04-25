const jwt = require('jsonwebtoken');
const User = require('./../models/User.js');
const session = require('express-session');

const auth = async (req, res, next) => {
    try {
         // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
        const allowedMethods = [
            "OPTIONS",
            "HEAD",
            "CONNECT",
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
        ];

        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({ type:"danger", message: `${req.method} not allowed.` });
        }


        if(!(req.headers.authorization)) return res.status(500).json({ type:"danger", message: 'no_token' });
        
        const token = req.headers.authorization.split(" ")[1];
        let decodedData;
        if (token) {
            decodedData = jwt.verify(token, process.env.SECRET_KEY);
            let userEnable = true;

            if(decodedData.id){
                req.userUid = decodedData.id;
				if(decodedData.role){
					req.role = decodedData.role;
				}
                const user = await new User({'uid': decodedData.id, is_valid: '1', is_active: '1'})
                .fetch({require: false})
                .then(async result => {
                    if(result == null) {return res.status(501).json({ type:"danger", message: 'no_user' });}
                    else {
                        session.userUid = decodedData.id;
                        next(); }
                });
            }
            

            

        } else {
            req.userUid = false;
        }
        
    } catch (error) {
        return res.status(401).json({ type:"danger", message: 'token_error' });
    }
};

module.exports = {auth} ;

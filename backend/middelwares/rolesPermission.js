const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const rolePermission = async (req, res, next) => {
    try {
        if(!(req.headers.authorization)) return res.status(500).json({ type:"danger", message: 'no_token' });
        const token =  req.headers.authorization.split(" ")[1];
        if (token) {
            decodedData = jwt.verify(token, process.env.SECRET_KEY);
            userUid = decodedData.id;
            if(userUid){
                role = decodedData.role;
                if(role && (role === 'ROLE_ADMIN') || (role === 'ROLE_SUPPLIER')){
                    next();
                } else {
                    return res.status(404).json({ type:"danger", message: "no_permission"});
                }
            }
        } else {
            return res.status(500).json({ type:"danger", message: 'no_user' });
        }
        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: 'no_token' });
    }
};

const rolePermissionOffer = async (req, res, next) => {
    try {
        if(!(req.headers.authorization)) return res.status(500).json({ type:"danger", message: 'no_token' });
        const token =  req.headers.authorization.split(" ")[1];
        if (token) {
            decodedData = jwt.verify(token, process.env.SECRET_KEY);
            userUid = decodedData.id;
            if(userUid){
                const user = await new User({'uid': userUid, is_valid: '1', is_active: '1', offer_type: '2'})
                .fetch({require: false})
                .then(async result => {
                    if(result == null) {return res.status(501).json({ type:"danger", message: 'no_permission' });}
                    else {next(); }
                });

            }
        } else {
            return res.status(500).json({ type:"danger", message: 'no_user' });
        }
        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: 'no_token' });
    }
};

module.exports = {rolePermission, rolePermissionOffer} ;

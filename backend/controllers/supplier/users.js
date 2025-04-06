
const { body, validationResult } = require('express-validator');
const  Supplier = require('../../models/Supplier');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendToUse = require('./../../services/sendMail.js');
const Sensor = require('../../models/Sensor');

async function cryptePassword(password) {
    return await bcrypt.hash(password, 12);
}

async function cryptToken() {
    const d = new Date()
    return await crypto.randomBytes(48).toString('hex')+"$-$$"+d.setHours(d.getHours() + 1);
}

const getUsers = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
        let supplier_id =""
    
        const user = await new User({ 'uid' : uid})
        .fetch({require : false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"})
            if (result) supplier_id = result.get("supplier_id")
        })
        if(supplier_id && supplier_id !== ""){
        try {
                const user = new User()
                .query(qb => qb.where('supplier_id' ,'=',supplier_id)
                .andWhere('role', '=' , 'ROLE_USER')
                .andWhere('deleted_at', 'is' , null))
                .fetchAll({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.reports': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors.sensorsData': (qb) => { qb.where('deleted_at', null).orderBy('id','DESC') }}],require : false})
                .then(async users => {
                    return res.status(201).json({ users });
                })

            } catch (error) {
                return res.status(500).json({ type:"danger", message: "error_get_users" });
            }
        }
    }
 
const addUser = async (req,res) => {
    let role = "ROLE_USER"
    const { email, password, confirmPassword , name ,offer_type} = req.body ; 
    const uid  = req.userUid;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    try {
        let supplier_id =""
    
        const users = await new User({ 'uid' : uid})
        .fetch({require : false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"})
            if (result) supplier_id = result.get("supplier_id")
        })
        console.log(supplier_id)
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
                await new User({ email, password: encryptedPassword, name,role,offer_type,activation_account_token,supplier_id:supplier_id }).save()
                .then((result) => {
                    try {
                        sendToUse.sendmail(
                            result.get('email'), 
                            'signup',
                            {token: result.get('activation_account_token'), link: `${process.env.DOMAIN_FRONT}`}
                        );
                    } catch (error) {
                        console.log(error)
                        return res.status(500).json({ type:"danger", message: "error_send_mail" });
                    }
                    return res.status(201).json({ type :"success" , result });
                }).catch(err => {
                    console.log(err)
                    return res.status(500).json({ type:"danger", message: err });
                });
            }

        });        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }    
   
}


const assignSensorToUser = async (req,res) => {
        const {user_uid,sensor_uid} = req.body
        let user_id = null;
        if(user_uid !== "" && typeof user_uid !== 'undefined'){
            const user = await new User({'uid': user_uid, deleted_at: null})
            .fetch({require: false})
            .then(async users => {
              user_id = users.get('id');
            });
        }
    
        try {
            const sensor = new Sensor({ 'uid' : sensor_uid , deleted_at: null})
            .fetch({require: false})
            .then(async result => {
               if (result === null) return res.status(404).json({ type:"danger", message: "no_sensor"});
                if(result){
                    result.set({user_id: user_id});
                    result.save()
                    .then((result) => {
                        return res.status(201).json({ type:"success", Sensor : result });
                    }).catch(err => {
                        return res.status(500).json({ type:"danger", message: "error_edit_sensor" });
                    });
                }
            });        
        } catch (error) {
            res.status(500).json({ type:"danger", message: "error_sensor" });
        }
}







module.exports = {addUser , getUsers ,assignSensorToUser} ; 
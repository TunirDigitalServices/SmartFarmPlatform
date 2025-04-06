const User = require('../../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendToUse = require('./../../services/sendMail.js');
const Subscription = require('../../models/Subscription');
const Supplier = require('../../models/Supplier');

async function cryptePassword(password) {
    return await bcrypt.hash(password, 12);
}

async function cryptToken() {
    const d = new Date()
    return await crypto.randomBytes(48).toString('hex')+"$-$$"+d.setHours(d.getHours() + 1);
}

const getUsers = async (req, res) => {
    try {
        const user = new User()
        .query((qb) => {
            qb.where('deleted_at', null)
        })
        .fetchAll({require: false})                               
        .then(async users => {
            return res.status(201).json({ users });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_users" });
    }

}

const getExistUsers = async (req,res) => {
    const supplier_uid  = req.body.supplier_uid;
    let supplier_id = null;
    if ( typeof supplier_uid !== 'undefined' && supplier_uid !== "" ){
        const supplier = await new Supplier({'uid': supplier_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            supplier_id = result.get('id');
        });

    }
    try {
        const user = await new User()
        .query({where: {'deleted_at' : null, role : 'ROLE_USER', is_active: '1', is_valid: '1', supplier_id : supplier_id}})
        .fetchAll({require: false})
        .then(async result => {
            return res.status(201).json({ users : result });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_users" });
    }
}

const getExistUsersSuppliers = async (req,res) => {
    try {
        const user = await new User()
        .query({where: {'deleted_at' : null, role : 'ROLE_SUPPLIER', is_active: '1', is_valid: '1'}})
        .fetchAll({require: false})
        .then(async result => {
            return res.status(201).json({ suppliers : result });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_users" });
    }
}

const getSingleUser = async (req, res) => {
    const user_uid  = req.body.user_uid;
    try {
      const user = new User({'uid': user_uid, deleted_at: null})
      .fetch({require: false})
      .then(async result => {
          if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
          if(result){
                  return res.status(201).json({ type:"success", user : result });
              };
          })
      }catch (err) {
        return res.status(500).json({ type:"danger", message: 'error_get_user' });
      }      
  
    }

    const addUser = async (req,res) => {

        const { email, password, confirmPassword , name ,offer_type,supplier_uid } = req.body ; 
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
            let supplier_id = null;
            if(supplier_uid !== "") {
                const supplier = await new Supplier({'uid': supplier_uid, deleted_at: null})
                .fetch({require: false})
                .then(async result => {
                 return supplier_id = result.get('id');
                });
            }

        let role = "ROLE_USER";
        if (supplier_uid !== ""){
            role = "ROLE_SUPPLIER"
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
                    await new User({ email, password: encryptedPassword, name,role,offer_type, supplier_id:supplier_id,activation_account_token }).save()
                    .then((result) => {
                        try {
                            if(result.get('role') === 'ROLE_SUPPLIER'){
                                let extrenalToken = result.get('uid')+result.get('id');
                                result.set({ external_api_token: extrenalToken });
                                result.save()
                            }

                            sendToUse.sendmail(
                                result.get('email'), 
                                'signup',
                                {token: result.get('activation_account_token'), link: `${process.env.DOMAIN_FRONT}`}
                            );
                        } catch (error) {
                            return res.status(500).json({ type:"danger", message: "error_send_mail" });
                        }
                        return res.status(201).json({ type :"success" , result });
                    }).catch(err => {
                        return res.status(500).json({ type:"danger", message: err });
                    });
                }
    
            });        
        } catch (error) {
            return res.status(500).json({ type:"danger", message: error });
        }    
       
    }

    const editProfil = async (req, res) => {
        if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
        const {name,email,address,city,country,zip_code,description,user_uid,supplier_uid } = req.body;
        let supplier_id = null;
        
        // if(supplier_uid !== "") {
        //     const supplier = await new Supplier({'uid': supplier_uid, deleted_at: null})
        //     .fetch({require: false})
        //     .then(async result => {
        //         supplier_id = result.get('id');
        //     });

        // }
        // if(req.role === "ROLE_SUPPLIER") {
        //     const user = await new User({'uid': req.userUid})
        //     .fetch({require: false})
        //     .then(async result => {
        //         supplier_id = result.get('supplier_id');
        //     });
        // }
        try {
            const user = new User({'uid': user_uid})
            .fetch({require: false})
            .then(async result => {
                if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
                if(result){
                    if(result.get('role') === 'ROLE_SUPPLIER'){
                        let extrenalToken = result.get('uid')+result.get('id');
                        result.set({ external_api_token: extrenalToken });
                        result.save()
                    }
                    result.set({ name,email,address,city,country,zip_code,description,supplier_id : supplier_uid });
                    result.save()
                    .then((data) => {
                        res.status(201).json({ type:"success", message: 'profil_changed' });
                    }).catch(err => {
                        res.status(500).json({ type:"danger", message: 'error_save_user_profil' });
                    });
                }
            });        
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_user" });
        }
    }
    // fix uid
    const editUser = async (req, res) => {
        if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
        const {name,email,address,city,country,zip_code,description,offer_type} = req.body;

        const errors = validationResult(req);  

        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        } 
        let user_uid = req.body.user_uid

        try {
            const user = new User({'uid': user_uid})
            .fetch({require: false})
            .then(async result => {
                if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
                if(result){

                    if(result.get('role') === 'ROLE_SUPPLIER'){
                        let extrenalToken = result.get('uid')+result.get('id');
                        result.set({ external_api_token: extrenalToken });
                        result.save()
                    }


                    result.set({ name,email,offer_type,address,city,country,zip_code,description});
                    result.save()
                    .then((data) => {
                        res.status(201).json({ type:"success", message: 'user_updated' });
                    }).catch(err => {
                        res.status(500).json({ type:"danger", message: 'error_save_user' });
                    });
                }
            });        
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_user" });
        }
    }

    const desactiveUser = async (req,res) => {
        let user_uid = req.body.user_uid
        try {
            const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" });
                result.set({ is_active: '0' });
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "Account Desactivated" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_desactive_account" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_user" });
        }
    }

    const activeUser = async (req,res) => {
        let user_uid = req.body.user_uid
        try {
            const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" });
                result.set({is_active: '1' });
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "Account Activated" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_activate_account" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_user" });
        }
    }

    const confirmUser = async (req,res) => {
        let user_uid = req.body.user_uid
        try {
            const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" });
                result.set({is_valid: '1'  , activation_account_token : null});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "Account Activated" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_activate_account" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_user" });
        }
    }

    const  deleteUser = async (req,res) => {
        user_uid = req.body.user_uid;
      try {
          const user = new User({'uid': user_uid})
          .fetch({require: false})
          .then(async result => {
              if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
              if(result){
                  result.set({deleted_at: new Date()});
                  result.save()
                  return res.status(201).json({ type:"success", message: 'user_deleted' });
              }
          }).catch(err => {
              return res.status(500).json({ type:"danger", message: 'error_delete_user' });
          });;
      } catch (error) {
          return res.status(500).json({ type:"danger", message: "error_user" });
      } 
    }    

    const searchUser = async (req,res) => {

        const {name,email,role} = req.body;

        try {
            const user = new User()
            .query((user)=> 
            user.where('name', 'LIKE', '%' + name + '%')
            .orWhere('email', 'LIKE', '%' + email + '%')
            .orWhere('role', 'LIKE', '%' + role + '%'))
            .fetchAll()
            .then(async users => {
                return res.status(201).json({ users });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_users" });
        }
    } 

    const changeOffer = async (req,res) => {
        const {offer_type , user_uid} = req.body ; 

        try {
              const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" })
                result.set({offer_type : offer_type});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "Offer Changed" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_change_offer" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_users" });

        }
    }

    const changeRole = async (req,res) => {
        const {role , user_uid} = req.body ; 

        try {
              const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" })
                result.set({role : role});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "Role Changed" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_role_offer" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_users" });

        }
    }

    const changeHasCommand = async (req,res) => {
        const {command , user_uid} = req.body ; 

        try {
              const user = await new User({'uid' : user_uid})
            .fetch({require: false})
            .then(async result => {
                if(result === null) return res.status(500).json({ type:"danger", message: "no_user" })
                result.set({has_command : command});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", message: "User Updated" });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_change_user" });
                });
            })
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_get_users" });

        }
    }


    module.exports = {getUsers,getExistUsers,getExistUsersSuppliers, getSingleUser,addUser,editUser,desactiveUser,activeUser,confirmUser,deleteUser,searchUser,changeOffer,changeRole,editProfil,changeHasCommand}

const User = require('./../../models/User.js');
const multer = require("multer");
const fs = require('fs')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');



const profil = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
   
    const uid  = req.userUid;
    try {
        const user = new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result){
                return res.status(200).json({ result: result });
            }

        });        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}
const editProfil = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const {name,email,address,city,country,zip_code,description } = req.body;
    const uid  = req.userUid;
    try {
        const user = new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result){
                result.set({ name,email,address,city,country,zip_code,description });
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

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'docs/img');
    },
    filename: function (req, file, callback) {
    
    if(!(req.userUid) || req.userUid == "") return false;
   
    const uid  = req.userUid;

    const user = new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(500).json({ type:"danger", message: "no_user"});
            if(result){
                //let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                result.set({upload_file_name : file.fieldname + '-' + result.get('uid')+".jpeg"})
                result.save()
                callback(null, file.fieldname + '-' + result.get('uid')+".jpeg");
            }

        });
      
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
  });
  
  const maxSize = 1 * 1024 * 1024; // for 1MB
  var upload = multer({ storage : storage}).single('userPhoto');

  const uploadPicture = async (req, res) => {
    upload(req,res,function(err) {
        if(err) {
            return res.status(500).json({ type:"danger", message: err });
        }
        res.status(201).json({ type:"success", message: 'File is uploaded' });
    });

  }

  async function cryptePassword(password) {
    return await bcrypt.hash(password, 12);
}


  const changePassword = async (req,res) => {
    const {password,newPassword,confirmNewPassword } = req.body;

      const uid  = req.userUid;
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }  
    try {
        const user = new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result){
                const isPasswordCorrect = await bcrypt.compare(password, result.get('password'));
                if (!isPasswordCorrect) return res.status(400).json({ type:"danger", message: 'error_password' })
                if (newPassword !== confirmNewPassword ) return res.status(400).json({ type:"danger", message: "password_not_valid" });
                const encryptedPassword = await cryptePassword(newPassword);
              result.set({ password: encryptedPassword });
              result.save()
              .then((result) => {
                  res.status(201).json({ type:"success", message: 'password_changed' });
              }).catch(err => {
                  res.status(500).json({ type:"danger", message: 'error_save_user' });
              });
            }
            });  
        } catch (error) {
            return res.status(500).json({ type:"danger", message: "error_user" });
        }
  }

  const validateProfil =(method) => {
    switch (method) {
      case 'changePassword': {
          return [ 
              body('password', 'password_min_length_error').isLength({ min: 6 }),
              body('password', 'password_empty').notEmpty(),
              
              body('newPassword', 'new_password_min_length_error').isLength({ min: 6 }),
              body('newPassword', 'new_password_empty').notEmpty()
          ]   
      }
    }
  }

module.exports = {profil,changePassword, uploadPicture,editProfil,validateProfil}
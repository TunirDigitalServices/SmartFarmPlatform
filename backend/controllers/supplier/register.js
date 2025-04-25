
const { body, validationResult } = require('express-validator');
const  Supplier = require('../../models/Supplier');
const User = require('../../models/User');




const getSupplierByConnectedUser = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'suppliers': (qb) => { qb.where('deleted_at', null); }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_supplier"});
            return res.status(201).json({ type:"success", supplier: result.related('suppliers') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}


const editSupplier = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});

    const {name ,address,city,country,tel,tel_mobile,email} = req.body
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    try {
        const user = new Supplier()
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result){
                result.set({name ,address,city,country,tel,tel_mobile,email });
                result.save()
                .then((data) => {
                    res.status(201).json({ type:"success", message: 'supplier_changed' });
                }).catch(err => {
                    res.status(500).json({ type:"danger", message: 'error_save_supplier' });
                });
            }
        });        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const addSupplier = async (req,res) => {
    const {name ,address,city,country,tel,tel_mobile,email} = req.body
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    try {
  
                await new Supplier({ name ,address,city,country,tel,tel_mobile ,email}).save()
                .then((result) => {
                    return res.status(201).json({ type:"success", supplier : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: 'error_save_supplier' });
                });
            } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const validateAddSupplier =(method) => {
    switch (method) {
      case 'register': {
       return [ 
          body('name', 'name_empty').notEmpty(),
          body('tel_mobile', 'tel_empty').notEmpty(),
          ]   
      }
    }
  }





module.exports = {addSupplier ,editSupplier,getSupplierByConnectedUser, validateAddSupplier} ; 
const Supplier = require('./../../models/Supplier.js');


const getSuppliers= async (req, res) => {
    try {
        const supplier = new Supplier()
        .fetchAll()
        .then(async data=> {
            let suppliers = JSON.parse(JSON.stringify(data))
            return res.status(201).json({ suppliers });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_suppliers" });
    }
}

const getExistSuppliers = async (req,res) => {
    try {
        const user = await new Supplier()
        .query({where: {'deleted_at' : null}})
        .fetchAll({require: false})
        .then(async result => {
            let data = JSON.parse(JSON.stringify(result))
            return res.status(201).json({ suppliers : data });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_suppliers" });
    }
}
       
const getSingleSupplier = async (req, res) => {
    const supplier_uid  = req.body.supplier_uid;
    try {
      const supplier = new Supplier({'uid': supplier_uid, deleted_at: null})
      .fetch({require: false})
      .then(async result => {
          if (result === null) return res.status(404).json({ type:"danger", message: "no_supplier"});
          if(result){
                  return res.status(201).json({ type:"success", supplier : result });
              };
          })
      }catch (err) {
        return res.status(500).json({ type:"danger", message: 'error_get_supplier' });
      }      
  
    }

    const editSupplier = async (req,res) => {
        if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    
        const {name ,address,city,country,tel,tel_mobile,supplier_uid} = req.body
        try {
            const user = new Supplier({'uid' : supplier_uid})
            .fetch({require: false})
            .then(async result => {
                if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
                if(result){
                    result.set({name ,address,city,country,tel,tel_mobile });
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
module.exports = {getExistSuppliers,editSupplier,getSuppliers,getSingleSupplier}
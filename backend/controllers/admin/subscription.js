const Subscription = require('./../../models/Subscription.js');
const User = require('./../../models/User.js');

const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = new Subscription()
        .fetchAll()
        .then(async subscriptions => {
            return res.status(201).json({ subscriptions });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_subscriptions" });
    }
}

const getSubscriptionByUser = async (req, res) => {
    var user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: ["subscriptions"] ,require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result) return res.status(201).json({ subscriptions:  result.related('subscriptions') });
        }).catch(err => {
            res.status(500).json({ type:"danger", message: "error_activate_account" });
        });
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_user" });
    }
}
const checkSubscription = async (start, end, user_id) => {
    let dateOne =  new Date(start);
    let dateTwo = new Date(end);
    let r = 0;
    
    for(var i = dateOne; i<= dateTwo; i.setDate(i.getDate()+1)){
        // variable i will be used to get all dates in range
        await new Subscription()
        .query((qb)=>
        qb.where('start', '<=' , i)
        .andWhere('end', '>=' , i)
        .andWhere('deleted_at', 'is' , null)
        .andWhere('is_active', '=' , '1')
        .andWhere('user_id', '=' , user_id)
        )
        .fetchAll()
        .then(result=>{
            r =  r + result.length;         
        })
    }
    if(r > 0 ){
        return false;
    }else{
        return true;
    }
    
}

const addSubscription = async (req, res) => {  
    const {start,end,description,user_uid} = req.body;

    if(!(req.body.user_uid) || req.body.user_uid == "") return res.status(404).json({ type:"danger", message: "no_user_selected"});
    try {
        const user = await new User({'uid' : user_uid, 'offer_type': 2})
        .fetch({withRelated: ["subscriptions"] ,require : false})
        .then(async result=>{
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_found_or_no_offer"});
            if (result) {
                let user_id = result.get('id');
                
                if(await checkSubscription(start, end, user_id) === true) {
                    new Subscription({start,end,description, user_id: user_id}).save()
                    .then(result=>{
                        return res.status(201).json({ type:"success", subscription : result })
                    })
                    .catch(err=>{
                        return res.status(500).json({ type:"danger", message: err });
                    })  
                } else {
                    return res.status(500).json({ type:"danger", message: "exist_date_in_subscriptions" });

                }
            }
        })
        .catch(err=>{
            return res.status(500).json({ type:"danger", message: "error_user_select" });
        })    
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}
const editSubscriptions = async (req, res) => {  
}

const deleteSubscriptions = async (req, res) => {  
    subscription_uid = req.body.subscription_uid ;
    try {
        const subscription = new Subscription({'uid':  subscription_uid })
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_subscription"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'subscription_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_subscription' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_subscription" });
    } 
}

 const desactivateSub = async (req,res) => {
    let subscription_uid = req.body.subscription_uid
    try {
        const subscription = await new Subscription({'uid' : subscription_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_subscription" });
            result.set({ is_active: '0' });
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "Subscription Desactivated" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_desactive_subscription" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_subscription" });
    }
 }    

 const activateSub = async (req,res) => {
    let subscription_uid = req.body.subscription_uid
    try {
        const subscription = await new Subscription({'uid' : subscription_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_subscription" });
            result.set({is_active: '1' });
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "Subscription Activated" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_activate_subscription" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_subscription" });
    }
}
module.exports = {getSubscriptions, editSubscriptions, addSubscription, deleteSubscriptions,activateSub,desactivateSub,getSubscriptionByUser}

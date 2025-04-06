const User = require('./../../models/User.js');
const Field = require('./../../models/Field.js');
const Notification= require('../../models/Notification.js')


const getAllNotification = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;

    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'notifications': (qb) => { qb.where('deleted_at', null).orderBy('id','DESC') }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_notifications"});
            return res.status(201).json({ notifications: result.related('notifications') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
} 


const getNotifByConnectedUser = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;

    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'notifications': (qb) => { qb.where('deleted_at', null).andWhere('is_view', '=' , "0").orderBy('id','DESC')  }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_notifications"});
            return res.status(201).json({ notifications: result.related('notifications') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
} 

const addNotification= async (req, res) => {
   const {object,type,description,user_uid} = req.body;
   if(!(req.body.user_uid) || req.body.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
   try {
        const user = new User({'uid': user_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
           if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
           if(result){
               await new Notification({ object,type,description,user_id :  result.get('id') }).save()
               .then((result) => {
                   return res.status(201).json({ type:"success", notification: result });
               }).catch(err => {
                   return res.status(500).json({ type:"danger", message: 'error_save_Notification' });
               });
           }
       });        
   } catch (error) {
       res.status(500).json({ type:"danger", message: "error_user" });
   }
}

const asReadNotification = async (req,res) => {
    let notification_uid = req.body.notification_uid
    try {
        const notification = await new Notification({'uid' : notification_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_Notification" });
            result.set({is_view: '1',viewed_at: new Date()});
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "Notification viewed" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_view_Notification" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_Notification" });
    }
}
    
 
const asNotReadNotification = async (req,res) => {
    let notification_uid = req.body.notification_uid
    try {
        const notification = await new Notification({'uid' : notification_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_Notification" });
            result.set({is_view: '0'});
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "Notification not viewed" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_view_Notification" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_Notification" });
    }
}

module.exports = {getAllNotification, addNotification ,getNotifByConnectedUser ,asReadNotification,asNotReadNotification }
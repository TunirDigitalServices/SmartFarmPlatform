const User = require('./../../models/User.js');
const Field = require('./../../models/Field.js');
const Recommendation = require('./../../models/Recommendation')

const getAllRecommendation = async (req,res) => {
    try {
        const recommendation = new Recommendation()
        .fetchAll()
        .then(async recommendation => {
            return res.status(201).json({ recommendation });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_recommendation" });
    }
} 

const getSingleRecommendation = async (req,res) => {
    const recommendation_uid  = req.body.recommendation_uid;
  
  try {
    const recommendation = new Recommendation({'uid': recommendation_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_recommendation"});
        if(result){
                return res.status(201).json({ type:"success", recommendation : result });
            };
        })
    }catch (err) {
      return res.status(500).json({ type:"danger", message: 'error_get_recommendation' });
    }  
} 

const getViewedRecommendation = async (req,res) => {
    try {
        const recommendation = new Recommendation()
        .query({where: {'viewed' : 1}})
        .fetchAll({require: false})
        .then(async recommendation => {
            return res.status(201).json({ recommendation });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_recommendation" });
    }
} 

const getRecommendationsByField = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    let field_id = req.params.id;
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'recommendations': (qb) => { qb.where('deleted_at', null).andWhere('field_id' ,'=' ,field_id).orderBy('id','DESC')  }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_recommendations"});
            return res.status(201).json({ recommendations: result.related('recommendations') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
} 
const getRecommendationsByUser = async (req,res) => {
    let user_id = req.params.user;
    let field_id = req.params.id;
    try {
        const user = await new User({'id': user_id})
        .fetch({withRelated: [ {'recommendations': (qb) => { qb.where('deleted_at', null).andWhere('field_id' ,'=' ,field_id).orderBy('id','DESC')  }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_recommendations"});
            return res.status(201).json({ recommendations: result.related('recommendations') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
} 

const getRecommendationByConnectedUser = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    let field_id = req.params.id;

    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'recommendations': (qb) => { qb.where('deleted_at', null).andWhere('field_id' ,'=' ,field_id).orderBy('id','DESC').limit(1)  }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_recommendations"});
            return res.status(201).json({ recommendations: result.related('recommendations') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
} 


const addRecommendation = async (req, res) => {
   const {title,description,field_uid,user_uid} = req.body;
   if(!(req.body.user_uid) || req.body.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});

   let user_id = "";
   const user = await new User({'uid': user_uid, deleted_at: null})
   .fetch({require: false})
   .then(async result => {
     if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
     user_id = result.get('id');
   });

   try {
        const field = new Field({'uid': field_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
           if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
           if(result){
               await new Recommendation({ title,description,user_id : user_id,field_id: result.get('id') }).save()
               .then((result) => {
                   console.log(result)
                   return res.status(201).json({ type:"success", recommendation : result });
               }).catch(err => {
                   return res.status(500).json({ type:"danger", message: 'error_save_recommendation' });
               });
           }
       });        
   } catch (error) {
       res.status(500).json({ type:"danger", message: "error_user" });
   }
}

    
 const asReadRecommendation = async (req,res) => {
    let recommendation_uid = req.body.recommendation_uid
    try {
        const recommendation = await new Recommendation({'uid' : recommendation_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_recommendation" });
            result.set({viewed: '1' , viewed_at: new Date()});
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "recommendation viewed" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_view_recommendation" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_recommendation" });
    }
}

const asNotReadRecommendation = async (req,res) => {
    let recommendation_uid = req.body.recommendation_uid
    try {
        const recommendation = await new Recommendation({'uid' : recommendation_uid})
        .fetch({require: false})
        .then(async result => {
            if(result === null) return res.status(500).json({ type:"danger", message: "no_recommendation" });
            result.set({viewed: '0'});
            result.save()
            .then((result) => {
                return res.status(201).json({ type:"success", message: "recommendation not viewed" });
            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "error_view_recommendation" });
            });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_recommendation" });
    }
}


module.exports = {addRecommendation ,asReadRecommendation,getRecommendationsByField,getRecommendationsByUser,getSingleRecommendation,getRecommendationByConnectedUser,getAllRecommendation,getViewedRecommendation,asNotReadRecommendation }
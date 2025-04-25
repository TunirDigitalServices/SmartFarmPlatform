const fs = require('fs')
const pdf = require('pdf-creator-node')
const path = require('path')
const options = require('./options')
const User = require('../models/User')
const CalculSensor = require('../models/CalculSensor')
const Report = require('../models/Report')

const generatePDF = async  (req,res,next) => {


    const html = fs.readFileSync(path.join(__dirname, './template.html'), 'utf-8');
    const filename = Math.random() + '_doc' + '.pdf';
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let currentDate = `${day}-${month}-${year}`;

    
    
    const uid = req.userUid
    const user = await new User({ 'uid': uid , 'deleted_at': null})
    .fetch({withRelated: [ {'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null)}},{'farms.fields.crops': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.zones': (qb) => { qb.where('deleted_at', null); }}] ,require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type: "danger", message: "no_user" });
        if (result){
           let data =  JSON.parse(JSON.stringify(result))
           let userName = data.name
           let userEmail = data.email
           let farms = data.farms
           let Fields = []
            farms.map(dataFarm=>{
                let fields = dataFarm.fields
                if(fields){
                    Fields.push(fields)

                }
           })
           let array = [];
               array.push({
                   name : userName,
                   email : userEmail,
                   date : currentDate
       
               });
               const obj = {
                   list: array,
                }
               const document = {
                   html: html,
                   data: {
                       products: obj
                   },
                   path: './docs/' + filename
               }
               pdf.create(document, options)
                   .then(res => {
                       console.log(res);
                   }).catch(error => {
                       console.log(error);
                   });
                   const filepath = 'http://localhost:3000/docs/' + filename;
        }
    });
  

} 


const downloadReport = async (req, res) => {
    let file = req.body.filename;

    try {
        const report = await new Report({ filename: file, deleted_at: null }).fetch({ require: false });

        if (!report) {
            return res.status(404).json({ type: "danger", message: "no_file" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${file}`);

        const filePath = `docs/${file}`;
        const fileData = fs.readFileSync(filePath);
        const fileSize = fs.statSync(filePath).size;

        // Set Content-Length header
        res.setHeader("Content-Length", fileSize);

        // Ensure fileData is a Buffer
        const bufferData = Buffer.from(fileData);

        res.send(bufferData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: "danger", message: "error_download_file" });
    }
};


  
  





module.exports = {generatePDF,downloadReport}
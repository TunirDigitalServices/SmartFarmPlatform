
const express = require('express')
const router = express.Router();
const expressValidator = require('express-validator')
const cors = require('cors')
const bodyParser = require('body-parser')
const knex = require('./knex/knex')
const dotenv = require('dotenv');
const User = require('./models/User');
const userRouters = require('./routes/user.js');
const commonRouters = require('./routes/common.js');
const adminRouters = require('./routes/admin.js');
const supplierRouters = require('./routes/supplier.js');
const sensorFunction = require('./controllers/common/sensor.js')
const expressLayouts = require('express-ejs-layouts')
const rolePermission = require('./middelwares/rolesPermission.js');
const mongoose = require('mongoose')

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
const { auth } = require('./middelwares/auth');
const session = require('express-session');
dotenv.config();
let app = express()
let interval;
//const io = require('socket.io')(`${process.env.PORT_SOCKET}`, {cors: {origin: "*"}});
app.use(expressLayouts)
app.set('view engine','ejs')
const sessionsMap = {};
/*
io.on('connection', socket => {


  socket.id = session.userUid;
  async function sendTime() {
    let dataSensor = await sensorFunction.updateSensorsApiByUserSocket(session.userUid);
    if(session.userUid)
      socket.emit('sensorData', {"data": dataSensor, "socketid": session.userUid});
  }
setInterval(sendTime, 5000);
})
*/





app.use(bodyParser.json({ limit: "32mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "32mb", extended: true}));


app.use(cors());
app.use('/admin/*', function (req, res, next) {
   rolePermission.rolePermission(req, res, next);
})

// TODO TEST ROLE-
app.use('/supplier/*', function (req, res, next) {
  rolePermission.rolePermission(req, res, next);
})


app.use(['/sensor/*'], function (req, res, next) {
  rolePermission.rolePermissionOffer(req, res, next);
})

app.use('/', userRouters)
app.use('/', commonRouters)
app.use('/', adminRouters)
app.use('/', supplierRouters)

app.use('/static', express.static(__dirname + '/docs/img'));
app.use('/static', express.static(__dirname + '/docs/img/crop'));
app.use('/static', express.static(__dirname + '/docs/img/soil'));
app.use('/static', express.static(__dirname + '/docs/img/variety'));

app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);


app.get('/', (req, res) => {
  res.send('GET request to homepage')
});

// mongoose.set("strictQuery", false);
// mongoose.connect(
//   process.env.MONGO_URI,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: false
//   },
//   (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Connected to MongoDB");
//     }
//   }
// );

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
  })
  

  module.exports = app;
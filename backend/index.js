const express = require("express");
const router = express.Router();
const expressValidator = require("express-validator");
const cors = require("cors");
const bodyParser = require("body-parser");
const knex = require("./knex/knex");
const dotenv = require("dotenv");
const User = require("./models/User");
const userRouters = require("./routes/user.js");
const commonRouters = require("./routes/common.js");
const adminRouters = require("./routes/admin.js");
const supplierRouters = require("./routes/supplier.js");
const sensorFunction = require("./controllers/common/sensor.js");
const expressLayouts = require("express-ejs-layouts");
const rolePermission = require("./middelwares/rolesPermission.js");
const mongoose = require("mongoose");
const axios = require("axios");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
const { auth } = require("./middelwares/auth");
const session = require("express-session");
const path = require("path");
dotenv.config();
let app = express();
let interval;
//const io = require('socket.io')(`${process.env.PORT_SOCKET}`, {cors: {origin: "*"}});
app.use(expressLayouts);
app.set("view engine", "ejs");
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

app.use(bodyParser.json({ limit: "32mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "32mb", extended: true }));

app.use(cors());
app.use("/admin/*", function (req, res, next) {
  rolePermission.rolePermission(req, res, next);
});

// TODO TEST ROLE-
app.use("/supplier/*", function (req, res, next) {
  rolePermission.rolePermission(req, res, next);
});

app.use(["/sensor/*"], function (req, res, next) {
  rolePermission.rolePermissionOffer(req, res, next);
});

app.use("/", userRouters);
app.use("/", commonRouters);
app.use("/", adminRouters);
app.use("/", supplierRouters);
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use("/static", express.static(__dirname + "/docs/img"));
app.use("/static", express.static(__dirname + "/docs/img/crop"));
app.use("/static", express.static(__dirname + "/docs/img/soil"));
app.use("/static", express.static(__dirname + "/docs/img/variety"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const apiKey =
  "apk.4e8c771435de030fcee7b1aa265ecd24ac0f9eb57ce758a71ac101796dcbc07e";
app.post("/create-polygon", async (req, res) => {
  try {
    const { coordinates } = req.body;
    const response = await axios.post(
      "https://api-connect.eos.com/field-management?api_key=" + apiKey,
      {
        type: "Feature",
        properties: {
          name: "my field",
          group: "my group",
          years_data: [
            {
              crop_type: "Wheat",
              year: 2025,
              sowing_date: "2025-04-20",
            },
          ],
        },
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      },

      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.get("/view-image-field/:fieldEosId", async (req, res) => {
  try {
    const { fieldEosId } = req.params;

    const request = await axios.post(
      "https://api-connect.eos.com/scene-search/for-field/" + fieldEosId,
      {
        params: {
          date_start: "2025-04-1",
          date_end: "2025-04-20",
          data_source: ["sentinel2"],
        },
      },
      {
        headers: {
          // "Content-Type": "text/plain",
          "x-api-key": apiKey,
        },
      }
    );
    console.log("request", request.data);
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let view = null;
    let requestStatus = request.data.status;

    if (request.data.request_id) {
      while (requestStatus !== "success") {
        const response = await axios.get(
          `https://api-connect.eos.com/scene-search/for-field/${fieldEosId}/${request.data.request_id}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        );
        console.log("responseData", response.data);

        if (response.data.status === "success") {
          requestStatus = "success";
          view = response.data.result[0];
          console.log(view);

          break;
        }
        await delay(5000);
      }
    } else {
      view = request.data.result[1];
    }

    console.log("view.data", view);

    const task = await axios.post(
      "https://api-connect.eos.com/field-imagery/indicies/" + fieldEosId,
      {
        params: {
          view_id: view.view_id,
          index: "NDVI",
          format: "png",
        },
        callback_url: "https://test.local",
      },
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    console.log("task", task.data);

    async function waitForImage(fieldEosId, requestId) {
      let status = "created";
      let imageResponse = null;

      while (status !== "done" && status !== "failed") {
        const response = await axios.get(
          `https://api-connect.eos.com/field-imagery/${fieldEosId}/${requestId}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
            responseType: "arraybuffer",
          }
        );

        status = response.data.status;
        console.log("Current status:", status);
        console.log(response.headers["content-type"]);

        if (status !== "created") {
          imageResponse = response;
          break;
        }

        if (status === "failed") {
          throw new Error("Image generation failed.");
        }

        await delay(5000);
      }

      return imageResponse;
    }
    const image = await waitForImage(fieldEosId, task.data.request_id);
    // const base64Image = Buffer.from(image.data).toString("base64");

    // console.log(base64Image);
    // res.json({ image: base64Image });
    const realBuffer = Buffer.from(image.data);
    console.log(realBuffer);
    // res.set('Content-Type', 'image/png');
    console.log(image.data);
    res.send(realBuffer);
    // res.json(image.data);
  } catch (error) {
    res.send(error);
  }
});
app.get("/imageSatteliteEos/:taskId", async (req, res) => {
  try {
    const result = await axios.get(
      `https://api-connect.eos.com/api/gdw/api/${req.params.taskId}?api_key=${apiKey}`
    );
    console.log(result.data);
    res.json(result.data);
  } catch (error) {
    res.send(error);
  }
});

app.get("/", (req, res) => {
  res.send("GET request to homepage");
});

mongoose.set("strictQuery", false);
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  }
);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

module.exports = app;

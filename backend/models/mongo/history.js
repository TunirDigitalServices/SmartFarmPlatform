const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const historySchema = new Schema({
  time: String,
  ref: String,
  temperature: String,
  humidity: String,
  pressure: String,
  altitude : String,
  charge: String,
  adc: String,
  ts: String,
  mv1: String,
  mv2: String,
  mv3: String,
  mv1WithMapping: String,
  mv2WithMapping: String,
  mv3WithMapping: String,
  mv1MappingId: String,
  mv2MappingId: String,
  mv3MappingId: String,
  lat : String,
  lon : String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("History", historySchema, 'mappingDataSensor');
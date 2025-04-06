const HistoryModel = require('../models/mongo/history')
const mongoose = require('mongoose')

exports.getAllHistory = async () => {
    return await HistoryModel.find();
};

exports.createHistory = async (historyData) => {
    return await HistoryModel.create(historyData);
};

exports.createHistoryIfNotExist = async (historyData) => {
    return await HistoryModel.updateOne(
        {
          time : historyData.time,
          ref: historyData.ref
        }, 
         {
            $set: historyData
         },
         {upsert: true}
    )
};

exports.getHistoryById = async (id) => {
    return await HistoryModel.findById(id);
};

exports.updateHistory = async (id, historyData) => {
    return await HistoryModel.findByIdAndUpdate(id, historyData);
};

exports.deleteHistory = async (id) => {
    return await HistoryModel.findByIdAndDelete(id);
};
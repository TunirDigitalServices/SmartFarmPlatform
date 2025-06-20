const { calculBilanHydriqueByField } = require("../controllers/premiumCalcul/calculPremium.js");
const bookshelf = require("./bookshelf.js");
const Crop = require("./Crop.js");

const Croptype = bookshelf.Model.extend({
  tableName: "croptype",
  varieties() {
    return this.hasMany(require("./CropVarieties"));
  },
  parse(response) {
    if (response.all_kc) response.all_kc = JSON.parse(response.all_kc);
    return response;
  },
  format(attributes) {
    if (attributes.all_kc)
      attributes.all_kc = JSON.stringify(attributes.all_kc);
    return attributes;
  },

  initialize() {
    this.on("saving", async (model) => {
      if (!model.id) return;

      try {
        // Step 1: Get the existing model
        const existing = await model.constructor
          .where({ id: model.id })
          .fetch({ require: false });

        if (!existing) return;
        // console.log(existing.toJSON(), "existing");

        // Step 2: Check if all_kc has changed
        const oldKc = existing.get("all_kc");
        const newKc = model.get("all_kc");

        const kcChanged = JSON.stringify(oldKc) !== JSON.stringify(newKc);

        if (!kcChanged) return;

        // Step 4: Get all crops that use the same variety name
        const matchingCrops = await Crop.query((qb) => {
          qb.innerJoin(
            "croptype",
            "crop.croptype_id",
            "croptype.id"
          ).where("croptype.id", model.id)
           .andWhere("crop.is_kc_modified", false);
        }).fetchAll({ require: false });

        // console.log(matchingCrops.toJSON(), "matching");

        if (!matchingCrops || matchingCrops.length === 0) {
          console.warn("⚠️ No crops found using the new variety.");
          return;
        }

        // Step 5: Extract unique field_ids from the matching crops
        const fieldIds = matchingCrops
          .toJSON()
          .map((crop) => crop.field_id)
          .filter((id, index, self) => id && self.indexOf(id) === index);

        if (fieldIds.length === 0) {
          console.log("⚠️ No valid fields found to recalculate C-T.");
          return;
        }

        console.log(
          "Recalculating fields for crop variety change C-T:",
          fieldIds
        );
        let successfulFields = [];
        let failedFields = [];

        await Promise.all(
          fieldIds.map((fieldId) => {
            return new Promise(async (resolve) => {
              const mockReq = {
                body: {
                  fieldId,
                  userId: 75,
                },
              };

              let statusCode;
              let responseData;

              const mockRes = {
                status: (code) => {
                  statusCode = code;
                  return {
                    json: (data) => {
                      responseData = data;
                      return data;
                    },
                  };
                },
              };

              await calculBilanHydriqueByField(mockReq, mockRes);

              const isFailure =
                statusCode !== 201 ||
                !responseData?.data ||
                responseData?.data?.length === 0;

              if (isFailure) {
                failedFields.push(fieldId);
                console.warn(
                  `❌ Field ${fieldId} skipped or failed:`,
                  responseData?.message || "No data"
                );
              } else {
                successfulFields.push(fieldId);
              }

              resolve();
            });
          })
        );

        console.log("✅ Successfully recalculated fields C-T:", successfulFields);
        console.log("❌ Failed to recalculate fields C-T:", failedFields);
        model._recalculationResult = {
          successfulFields,
          failedFields,
        };
      } catch (err) {
        console.error("❌ Error during recalculation C-T:", err);
      }
    });
  },
});

module.exports = Croptype;

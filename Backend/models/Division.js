// backend/models/Division.js
const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    organisationalUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganisationalUnit",
      required: true,
    },
    credentials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credential",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Division", divisionSchema);

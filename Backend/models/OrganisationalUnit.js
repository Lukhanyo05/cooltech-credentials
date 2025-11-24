// backend/models/OrganisationalUnit.js
const mongoose = require("mongoose");

const organisationalUnitSchema = new mongoose.Schema(
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
    divisions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Division",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrganisationalUnit", organisationalUnitSchema);

const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect");
  });

const LogInSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const RegistrationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  roll: {
    type: String
  },
  year: {
    type: String
  },
  branch: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true
  }
});

const FoundItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  item: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: String,
  date: {
    type: Date,
    required: true
  },
  rollno: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  message: String,
  image: {
    data: Buffer,
    contentType: String
  }
});

const LostItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  item: {
    type: String,
    required: true
  },
  rollno: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: String,
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  message: String,
  reward: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

const lostClickSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  itemid: {
    type: String,
    required: true
  },
  proof: {
    data: Buffer,
    contentType: String, // Assuming you'll store file paths or URLs
  },
  describe: String // Assuming optional field
});

const foundClickSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  itemid: {
    type: String,
    required: true
  },
  proof: {
    data: Buffer,
    contentType: String, // Assuming you'll store file paths or URLs
  },
  describe: String // Assuming optional field
});

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: true
  }
  // Assuming optional field
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
const FoundClick = mongoose.model("FoundClick", foundClickSchema);
const LostClick = mongoose.model("LostClick", lostClickSchema);
const LostItem = mongoose.model("LostItem", LostItemSchema);
const FoundItem = mongoose.model("FoundItem", FoundItemSchema);
const Registration = mongoose.model("Registration", RegistrationSchema);
const collection = mongoose.model("collection", LogInSchema);

module.exports = { Registration, collection, FoundItem, LostItem, LostClick, FoundClick, ContactUs };

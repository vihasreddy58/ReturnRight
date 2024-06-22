const express = require("express");
const app = express();
require('dotenv').config();
const port = 3000;
const fs = require('fs');
const path = require("path");
const { Registration, collection,FoundItem,LostItem ,LostClick,FoundClick,ContactUs} = require("./src/mongodb");
const multer =require('multer')

const storage=multer.diskStorage({
  destination:function(req,file,cb){
    return cb(null,"./uploads");
  },
  filename: function(req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
}
})

const upload=multer({storage});
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const session = require('express-session');
const crypto = require('crypto');
// Generate a random string of 32 characters
const generateSecret = () => {
  return crypto.randomBytes(16).toString('hex');
};
// Use the generated secret for your express-session configuration
const sessionSecret = generateSecret();
// Configure express-session middleware with the generated secret
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use((req, res, next) => {
  res.locals.page = ""; // Initialize page variable
  next();
});
app.get("/", (req, res) => {
  res.locals.page = "login";
  res.render("login");
});

// Route for rendering registration page
app.get("/register", (req, res) => {
  res.locals.page = "register";
  res.render("register");
});
app.post("/register", async (req, res) => {
  console.log(req.body);
  const data = {
    username: req.body.username,
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    roll: req.body.roll,
    year: req.body.year,
    branch: req.body.branch,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  await Registration.insertMany([data]);

  res.render("home");
});
app.post("/login", async (req, res) => {
  try {
    const check = await Registration.findOne({ username: req.body.username });
    if (check) {
      // Check if user exists
      if (check.password === req.body.password) {
        req.session.user=check;
        res.render("home");
      } else {
        res.send("Wrong password");
      }
    } else {
      res.send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});

app.post('/foundform', upload.single('image'), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const foundItemData = {
      name: req.body.name,
      email: req.body.email,
      item: req.body.item,
      category: req.body.category,
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      rollno:req.body.rollno,
      message: req.body.message,
      image: {
        data: fs.readFileSync(path.join(__dirname, '/uploads/' + req.file.filename)),
        contentType: 'image/png' // Change as per your file type
      }
    };

    const foundItem = new FoundItem(foundItemData);
    await foundItem.save();

    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});
app.get("/founditems", async (req, res) => {
  try {
    const foundItems = await FoundItem.find();
    res.render("founditems", { foundItems ,loggedInUser:req.session.user}); // Make sure you're passing `foundItems`, not `foundItem`
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request");
  }
});
app.post("/deleteFoundItem", async (req, res) => {
  try {
      const itemId = req.body.itemId;
      // Check if the logged-in user is the owner of the item before deleting
      const foundItem = await FoundItem.findById(itemId);
      if (!foundItem) {
          return res.status(404).send("Item not found");
      }
      // Check ownership
      if (foundItem.name !== req.session.user.username) {
          return res.status(403).send("Unauthorized to delete this item");
      }
      // If ownership is verified, delete the item
      await FoundItem.findByIdAndDelete(itemId);
      res.redirect("/founditems");
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while processing your request");
  }
});

app.post('/lostform', upload.single('image'), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const lostItemData = {
      name: req.body.name,
      email: req.body.email,
      item: req.body.item,
      category: req.body.category,
      location: req.body.location,
      rollno:req.body.rollno,
      date: req.body.date,
      time: req.body.time,
      reward:req.body.reward,
      message: req.body.message,
      image: {
        data: fs.readFileSync(path.join(__dirname, '/uploads/' + req.file.filename)),
        contentType: 'image/png' // Change as per your file type
      }
    };

    const lostItem = new LostItem(lostItemData);
    await lostItem.save();

    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});
app.get("/lostitems", async (req, res) => {
  try {
    const lostItems = await LostItem.find();
    res.render("lostitems", { lostItems, loggedInUser: req.session.user}); // Make sure you're passing `foundItems`, not `foundItem`
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request");
  }
});
app.post("/deleteLostItem", async (req, res) => {
  try {
      const itemId = req.body.itemId;
      // Check if the logged-in user is the owner of the item before deleting
      const lostItem = await LostItem.findById(itemId);
      if (!lostItem) {
          return res.status(404).send("Item not found");
      }
      // Check ownership
      if (lostItem.name !== req.session.user.username) {
          return res.status(403).send("Unauthorized to delete this item");
      }
      // If ownership is verified, delete the item
      await LostItem.findByIdAndDelete(itemId);
      res.redirect("/lostitems");
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while processing your request");
  }
});

app.post('/lostclick', upload.single('proof'), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const lostClickData = {
      name: req.body.name,
      email: req.body.email,
      itemid:req.body.itemid,
      proof: {
        data: fs.readFileSync(path.join(__dirname, '/uploads/' + req.file.filename)),
        contentType: 'image/png' // Change as per your file type
      },
      describe: req.body.describe
    };

    const lostClick = new LostClick(lostClickData);
    await lostClick.save();
    
    // Finding the email associated with the found item
    const foundItem = await FoundItem.findOne({rollno:req.body.itemid});
    const mailid = foundItem ? foundItem.email : null;
    console.log(mailid);
    
    // Check if mailid is found before proceeding
    if (!mailid) {
      console.log("Mailid not found");
      res.send("Mailid not found");
      return;
    }

    // Send email to the user who posted the found item
    const mailOptions = {
      from: req.body.email, // your email
      to: mailid, // recipient's email
      subject: 'Lost Item Reported',
      text: `Your lost item has been reported successfully. Here are the details:
        Name: ${req.body.name}
        Email: ${req.body.email}
        Description: ${req.body.describe}`,
      attachments: [
        {
          filename: req.file.originalname,
          content: fs.createReadStream(req.file.path)
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.send('Error occurred while sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect("/home");
      }
    });
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});
app.post('/foundclick', upload.single('proof'), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const foundClickData = {
      name: req.body.name,
      email: req.body.email,
      itemid:req.body.itemid,
      proof: {
        data: fs.readFileSync(path.join(__dirname, '/uploads/' + req.file.filename)),
        contentType: 'image/png' // Change as per your file type
      },
      describe: req.body.describe
    };

    const foundClick = new FoundClick(foundClickData);
    await foundClick.save();
    
    // Finding the email associated with the found item
    const lostItem = await LostItem.findOne({rollno:req.body.itemid});
    const mailid = lostItem ? lostItem.email : null;
    console.log(mailid);
    
    // Check if mailid is found before proceeding
    if (!mailid) {
      console.log("Mailid not found");
      res.send("Mailid not found");
      return;
    }

    // Send email to the user who posted the found item
    const mailOptions = {
      from: req.body.email, // your email
      to: mailid, // recipient's email
      subject: 'Lost Item Reported',
      text: `Your lost item has been reported successfully. Here are the details:
        Name: ${req.body.name}
        Email: ${req.body.email}
        Description: ${req.body.describe}`,
      attachments: [
        {
          filename: req.file.originalname,
          content: fs.createReadStream(req.file.path)
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.send('Error occurred while sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect("/home");
      }
    });
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});
app.post('/contactus', async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const contactUsData = {
      name: req.body.name,
      email: req.body.email,
      phone:req.body.phone,
      subject:req.body.subject,
      query: req.body.query,
    };

    const contactUs = new ContactUs(contactUsData);
    await contactUs.save();
    

    // Send email to the user who posted the found item
    const mailOptions = {
      from: req.body.email, // your email
      to: user, // recipient's email
      subject: `${req.body.subject}`,
      text: `
        Name: ${req.body.name}
        Email: ${req.body.email}
        Phone: ${req.body.phone}
        Query: ${req.body.query}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.send('Error occurred while sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect("/home");
      }
    });
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request");
  }
});

// Route for rendering home page
app.get("/home", (req, res) => {
  console.log("Rendering home page");
  res.locals.page = "home";
  res.render("home");
});

// Route for rendering navbar
app.get("/navbar", (req, res) => {
  res.locals.page = "navbar";
  res.render("navbar");
});

// Route for rendering footer
app.get("/footer", (req, res) => {
  res.locals.page = "footer";
  res.render("footer");
});

// Route for rendering contact us page
app.get("/contactus", (req, res) => {
  res.locals.page = "contactus";
  res.render("contactus");
});

// Route for rendering about us page
app.get("/aboutus", (req, res) => {
  res.locals.page = "aboutus";
  res.render("aboutus");
});

// Route for rendering found items page
app.get("/founditems", (req, res) => {
  res.locals.page = "founditems";
  res.render("founditems");
});


// Route for rendering found form page
app.get("/foundform", (req, res) => {
  res.locals.page = "foundform";
  res.render("foundform");
});

// Route for rendering lost form page
app.get("/lostform", (req, res) => {
  res.locals.page = "lostform";
  res.render("lostform");
});

// Start the server once the collection is ready
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

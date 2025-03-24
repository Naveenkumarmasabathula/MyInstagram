    require("dotenv").config(); // Load environment variables

    const express = require("express");
    const app = express();
    const path = require("path");
    const methodOverride = require("method-override");
    const { v4: uuidv4 } = require("uuid");
    const multer = require("multer");
    const { CloudinaryStorage } = require("multer-storage-cloudinary");
    const cloudinary = require("cloudinary").v2;
    const cors = require("cors");
    app.use(cors()); // Enable CORS for all routes


    const port = process.env.PORT || 3000;

    // Cloudinary Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Multer-Cloudinary Storage
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: "accounts", // Cloudinary folder name
            format: async (req, file) => "png", // Convert all images to PNG
            public_id: (req, file) => uuidv4(),
        },
    });

    const upload = multer({ storage: storage });

    // Middleware setup
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));

    // View engine setup
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Sample data
    let accounts = [
        { id: uuidv4(), username: "Naveen", post_count: 30, followers_count: 400, following_count: 300, content: "Consistency is important!", profile_pic: "/channel-11.jpeg" },
        { id: uuidv4(), username: "Sam", post_count: 40, followers_count: 100, following_count: 200, content: "Hard work is important!", profile_pic: "/channel-9.jpeg" },
        { id: uuidv4(), username: "Bill", post_count: 90, followers_count: 4000, following_count: 100, content: "Discipline is important!", profile_pic: "/channel-3.jpeg" },
    ];

    // Routes
    app.get("/", (req, res) => res.redirect("/accounts"));

    app.get("/accounts", (req, res) => {
        res.render("index", { accounts });
    });

    app.get("/accounts/new", (req, res) => res.render("new"));

    app.post("/accounts", upload.single("profile_pic"), (req, res) => {
        let newAccount = {
            id: uuidv4(),
            username: req.body.username,
            post_count: req.body.post_count,
            followers_count: req.body.followers_count,
            following_count: req.body.following_count,
            content: req.body.content,
            profile_pic: req.file? req.file.path : "https://res.cloudinary.com/dt7xsczbg/image/upload/v1742765087/accounts/f3c73723-da49-4ed7-8f21-ce00c8fdd638.png" , // Cloudinary URL
        };
        // console.log(newAccount);
        accounts.push(newAccount);
        res.redirect("/accounts");
    });

    app.get("/accounts/:id", (req, res) => {
        let account = accounts.find(a => a.id === req.params.id);
        account ? res.render("show", { account }) : res.redirect("/accounts");
    });

    app.get("/accounts/:id/edit", (req, res) => {
        let account = accounts.find(a => a.id === req.params.id);
        account ? res.render("edit", { account }) : res.redirect("/accounts");
    });

    app.patch("/accounts/:id", (req, res) => {
        let account = accounts.find(a => a.id === req.params.id);
        if (account) account.content = req.body.content;
        res.redirect("/accounts");
    });

    app.delete("/accounts/:id", (req, res) => {
        accounts = accounts.filter(a => a.id !== req.params.id);
        res.redirect("/accounts");
    });

    // Start server
    app.listen(port, () => console.log(`Server running on port ${port}`));

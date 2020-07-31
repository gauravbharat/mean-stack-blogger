const express = require("express");
const multer = require("multer"); // package to extract incoming files, can't be done by body-parser

const router = express.Router();
const Post = require("../models/post.model");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

// Store incoming files on the local system
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }

    // return the file save folder path, relative to server.js
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    // Replace empty spaces with a hyphen
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const extension = MIME_TYPE_MAP[file.mimetype];
    // return the filename, 1st argument is null for no error
    cb(null, `${name}-${Date.now()}.${extension}`);
  },
});

router.post(
  "",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = `${req.protocol}://${req.get("host")}`;

    //.body is added by body-parser
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${req.file.filename}`,
    });

    post
      .save()
      .then((createdPost) => {
        res.status(201).json({
          message: "Post added successfully",
          post: {
            ...createdPost,
            id: createdPost._id,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Server error creating post",
        });
      });
  }
);

router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    // Update the old image file name when NOT updating post with a new image
    let imagePath = req.body.imagePath;

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}`;
      imagePath = `${url}/images/${req.file.filename}`;
    }

    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath,
    });

    Post.updateOne({ _id: req.params.id }, post)
      .then((result) => {
        res.status(200).json({ message: "Update successful!" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Server error updating post." });
      });
  }
);

router.get("", (req, res, next) => {
  // Get the pagination query parameters
  // Prefixing + operator to a string converts its type to Number
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((posts) => {
      fetchedPosts = posts;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Server error fetching posts",
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});

module.exports = router;

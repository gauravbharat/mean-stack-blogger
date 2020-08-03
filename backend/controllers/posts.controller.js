const Post = require('../models/post.model');

let cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getCloudinaryImagePublicId = (strPath) => {
  // Extract Cloudinary image public Id from the path
  if (strPath) {
    let slice1 = strPath.slice(strPath.lastIndexOf('/') + 1);
    let publicId = slice1.slice(0, slice1.lastIndexOf('.'));
    return publicId;
  }
  return null;
};

exports.addPost = async (req, res, next) => {
  let result;

  try {
    result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'mean-stack-app',
    });
  } catch (error) {
    console.log('cloudinary_new_post', error);
    return res
      .status(500)
      .json({ message: 'Error uploading image on cloud storage!' });
  }

  //.body is added by body-parser
  const post = await new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: result.secure_url,
    creator: req.userData.userId,
  });

  await post
    .save()
    .then((createdPost) => {
      res.status(201).json({
        message: 'Post added successfully',
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Server error creating post',
      });
    });
};

exports.updatePost = async (req, res, next) => {
  // Update the old image file name when NOT updating post with a new image
  let imagePath = req.body.imagePath;

  if (req.file.filename) {
    try {
      let result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'mean-stack-app',
      });

      imagePath = result.secure_url;
    } catch (error) {
      console.log('cloudinary_edit_post', error);
      return res
        .status(500)
        .json({ message: 'Error uploading image on cloud storage!' });
    }
  }

  const post = await new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId,
  });

  await Post.updateOne(
    { _id: req.params.id, creator: req.userData.userId },
    post
  )
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Update successful!' });
      } else {
        res.status(401).json({ message: 'Not authorized!' });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Couldn't update post!" });
    });
};

exports.getPosts = (req, res, next) => {
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
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching posts failed!',
      });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching post failed!',
      });
    });
};

exports.deletePost = async (req, res, next) => {
  let imagePath;

  const post = await Post.findById(req.params.id);
  if (post) {
    imagePath = post.imagePath;
  }

  await Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Post deleted!' });
      } else {
        res.status(401).json({ message: 'Not authorized!' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error deleting post!',
      });
    });

  // destroy image uploaded on Cloudinary
  try {
    if (imagePath) {
      let result = await cloudinary.v2.uploader.destroy(
        'mean-stack-app/' + getCloudinaryImagePublicId(imagePath)
      );
    }
  } catch (error) {
    console.log('cloudinary_delete_post', error);
  }
};

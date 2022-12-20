const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");

//get the product by its id
exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          err: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

//create the new product and save it to the database
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  //This will display the extension of file
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "problem to upload the img",
      });
    }

    //destructure the fields
    const { name, description, price, category, stock } = fields;

    //Restrictions on the product fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Include all the fields",
      });
    }

    let product = new Product(fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          message: "file size is too large",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.filepath);
      product.photo.contentType = file.photo.mimetype;
    }

    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          err: "Failed to save the img in DB",
        });
      }

      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  //for making application faster
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

//delete controller

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        err: "Failed to delete the product",
      });
    }
    res.json({
      msg: "Product is deleted successfully",
      deletedProduct,
    });
  });
};

//update controller
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  //This will display the extension of file
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "problem to upload the img",
      });
    }

    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          message: "file size is too large",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.filepath);
      product.photo.contentType = file.photo.mimetype;
    }

    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          err: "Updation in DB is failed",
        });
      }

      res.json(product);
    });
  });
};

//listing controller
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          err: "No product is found",
        });
      }
      res.json(products);
    });
};

//updating the inventory
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        err: " Bulk opertaion failed",
      });
    }

    next();
  });
};

//getAllUniqueCategories

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        err: "No category found",
      });
    }
    res.json(category);
  });
};

var $hDP3I$express = require("express");
require("morgan");
var $hDP3I$cors = require("cors");
var $hDP3I$dotenv = require("dotenv");
var $hDP3I$helmet = require("helmet");
var $hDP3I$cookieparser = require("cookie-parser");
var $hDP3I$expressmongosanitize = require("express-mongo-sanitize");
var $hDP3I$xssclean = require("xss-clean");
var $hDP3I$hpp = require("hpp");
var $hDP3I$compression = require("compression");
var $hDP3I$expressratelimit = require("express-rate-limit");
var $hDP3I$mongoose = require("mongoose");
var $hDP3I$bcrypt = require("bcrypt");
var $hDP3I$validator = require("validator");
var $hDP3I$util = require("util");
var $hDP3I$jsonwebtoken = require("jsonwebtoken");












var $6e01d007996f5575$exports = {};
var $e203200498571e93$exports = {};
class $e203200498571e93$var$AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? "error" : "fail";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
$e203200498571e93$exports = $e203200498571e93$var$AppError;


const $6e01d007996f5575$var$handleJWTError = ()=>new $e203200498571e93$exports("Invalid token, please log in again", 401);
const $6e01d007996f5575$var$handleJWTExpiredError = ()=>new $e203200498571e93$exports("Your token has expired. Please log in again", 401);
const $6e01d007996f5575$var$handleCastErrorDB = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new $e203200498571e93$exports(message, 400);
};
const $6e01d007996f5575$var$handleDuplicateFieldsDB = (err)=>{
    const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value.`;
    return new $e203200498571e93$exports(message, 400);
};
const $6e01d007996f5575$var$handleValidationErrorDB = (error)=>{
    const validationErrors = Object.values(error.errors).map((err)=>err.message).join("//");
    const message = `Provided data is not valid: ${validationErrors}`;
    return new $e203200498571e93$exports(message, 400);
};
const $6e01d007996f5575$var$sendProdError = (error, response)=>{
    // only errors we could predict
    if (error.isOperational) response.status(error.statusCode).json({
        status: error.status,
        message: error.message
    });
    else response.status(500).json({
        status: "Error",
        message: "An unexpected error ocurred"
    });
};
const $6e01d007996f5575$var$sendDevError = (error, response)=>{
    response.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack
    });
};
$6e01d007996f5575$exports = (error, request, response, next)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    {
        // we should not change arguments
        let errorObject = {
            ...error
        };
        // Below code snapshot comes from Jonas Schmedtmann's NodeJS tutorial on udemy.
        // Every error connected with our DB data will have its own name or code:
        if (errorObject.name === "ValidationError") errorObject = $6e01d007996f5575$var$handleValidationErrorDB(errorObject);
        if (errorObject.name === "CastError") errorObject = $6e01d007996f5575$var$handleCastErrorDB(errorObject);
        if (errorObject.code === 11000) errorObject = $6e01d007996f5575$var$handleDuplicateFieldsDB(errorObject);
        if (errorObject.name === "JsonWebTokenError") errorObject = $6e01d007996f5575$var$handleJWTError();
        if (errorObject.name === "TokenExpiredError") errorObject = $6e01d007996f5575$var$handleJWTExpiredError();
        $6e01d007996f5575$var$sendProdError(errorObject, response);
    }
    next();
};


var $d176c6f5e4f47181$exports = {};

var $9d2c5b801713c0c3$export$3493b8991d49f558;
var $ca4b57b91abcd647$exports = {};

const { Schema: $ca4b57b91abcd647$var$Schema , model: $ca4b57b91abcd647$var$model  } = $hDP3I$mongoose;


const $ca4b57b91abcd647$var$userSchema = new $ca4b57b91abcd647$var$Schema({
    name: {
        type: String,
        required: [
            true,
            "User must have a name"
        ],
        unique: true
    },
    email: {
        type: String,
        required: [
            true,
            "User must have an email"
        ],
        unique: true,
        lowercase: true,
        validate: [
            $hDP3I$validator.isEmail,
            "Please provide a correct email"
        ]
    },
    password: {
        type: String,
        required: [
            true,
            "User must have a password"
        ],
        minLength: 8,
        select: false
    },
    // ========== Works only with save() method ==============
    passwordConfirm: {
        type: String,
        required: [
            true,
            "Please confirm your password"
        ],
        minLength: 8,
        validate: {
            validator: function(passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: "Provided passwords are different."
        }
    },
    role: {
        type: String,
        default: "user",
        enum: [
            "user",
            "admin"
        ]
    },
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetToken: String
});
// create method invokes save method
$ca4b57b91abcd647$var$userSchema.pre("save", async function(next) {
    // checking if password is not modified
    if (this.isModified("password")) {
        // hashing password before saving to DB,
        this.password = await $hDP3I$bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});
$ca4b57b91abcd647$var$userSchema.methods.checkIfPasswordIsCorrect = async function(passwordFromUser) {
    return await $hDP3I$bcrypt.compare(passwordFromUser, this.password);
};
$ca4b57b91abcd647$var$userSchema.methods.passwordChangedAfterJWTWasIssued = async function(JWTIssueDate) {
    if (this.passwordChangedAt) {
        const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTIssueDate < changedAt;
    }
    // Password has not been changed
    return false;
};
const $ca4b57b91abcd647$var$User = $ca4b57b91abcd647$var$model("User", $ca4b57b91abcd647$var$userSchema);
$ca4b57b91abcd647$exports = $ca4b57b91abcd647$var$User;



var $9e7a345a81ca5826$exports = {};
$9e7a345a81ca5826$exports = (fn)=>{
    return (request, response, next)=>{
        fn(request, response, next).catch(next);
    };
};


$9d2c5b801713c0c3$export$3493b8991d49f558 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { body: body  } = request;
    const user = await $ca4b57b91abcd647$exports.create({
        name: body.name,
        email: body.email,
        password: body.password,
        passwordConfirm: body.passwordConfirm
    });
    if (!user) return response.status(400).json({
        status: "error",
        message: "An error ocurred"
    });
    response.status(200).json({
        status: "success",
        data: {
            user: user
        }
    });
});


var $d176c6f5e4f47181$require$createUser = $9d2c5b801713c0c3$export$3493b8991d49f558;
var $ce487c6e3030a219$export$7200a869094fec36;
var $ce487c6e3030a219$export$596d806903d1f59e;
// The following function checks if user is logged in with a valid token.
var $ce487c6e3030a219$export$eda7ca9e36571553;
var $ce487c6e3030a219$export$e1bac762c84d3b0c;

var $ce487c6e3030a219$require$promisify = $hDP3I$util.promisify;




const $ce487c6e3030a219$var$createTokenAndSendResponse = (response, statusCode, user, message = "")=>{
    const token = $hDP3I$jsonwebtoken.sign({
        id: user.id
    }, undefined, {
        expiresIn: undefined
    });
    user.password = undefined;
    const jsonToBeSent = {
        status: "success",
        message: message,
        token: token,
        data: {
            user: user
        }
    };
    if (!message) delete jsonToBeSent.message;
    const cookieOptions = {
        expires: new Date(Date.now() + NaN),
        httpOnly: true
    };
    cookieOptions.secure = true;
    response.cookie("jwt", token, cookieOptions);
    response.status(statusCode).json(jsonToBeSent);
};
$ce487c6e3030a219$export$7200a869094fec36 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { body: body  } = request;
    const addedUser = await $ca4b57b91abcd647$exports.create({
        name: body.name,
        email: body.email,
        password: body.password,
        passwordConfirm: body.passwordConfirm
    });
    $ce487c6e3030a219$var$createTokenAndSendResponse(response, 201, addedUser, "User has been successfuly registered.");
});
$ce487c6e3030a219$export$596d806903d1f59e = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { email: email , password: password  } = request.body;
    // 1) Check if email and password are included in request body:
    if (!email) next(new $e203200498571e93$exports("Missing email. Enter it and try again", 400));
    if (!password) next(new $e203200498571e93$exports("Missing password. Enter it and try again", 400));
    // 2) Get user and check password
    const user = await $ca4b57b91abcd647$exports.findOne({
        email: email
    }).select("+password");
    // User does not exist in DB or password is incorrect
    if (!user || !await user.checkIfPasswordIsCorrect(password)) next(new $e203200498571e93$exports("Incorrect email or password", 401));
    // If compilator reached this point --> user inputed correct data
    $ce487c6e3030a219$var$createTokenAndSendResponse(response, 200, user, "User has been correctly logged in.");
});
$ce487c6e3030a219$export$eda7ca9e36571553 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    // 1) Get token
    const { authorization: authorization  } = request.headers;
    const token = authorization.split(" ")[1];
    // if (!token) return next(new AppError('You are not logged in.', 401));
    // 2) Token verification. We have to promisify it, because decoding can take some time
    const decodedToken = await $ce487c6e3030a219$require$promisify($hDP3I$jsonwebtoken.verify)(token, undefined);
    // 3) Check if user still exists:
    const user = await $ca4b57b91abcd647$exports.findById(decodedToken.id);
    if (!user) next(new $e203200498571e93$exports("This user no loger exist", 401));
    // 4) Check if user has changed password since JWT was issued
    if (await user.passwordChangedAfterJWTWasIssued(decodedToken.iat)) return next(new $e203200498571e93$exports("User has recently changed password. Log in and try again"));
    // if compiler reached this point --> user is logged in.
    // Next middleware functions fill have access to currently logged in user.
    request.user = user;
    next();
});
$ce487c6e3030a219$export$e1bac762c84d3b0c = (...authorizedRoles)=>(request, response, next)=>{
        const { role: role  } = request.user;
        if (!authorizedRoles.includes(role)) return next(new $e203200498571e93$exports("You do not have permission to perform this aciton"));
        // user is authorized and have access to protected actions.
        next();
    };


var $d176c6f5e4f47181$require$login = $ce487c6e3030a219$export$596d806903d1f59e;
var $d176c6f5e4f47181$require$signup = $ce487c6e3030a219$export$7200a869094fec36;

var $d176c6f5e4f47181$require$protect = $ce487c6e3030a219$export$eda7ca9e36571553;
var $d176c6f5e4f47181$require$restrictTo = $ce487c6e3030a219$export$e1bac762c84d3b0c;
const $d176c6f5e4f47181$var$router = $hDP3I$express.Router();
$d176c6f5e4f47181$var$router.route("/signup").post($d176c6f5e4f47181$require$signup);
$d176c6f5e4f47181$var$router.route("/login").post($d176c6f5e4f47181$require$login);
$d176c6f5e4f47181$var$router.route("/").post($d176c6f5e4f47181$require$protect, $d176c6f5e4f47181$require$restrictTo("admin"), $d176c6f5e4f47181$require$createUser);
$d176c6f5e4f47181$exports = $d176c6f5e4f47181$var$router;


var $e7da4ce74fe64e5c$exports = {};

var $332990dbc264a963$export$8d8542dbbc23fe1a;
var $332990dbc264a963$export$f92dfeb71e9bb569;
var $332990dbc264a963$export$15b7d0c192d0aa5d;
var $332990dbc264a963$export$1f768fd5b3313118;
var $332990dbc264a963$export$72b8c6d38aa6195b;
var $332990dbc264a963$export$c9cdcc7cfdf69384;


var $c2fac098a6eb75b4$exports = {};

var $c2fac098a6eb75b4$require$model = $hDP3I$mongoose.model;
var $c2fac098a6eb75b4$require$Schema = $hDP3I$mongoose.Schema;
const $c2fac098a6eb75b4$var$itemsModel = new $c2fac098a6eb75b4$require$Schema({
    name: {
        type: String,
        required: [
            true,
            "An Item must have a name"
        ],
        unique: true,
        trim: true,
        maxLength: [
            30,
            "An item name must have less or equal than 30 characters"
        ],
        minLength: [
            3,
            "An item name must have at least 3 characters"
        ]
    },
    itemType: {
        type: String,
        required: [
            true,
            "An Item must have a type"
        ],
        lowerCase: true,
        enum: [
            "pen",
            "printer",
            "tractor",
            "battery",
            "window",
            "computer",
            "office space", 
        ]
    },
    amount: {
        type: Number,
        required: [
            true,
            "An Item must have an amount"
        ],
        min: 1,
        max: 10000
    },
    description: {
        type: String,
        required: [
            true,
            "An Item must have a description"
        ],
        trim: true
    },
    dateAdded: Date
});
$c2fac098a6eb75b4$var$itemsModel.pre("save", function(next) {
    this.dateAdded = Date.now();
    next();
});
const $c2fac098a6eb75b4$var$Items = $c2fac098a6eb75b4$require$model("Items", $c2fac098a6eb75b4$var$itemsModel);
$c2fac098a6eb75b4$exports = $c2fac098a6eb75b4$var$Items;


$332990dbc264a963$export$8d8542dbbc23fe1a = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { itemId: itemId  } = request.params;
    const deletedItem = await $c2fac098a6eb75b4$exports.findByIdAndDelete(itemId);
    if (!deletedItem) next(new $e203200498571e93$exports("Could not find that item", 404));
    response.status(204).json({
        status: "success",
        message: "Item has been successfuly deleted"
    });
});
$332990dbc264a963$export$f92dfeb71e9bb569 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { itemId: itemId  } = request.params;
    const item = await $c2fac098a6eb75b4$exports.findById(itemId);
    if (!item) next(new $e203200498571e93$exports("Could not find that item", 404));
    response.status(200).json({
        status: "success",
        data: {
            item: item
        }
    });
});
$332990dbc264a963$export$15b7d0c192d0aa5d = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const items = await $c2fac098a6eb75b4$exports.find();
    response.status(200).json({
        status: "success",
        numOfItems: items.length,
        data: {
            items: items
        }
    });
});
$332990dbc264a963$export$1f768fd5b3313118 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { name: name , amount: amount , description: description , dateAdded: dateAdded , itemType: itemType  } = request.body;
    const item = await $c2fac098a6eb75b4$exports.create({
        itemType: itemType,
        name: name,
        amount: amount,
        description: description,
        dateAdded: dateAdded
    });
    response.status(201).json({
        status: "success",
        data: {
            item: item
        }
    });
});
$332990dbc264a963$export$72b8c6d38aa6195b = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { itemId: itemId  } = request.params;
    const { body: newValues  } = request;
    if (!Object.keys(newValues).length) return next(new $e203200498571e93$exports("Fill in at least one field", 400));
    const updatedItem = await $c2fac098a6eb75b4$exports.findByIdAndUpdate(itemId, newValues);
    if (!updatedItem) next(new $e203200498571e93$exports("Item with that ID does not exist.", 404));
    response.status(200).json({
        status: "success",
        message: "Item has been successfuly updated",
        data: {
            updatedItem: updatedItem
        }
    });
});
$332990dbc264a963$export$c9cdcc7cfdf69384 = $9e7a345a81ca5826$exports(async (request, response, next)=>{
    const { itemType: itemType  } = request.params;
    const items = await $c2fac098a6eb75b4$exports.find({
        itemType: itemType
    });
    if (!items.length) return next(new $e203200498571e93$exports("Could not find this type of items", 400));
    response.status(200).json({
        status: "success",
        itemsFound: items.length,
        data: {
            items: items
        }
    });
});


var $e7da4ce74fe64e5c$require$getAllItems = $332990dbc264a963$export$15b7d0c192d0aa5d;
var $e7da4ce74fe64e5c$require$createItem = $332990dbc264a963$export$1f768fd5b3313118;
var $e7da4ce74fe64e5c$require$updateItem = $332990dbc264a963$export$72b8c6d38aa6195b;
var $e7da4ce74fe64e5c$require$getOneTypeOfItems = $332990dbc264a963$export$c9cdcc7cfdf69384;
var $e7da4ce74fe64e5c$require$getItem = $332990dbc264a963$export$f92dfeb71e9bb569;
var $e7da4ce74fe64e5c$require$deleteItem = $332990dbc264a963$export$8d8542dbbc23fe1a;

var $e7da4ce74fe64e5c$require$protect = $ce487c6e3030a219$export$eda7ca9e36571553;
var $e7da4ce74fe64e5c$require$restrictTo = $ce487c6e3030a219$export$e1bac762c84d3b0c;
const $e7da4ce74fe64e5c$var$router = $hDP3I$express.Router();
$e7da4ce74fe64e5c$var$router.use($e7da4ce74fe64e5c$require$protect);
$e7da4ce74fe64e5c$var$router.route("/").get($e7da4ce74fe64e5c$require$getAllItems).post($e7da4ce74fe64e5c$require$restrictTo("admin"), $e7da4ce74fe64e5c$require$createItem);
$e7da4ce74fe64e5c$var$router.route("/:itemId").get($e7da4ce74fe64e5c$require$getItem).patch($e7da4ce74fe64e5c$require$restrictTo("admin"), $e7da4ce74fe64e5c$require$updateItem).delete($e7da4ce74fe64e5c$require$restrictTo("admin"), $e7da4ce74fe64e5c$require$deleteItem);
$e7da4ce74fe64e5c$var$router.route("/item/:itemType").get($e7da4ce74fe64e5c$require$getOneTypeOfItems);
$e7da4ce74fe64e5c$exports = $e7da4ce74fe64e5c$var$router;


const $84a264530b3fb4fb$var$app = $hDP3I$express();
$hDP3I$dotenv.config({
    path: "./config.env"
});
$84a264530b3fb4fb$var$app.use($hDP3I$helmet());
$84a264530b3fb4fb$var$app.use((request, response, next)=>{
    response.append("Access-Control-Allow-Origin", [
        "*"
    ]);
    response.append("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    response.append("Access-Control-Allow-Headers", "Content-Type");
    response.append("Access-Control-Allow-Credentials", true);
    next();
});
//body parsers
$84a264530b3fb4fb$var$app.use($hDP3I$cookieparser());
$84a264530b3fb4fb$var$app.use($hDP3I$express.json({
    limit: "20kb"
}));
//data sanitization
$84a264530b3fb4fb$var$app.use($hDP3I$expressmongosanitize());
$84a264530b3fb4fb$var$app.use($hDP3I$xssclean());
//limiter
$84a264530b3fb4fb$var$app.use($hDP3I$expressratelimit({
    max: 100,
    windowMs: 1800000,
    message: "Too many requests."
}));
$84a264530b3fb4fb$var$app.use($hDP3I$hpp());
$84a264530b3fb4fb$var$app.use($hDP3I$cors());
$84a264530b3fb4fb$var$app.use($hDP3I$compression());
// routes
$84a264530b3fb4fb$var$app.use("/api/v1/users", $d176c6f5e4f47181$exports);
$84a264530b3fb4fb$var$app.use("/api/v1/items", $e7da4ce74fe64e5c$exports);
// route not found
$84a264530b3fb4fb$var$app.use("*", (request, response)=>{
    response.status(404).json({
        status: "fail",
        message: "Could not find that resource."
    });
});
$84a264530b3fb4fb$var$app.use($6e01d007996f5575$exports);
module.exports = $84a264530b3fb4fb$var$app;


//# sourceMappingURL=app.js.map

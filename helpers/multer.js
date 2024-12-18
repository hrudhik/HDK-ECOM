// const multer=require("multer");
// const path= require("path");


// const storage= multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,path.join(__dirname,"../public/uploads/re-image"));

//     },
//     filename: (req,file,cb)=>{
//         cb(null,Date.now()+ "-"+file.originalname);
//     }
// })



// module.exports={
//     storage
// }


const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/re-image"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer instance
const upload = multer({ storage: storage });

module.exports = { upload };

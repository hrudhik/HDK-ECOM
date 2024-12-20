const multer=require("multer");
const path= require("path");

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,"../public/uploads/re-image"));

    },
    filename: (req,file,cb)=>{
        cb(null,Date.now()+ "-"+file.originalname);
    }
})

const upload = multer({storage})

module.exports={
    upload
}


// // const multer = require("multer");
// // const path = require("path");

// // // Storage configuration
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //       const dirPath = path.join(__dirname, "../public/uploads/re-image");
// //       console.log("Destination Path:", dirPath); // Debug destination path
// //       cb(null, dirPath);
// //   },
// //   filename: (req, file, cb) => {
// //       const fileName = Date.now() + "-" + file.originalname;
// //       console.log("File Name:", fileName); // Debug file name
// //       cb(null, fileName);
// //   },
// // });
// // // Initialize multer instance
// // const upload = multer({ storage: storage });

// // module.exports = { upload };



// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure upload directory exists
// const dirPath = path.join(__dirname, "../public/uploads/re-image");
// if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
// }

// // Storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log("Destination Path:", dirPath); // Debug destination path
//         cb(null, dirPath);
//     },
//     filename: (req, file, cb) => {
//         const fileName = Date.now() + "-" + file.originalname;
//         console.log("File Name:", fileName); // Debug file name
//         cb(null, fileName);
//     },
// });

// // Initialize multer instance
// const upload = multer({ storage: storage });

// module.exports = { upload };

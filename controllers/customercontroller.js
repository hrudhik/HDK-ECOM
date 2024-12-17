const User = require('../models/userSchema')




// const customerInfo=async(req,res)=>{

//     // return res.render('customers')
//     try {
//         let search = "";
//         if(req.query.search){
//             search=req.query.search;
//         }
//         let page=1;
//         if(req.query.page){
//             page=req.query.page;
//         }
//         const limit=3; 
//         const userData= await User.find({
//             isAdmin:false,
//             $or:[
//                 {name:{$regex:".*"+search+"*"}},
//                 {email:{$regex:".*"+search+"*" }},
//             ],
//         })
//         .limit(limit*1)
//         .skip((page-1)*limit)
//         .exec();

//         const count = await User.find({
//             isAdmin:false,
//             $or:[
//                 {name:{$regex:".*"+search+"*"}},
//                 {email:{$regex:".*"+search+"*" }},
//             ],
//         }).countDocuments();

//         res.render('customers')




//     } catch (error) {
//         console.log(error)

//     }
// }


// const customerInfo = async (req, res) => {
//     try {
//         let search = "";
//         if(req.query.search){
//             search=req.query.search;
//         }

//         let page = 1;
//         if (req.query.page) {
//             page = parseInt(req.query.page);
//         }

//         const limit = 3;

//         const userData = await User.find({
//             isAdmin: false,
//             $or: [
//                 { name: { $regex: ".*" + search + ".*", $options: "i" } }, 
//                 { email: { $regex: ".*" + search + ".*", $options: "i" } }, 
//             ],
//         })
//             .limit(limit)
//             .skip((page - 1) * limit)
//             .exec();

//         const count = await User.find({
//             isAdmin: false,
//             $or: [
//                 { name: { $regex: ".*" + search + ".*", $options: "i" } },
//                 { email: { $regex: ".*" + search + ".*", $options: "i" } },
//             ],
//         }).countDocuments();

//         res.render('customers', { data: userData, totalPages: Math.ceil(count / limit), currentPage: page });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

const customerInfo = async (req, res) => {
    try {
        let search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        const limit = 5;

        const result = await User.aggregate([
            {
                $match: {
                    isAdmin: false,
                    $or: [
                        { name: { $regex: `.*${search}.*`, $options: "i" } },
                        { email: { $regex: `.*${search}.*`, $options: "i" } },
                    ],
                },
            },
            {
                $facet: {
                    data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                    count: [{ $count: "total" }],
                },
            },
        ]);

        const userData = result[0]?.data || [];
        const count = result[0]?.count[0]?.total || 0;

        res.render("customers", {
            data: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};


const customerblocked = async (req, res) => {
    try {
        let id = req.query.id;
        // console.log("query", req.quer.id); // For query parameter
        // console.log("body", req.body.id);y  // For request body

        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        if (req.session.user) [
            req.session.user = null
        ]
        res.redirect('/admin/users')

    } catch (error) {
        console.log(error);
        res.redirect('/pagenotfound')

    }
}

const customerUnblocked = async (req, res) => {
    try {
        let id = req.query.id;
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } })
    } catch (error) {
        console.log(error);
        res.redirect('/pagenotfound')

    }
}


module.exports = {
    customerInfo,
    customerblocked,
    customerUnblocked
}
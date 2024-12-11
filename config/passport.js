// const passport =require("passport");
// const GoogleStrategy = require('passport-google-oauth20'.Strategy);
// const User = require('../models/userSchema');
// const env =require("dotenv").config();





// passport.use(new GoogleStrategy({
//     clientId:process.env.GOOGLE_CLIENT_ID,
//     clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:'/auth/google/callback'
// },
//     async (accessToken,refreshToken,profile,done)=>{
//         try {
//             let user= await User.findOne({google:profile.id});
//             if(user){
//                 return done(null,user);

//             }else {
//                 user= new User({
//                     name:profile.displayName,
//                     email:profile.emails[0].value,
//                     googleId:profile.id
//                 })
//                 await user.save();
//                 return done(null,user);

//             }

//         } catch  {
//             return done(err,null)
//         }
//     }
    
// ))

// passport.serializeUser((user,done)=>{
//     if (!user.id) {
//         console.error('User ID is undefined during serialization');
//         return done(new Error('User ID is missing'));
//     }
//     done(null,user.id)

// });

// passport.deserializeUser((id,done)=>{
//     User.findById(id)
//     .then(user=>{
//         done(null,user)
//     })
//     .catch(err=>{
//         done(err,null)
//     })

// });

// module.exports=passport;







const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const env = require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3001/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user ) {
                    return done(null, user);
                } else {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                    });
                    await user.save();
                    return done(null, user);
                }
            } catch (err) {
                console.error("Error in Google Strategy:", err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    if (!user.id ) {
        console.error("User ID is undefined during serialization");
        return done(new Error("User ID is missing"));
    }
    done(null, user.id);
    // console.log(user.name)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (user) {
            done(null, user);
            // console.log(user.name)

        } else {
            done(new Error("User not found"), null);
        }
    } catch (err) {
        console.error("Error during deserialization:", err);
        done(err, null);
    }
});

module.exports = passport;

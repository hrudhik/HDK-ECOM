
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const env = require("dotenv").config();

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: 'http://localhost:3001/google/callback',
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let user = await User.findOne({ googleId: profile.id });
//                 if (user ) {
//                     return done(null, user);
//                 } else {
//                     user = new User({
//                         name: profile.displayName,
//                         email: profile.emails[0].value,
//                         googleId: profile.id,
//                     });
//                     await user.save();
//                     return done(null, user);
//                 }
//             } catch (err) {
//                 console.error("Error in Google Strategy:", err);
//                 return done(err, null);
//             }
//         }
//     )
// );


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://www.hdktimes.shop/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // Check if the user is blocked
                    if (user.isBlocked) {
                        return done(null, false, { message: "Your account is blocked. Please contact support." });
                    }
                    return done(null, user); // User is not blocked; proceed to login
                } else {
                    // Create a new user if not found
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
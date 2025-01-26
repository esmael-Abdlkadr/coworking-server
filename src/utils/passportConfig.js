import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/users.js";
import { generateAccessToken } from "./tokenUtil.js";

const sanitizeUserData = (profile) => ({
  firstName: profile.name?.givenName || profile.displayName?.split(" ")[0],
  lastName:
    profile.name?.familyName ||
    profile.displayName?.split(" ").slice(1).join(" "),
  photo: profile.photos?.[0]?.value,
});

const configurePassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Deserialization Error:", error);
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
        passReqToCallback: true,
        scope: ["profile", "email"],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found"), null);
          }

          const sanitizedProfile = sanitizeUserData(profile);

          let user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.photo = sanitizedProfile.photo;
            await user.save();
          } else {
            user = await User.create({
              firstName: sanitizedProfile.firstName,
              lastName: sanitizedProfile.lastName,
              email,
              googleId: profile.id,
              photo: sanitizedProfile.photo,
              emailVerified: true,
              password: Math.random().toString(36).slice(-16),
              accessToken: generateAccessToken(),
            });
          }

          done(null, user);
        } catch (error) {
          console.error("Google OAuth Error:", error);
          done(error, null);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/github/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.find((e) => e.primary)?.value ||
            profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("No email found"), null);
          }

          const sanitizedProfile = sanitizeUserData(profile);

          let user = await User.findOne({ email });

          if (user) {
            user.githubId = profile.id;
            user.photo = sanitizedProfile.photo;
            await user.save();
          } else {
            user = await User.create({
              firstName: sanitizedProfile.firstName,
              lastName: sanitizedProfile.lastName,
              email,
              githubId: profile.id,
              photo: sanitizedProfile.photo,
              emailVerified: true,
              accessToken: generateAccessToken(),
            });
          }

          done(null, user);
        } catch (error) {
          console.error("GitHub OAuth Error:", error);
          done(error, null);
        }
      }
    )
  );
};

export default configurePassport;

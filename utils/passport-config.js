import { Strategy as LocalStrategy } from "passport-local";

/**
* @param {import('passport')} passport
* @returns {void}
* */
export default function initialise(passport, getUserByDetails, getUserById) {
  const authenticateUser = async (req, username, password, done) => {
    const user = await getUserByDetails(username, req.body);
    if (user == null) {
      console.log("No user found");
      return done(null, false, { message: "No user found" });
    }
    try {
      if (password == user.password) {
        return done(null, user);
      } else {
        console.log("Wrong Password");
        return done(null, false, { message: "Wrong Password" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

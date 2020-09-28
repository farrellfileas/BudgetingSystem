const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserById) {
	const authenticateUser = async (username, password, done) => {
		const user = await getUserByUsername(username);
		if (user == null) {
			return done(null, false, {message: username});
		}

		try {
			if (await bcrypt.compare(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, {message: "password"});
			}
		} catch (e) {
			return done(e);
		}
	}

	passport.use(new LocalStrategy(authenticateUser));
	passport.serializeUser((user, done) => {done(null, user.uid)});
	passport.deserializeUser((id, done) => {done(null, getUserById(id))});
}

module.exports = initialize;
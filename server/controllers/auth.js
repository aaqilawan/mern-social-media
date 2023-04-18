import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    /** To hash a password */
    const salt = await bcrypt.genSalt(); // generate the random salt
    const passwordHash = await bcrypt.hash(password, salt); // hashing with password

    // Create a new user like that { User.create ({firstName,})} or new User
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    // after that saved in the Mongoose Db
    const savedUser = await newUser.save();
    // After that saved the data show in the front end 
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    // using get e,p get
    const { email, password } = req.body;
    // find one email from mongoose
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    // compare the password who's we input and that email password that save in the mongoose
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    // create the token using jsonWebToken
    const token = jwt.sign({ id: user._id }, `${process.env.JWT_SECRET}`);
    // After that delete the password kyu kay front end pay show na ho
    delete user.password;
    // show on the front end
    res.status(200).json({ token, user });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

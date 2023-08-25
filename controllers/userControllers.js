const userModel = require('../model/userModel');

const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer= require('nodemailer');

//task1 login 
//task2 register
//task 3 get user profile


// test route
//router.get('pathname', arrowfunction);
router.get('/test', (req, res) => {
    res.send('Welcome to Flybuy user API');
});

// register route
router.post('/register', async (req, res) => {
    console.log(req.body);

    //destructuring json data
    const { fname, lname, email, password } = req.body;
    // Step2 validtaion
    if (!fname || !lname || !email || !password) {
        return res.status(400).send("please fill all the fields");
    }
    try {
        //step 3 check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exist");
        }

        // password hashing
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);//encrypts and returns a hash

        // step 4 save user to data
        const newUser = new userModel({
            fname: fname,//userModel:Destructing data
            lname: lname,
            email: email,
            password: hashPassword
        });

        await newUser.save();

        //send response
        res.status(200).send({
            message: "User registered succcessfully",
            user: newUser
        });
    } catch (error) {
        console.log(error);
        res.status(5000).send("Internal Server Error");
    }
});

// login route
router.post('/login', async (req, res) => {
    console.log(req.body);

    // destucturing json data
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
        return res.status(400).send("please fill all the fields");
    }

    try {
        // find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json("User donesn't exist");
        }

        // compare password
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            return res.json("Invalid Password");
        }

        // generate token and send response
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie(
            "token",
            token,
            {
                httpOnly: true,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        )
        res.status(200).send({
            message: "User logged in successfully",
            token: token,
            user: user
        });

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server error");
    }
})

router.post('/forgot_password', async (req, res) => {
    console.log(req.body);
    // res.send('Forgot Password');

    const { email } = req.body;
    if (!email) {
        return res.status(400).send("Please entr email")
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send('User does not exist');

        }
        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, secret, { expiresIn: '1h' });

        const link = `http://localhost:5000/api/users/reset_password/${user._id}/${token}`;

        //send email using nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jubina574@gmail.com',
                pass: 'xaoialvknxohpanx'
            }
        });

        var mailOptions = {
            from: 'jubina574@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: link
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Email sent: '+ info.response);
            }
        });

        res.send("OK");

    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// for validatin token and user link
router.get('/reset_password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    if (!id || !token) {
        return res.status(400).send('Fields cannot be empty');
    }

    const checkUser = await userModel.findOne({ _id: id });
    if (!checkUser) {
        return res.status(400).send('User does not exist')
    }

    const secret = process.env.JWT_SECRET + checkUser.password;

    try {
        const verifyToken = jwt.verify(token, secret);
        if (verifyToken) {
            res.render('index',{email: verifyToken.email});
        }
    } catch (error) {
        res.send("Link expired");
    }
});

router.post('/reset_password/:id/:token', async (req, res) => { 
    const { id, token } = req.params;
    const {password} = req.body;
    if (!id || !token) {
        return res.status(400).send('Fields cannot be empty');
    }

    const checkUser = await userModel.findOne({ _id: id });
    if (!checkUser) {
        return res.status(400).json('User does not exist')
    }

    const secret = process.env.JWT_SECRET + checkUser.password;

    try {
        jwt.verify(token, secret);
        const encryptPassword = await bcrypt.hash(password, 10);
        await userModel.updateOne(
            {_id:id},
            {
                $set:{password: encryptPassword}
            }
            )
        res.send("Password changed successfully !!");
    } catch (error) {
        res.send("Link expired");
    }

});
module.exports = router;
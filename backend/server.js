const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User =require('./models/userSchema')
const SECRET_KEY="secret_key"

const app = express()


const dbURL='mongodb+srv://${process.env.Username}:${process.env.Password}@cluster0.6wbgjir.mongodb.net/UsersDB?retryWrites=true&w=majority&appName=Cluster0'
mongoose
.connect(dbURL)
.then(()=>{
    app.listen(3000,()=>{
        console.log('server is connected')
    })

})
.catch((error)=>{
    console.log('unable to connect')
})

app.use(bodyparser.json())
app.use(cors())



app.post('/register',async(req,res)=>{
    try{
        const{ email, username, password}=req.body
        const hashedPassword = await bcrypt.hash(password,10)
        const newUser= new User({email, username, password:hashedPassword})
        await newUser.save()
        res.status(201).json({message:"User created Successfull"})
    } catch(error){
        // console.error("Error signing up:", error);
        
        res.status(500).json({error: "Error signing up"})
    }
})

app.get('/register',async(req,res)=>{
    try{
        const users= await User.find()
        res.status(201).json(users)
    }catch(error){
        console.error("Error fetching users:", error);
        res.status(500).json({error:"Unable to get users"})
    }
})
//get login
app.post('/login',async(req,res)=>{
    try{
        const {username,password}=req.body
        const user = await User.findOne({username})
        if(!user){
            return res.status(401).json({error :"Invalid credentials"})
        }
        const isPasswordValid=await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(401).json({error:"Invalid Credentials"})
        }
        const token = jwt.sign({userId: user._id},SECRET_KEY,{expiresIn:'1hr'})
        res.json({message:"Login Successful",token})
    }catch(error){
        console.error("Error logging in:", error);
        res.status(500).json({error:"unable to logging in"})
    }
})









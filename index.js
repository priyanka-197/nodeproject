import express  from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


mongoose.connect("mongodb://127.0.0.1:27017",{dbName:"userdata"}).then((c)=>console.log("databasee connected")).catch((e)=>console.log(e))

const app = express();

app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.set('view engine','ejs')
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const user= mongoose.model("user",userSchema)

const isAuthanticated= async (req,res,next)=>{
const {token}=req.cookies
if(token){
 const decoded= jwt.verify(token,"secreate msg")
req.user = await user.findById(decoded._id)
next()

}else{
res.render("login")
}}

 
 app.get("/",isAuthanticated,(req,res)=>{

res.render("logout",{name:req.user.name})
 }) 

app.post("/login",async(req,res)=>{
  const {email,password}=req.body
let User=await user.findOne({email})

if(!User){
 return res.redirect("/ragister")
}
const isMatch = bcrypt.compare(password,User.password)
if(!isMatch){
return res.render("login",{email,message:"incorrect password"})}

const token = jwt.sign({_id:User._id},"secreate msg")
   
res.cookie("token",token,{
  httpOnly:true,
  expires:new Date(Date.now()+3000)
})

res.redirect("/")
})
 app.get("/ragister",async(req,res)=>{

res.render("ragister")
 })

 app.post("/ragister",async(req,res)=>{
  
  const {name,email,password}=req.body

 const heesedPassword=await bcrypt.hash(password,10)
 await user.create({name,email,password:heesedPassword})
   
  res.redirect("/")
  

 })
 app.get("/logout",(req,res)=>{
res.cookie("token",null,{httpOnly:true,expires:new Date(Date.now())})
res.redirect("/")
 })
 
     


app.listen("5000",()=>{
    console.log("server is working")
})


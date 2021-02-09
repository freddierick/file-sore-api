const express = require('express');
const Keyv = require('keyv');
const randomToken = require('random-token');

const { inviteCodeForSignUp } = process.env;

const userDB = require("../mongo/users")

const app = express.Router();

const authDB = new Keyv(process.env.redisURI);

async function genToken(){
    token = randomToken(64);
    if (await authDB.get(token) == null) genToken();
    return token;
};

app.post('/login', async (req, res) => {
    const { user, password } = req.body;

    res.status(400);
    let usr = await userDB.findOne({username: user});
    if (usr == null ) usr = await userDB.findOne({email: user});
    if (usr == null ) return res.send({error:"User not found"});
    
    res.status(200);
    let token = await genToken();
    await authDB.set(token,JSON.stringify({ID: usr._id, creation: Date.now(), authIP: req.ip}));
    return res.send({token});
})
  
app.post('/register', async (req, res) => {
    const { username, email, password, inviteCode } = req.body;
    try {
        res.status(400);
        if (username==null || email==null || password==null || (inviteCode==null && inviteCodeForSignUp)) return res.send({error:"Missing Fields"});
        let usr = await userDB.findOne({username});
        if (usr) return res.send({error:"That username is taken"});
        let eml = await userDB.findOne({email});
        if (eml) return res.send({error:"That email is taken"});
        await userDB.create({username, email, password});

        let user = await userDB.findOne({email});
        let token = await genToken();

        await authDB.set(token,JSON.stringify({ID: user._id, creation: Date.now(), authIP: req.ip}))
        res.status(200);
        return res.send({token});
    } catch (e){
        console.log(e);
        res.status(500)
        return res.send({error:"unknown"});
    };
});

async function checkAuth(token){
    const res = await authDB.get(token);
    if (!res) return false;
    return JSON.parse(res);
};

module.exports = {app, checkAuth};

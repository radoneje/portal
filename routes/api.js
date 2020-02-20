"use strict";

var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const hmacsha1 = require('hmacsha1');
const moment = require('moment');

/* GET home page. */
router.post('/postnews', async (req, res)=> {

try {
  var clientId = getClienntConfig(req.body.client, 'portalClientId');

  var clientArr = await req.knex.select("*").from("t_clients").where({id: clientId});
  if (clientArr.length < 1)
    return res.json(0)
  var client = clientArr[0];
  var hash = hmacsha1(client.secret, req.body.signature);
  if (hash != req.body.hash)
    return res.json(-1);

  var progArr = await req.knex.select("*").from("t_prog").where({clientid: clientId, nfId: req.body.progId});
  if (progArr.length == 0) {
    progArr = await req.knex("t_prog").insert({
      clientid: clientId,
      nfId: req.body.progId,
      title: req.body.progTitle
    }, "*")
  }
  var prog = progArr[0];
  await req.knex("t_prog").update({title: req.body.progTitle}).where({id: prog.id});

  var newsArr = await req.knex.select("*").from("t_news").where({progid: prog.id, nfid: req.body.newsId});
  if (newsArr.length == 0) {
    newsArr = await req.knex("t_news").insert({progid: prog.id, nfid: req.body.newsId}, "*")
  }
  var news = newsArr[0];
  await req.knex("t_news").update({
    title: req.body.newsTitle,
    newsDate: moment(req.body.newsDate).format('YYYY-MM-DD HH:mm:ss')
  }).where({id: news.id});

  for (const bl of req.body.blocks) {
    var blocksArr = await req.knex.select("*").from("t_blocks").where({newsid: news.id, nfid: bl.Id});
    if (blocksArr.length == 0) {
      console.log("insert ", news.id);
      blocksArr = await req.knex("t_blocks").insert({newsid: news.id, nfid: bl.Id}, "*")
    }
    var block = blocksArr[0];
    await req.knex("t_blocks")
        .update({
          title: bl.Name,
          isDeleted: bl.deleted,
          author: bl.Creator,
          type: bl.TypeName,
          text: bl.BlockText,
          isApprove: bl.Approve,
          isReady: bl.Ready,
          sort: bl.Sort
        })
        .where({id: block.id})
  };

  res.json(1)
}
catch (e) {
  console.warn(e);
  res.json({status:-3, err:e});
}
});
router.post('/login', async (req, res, next)=> {
  delete req.session.user;
  var q=await req.knex
      .select("*")
      .from("t_users")
      .where({email:req.body.login, password:req.body.pass, isDeleted:false});
  if(q.length==0)
  {return res.status(404).send("not found")};
  var utp=await req.knex
      .select("*")
      .from("t_userToGroup")
      .where({userId:q[0].id});
  if(utp.length==0)
  {return res.status(404).send("not found")};
  req.session.user=q[0];
  res.json({id:q[0].id, name:q[0].name, suName:q[0].suName});
});
router.get("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  delete req.session.user.password;//="";
  return res.json(req.session.user);

});
router.delete("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  delete req.session.user;
  return res.json({status:1});

})
router.post("/user", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var q=await req.knex
      .select("*")
      .from("t_users")
      .where({id:req.session.user.id});
  var usr=q[0];
  usr.name=req.body.name;
  usr.suName=req.body.suName;
  usr.email=req.body.email;
  usr.phone=req.body.phone;
  usr.readRate=req.body.readRate;
  usr.fb=req.body.fb;
  usr.password=req.body.password ||usr.password ;
  var id=usr.id;
  delete usr.id;
  try {
    q = await req.knex("t_users")
        .update(usr)
        .where({id: id});
    //delete usr.password;
    usr.id=id;
    return res.json(usr);
  }
  catch (e) {
    return res.json({e:e.message});
  }
})
function getClienntConfig(client, Key){
  return client.filter((cl)=>{
    return cl.Key==Key
  })[0].value;

}
router.get("/news/:clientId", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var ret=[];

  var progs=await req.knex.select("*").from("t_prog").where({clientid:req.params.clientId});
  for(const p of progs){
    var news=await req.knex.select("*").from("t_news").where({progid:p.id}).orderBy("newsDate","desc").limit(20);

    news.forEach(n=>{
      var nn=n;
      nn.progTitle=p.title;
      ret.push(nn);
    })
  }
  return res.json(ret);

})
router.get("/newsfromprog/:progId", async (req, res)=> {
    var news=await req.knex.select("*").from("t_news").where({progid:req.params.progId}).orderBy("newsDate","desc").limit(20);
  return res.json(news);

})
router.get("/progs", async (req, res)=> {

  var ret=[];

  var progs=await req.knex.select("*").from("t_prog").orderBy("title");


  for(const p of progs){
    var clients=await req.knex.select("*").from("t_clients").where({id:p.clientid});
    var tmp=p;
    tmp.clientTitle=clients[0].title;
    ret.push(tmp);
  }
  return res.json(ret);

})

router.get("/blocks/:newsId", async (req, res)=> {

  var ret=[];
  var blocks=await req.knex.select("*").from("t_blocks").where({newsid:req.params.newsId, isDeleted:false}).orderBy("sort");
  return res.json(blocks);

})
router.get("/groups", groups);
router.put("/groups", async (req, res)=> {
  await req.knex("t_groups").insert({title:""});
  console.log("put")
  await groups(req, res);
});
async function groups(req, res){
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var dt=await req.knex.select("*").from("t_groups").orderBy("title");
  for(var g of dt){
    var cs=await req.knex.select("*").from("t_clients").where({groupId:g.id}).orderBy("title");
    g.companies=cs;
  }

  res.json(dt);
}
router.post("/addCompany/:grId", async (req, res)=> {
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  await req.knex("t_clients").insert({groupId:req.params.grId});
  await groups(req, res);
})

router.get("/companies/:grId", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var dt=await req.knex.select("*").from("t_clients").where({groupId:req.params.grId}).orderBy("title");

  res.json(dt);

});
router.post("/changeCompany", async (req, res)=> {
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var id=req.body.id;
  delete req.body.id

  await req.knex("t_clients").update(req.body).where({id:id});
  await groups(req, res);
})
router.post("/changeGroup", async (req, res)=> {
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var id=req.body.id;
  delete req.body.id
  delete req.body.companies

  await req.knex("t_groups").update(req.body).where({id:id});
  await groups(req, res);
})


router.get("/users", users);
router.put("/users", async (req, res)=> {

 var dd= await req.knex("t_users").insert({name:"", suName:"", email:"", isDeleted:false, phone:"", readRate:0, password:"", fb:false, isAdmin:false}, "*");

 await users(req, res);
});
async function users(req, res){
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  var dt=await req.knex.select("*").from("t_users").where({isDeleted:false}).orderBy(["suName","name","email"]);
  for(var g of dt){
    var groups=await req.knex.select("*").from("t_userToGroup").where({userId:g.id})
    g.groups=groups;
  }

  res.json(dt);
}
router.post("/mainuser", async (req, res)=> {
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(401.7).json({status: -1, msg: "access deny"});


  var id=req.body.id;
  delete req.body.id;
  delete req.body.groups;

  await req.knex("t_users").update(req.body).where({id:id});

  await users(req, res);
});

router.post("/usergroup", async (req, res)=> {
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(401.7).json({status: -1, msg: "access deny"});

  if(req.body.state)
    await req.knex("t_userToGroup").insert({userId:req.body.userId, groupId:req.body.groupId});
  else
    await req.knex("t_userToGroup").delete().where({userId:req.body.userId, groupId:req.body.groupId});
  await users(req, res);
});
router.get("/list/:clientId", async (req, res)=> {
  if (!req.session || !req.session.user)
    return res.status(401.7).json({status: -1, msg: "access deny"});
  var skip=req.headers["x-skip"];
  var list=await req.knex.select("*")
      .from("v_blockwithnews")
      .where({"clientid":req.params.clientId})
      .orderBy([ { column: 'newsDate', order: 'desc' }, "sort"])
      .limit(5).offset(skip)

  return res.json(list);

})
module.exports = router;

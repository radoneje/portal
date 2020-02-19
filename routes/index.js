var express = require('express');
var router = express.Router();
const lang=require('../lang')
const moment=require('moment')

/* GET home page. */
router.get('/', login, async (req, res)=> {

  var groups=await req.knex.select("*").from("t_userToGroup").where({userId:req.session.user.id});
  var gr=[];
  for (const gId  of groups) {
    var arr=await req.knex.select("*").from("t_groups").where({id:gId.groupId}).orderBy("title");
    gr=[...gr, ...arr ]
  }
  groups=[];
  for (const group  of gr) {

    var clients=await req.knex.select("*").from("t_clients").where({groupId:group.id}).orderBy("title")
    console.log("clients" ,clients, group)
    var g=group;
    g.clients=clients;
    groups.push(g)
  }
  res.render('index', { title: 'Выбор группы', lang:lang.en, groups:groups });

});
 function login(req, res, next){

  if (!req.session|| !req.session.user)
    return res.redirect("/login");



  next();
}
router.get('/point/:id', login, async (req, res)=> {
  res.render('group', { title: 'Новости', lang:lang.en, clientId:1 });

});

router.all('/login', async (req, res, next)=>{
  //req.session.user=null;
  res.render('login', { title: '', lang:lang.en })
});
router.get("/block/:id",async (req, res)=>{
  try {
    var items = await req.knex.select("*").from("v_blockwithnews").where({id: req.params.id});
    res.render("block", { item: items[0],title:items[0].title, lang:lang.en, newsDate:moment(items[0].newsDate).format("DD.MM.YYYY HH:mm") })
  }
  catch (e) {
    console.log(e)
    res.sendStatus(404);
  }
})

module.exports = router;

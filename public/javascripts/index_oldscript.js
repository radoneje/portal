
var mainHeadApp = new Vue({
    el: '#main-page',
    data: {
        user:{},
        userMenu:false,
        panels:{rundown:true, dashboard:false},
        tabs:{archive:false,video:false,messager:false,rss:false},
        tabIsOpen:false,
        programs:[{id:1,title:'Новости 24', selected:true}],
        news:{},
        currNews:{},

    },
    methods: {
        exitClick:async function () {
            await axios.delete("/rest/api/v1/user")
            document.location.href="/login";
        },
        userClick:async function () {
            this.userMenu=true;
        },
        closeSettings:async function () {
            this.userMenu=false;
        },
        userChange:async function () {
            var r=await axios.post("/rest/api/v1/user", this.user);
           // this.user=r.data;
        },
        changePanels: async function(ctrl){
            Object.keys(this.panels).map(k=>{
                this.panels[k]=ctrl==k;
            });

        },
        changeTabs: async function(ctrl){
            var _this=this;
            Object.keys(this.tabs).map(k=>{
                if(ctrl!=k)
                    this.tabs[k]=false;
                else
                    this.tabs[k]=!this.tabs[k];
            });
            _this.tabIsOpen=false;
            Object.keys(_this.tabs).forEach(k=>{
                _this.tabIsOpen=_this.tabIsOpen||_this.tabs[k];
            });
        },
       reloadNews:async function(){
           var _this=this;
            var r=await axios.get("/rest/api/v1/news/"+  _this.programs.filter(p=>p.selected)[0].id);
            this.news=r.data;
       },
        newsClick:async function(newsItem){
            this.currNews=newsItem;
            this.news.forEach(n=>{
                if(n.id!=newsItem.id)
                    n.active=false;
                else
                    n.active=true;
                return n;
            });
        }

    },
    computed:{
      //  fullName:this.user.name +' ' + this.user.suName

    },
    watch:{
    },
    mounted: async function () {
        var _this=this;
        var r=await axios.get("/rest/api/v1/user")
        _this.user=r.data;
        _this.reloadNews();


    }
});
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePass(p){
    if(!p || p.length<3)
        return false
    return true;
}




var mainHeadApp = new Vue({
    el: '#main-page',
    data: {
        user:{},
        userMenu:false,
        panels:{rundown:true, dashboard:false},
        tabs:{archive:false,video:false,messager:false,rss:false},
        tabIsOpen:false,
        news:[],
        currNews:{},
        blocks:[],
        blocksFiltered:[],
        isLoaded:false,

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

            var r=await axios.get("/rest/api/v1/news/"+clientId);

            this.news=r.data;
       },
        newsClick:async function(newsItem){
            this.currNews=newsItem;
            var _this=this;
            this.news.forEach(n=>{
                if(n.id!=newsItem.id)
                    n.active=false;
                else
                    n.active=true;
                return n;
            });
            setTimeout(()=>{
                _this.blocks=[];
                _this.reloadBlocks();
            },0)
        },
        reloadBlocks:async function(){
            var _this=this;
            var r=await axios.get("/rest/api/v1/blocks/"+_this.currNews.id);
            this.blocks=r.data;
        },
        blockExpand:function (bl) {

            var _this=this;
            _this.blocks.forEach(b=>{
                if(b.id==bl.id)
                {
                    if(bl.isActive==true)
                        b.isActive=false;
                    else
                        b.isActive=true;
                }
                return b;
            })
            var tmp=this.blocks;
            this.blocks=[];

                _this.blocks=tmp;

            this.blocks=_this.blocks;
            console.log(this.blocks)

        },
        copyBlock:function (bl) {
           // console.log(bl, this.$refs)
           // var elem=document.querySelector("#block"+bl.id);
          //  console.log(elem);
            var elem = document.querySelector("#block"+bl.id);//.textContent;
            var text=elem.querySelector(".block-type").textContent+"\r\n";
            text+=elem.querySelector(".block-title").textContent+"\r\n";
            text+=elem.querySelector(".block-author").textContent+"\r\n\r\n";
            text+=elem.querySelector(".block-text").textContent+"\r\n\r\n";

            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },
        copyBlockLink:function (bl) {
            const el = document.createElement('textarea');
            el.value = "http://portal.may24.pro/block/"+bl.id;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }

    },
    computed:{
      //  fullName:this.user.name +' ' + this.user.suName

    },
    watch:{
        blocks:function(){
        }
    },
    mounted: async function () {
        var _this=this;

        var r=await axios.get("/rest/api/v1/user")
        _this.user=r.data;
        setTimeout(function(){
            _this.isLoaded=true;
        },0)
        await _this.reloadNews();

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
function CopyToClipboard(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");

    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        alert("text copied")
    }}



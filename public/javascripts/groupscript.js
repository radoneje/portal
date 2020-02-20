
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
        groups:[],
        groupsIsLoad:false,
        users:[],
        list:[],
        listEndLoad:false
    },
    methods: {
        upArrow:function(){
            var element = document.querySelector(".news-item.active");
            if(element)
                element.scrollIntoView({ behavior: 'smooth', block: 'center'});
        },
        initDashboard:async function(){
            var _this=this;
            await this.reloadList();
            setTimeout(()=>{
            var options = {
                root: null,//document.querySelector('#loadingBox'),
                rootMargin: '0px',
                threshold: 1
            }
            var callback = async function(entries, observer) {

                if(entries[0].isIntersecting){

                    var r=await axios.get("/rest/api/v1/list/"+clientId, { params:{}, headers: { "x-skip": _this.list.length }});
                    if(r.data.length==0)
                        _this.listEndLoad=true;
                    else
                        _this.listEndLoad=false;
                    _this.list=[..._this.list, ...r.data];
                }
            };
            var observer = new IntersectionObserver(callback, options);
            var target = document.querySelector('#loadingBox')
            observer.observe(target);
            },1000);
        },
        reloadList:async function(){

           /* var _this=this;
            _this.listEndLoad=false;
            var r=await axios.get("/rest/api/v1/list/"+clientId, { headers: { "x-skip": this.list.length }});
            this.list=r.data;*/
        },

        changeUserGroup:async function(u, g, e) {

         await   axios.post("/rest/api/v1/usergroup", {userId:u.id, groupId:g.id, state:e.target.checked})
            e.target.parentNode.classList.add("status");
            e.target.parentNode.classList.add("success");
            setTimeout(()=>{ e.target.parentNode.classList.remove("success");},1000)
            setTimeout(()=>{ e.target.parentNode.classList.remove("status");},2000)

        },
        usersLoad:async function(c){

            this.groupsIsLoad=true;
            var res=await axios.get("/rest/api/v1/users");
            this.groups=(await axios.get("/rest/api/v1/groups")).data;
            this.groupsIsLoad=false;
            this.users=res.data;
        },
        usersAdd:async function(c){

            this.groupsIsLoad=true;
            var res=await axios.put("/rest/api/v1/users");
            this.groupsIsLoad=false;
            this.users=res.data;
        },
        changeMainUser:async function(c, e){
            var res=await axios.post("/rest/api/v1/mainuser/",c);

            e.target.parentNode.classList.add("status");
            e.target.parentNode.classList.add("success");
            setTimeout(()=>{ e.target.parentNode.classList.remove("success");},1000)
            setTimeout(()=>{ e.target.parentNode.classList.remove("status");},2000)
        },
        groupsAdd:async function(c){

            this.groupsIsLoad=true;
            var res=await axios.put("/rest/api/v1/groups");
            this.groupsIsLoad=false;
            res.data.companies=[];
            this.groups=res.data;
        },
        changeCompany:async function(c, e){
            var res=await axios.post("/rest/api/v1/changeCompany/",c);
            e.target.parentNode.classList.add("status");
            e.target.parentNode.classList.add("success");
            setTimeout(()=>{ e.target.parentNode.classList.remove("success");},1000)
            setTimeout(()=>{ e.target.parentNode.classList.remove("status");},2000)
        },
        changeGroup:async function(c, e){
            var res=await axios.post("/rest/api/v1/changeGroup/",c);
            e.target.parentNode.classList.add("status");
            e.target.parentNode.classList.add("success");
            setTimeout(()=>{ e.target.parentNode.classList.remove("success");},1000)
            setTimeout(()=>{ e.target.parentNode.classList.remove("status");},2000)
        },
        companiesAdd:async function (item){

            this.groupsIsLoad=true;
            var res=await axios.post("/rest/api/v1/addCompany/"+item.id);
            this.groupsIsLoad=false;
            res.data.companies=[];
            this.groups=res.data;


        },
        groupsLoad:async function (){
            this.groupsIsLoad=true;
            var res=await axios.get("/rest/api/v1/groups");
            this.groupsIsLoad=false;
            res.data.companies=[];
            this.groups=res.data;
        },
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

            if(this.panels["dashboard"]==true)
                this.initDashboard();
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
                var element = document.querySelector("#curr-news-title");
                element.scrollIntoView({ behavior: 'smooth', block: 'start'});
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
        copyBlock:function (bl, e) {

            var alertElem=document.createElement("div")
            alertElem.classList.add("confirmModal");
            alertElem.innerHTML="text is copied";
            document.querySelector("body").appendChild(alertElem);
            alertElem.style.top=(e.clientY+10)+"px";
            alertElem.style.left=(e.clientX - alertElem.clientWidth/2)+"px";
            alertElem.style.opacity="1";
            setTimeout(()=>{alertElem.style.opacity="0";},1000);
            setTimeout(()=>{alertElem.parentNode.removeChild(alertElem)},3000);

            var elem = document.querySelector("#block"+bl.id);//.textContent;
            var text=elem.querySelector(".block-type").textContent+"\r\n";
            text+=elem.querySelector(".block-title").textContent+"\r\n";
            text+=elem.querySelector(".block-author").textContent+"\r\n\r\n";
            text+=elem.querySelector(".block-text").textContent+"\r\n\r\n";

            Clipboard.copy(text);
           /* const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);*/
        },
        copyBlockLink:function (bl, e) {
            /*const el = document.createElement('textarea');
            el.value = "http://portal.may24.pro/block/"+bl.id;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);*/

            Clipboard.copy("http://portal.may24.pro/block/"+bl.id);

            var alertElem=document.createElement("div")
            alertElem.classList.add("confirmModal");
            alertElem.innerHTML="link is copied";
            document.querySelector("body").appendChild(alertElem);
            alertElem.style.top=(e.clientY+10)+"px";
            alertElem.style.left=(e.clientX - alertElem.clientWidth/2)+"px";
            alertElem.style.opacity="1";
            setTimeout(()=>{alertElem.style.opacity="0";},1000);
            setTimeout(()=>{alertElem.parentNode.removeChild(alertElem)},3000);
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
window.Clipboard = (function(window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function(text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);



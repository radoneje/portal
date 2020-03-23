
var mainHeadApp = new Vue({
    el: '#main-page',
    data: {
        IsAnaliticsActive:false,
        isTextActive:true,
        analiticsPeriod:3,
        insertKeywordText:"",
        keywords:[],
        activeItem:{},
        blocks:null,
        isShowKW:false,
        isContactShow:false,
        items:[],//
         //   {id:1,title:"Яр-Сале", smi:"ЯТВ", logo:"logo_yatv.png",lastDate:moment(), contacts:[{Name:"Иван Иванов", position:"Редактор", tel:"+7(923) 455 5523"}]},
         //   {id:2,title:"Ноябрьск", smi:"МИГ", logo:"logo_mog.png",lastDate:moment(), contacts:[{Name:"Иван Иванов", position:"Редактор", tel:"+7(923) 455 5523"}]}
       // ]
    },
    methods: {
        addKeyWord:function () {
            if(this.insertKeywordText.length<2)
                return;
            var _this=this;
            var db = openDatabase("portal","0.1", "A list of to do items.", 20000)
            if(!db){alert("Failed to connect to database.");}
            db.transaction(function(tx) {
                tx.executeSql("SELECT COUNT(*) FROM keywords", [],
                    function (result) {

                        tx.executeSql("INSERT INTO keywords (keyword) VALUES(?)",[_this.insertKeywordText])
                        _this.reloadKeywords();
                    },
                    function (tx, error) {
                        tx.executeSql("CREATE TABLE keywords (id INTEGER PRIMARY KEY, keyword TEXT)", [],
                            function () {
                                tx.executeSql("INSERT INTO keywords (keyword) VALUES(?)",[_this.insertKeywordText], function () {
                                    _this.insertKeywordText="";
                                })
                            }
                            , null);
                })});
        },
        reloadKeywords:function () {
            var _this=this;
            var db = openDatabase("portal","0.1", "A list of to do items.", 20000)
            db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM keywords",null,function (tx,res) {
                    if(res) {
                        _this.keywords = [];
                        for(var i = 0; i < res.rows.length; i++)
                        {
                            _this.keywords.push(res.rows.item(i))
                        }
                        setTimeout(function () {
                            _this.keywords=_this.keywords.filter(function () {
                               return true
                            })
                            _this.insertKeywordText="----"
                            setTimeout(function () {
                                _this.insertKeywordText=""
                            },0)
                            setTimeout(function () {
                                createChart(_this)
                            },0)
                        },0)
                    }
                    console.log(_this.keywords);
                })
            })

        },
        deleteKeyword:function (item) {
            var _this=this;
            console.log(_this.keywords, item)
            _this.keywords=_this.keywords.filter(function (f) {
                return item.id!=f.id;
            })
            _this.insertKeywordText="----"
            setTimeout(function () {
                _this.insertKeywordText=""
            },0)
            console.log(_this.keywords)
            var db = openDatabase("portal","0.1", "A list of to do items.", 20000)
            db.transaction(function(tx) {
                tx.executeSql("DELETE FROM keywords WHERE id=?",[item.id]);
                setTimeout(function () {
                    createChart(_this)
                },0)
            })
        },
        dKeyWordsRowKeyDown:function (e) {
            if(e.keyCode==13)
                this.addKeyWord();
        },
        setTextActive:function (v) {
            var _this=this;
            this.isTextActive=v;
            if(!v){
                setTimeout(function () {
                    createChart(_this)
                },0)
            }
        },
        analiticsPeriodChange:function (v) {
            this.analiticsPeriod=v;
            createChart(this)
        },
        copyBlockTextToBuff:function(text){
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert('Текст скопирован в буфер обмена')
        },

    },
    computed:{
      //  fullName:this.user.name +' ' + this.user.suName

    },
    watch:{
        activeItem:function () {
            var _this=this;
            _this.blocks=null;
            axios.get("/rest/api/v1/list/"+_this.activeItem.id)
                .then(function (res) {
                    _this.blocks=res.data;
                    createChart(_this);
                })
        }
    },
    mounted: async function () {
        var _this=this;
        axios.get("/rest/api/v1/user")
            .then(function (res) {
                _this.user=res.data;
            })

        this.reloadKeywords();
        axios.get("/rest/api/v1/smi")
            .then(function (res) {
                _this.items=res.data;
                if(_this.items.length>0)
                    _this.activeItem=_this.items[0];
                console.log(_this.items);
            })

       // await _this.reloadNews();

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
function createChart(_this) {
    var elem=document.getElementById("container")
        if(!elem)
           return;
        elem.innerHTML=""
    var chart = anychart.line();
    // set the data


    _this.keywords.forEach(function (e) {
        var r=[];
        for(var i=0; i<_this.analiticsPeriod; i++) {

            var rr=[i, parseInt(Math.random()*4+6)]
            r.push(rr)

        }
        var series = chart.line(r);
    })

    // set chart title
    chart.title("Вид и данные для аналитики уточняются в просессе пуско-наладки");
    // set the container element
    chart.container("container");
    // initiate chart display
    chart.draw();
}


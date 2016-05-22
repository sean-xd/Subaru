function el(id, parent){
  if(!parent) parent = document;
  if(id[0] === "#") return parent.getElementById(id.substr(1));
  if(id[0] === ".") return parent.getElementsByClassName(id.substr(1));
  return parent.getElementsByTagName(id);
}

function t(tag, config){
  if(!config) var config = {};
  if(tag){
    if(tag[0] === "."){config.classes = [tag.substr(1)]; tag = "div";}
    if(tag[0] === "#"){config.id = tag.substr(1); tag = "div";}
  }
  var parent = tag ? document.createElement(tag) : document.createDocumentFragment();
  if(config){
    var i = 0, x = Object.keys(config), j = 0;
    while(i < x.length){
      var key = x[i++], y = config[key];
      if(key === "classes"){while(j < y.length) parent.classList.add(y[j++])}
      else if(key === "click"){parent.addEventListener("click", y)}
      else{parent[key] = y}
    }
  }
  return function(ch, force){
    parent.html = function(){
      var temp = document.createElement("div");
      temp.appendChild(this.cloneNode(true));
      return temp.innerHTML;
    };
    if(force){parent.innerHTML = ch; return parent;}
    if(!ch && ch !== 0) return parent;
    var type = is(ch), k = 0;
    if(type === "String" || type === "Number") parent.textContent = ch;
    if(type.substr(0,4) === "HTML" || type.substr(0, 4) === "Docu") parent.appendChild(ch);
    if(type === "Array") while(k<ch.length) parent.appendChild(ch[k++]);
    return parent;
  };
}

function pa(e){return e.parentNode;}
function clc(e, cn){return e.classList.contains(cn);}
function cla(e, cn){return e.classList.add(cn);}
function clr(e, cn){return e.classList.remove(cn);}
function clt(e, cn){return e.classList.toggle(cn);}

function hp(url, cb){
  var req = new XMLHttpRequest();
  req.addEventListener("load", function(){
    if(!this.responseText) return;
    cb(JSON.parse(this.responseText));
  });
  req.open("GET", url);
  req.send();
}

function c(cb, a){return b => cb(a, b);}

function Magic(num, fn, check){
  var args = [];
  return data => {
    args.push(data);
    if(args.length === num) check ? fn.apply(null, args) : fn(args);
  }
}

function is(thing, type){
  if(!thing && thing !== 0) return false;
  thing = Object.prototype.toString.call(thing).slice(8,-1);
  return type ? (thing === type) : thing;
}

function sorter(check, backup){
  return function(a, b){
    if(check(a) === check(b) && backup) return backup(a) - backup(b);
    return check(a) - check(b);
  }
}

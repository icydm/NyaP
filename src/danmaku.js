/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';
import {DanmakuFrame,DanmakuFrameModule} from '../lib/danmaku-frame/src/danmaku-frame.js'
import addTextDanmaku from '../lib/danmaku-text/src/danmaku-text.js'
import {limitIn} from './NyaPCore.js';
addTextDanmaku(DanmakuFrame,DanmakuFrameModule);//init TextDanmaku mod

const colorChars='0123456789abcdef';
const danmakuProp=['color','text','size','mode','time'];
class Danmaku{
	constructor(core){
		this.core=core;
		this.danmakuFrame=new DanmakuFrame(core.danmakuContainer);
		if(core.opt.danmakuModule instanceof Array){
			core.opt.danmakuModule.forEach(m=>{
				this.initModule(m);
				this.danmakuFrame.enable(m);
			});
		}
		this.danmakuFrame.setMedia(core.video);
	}
	initModule(name){
		return this.danmakuFrame.initModule(name,this.core.opt.danmakuModuleArg[name]);
	}
	load(obj){
		return this.danmakuFrame.load(obj);
	}
	loadList(list){
		this.danmakuFrame.loadList(list);
	}
	remove(obj){
		this.danmakuFrame.unload(obj);
	}
	enable(){
		this.danmakuFrame.enable();
		this.core.emit('danmakuFrameToggle',name,this.module(name).enabled);
	}
	disable(){this.danmakuFrame.enable();}
	toggle(name,bool){
		if(typeof name==='boolean' || name==undefined){//frame switch mode
			bool=(name!=undefined)?name:!this.danmakuFrame.enabled;
			this.danmakuFrame[bool?'enable':'disable']();
			this.core.emit('danmakuFrameToggle',bool);
			return;
		}
		try{
			if(bool==undefined)bool=!this.module(name).enabled;
			this.danmakuFrame[bool?'enable':'disable'](name);
			this.core.emit('danmakuModuleToggle',name,this.module(name).enabled);
		}catch(e){
			this.core.log('','error',e);
			return false;
		}
		return true;
	}
	at(x,y){
		return this.module('TextDanmaku').danmakuAt(x,y);
	}
	module(name){
		return this.danmakuFrame.modules[name];
	}
	send(obj,callback){
		for(let i of danmakuProp)
			if((i in obj)===false)return false;
		if((obj.text||'').match(/^\s*$/))return false;
		obj.color=this.isVaildColor(obj.color);
		if(obj.color){
			obj.color=obj.color.replace(/\$/g,()=>{
				return colorChars[limitIn((16*Math.random())|0,0,15)];
			});
		}else{
			obj.color=null;
		}
		if(this.core.opt.danmakuSend instanceof Function){
			this.core.opt.danmakuSend(obj,callback||(()=>{}));
			return true;
		}
		return false;
	}
	isVaildColor(co){
		if(typeof co !== 'string')return false;
		return (co=co.match(/^\#?(([\da-f\$]{3}){1,2})$/i))?co[1]:false;
	}
}

export default Danmaku;

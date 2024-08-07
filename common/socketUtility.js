import { build } from './schemapack.js';
const EVENTCODE_CODE = 255;
const PING_CODE = 254;
const PONG_CODE = 253;

export class SocketConfig {
    packetSchemas;
    heartBeatInterval;
    keepAliveTimeout;
    constructor(opts){
        this.packetSchemas = opts.packetSchemas;
        this.heartBeatInterval = opts.heartBeatInterval || 2000;
        this.keepAliveTimeout = opts.keepAliveTimeout || 10000;

        this.eventCodes = {};
        this.schemas = new Array(256).fill(null);
        for (const [i, [eventName, schema]] of Object.entries(this.packetSchemas).entries()){
            this.eventCodes[eventName] = i;
            this.schemas[i] = build(schema);
        }
        this.schemas[EVENTCODE_CODE] = build({
            eventCode : 'uint8'
        });
        this.schemas[PING_CODE] = build({});
        this.schemas[PONG_CODE] = build({});
    }
    serializePacket(ec, info){
        return this.schemas[ec].encode(info);
    }
    deserializePacket(ec, buffer){
        return this.schemas[ec].decode(buffer);
    }
}
export class SocketClient{
    _ws;
    cfg;
    listeners;
    connectListeners;
    disconnectListeners;
    errorListeners;
    nextRecieveCode;
    pingPongDelta;
    constructor(ws, cfg){
        this.cfg = new SocketConfig(cfg);
        this.listeners = new Array(256).fill().map(() => new Set());
        this.listeners[PING_CODE].add(
            () => {
                this.emitEventCode(PONG_CODE, {});
            }
        );
        this.listeners[PONG_CODE].add(
            () => {
                this.pingPongDelta--;
            }
        );
        this.connectListeners = new Set();
        this.disconnectListeners = new Set();
        this.errorListeners = new Set();
        this.nextRecieveCode = EVENTCODE_CODE;

        this.pingPongDelta = 0;

        if (ws){
            this.ws = ws;
        }
    }
    init(){
        const that = this;
        this.nextRecieveCode = EVENTCODE_CODE;
        this._ws.binaryType = "arraybuffer";
        this._ws.onopen = function(){
            for (const listener of that.connectListeners){
                listener();
            }
            that.pingPongDelta = 0;
            const interval = setInterval(()=>{
                // console.log(that.pingPongDelta, that.cfg.keepAliveTimeout / that.cfg.heartBeatInterval);
                if (that._ws.readyState > 1 || that.pingPongDelta > that.cfg.keepAliveTimeout / that.cfg.heartBeatInterval){
                    that._ws.close();
                    that._ws.onclose();
                    clearInterval(interval);
                } else{
                    that.emitEventCode(PING_CODE, {});
                    that.pingPongDelta++;
                }
            }, that.cfg.heartBeatInterval);
        } 
        if (this._ws.readyState === 1){
            this._ws.onopen();
        }
        this._ws.onclose = function(){
            // if (that.disconnectFired){
            //     return;
            // }
            for (const listener of that.disconnectListeners){
                listener();
            }
            // that.disconnectFired = true;
        }
        this._ws.onerror = function(){
            for (const listener of that.errorListeners){
                listener();
            }
        }
        this._ws.onmessage = function(event){
            const data = event.data;
            try{
                const packetInfo = that.cfg.deserializePacket(that.nextRecieveCode, data);
                if (that.nextRecieveCode == EVENTCODE_CODE){
                    that.nextRecieveCode = packetInfo.eventCode;
                } else{
                    for (const listener of that.listeners[that.nextRecieveCode]){
                        listener(packetInfo);
                    }
                    that.nextRecieveCode = EVENTCODE_CODE;
                }
            } catch (e){
                console.log("Packet does not fit schema. PacketCode: " + that.nextRecieveCode + ".", e);
                return;
            }
        }
    }
    set ws(ws){
        if (this._ws){
            this._ws.onopen = null;
            this._ws.onclose = null;
            this._ws.onerror = null;
            this._ws.onmessage = null;
        }
        this._ws = ws;
        if (ws){
            this.init();
        }
    }
    get readyState(){
        return this._ws.readyState;
    }
    disconnect(){
        this._ws.close();
        // this._ws.onclose();
    }
    emit(eventName, info){
        console.log(eventName, JSON.stringify(info, null, 2));
        
        const eventCode = this.cfg.eventCodes[eventName];
        this.emitEventCode(eventCode, info);
    }
    emitEventCode(eventCode, info){
        if (this._ws.readyState === 1){
            let packet1, packet2;
            try{
                packet1 = this.cfg.serializePacket(EVENTCODE_CODE, { eventCode });
                packet2 = this.cfg.serializePacket(eventCode, info);
            } catch (e){
                console.log('error serializing ', eventCode, JSON.stringify(info, undefined, 4)); 
            }
            this._ws.send(packet1);
            this._ws.send(packet2);
        } else if (this._ws.readyState === 0){
            setTimeout(this.emitEventCode.bind(this,eventCode, info), 1000)
        } else{
            console.log("packet fail " + this._ws.readyState);
        }
    }
    
    on(eventName, listener){
        if (eventName == "connect"){
            this.connectListeners.add(listener);
        } else if (eventName == "disconnect"){
            this.disconnectListeners.add(listener);
        } else if (eventName == "error"){
            this.errorListeners.add(listener);
        }else{
            const eventCode = this.cfg.eventCodes[eventName];
            this.onEventCode(eventCode, listener);
        }
    }
    onEventCode(eventCode, listener){
        this.listeners[eventCode].add(listener);
    }
    removeListener(eventName, listener){
        if (eventName == "connect"){
            this.connectListeners.delete(listener);
        } else if (eventName == "disconnect"){
            this.disconnectListeners.delete(listener);
        } else if (eventName == "error"){
            this.errorListeners.delete(listener);
        }else{
            const eventCode = this.cfg.eventCodes[eventName];
            this.removeEventCodeListener(eventCode, listener);
        }
    }
    removeEventCodeListener(eventCode, listener){
        this.listeners[eventCode].delete(listener);
    }
}
export class SocketServer{
    wss;
    cfg;
    constructor(wss, cfg){
        this.wss = wss;
        this.cfg = new SocketConfig(cfg);
    }
    on(event, listener){
        if (event == "connection"){
            this.wss.on("connection", (ws, req) =>{
                const socket = new SocketClient(ws, this.cfg);
                const ip = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress;
                const userAgent = req?.headers['user-agent'];
                listener(socket, {ip, userAgent});
            });
        }
    }
}
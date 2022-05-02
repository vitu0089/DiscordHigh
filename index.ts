import Discord from "discord.js"
import { JsonDB as OverallDB } from "node-json-db"
import { Stripe as StripeModule } from "stripe"

const FolderName = "dynamic_values"

interface IncrementOptionsInterface{
    incremental?:boolean
}

export class Frame {
    wait(seconds:number){
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve(true)
            },seconds * 1000)
        })
    }
}

export class HighLevel {
    client:Discord.Client
    DB:{Members:OverallDB,Servers:OverallDB,Global:OverallDB}
    Frame:Frame = new Frame()
    default_data:object
    constructor(client:Discord.Client,default_data:object,options?:{save_interval?:number}){
        if (!client.isReady()) {
            throw "Client not logged in";
        }
        
        this.default_data = default_data

        this.client = client
        
        this.DB = {
            Members: new OverallDB("Members_" + client.user.id),
            Servers: new OverallDB("Servers_" + client.user.id),
            Global: new OverallDB("Global_" + client.user.id)
        }

        this.DB.Members.load()
        this.DB.Servers.load()
        this.DB.Global.load()
    }

    getUser(user_id:string,if_null?:any){
        var user_path = "/" + user_id
        var return_value = this.DB.Members.exists(user_path) && this.DB.Members.getData(user_path) || if_null
        return typeof return_value != undefined && return_value
    }
    setUser(user_id:string,data:any){
        var user_path = "/" + user_id
        this.DB.Members.push(user_path,data,true)
        return data
    }

    getServer(server_id:string,if_null?:any){
        var server_path = "/" + server_id
        return this.DB.Servers.exists(server_path) && this.DB.Servers.getData(server_path) || if_null || false
    }
    setServer(server_id:string,data:any){
        var server_path = "/" + server_id
        this.DB.Servers.push(server_path,data,true)
        return data
    }

    getGlobal(global_value:string,if_null?:any){
        var global_path = "/" + global_value
        return this.DB.Global.exists(global_path) && this.DB.Global.getData(global_path) || if_null || false
    }
    setGlobal(global_value:string,data:any){
        var global_path = "/" + global_value
        this.DB.Global.push(global_path,data,true)
        return data
    }

    forceSave(){
        this.DB.Global.save()
        this.DB.Servers.save()
        this.DB.Members.save()
    }
}

export class Points {
    name:string
    default_value:number
    options:IncrementOptionsInterface | undefined
    main_module:HighLevel

    constructor(main_module:HighLevel,points_name:string,start_value:number,options?:IncrementOptionsInterface | undefined){
        this.name = points_name
        this.default_value = start_value
        this.options = options
        this.main_module = main_module
    }

    incrementUser(user_id:string,value?:number){
        if (!this.options || this.options && !this.options.incremental){
            throw "Trying to increment a non-incrementable value"
        }

        value = value || 1
        
        const player_data = this.main_module.getUser(user_id,this.main_module.default_data)

        if (player_data == undefined) {
            throw "Couldn't find player_data"
        }

        var folder = player_data[FolderName]
        
        if (!folder) {
            player_data[FolderName] = {}
            folder = player_data[FolderName]
        }
        
        if (!folder[this.name]){
            folder[this.name] = this.default_value
        }

        const possible_transaction = folder[this.name] + value >= 0
        if (possible_transaction){
            folder[this.name] += value
            this.main_module.setUser(user_id,player_data)
        }
        return possible_transaction
    }
    getUserData(user_id:string){
        return this.main_module.getUser(user_id)[this.name] || this.main_module.setUser(user_id,0) && this.default_value
    }

    incrementServer(server_id:string,value?:number){
        if (!this.options || this.options && !this.options.incremental){
            throw "Trying to increment a non-incrementable value"
        }

        value = value || 1
        
        const server_data = this.main_module.getServer(server_id,this.main_module.default_data)
        
        if (server_data == undefined) {
            throw "Couldn't find server_data"
        }

        var folder = server_data[FolderName]
        
        if (!folder) {
            server_data[FolderName] = {}
            folder = server_data[FolderName]
        }
        
        if (!folder[this.name]){
            folder[this.name] = this.default_value
        }

        const possible_transaction = folder[this.name] + value >= 0
        if (possible_transaction){
            folder[this.name] += value
            this.main_module.setServer(server_id,server_data)
        }
        return possible_transaction
    }
    getServerData(server_id:string){
        return this.main_module.getServer(server_id)[this.name] || this.incrementServer(server_id,0) && this.default_value
    }

    incrementGlobal(setting_name:string,value?:number){
        if (!this.options || this.options && !this.options.incremental){
            throw "Trying to increment a non-incrementable value"
        }

        value = value || 1
        
        const global_data = this.main_module.getGlobal(setting_name,this.main_module.default_data)
        
        if (global_data == undefined) {
            throw "Couldn't find global_data"
        }
        
        if (!global_data[this.name]){
            global_data[this.name] = this.default_value
        }

        const possible_transaction = global_data[this.name] + value >= 0
        if (possible_transaction){
            global_data[this.name] += value
            this.main_module.setGlobal(setting_name,global_data)
        }
        return possible_transaction
    }
    getGlobalData(setting_name:string){
        return this.main_module.getGlobal(setting_name)[this.name] || this.incrementGlobal(setting_name,0) && this.default_value
    }
}

export class Stripe {
    public_key:string
    private_key:string
    handler:StripeModule
    constructor(public_key:string,private_key:string){
        this.public_key = public_key
        this.private_key = private_key

        //@ts-ignore
        this.handler = new StripeModule(private_key)
    }

    invoice(options:{quantity:number,price_id:string}){
        return this.handler.paymentLinks.create({
            line_items:[{quantity:1,price:options.price_id,adjustable_quantity:{enabled:true,maximum:10,minimum:1}}]
        })
    }
}
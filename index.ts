import Discord from "discord.js"
import { JsonDB as OverallDB } from "node-json-db"

interface IncrementOptionsInterface{
    incremental?:boolean
}

export class HLD {
    client:Discord.Client
    DB:{Members:OverallDB,Servers:OverallDB,Global:OverallDB}
    constructor(client:Discord.Client){
        if (!client.isReady()) {
            throw "Client not logged in";
        }

        this.client = client
        this.DB = {
            Members: new OverallDB("Members_" + client.user.id),
            Servers: new OverallDB("Servers_" + client.user.id),
            Global: new OverallDB("Global_" + client.user.id)
        }
    }

    getUser(user_id:string,if_null?:any){
        var user_path = "/" + user_id
        return this.DB.Members.exists(user_path) && this.DB.Members.getData(user_path) || if_null || false
    }
    setUser(user_id:string,data:any){
        var user_path = "/" + user_id
        this.DB.Members.push(user_path,data,true)
        return data
    }
}

export class VS {
    name:string
    default_value:number
    options:IncrementOptionsInterface | undefined
    main_module:HLD

    constructor(main_module:HLD,points_name:string,start_value:number,options?:IncrementOptionsInterface | undefined){
        this.name = points_name
        this.default_value = start_value
        this.options = options
        this.main_module = main_module
    }

    increment(user_id:string,value:number){
        if (!this.options || this.options && !this.options.incremental){
            throw "Trying to increment a non-incrementable value"
        }
        
        const player_data = this.main_module.getUser(user_id)

        if (!player_data) {
            throw "Couldn't find player_data"
        }
        
        if (!player_data[this.name]){
            player_data[this.name] = this.default_value
        }

        const possible_transaction = player_data[this.name] + value >= 0
        if (possible_transaction) player_data[this.name] += value
        return possible_transaction
    }

    getValue(user_id:string){
        return this.main_module.getUser(user_id)[this.name] || this.increment(user_id,0) && this.default_value
    }
}
import Discord from "discord.js"
import { JsonDB as OverallDB } from "node-json-db"

export default class HLD {
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
    setUser(user_id:string,if_null?:any){

    }
}
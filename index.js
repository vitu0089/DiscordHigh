"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_json_db_1 = require("node-json-db");
class HLD {
    constructor(client) {
        if (!client.isReady()) {
            throw "Client not logged in";
        }
        this.client = client;
        this.DB = {
            Members: new node_json_db_1.JsonDB("Members_" + client.user.id),
            Servers: new node_json_db_1.JsonDB("Servers_" + client.user.id),
            Global: new node_json_db_1.JsonDB("Global_" + client.user.id)
        };
    }
    getUser(user_id, if_null) {
        console.log(this.DB.getData("/"));
        //return this.DB.find("/Member/" + user_id)
    }
    setUser(user_id, if_null) {
    }
}
exports.default = HLD;

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
        var user_path = "/" + user_id;
        return this.DB.Members.exists(user_path) && this.DB.Members.getData(user_path) || if_null || false;
    }
    setUser(user_id, if_null) {
    }
}
exports.default = HLD;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VS = exports.HLD = void 0;
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
    setUser(user_id, data) {
        var user_path = "/" + user_id;
        this.DB.Members.push(user_path, data, true);
        return data;
    }
}
exports.HLD = HLD;
class VS {
    constructor(main_module, points_name, start_value, options) {
        this.name = points_name;
        this.default_value = start_value;
        this.options = options;
        this.main_module = main_module;
    }
    increment(user_id, value) {
        if (!this.options || this.options && !this.options.incremental) {
            throw "Trying to increment a non-incrementable value";
        }
        const player_data = this.main_module.getUser(user_id);
        if (!player_data) {
            throw "Couldn't find player_data";
        }
        if (!player_data[this.name]) {
            player_data[this.name] = this.default_value;
        }
        const possible_transaction = player_data[this.name] + value >= 0;
        if (possible_transaction)
            player_data[this.name] += value;
        return possible_transaction;
    }
    getValue(user_id) {
        return this.main_module.getUser(user_id)[this.name] || this.increment(user_id, 0) && this.default_value;
    }
}
exports.VS = VS;

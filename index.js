"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stripe = exports.Points = exports.HighLevel = exports.Frame = void 0;
const node_json_db_1 = require("node-json-db");
const stripe_1 = require("stripe");
const FolderName = "dynamic_values";
class Frame {
    wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, seconds * 1000);
        });
    }
}
exports.Frame = Frame;
class HighLevel {
    constructor(client, default_data, options) {
        this.Frame = new Frame();
        if (!client.isReady()) {
            throw "Client not logged in";
        }
        this.default_data = default_data;
        this.client = client;
        this.DB = {
            Members: new node_json_db_1.JsonDB("Members_" + client.user.id),
            Servers: new node_json_db_1.JsonDB("Servers_" + client.user.id),
            Global: new node_json_db_1.JsonDB("Global_" + client.user.id)
        };
        this.DB.Members.load();
        this.DB.Servers.load();
        this.DB.Global.load();
    }
    getUser(user_id, if_null) {
        var user_path = "/" + user_id;
        var return_value = this.DB.Members.exists(user_path) && this.DB.Members.getData(user_path) || if_null;
        return typeof return_value != undefined && return_value;
    }
    setUser(user_id, data) {
        var user_path = "/" + user_id;
        this.DB.Members.push(user_path, data, true);
        return data;
    }
    getServer(server_id, if_null) {
        var server_path = "/" + server_id;
        return this.DB.Servers.exists(server_path) && this.DB.Servers.getData(server_path) || if_null || false;
    }
    setServer(server_id, data) {
        var server_path = "/" + server_id;
        this.DB.Servers.push(server_path, data, true);
        return data;
    }
    getGlobal(global_value, if_null) {
        var global_path = "/" + global_value;
        return this.DB.Global.exists(global_path) && this.DB.Global.getData(global_path) || if_null || false;
    }
    setGlobal(global_value, data) {
        var global_path = "/" + global_value;
        this.DB.Global.push(global_path, data, true);
        return data;
    }
    forceSave() {
        this.DB.Global.save();
        this.DB.Servers.save();
        this.DB.Members.save();
    }
}
exports.HighLevel = HighLevel;
class Points {
    constructor(main_module, points_name, start_value, options) {
        this.name = points_name;
        this.default_value = start_value;
        this.options = options;
        this.main_module = main_module;
    }
    incrementUser(user_id, value) {
        if (!this.options || this.options && !this.options.incremental) {
            throw "Trying to increment a non-incrementable value";
        }
        value = value || 1;
        const player_data = this.main_module.getUser(user_id, this.main_module.default_data);
        if (player_data == undefined) {
            throw "Couldn't find player_data";
        }
        var folder = player_data[FolderName];
        if (!folder) {
            player_data[FolderName] = {};
            folder = player_data[FolderName];
        }
        if (!folder[this.name]) {
            folder[this.name] = this.default_value;
        }
        const possible_transaction = folder[this.name] + value >= 0;
        if (possible_transaction) {
            folder[this.name] += value;
            this.main_module.setUser(user_id, player_data);
        }
        return possible_transaction;
    }
    getUserData(user_id) {
        return this.main_module.getUser(user_id)[this.name] || this.main_module.setUser(user_id, 0) && this.default_value;
    }
    incrementServer(server_id, value) {
        if (!this.options || this.options && !this.options.incremental) {
            throw "Trying to increment a non-incrementable value";
        }
        value = value || 1;
        const server_data = this.main_module.getServer(server_id, this.main_module.default_data);
        if (server_data == undefined) {
            throw "Couldn't find server_data";
        }
        var folder = server_data[FolderName];
        if (!folder) {
            server_data[FolderName] = {};
            folder = server_data[FolderName];
        }
        if (!folder[this.name]) {
            folder[this.name] = this.default_value;
        }
        const possible_transaction = folder[this.name] + value >= 0;
        if (possible_transaction) {
            folder[this.name] += value;
            this.main_module.setServer(server_id, server_data);
        }
        return possible_transaction;
    }
    getServerData(server_id) {
        return this.main_module.getServer(server_id)[this.name] || this.incrementServer(server_id, 0) && this.default_value;
    }
    incrementGlobal(setting_name, value) {
        if (!this.options || this.options && !this.options.incremental) {
            throw "Trying to increment a non-incrementable value";
        }
        value = value || 1;
        const global_data = this.main_module.getGlobal(setting_name, this.main_module.default_data);
        if (global_data == undefined) {
            throw "Couldn't find global_data";
        }
        if (!global_data[this.name]) {
            global_data[this.name] = this.default_value;
        }
        const possible_transaction = global_data[this.name] + value >= 0;
        if (possible_transaction) {
            global_data[this.name] += value;
            this.main_module.setGlobal(setting_name, global_data);
        }
        return possible_transaction;
    }
    getGlobalData(setting_name) {
        return this.main_module.getGlobal(setting_name)[this.name] || this.incrementGlobal(setting_name, 0) && this.default_value;
    }
}
exports.Points = Points;
class Stripe {
    constructor(public_key, private_key) {
        this.public_key = public_key;
        this.private_key = private_key;
        //@ts-ignore
        this.handler = new stripe_1.Stripe(private_key);
    }
    createPaymentLink(options) {
        return this.handler.paymentLinks.create({
            line_items: [{ quantity: 1, price: options.price_id, adjustable_quantity: { enabled: true, maximum: 10, minimum: 1 } }]
        });
    }
}
exports.Stripe = Stripe;

module.exports = (RED) => {
    class ProvideGlobal {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.on('input', (msg) => {
                try {
                    // Attach global to the message object
                    msg.global = global;
                    // attach keywords
                    msg.global.require = require;
                    msg.global.module = module;
                    msg.global.exports = exports;
                    msg.global.__dirname = __dirname;
                    msg.global.__filename = __filename;

                    // Send the updated message object
                    this.send(msg);
                } catch (err) {
                    this.error(`Error in ProvideGlobal: ${err.message}`, msg);
                }
            });
        }
    }
    RED.nodes.registerType("provide-global", ProvideGlobal);
};

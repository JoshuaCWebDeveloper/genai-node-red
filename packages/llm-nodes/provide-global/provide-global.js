module.exports = (RED) => {
    class ProvideGlobal {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.on('input', (msg) => {
                try {
                    // Attach global the message object
                    msg.global = global;
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

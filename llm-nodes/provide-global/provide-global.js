module.exports = (RED) => {
    class ProvideImportFn {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.on('input', (msg) => {
                try {
                    // Custom function wrapper logic
                    const sendFunction = async (module) => {
                        return await import(module);    
                    }
                    // Attach the function to the message object
                    msg.import = sendFunction;
                    // Send the updated message object
                    this.send(msg);
                } catch (err) {
                    this.error(`Error in ProvideImportFn: ${err.message}`, msg);
                }
            });
        }
    }
    RED.nodes.registerType("provide-import-fn", ProvideImportFn);
};

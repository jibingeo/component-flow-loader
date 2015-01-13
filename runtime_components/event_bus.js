"use strict"

/**
 * Exports a global EventEmitter instance for component_wrappers to publish
 * prop change messages to, and for the data_log_panel to subscribe to
 *
 * TODO: Use a more robust mechanism for this
 * @type {EventEmitter|*}
 */


var EventEmitter = require("events").EventEmitter;

var eventBus = new EventEmitter();
eventBus.setMaxListeners(0);

module.exports = eventBus;
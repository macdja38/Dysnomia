"use strict";
var path = require("path");
var fs = require("fs");

var COMMAND_PATH = "commands";
var commands = [];

// Adds some required functions to a command module if it does not have them
exports.normalizeCommandModule = function(commandModule) {
    // A command module must always have a command name
    if (!commandModule.commandName) {
        throw new Error("Module has no command name!");
    }

    commandModule.description = commandModule.description || "";
    commandModule.aliases = commandModule.aliases || [];
    commandModule.isValid = commandModule.isValid || (() => true);
    commandModule.execute = commandModule.execute || (() => {});

    return commandModule;
};

// Adds utility functions to a command object
exports.addUtilities = function(command) {
    command.hasFlag = function(flagName) {
        var firstChar = flagName[0];
        return firstChar in command.flags || command.options[flagName] === true;
    };

    command.getOption = function(option, defaultValue) {
        return command.options[option] || defaultValue;
    };

    command.joinArguments = function(delimiter) {
        return command.arguments.join(delimiter || " ");
    };
};

// Load all commands from the directory
exports.loadCommands = function() {
    var normalizedPath = path.join(__dirname, COMMAND_PATH);

    fs.readdirSync(normalizedPath).forEach(function(file) {
        var commandModule = exports.normalizeCommandModule(require(
            "./commands/" + file));
        commands.push(commandModule);
    });
};

// Find a command with a name defined in the given command object
exports.findCommand = function(command) {
    var commandName = command.command;
    for(var element in commands) {
        if(element.commandName === commandName ||
                element.commandName in element.aliases) {
            // Command found
            return element;
        }
    }
};
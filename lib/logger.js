var chalk = require('chalk');

const categories = {
    main: chalk.yellow,
    mal: chalk.blue,
    mml: chalk.magenta,
    osu: chalk.cyan
};

/**
 * Log something.
 * @param {String} category 
 * @param {String} message 
 */
function logger(category, message) {
    console.log(`[${categories[category.toLowerCase()](category)}] ${message}`);
}

module.exports = logger;
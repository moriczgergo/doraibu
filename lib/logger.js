var chalk = require('chalk'); // Colored console

// Logging categories: a name paired with a chalk color
const categories = {
    main: chalk.yellow,
    mal: chalk.blue,
    mml: chalk.magenta,
    osu: chalk.cyan
};

/**
 * Log something.
 * 
 * @param {String} category 
 * @param {String} message 
 */
function logger(category, message) {
    console.log(`[${categories[category.toLowerCase()](category)}] ${message}`); // Log colored message
}

module.exports = logger;
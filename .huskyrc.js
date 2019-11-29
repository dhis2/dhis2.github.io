const { config } = require('@dhis2/cli-style')

module.exports = {
    hooks: {
        ...config.husky.hooks,
        'pre-commit': 'd2-style text check --pattern "**/*.{md,json,yml,yaml}" --staged',
    },
}

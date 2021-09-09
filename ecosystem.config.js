const DatabaseName = "zezedeyeter"

module.exports = {
    apps: [{
            name: `${DatabaseName}-guard1`,
            script: "./Guard1/main.js",
            watch: true
        },
        {
            name: `${DatabaseName}-guard2`,
            script: "./Guard2/main.js",
            watch: true
        },
        {
            name: `${DatabaseName}-guard3`,
            script: "./Guard3/main.js",
            watch: true
        },
        {
            name: `${DatabaseName}-guard4`,
            script: "./Guard4/main.js",
            watch: true
        },
        {
            name: `${DatabaseName}-guard5`,
            script: "./Guard5/main.js",
            watch: false
        },

    ]
};
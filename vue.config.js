module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                // options placed here will be merged with default configuration and passed to electron-builder
                "appId": "com.pabushabi.gameconstructor",
                "productName": "Game Constructor",
                "win": {
                    "icon": "./public/ic_launcher.png"
                },
                "files": [
                    "**/*",
                    "./res/**/*"
                ],
                "extraResources": [
                    {
                        "from": "./res/",
                        "to": "./",
                        "filter": [
                            "**/*"
                        ]
                    },
                    {
                        "from": "./mingo/",
                        "to": "./mingo",
                        "filter": [
                            "**/*"
                        ]
                    }
                ]
            }
        }
    }
}

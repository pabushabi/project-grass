module.exports = {
  "pluginOptions": {
    "electronBuilder": {
      "builderOptions": {
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
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
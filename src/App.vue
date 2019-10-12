<template>
  <div id="app">
    <h1>CONSTRUCTOR</h1>
    <label>
      label:
      <input v-model="label" type="text" disabled>
    </label>
    <label>
      title:
      <input v-model="title" type="text">
    </label>
    <br>
    <label>
      speed:
      <input v-model="speed" type="number">
    </label>
    <label>
      gravity:
      <input v-model="gravity" type="number">
    </label>
    <br>
    <br>
    <button @click="compile">compile</button>
    <button @click="run">run</button>
  </div>
</template>

<script>
  const { app } = require('electron').remote;
  const { ipcRenderer } = require('electron');
  const execFile = require("child_process").execFile;
  const fs = require('fs');

  console.log(`${app.getName()} ${app.getVersion()} ${app.getAppPath()}`);
  export default {
    name: 'app',
    components: {},
    data() {
      return {
        label: "",
        title: "",
        speed: 0.0,
        gravity: 0.0,
        newData: "",
      }
    },
    methods: {
      async compile() {
        fs.readFile('resources/input/game.go', 'utf-8', (err, data) => {
          ipcRenderer.send("set-progress", 0.2);
          if (err !== null) {
            console.log(err);
            alert("Error: \nInput script isn't present or corrupted")
          }
          // console.log(err, data);
          this.modify(data);
          // console.log(this.newData);
          fs.writeFile('resources/generated/game.go', this.newData, err1 => {
            ipcRenderer.send("set-progress", 0.3);
            if (err1 !== null) console.log(err1);
            let path = app.getAppPath() + "";
            path = path.replace(/app.asar/gi, "mingo\\bin\\go.exe");
            console.log(path);
            execFile('cmd', ['/c', `${path} build -i -o output/app.exe resources/generated/game.go`], (err) => {
            // execFile('cmd', ['/c', `C:\\Go\\bin\\go build -i -o output/app.exe resources/generated/game.go`], (err) => {
              ipcRenderer.send("set-progress", 1);
              if (!fs.existsSync("./sheet.csv")) {
                fs.copyFileSync("resources/sheet.csv", "./sheet.csv");
                fs.copyFileSync("resources/sheet.csv", "output/sheet.csv");
              }
              if (!fs.existsSync("./sheet.png")) {
                fs.copyFileSync("resources/sheet.png", "./sheet.png");
                fs.copyFileSync("resources/sheet.png", "output/sheet.png");
              }
              alert(`compiled! win-${process.getSystemVersion()}`);
              if (err) console.log(`${err}`);
              this.run();
            });
          })
        })
      },
      run() {
        if (fs.existsSync("output/app.exe"))
          execFile('output/app.exe', (err, stdout, stderr) => {
            ipcRenderer.send("set-progress", 0);
            if (err)
              console.log(`err-${err}, stderr-${stderr}`);
          });
        else alert("executable file is't present or corrupted");
      },
      modify(data) {
        this.newData = data.replace(/gameTitle := "*([a-zA-Za-яА-Я0-9]|\s)*"*/gi, `gameTitle := "${this.title}"`);
        this.newData = this.newData.replace(/gameGravity := (-|[a-zA-Za-яА-Я0-9]|\s)*\n/gi, `gameGravity := ${this.gravity}.0\n`);
        this.newData = this.newData.replace(/gameRunSpeed := ([a-zA-Za-яА-Я0-9]|\s)*\n/gi, `gameRunSpeed := ${this.speed}.0\n\n`);
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 60px 10px 10px 10px;
  }
  input {
    margin: 10px;
  }
  button {
    margin: 5px;
  }
</style>

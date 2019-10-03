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
  </div>
</template>

<script>
  const {app} = require('electron').remote;
  const { ipcRenderer } = require('electron');

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
      compile() {
        console.log(`t-${this.title}, s-${this.speed}, g-${this.gravity}`);
        fs.readFile('input/game.go', 'utf-8', (err, data) => {
          ipcRenderer.send("set-progress", 0.1);
          if (err !== null) console.log(err);
          console.log(err, data);
          this.newData = data.replace(/gameTitle := "*([a-zA-Za-яА-Я0-9]|\s)*"*/gi, `gameTitle := "${this.title}"`);
          this.newData = this.newData.replace(/gameGravity := (-|[a-zA-Za-яА-Я0-9]|\s)*\n/gi, `gameGravity := ${this.gravity}.0\n`);
          this.newData = this.newData.replace(/gameRunSpeed := ([a-zA-Za-яА-Я0-9]|\s)*\n/gi, `gameRunSpeed := ${this.speed}.0\n\n`);
          console.log(this.newData);
          fs.writeFile('generated/game.go', this.newData, err1 => {
            ipcRenderer.send("set-progress", 0.3);
            if (err1 !== null) console.log(err1);
            const  execFile = require("child_process").execFile;
            execFile('cmd', ['/c', `C:\\Go\\bin\\go build -i -o output/app.exe generated/game.go`], (err) => {
              ipcRenderer.send("set-progress", 1);
              alert(`compiled! win-${process.getSystemVersion()}`);
              console.log(`${err}`);
              execFile('output/app.exe', (err, stdout, stderr) => {
                ipcRenderer.send("set-progress", 0);
                console.log(`err-${err}, stderr-${stderr}`);
              })
            });
          })
        })
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
</style>

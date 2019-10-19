<template>
    <v-app>
        <v-navigation-drawer absolute permanent>
            <v-list nav>
                <v-subheader>LIST OF ELEMENTS</v-subheader>
                <v-list-item-group v-model="item" color="primary">
                    <v-list-item v-for="(item, i) in items" :key="i">
                        <v-list-item-content>
                            <v-list-item-title v-text="item.text"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-btn block outlined>+</v-btn>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <v-navigation-drawer absolute permanent right>
            <v-container>
                <h3 class="text-center">Parameters</h3>
            </v-container>
            <v-container class="title-list">
                <p id="title-p">Title</p>
                <v-text-field v-model="title" type="text" dense flat solo filled clearable id="title-inp"/>
            </v-container>
            <v-container class="run-btns">
                <v-btn @click="compile" small outlined id="compile-btn">compile</v-btn>
                <v-btn @click="run" small outlined class="ml-2" id="run-btn">run</v-btn>
            </v-container>
            <v-divider/>

            <v-container class="options-list">
                <label>Speed:</label>
                <v-text-field v-model="speed" type="number" dense flat filled solo/>
                <label>Gravity:</label>
                <v-text-field v-model="gravity" type="number" dense flat filled solo/>
                <label>width</label>
                <v-text-field v-model="sizew" type="number" dense disabled flat filled solo placeholder="disabled"/>
                <label>height</label>
                <v-text-field v-model="sizeh" type="number" dense disabled flat filled solo placeholder="disabled"/>
                <label>Sprite:</label>
                <input type="file" id="filer"/>
            </v-container>
            <v-divider/>

            <v-container>
                <v-textarea v-model="debuginfo" solo flat filled placeholder="debug info" readonly/>
            </v-container>
        </v-navigation-drawer>

        <canvas width="900" height="500"></canvas>
    </v-app>
</template>

<script>
    const {app} = require('electron').remote;
    const {ipcRenderer} = require('electron');
    const execFile = require("child_process").execFile;
    const fs = require('fs');

    console.log(`${app.getName()} ${app.getVersion()} ${app.getAppPath()}`);
    export default {
        name: 'app',
        components: {},
        data() {
            return {
                title: "",
                speed: 0.0,
                gravity: 0.0,
                newData: "",
                debuginfo: "",
                item: 1,
                items: [
                    { text: 'Player' },
                    { text: 'Bot1' },
                    { text: 'Block1' },
                ],
            }
        },
        methods: {
            async compile() {
                fs.readFile('resources/input/game.go', 'utf-8', (err, data) => {
                    ipcRenderer.send("set-progress", 0.2);
                    if (err !== null) {
                        console.log(err);
                        this.debuginfo += err;
                        alert("Error: \nInput script isn't present or corrupted")
                    }
                    // console.log(err, data);
                    this.modify(data);
                    // console.log(this.newData);
                    fs.writeFile('resources/generated/game.go', this.newData, err => {
                        ipcRenderer.send("set-progress", 0.3);
                        if (err !== null) {
                            console.log(err);
                            this.debuginfo += err;
                        }
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
                            if (err) {
                                console.log(err);
                                this.debuginfo += err;
                            }
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
                        this.debuginfo += err;
                        this.debuginfo += stderr;
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
    body {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin: 0;
    }
    canvas {
        border: 1px solid #2c3e50;
        position: fixed;
        right: 305px;
        top: 50px;
    }
    aside {
        width: 290px !important;
    }
    .run-btns {
        display: grid;
        /*grid-template-columns: 60px 205px;*/
        /*grid-template-rows: repeat(auto-fill, 50px);*/
        grid-template-areas: ". . compile run";
    }
    .title-list {
        display: grid;
        grid-template-columns: 60px 205px;
        grid-template-rows: 30px;
    }
    .options-list {
        display: grid;
        grid-template-columns: 60px 205px;
        grid-template-rows: repeat(4, 50px);
    }
    #compile-btn {
        grid-area: compile;
    }
    #run-btn {
        grid-area: run;
    }
    input, textarea {
        margin: 0!important;
    }
    p, label {
        padding-top: 7px;
    }
</style>

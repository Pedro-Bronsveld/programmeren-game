"use strict";
class Game {
    constructor(levelsData, meshesData, soundsData) {
        this.gameloop = () => {
            let delta = this.propClock.getDelta();
            this.level.update(delta);
            this.renderer.update();
            this.hud.update();
            this.menu.update();
            requestAnimationFrame(() => this.gameloop());
        };
        this.levelsData = levelsData;
        this.meshesData = meshesData;
        this.soundsData = soundsData;
        this.propElement = document.getElementsByTagName("game")[0];
        this.eventHandler = new EventHandler();
        this.propRenderer = new Renderer();
        this.propMenu = new Menu(this);
        this.levelOrder = ["main_menu", "level_0", "level_1", "level_2", "level_3"];
        this.propHud = new Hud(this);
        this.globalSound = new GlobalSound(this);
        this.propLevel = new MainMenu(this);
        this.propClock = new THREE.Clock();
        this.gameloop();
    }
    get level() { return this.propLevel; }
    ;
    get renderer() { return this.propRenderer; }
    ;
    get clock() { return this.propClock; }
    ;
    get element() { return this.propElement; }
    ;
    get hud() { return this.propHud; }
    ;
    get menu() { return this.propMenu; }
    ;
    get events() { return this.eventHandler; }
    ;
    get sound() { return this.globalSound; }
    ;
    levelDataByName(name) {
        let errorNum = 0;
        let i = 0;
        for (let levelData of this.levelsData) {
            if (levelData.name == name) {
                return levelData;
            }
            else if (levelData.name == "error_level") {
                errorNum = i;
            }
            i++;
        }
        return this.levelsData[errorNum];
    }
    meshDataByName(name) {
        let errorNum = 0;
        let i = 0;
        for (let meshData of this.meshesData) {
            if (meshData.name == name) {
                return meshData;
            }
            else if (meshData.name == "error") {
                errorNum = i;
            }
            i++;
        }
        return this.meshesData[errorNum];
    }
    soundDataByName(name) {
        let errorNum = 0;
        let i = 0;
        for (let soundData of this.soundsData) {
            if (soundData.name == name) {
                return soundData;
            }
            else if (soundData.name == "error") {
                errorNum = i;
            }
            i++;
        }
        return this.soundsData[errorNum];
    }
    checkNextLevel(level) {
        let levelIndex = this.levelOrder.indexOf(level);
        levelIndex = (levelIndex + 1) % this.levelOrder.length;
        return this.levelOrder[levelIndex];
    }
    loadLevel(name) {
        if (name == "main_menu") {
            this.propLevel = new MainMenu(this);
        }
        else {
            this.propLevel = new Level(this, name);
            this.renderer.lockPointer();
        }
    }
}
let game;
class PreLoad {
    constructor() {
        this.assetsDir = "assets";
        this.modelsDir = this.assetsDir + "/models";
        this.levelsDir = this.assetsDir + "/levels";
        this.soundsDir = this.assetsDir + "/sounds";
        this.preloadedMeshes = {};
        this.loadedMeshes = new Array();
        this.preloadedLevels = {};
        this.loadedLevels = new Array();
        this.preloadedSounds = {};
        this.loadedSounds = new Array();
        reqwest(this.assetsDir + "/preload_list.json", (preloadData) => {
            let modelNames = preloadData.models;
            let levelNames = preloadData.levels;
            let soundFiles = preloadData.sounds;
            for (let name of modelNames) {
                this.preloadedMeshes[name] = false;
                this.loadMesh(name);
            }
            for (let name of levelNames) {
                this.preloadedLevels[name] = false;
                this.loadLevel(name);
            }
            for (let filename of soundFiles) {
                this.preloadedSounds[filename] = false;
                this.loadSound(filename);
            }
            this.waitForLoad();
        });
    }
    loadMesh(name) {
        let jsonLoader = new THREE.JSONLoader();
        let meshSrc = this.modelsDir + "/" + name + "/model.json";
        jsonLoader.load(meshSrc, (geometry, materials) => {
            let mesh;
            if (geometry.bones.length > 0) {
                materials.forEach(function (material) {
                    material.skinning = true;
                });
                mesh = new THREE.SkinnedMesh(geometry, materials);
            }
            else {
                mesh = new THREE.Mesh(geometry, materials);
            }
            mesh.name = name;
            let propsSrc = this.modelsDir + "/" + name + "/modelProps.json";
            reqwest(propsSrc, (modelProps) => {
                mesh.castShadow = modelProps.cast_shadow;
                mesh.receiveShadow = modelProps.receive_shadow;
                this.loadedMeshes.push(new MeshData(name, mesh, geometry));
                this.preloadedMeshes[name] = true;
            });
        });
    }
    loadLevel(name) {
        let levelSrc = this.levelsDir + "/" + name + ".json";
        reqwest(levelSrc, (levelSrcData) => {
            this.loadedLevels.push(levelSrcData);
            this.preloadedLevels[name] = true;
        });
    }
    loadSound(filename) {
        let audioLoader = new THREE.AudioLoader();
        let filenameArray = filename.split(".");
        let name = filenameArray.slice(0, filenameArray.length - 1).join(".");
        let soundSrc = this.soundsDir + "/" + filename;
        audioLoader.load(soundSrc, (buffer) => {
            this.loadedSounds.push(new SoundData(name, buffer));
            this.preloadedSounds[filename] = true;
        }, function () {
        }, function () {
            console.log('An error occured when loading' + filename);
        });
    }
    waitForLoad() {
        let loadingDone = () => {
            for (let key in this.preloadedMeshes) {
                let state = this.preloadedMeshes[key];
                if (!state) {
                    return false;
                }
            }
            for (let key in this.preloadedLevels) {
                let state = this.preloadedLevels[key];
                if (!state) {
                    return false;
                }
            }
            for (let key in this.preloadedSounds) {
                let state = this.preloadedSounds[key];
                if (!state) {
                    return false;
                }
            }
            return true;
        };
        if (!loadingDone()) {
            requestAnimationFrame(() => this.waitForLoad());
        }
        else {
            game = new Game(this.loadedLevels, this.loadedMeshes, this.loadedSounds);
        }
    }
}
window.addEventListener("load", () => new PreLoad());
class GameObject {
    constructor(level, name, objectType, blendName = "") {
        this.uniqueName = (name, level) => {
            let uniqueName = name;
            let num = 0;
            let names = level.namesInUse();
            while (names.indexOf(uniqueName) != -1) {
                num++;
                uniqueName = name + "." + num;
            }
            return uniqueName;
        };
        this.modelName = name;
        this.propLevel = level;
        this.name = this.uniqueName(name, this.level);
        this.blendName = blendName;
        this.objectType = objectType;
    }
    get level() {
        return this.propLevel;
    }
    get type() {
        return this.objectType;
    }
}
class Camera extends GameObject {
    constructor(level, name = "Camera", position = new THREE.Vector3(), rotation = new THREE.Vector3()) {
        super(level, name, name);
        this.setSize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.09, 2000);
        this.camera.rotation.x = rotation.x;
        this.camera.rotation.y = rotation.y;
        this.camera.rotation.z = rotation.z;
        this.camera.position.set(position.x, position.y, position.z);
        if (name == "Camera") {
            this.level.game.events.cameraResize = this.setSize;
        }
        else if (name = "PlayerCamera") {
            this.level.game.events.playerCameraReize = this.setSize;
        }
    }
    getRotation() {
        return this.camera.rotation;
    }
    assignToRenderer(renderer) {
        renderer.camera = this.camera;
    }
    update() {
    }
    get pX() { return this.camera.position.x; }
    ;
    get pY() { return this.camera.position.y; }
    ;
    get pZ() { return this.camera.position.z; }
    ;
    set pX(x) { this.camera.position.x = x; }
    ;
    set pY(y) { this.camera.position.y = y; }
    ;
    set pZ(z) { this.camera.position.z = z; }
    ;
    get posVector() { return new THREE.Vector3(this.pX, this.pY, this.pZ); }
    set posVector(vector3) {
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }
    get rX() { return this.camera.rotation.x; }
    ;
    get rY() { return this.camera.rotation.y; }
    ;
    get rZ() { return this.camera.rotation.z; }
    ;
    set rX(x) { this.camera.rotation.x = x; }
    ;
    set rY(y) { this.camera.rotation.y = y; }
    ;
    set rZ(z) { this.camera.rotation.z = z; }
    ;
    get rotVector() { return new THREE.Vector3(this.rX, this.rY, this.rZ); }
    set rotVector(vector3) {
        this.rX = vector3.x;
        this.rY = vector3.y;
        this.rZ = vector3.z;
    }
}
class PlayerCamera extends Camera {
    constructor(level, model, viewRotate = 0) {
        super(level, "PlayerCamera");
        this.mouseHandler = (e) => {
            if (this.level.game.renderer.pointerIsLocked) {
                let sens = 0.0015;
                let movementDif = Math.abs(e.movementX - this.prevMovementX);
                if (movementDif < 500) {
                    this.viewRotateX += e.movementY * sens;
                    this.viewRotateY -= e.movementX * sens;
                    let xMax = Math.PI / 2 - 0.0001;
                    let xMin = -xMax;
                    if (this.viewRotateX > xMax) {
                        this.viewRotateX = xMax;
                    }
                    else if (this.viewRotateX < xMin) {
                        this.viewRotateX = xMin;
                    }
                }
                this.prevMovementX = e.movementX;
            }
        };
        this.targetModel = model;
        this.yOffset = 10;
        this.defaultDistance = 15;
        this.distance = this.defaultDistance;
        this.viewRotateX = 0;
        this.viewRotateY = 0;
        this.prevMovementX = 0;
        this.targetIntersectsFilter = new IntersectsFilter(this.level, undefined, [this.targetModel.name]);
        this.cameraIntersectsFilter = new IntersectsFilter(this.level, ["turret_top"], [this.targetModel.name]);
        this.level.game.events.viewRotate = this.mouseHandler;
        this.crosshair = new Model(level, "crosshair", undefined, false);
        var crosshairMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
        this.crosshair.material = crosshairMaterial;
        this.crosshair.pZ = -0.1;
        this.crosshair.sY = 0.002;
        this.crosshair.sX = 0.002;
        this.camera.add(this.crosshair.getMesh());
        this.viewRotateY = viewRotate;
        this.camera.add(level.game.sound.listener);
    }
    getTarget() {
        let direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        let maxDistance = 200;
        let rayCaster = new THREE.Raycaster(this.camera.position, direction, 0, maxDistance);
        let intersects = rayCaster.intersectObjects(this.level.getScene().children);
        intersects = this.targetIntersectsFilter.check(intersects);
        if (intersects.length > 0) {
            return intersects[0].point;
        }
        else {
            let maxPoint = new THREE.Vector3(0, 0, -maxDistance);
            maxPoint.applyQuaternion(this.camera.quaternion);
            maxPoint.x += this.camera.position.x;
            maxPoint.y += this.camera.position.y;
            maxPoint.z += this.camera.position.z;
            return maxPoint;
        }
    }
    get viewRotY() {
        return this.viewRotateY;
    }
    get viewRotX() {
        return this.viewRotateX;
    }
    update() {
        function changeDirection(inputVector, angleX, angleY) {
            let axisX = new THREE.Vector3(1, 0, 0);
            let axisY = new THREE.Vector3(0, 1, 0);
            let directionVector = new THREE.Vector3().copy(inputVector);
            directionVector.applyAxisAngle(axisX, angleX);
            directionVector.applyAxisAngle(axisY, angleY);
            return directionVector;
        }
        let cameraTarget = this.targetModel.posVector;
        cameraTarget.y += this.yOffset;
        let angleX = this.viewRotateX;
        let angleY = this.viewRotateY;
        let raycasterDirection = new THREE.Vector3(0, 0, -1);
        raycasterDirection = changeDirection(raycasterDirection, angleX, angleY);
        let rayCaster = new THREE.Raycaster(cameraTarget, raycasterDirection, 0, this.distance + 1);
        let intersects = rayCaster.intersectObjects(this.level.getScene().children);
        intersects = this.cameraIntersectsFilter.check(intersects);
        for (let i = 0; i < intersects.length;) {
            if (intersects[i].object.userData.uniqueName == this.level.player.modelName) {
                intersects.splice(i, 1);
            }
            else {
                i++;
            }
        }
        let cameraOffset;
        if (intersects.length > 0) {
            let distance = intersects[0].distance - 1;
            cameraOffset = new THREE.Vector3(0, 0, -distance);
        }
        else {
            cameraOffset = new THREE.Vector3(0, 0, -this.distance);
        }
        cameraOffset = changeDirection(cameraOffset, angleX, angleY);
        cameraOffset.y += this.yOffset;
        let modelPos = this.targetModel.posVector;
        cameraOffset.x += modelPos.x;
        cameraOffset.y += modelPos.y;
        cameraOffset.z += modelPos.z;
        this.camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
        this.camera.lookAt(cameraTarget);
    }
    updateAlways() {
        if (this.crosshair.visible != this.level.game.hud.visible) {
            this.crosshair.visible = this.level.game.hud.visible;
        }
    }
}
class EventHandler {
    constructor() {
        this.viewRotate = new Function();
        this.moveStart = new Function();
        this.moveStop = new Function();
        this.cameraResize = new Function();
        this.playerCameraReize = new Function();
        this.menuKeys = new Function;
        this.gunFireStart = new Function;
        this.gunFireStop = new Function;
        window.addEventListener("mousemove", (e) => this.viewRotate(e));
        window.addEventListener("keydown", (e) => this.moveStart(e));
        window.addEventListener("keyup", (e) => this.moveStop(e));
        window.addEventListener("resize", (e) => {
            this.cameraResize(e);
            this.playerCameraReize(e);
        });
        window.addEventListener("keypress", (e) => this.menuKeys(e));
        window.addEventListener("mousedown", (e) => this.gunFireStart(e));
        window.addEventListener("mouseup", (e) => this.gunFireStop(e));
    }
}
class LevelEnd {
    constructor(level, levelSrcData) {
        this.level = level;
        this.use = levelSrcData.level_end.use;
        this.position = new THREE.Vector3(levelSrcData.level_end.x, levelSrcData.level_end.y, levelSrcData.level_end.z);
        this.radius = levelSrcData.level_end.radius;
    }
    update() {
        if (this.use && this.position.distanceTo(this.level.player.posVector) < this.radius) {
            this.level.complete = true;
            this.level.game.menu.visible = true;
            this.level.game.renderer.unlockPointer();
        }
    }
}
class LightSource {
    constructor() {
        this.name = "new_light";
        this.model = "point";
        this.type = "LAMP";
        this.location = new LocRot();
        this.rotation = new LocRot();
        this.scale = new Scale();
        this.data = {
            spot_blend: 0,
            decay: 2,
            type: "POINT",
            distance: 25,
            cast_shadow: true,
            color: {
                r: 255,
                g: 255,
                b: 255
            },
            energy: 1,
            spot_size: 0
        };
    }
}
class LocRot {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Scale {
    constructor(x = 1, y = 1, z = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class MeshData {
    constructor(name, mesh, geometry) {
        this.name = name;
        this.templateMesh = mesh;
        this.geometry = geometry;
    }
    get mesh() {
        return this.templateMesh.clone();
    }
}
class RayData {
    constructor(distance, point, model, intersected, faceIndex) {
        this.distance = distance;
        this.point = point;
        this.model = model;
        this.intersected = intersected;
        this.faceIndex = faceIndex;
    }
}
class Renderer {
    constructor() {
        this.setSize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        this.lockPointer = () => {
            this.element.requestPointerLock();
            this.pointerLocked = true;
        };
        this.unlockPointer = () => {
            document.exitPointerLock();
            this.pointerLocked = false;
        };
        this.pointerLockChange = () => {
            if (document.pointerLockElement !== this.element) {
                this.pointerLocked = false;
            }
            else {
                this.pointerLocked = true;
            }
        };
        this.assignedCamera = new THREE.PerspectiveCamera();
        this.assignedScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.setSize();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementsByTagName("game")[0].appendChild(this.renderer.domElement);
        window.addEventListener("resize", this.setSize);
        this.pointerLocked = false;
        this.element.requestPointerLock = this.element.requestPointerLock;
        this.element.addEventListener("click", () => this.lockPointer());
        document.addEventListener('pointerlockchange', this.pointerLockChange, false);
        this.renderer.domElement.id = "renderer";
    }
    get element() {
        return this.renderer.domElement;
    }
    set scene(scene) {
        this.assignedScene = scene;
    }
    set camera(camera) {
        this.assignedCamera = camera;
    }
    get pointerIsLocked() {
        return this.pointerLocked;
    }
    update() {
        this.renderer.render(this.assignedScene, this.assignedCamera);
    }
}
class Model extends GameObject {
    constructor(level, meshName, modelSource = new ModelSource(), autoAdd = true) {
        super(level, meshName, "Model", modelSource.name);
        let meshData = level.game.meshDataByName(meshName);
        this.mesh = meshData.mesh;
        let geometry = meshData.geometry;
        this.tween = new Tween;
        this.mesh.userData.uniqueName = this.name;
        this.mixer = new THREE.AnimationMixer(this.mesh);
        this.actions = {};
        this.playingAction = "";
        if (typeof geometry.animations !== 'undefined') {
            let animationCount = geometry.animations.length;
            for (let i = 0; i < animationCount; i++) {
                let animationClip = geometry.animations[i];
                let action = this.mixer.clipAction(animationClip);
                action.setEffectiveWeight(1);
                action.enabled = true;
                this.actions[animationClip.name] = action;
            }
        }
        modelSource.model = this.name;
        this.modelSource = modelSource;
        if (autoAdd) {
            this.level.addModel(this);
        }
        else {
            this.level.addModelOnly(this);
        }
        this.posVector = new THREE.Vector3(this.modelSource.location.x, this.modelSource.location.y, this.modelSource.location.z);
        this.rotVector = new THREE.Vector3(this.modelSource.rotation.x, this.modelSource.rotation.y, this.modelSource.rotation.z);
        this.scaleVector = new THREE.Vector3(this.modelSource.scale.x, this.modelSource.scale.y, this.modelSource.scale.z);
    }
    hit(damage) {
        damage = damage;
        return 1;
    }
    getMesh() {
        return this.mesh;
    }
    set material(material) {
        this.mesh.material = material;
    }
    get pX() { return this.mesh.position.x; }
    ;
    get pY() { return this.mesh.position.y; }
    ;
    get pZ() { return this.mesh.position.z; }
    ;
    set pX(x) { this.mesh.position.x = x; }
    ;
    set pY(y) { this.mesh.position.y = y; }
    ;
    set pZ(z) { this.mesh.position.z = z; }
    ;
    get posVector() { return new THREE.Vector3(this.pX, this.pY, this.pZ); }
    set posVector(vector3) {
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }
    get rX() { return this.mesh.rotation.x; }
    ;
    get rY() { return this.mesh.rotation.y; }
    ;
    get rZ() { return this.mesh.rotation.z; }
    ;
    set rX(x) { this.mesh.rotation.x = x; }
    ;
    set rY(y) { this.mesh.rotation.y = y; }
    ;
    set rZ(z) { this.mesh.rotation.z = z; }
    ;
    get rotVector() { return new THREE.Vector3(this.rX, this.rY, this.rZ); }
    set rotVector(vector3) {
        this.rX = vector3.x;
        this.rY = vector3.y;
        this.rZ = vector3.z;
    }
    get sX() { return this.mesh.scale.x; }
    ;
    get sY() { return this.mesh.scale.y; }
    ;
    get sZ() { return this.mesh.scale.z; }
    ;
    set sX(x) { this.mesh.scale.x = x; }
    ;
    set sY(y) { this.mesh.scale.y = y; }
    ;
    set sZ(z) { this.mesh.scale.z = z; }
    ;
    get scaleVector() { return new THREE.Vector3(this.sX, this.sY, this.sZ); }
    set scaleVector(vector3) {
        this.sX = vector3.x;
        this.sY = vector3.y;
        this.sZ = vector3.z;
    }
    get visible() { return this.mesh.visible; }
    ;
    set visible(visible) { this.mesh.visible = visible; }
    ;
    getWorldMatrix() {
        return this.mesh.matrixWorld;
    }
    stopAction(name) {
        for (let key in this.actions) {
            if (key == name) {
                this.actions[key].stop();
            }
        }
    }
    playAction(name, repetitions = Infinity, fade = true) {
        if (name != this.playingAction) {
            for (let key in this.actions) {
                if (key == name) {
                    if (fade) {
                        let from;
                        if (typeof this.actions[this.playingAction] !== "undefined") {
                            from = this.actions[this.playingAction].play();
                        }
                        else {
                            from = this.actions[key];
                        }
                        let to = this.actions[key].play();
                        to.reset();
                        to.repetitions = repetitions;
                        if (to.repetitions != Infinity) {
                            to.clampWhenFinished = true;
                        }
                        from.crossFadeTo(to, 0.2, true);
                    }
                    else {
                        this.stopAction(this.playingAction);
                        this.actions[key].play();
                    }
                    this.playingAction = name;
                }
            }
        }
    }
    actionTimeScale(name, scale = 1) {
        for (let key in this.actions) {
            if (key == name) {
                this.actions[key].timeScale = scale;
            }
        }
    }
    update(delta) {
        this.mixer.update(delta);
    }
    updateAlways() { }
}
class Skybox extends Model {
    constructor(level, color = 0x0077ff) {
        super(level, "skybox");
        this.mesh.material = new THREE.MeshBasicMaterial({ color: color });
        this.sX = 10;
        this.sY = 10;
        this.sZ = 10;
    }
    update() {
        this.posVector = this.level.player.posVector;
    }
}
class Tween {
    radians(from, to, step) {
        step = Math.abs(step);
        function mod(n, m) {
            return ((n % m) + m) % m;
        }
        from = mod(from, Math.PI * 2);
        to = mod(to, Math.PI * 2);
        let difference = Math.abs(to - from);
        if (difference > Math.PI) {
            difference = (2 * Math.PI) - difference;
        }
        let dir = 1;
        if (to > from && to - from > Math.PI || from > to && from - to < Math.PI) {
            dir = -1;
        }
        let newRad;
        if (difference < step) {
            newRad = to;
        }
        else {
            newRad = from + step * dir;
        }
        return mod(newRad, Math.PI * 2);
    }
    number(from, to, step) {
        step = Math.abs(step);
        let dir = 1;
        if (to < from) {
            dir = -1;
        }
        let difference = Math.abs(to - from);
        if (difference < step) {
            return to;
        }
        else {
            return from + (step * dir);
        }
    }
    vector(from, to, step) {
        step = Math.abs(step);
        let difference = from.distanceTo(to);
        if (difference < step) {
            return to;
        }
        else {
            let direction = new THREE.Vector3();
            direction.subVectors(to, from).normalize().multiplyScalar(step);
            let newPos = new THREE.Vector3().copy(from);
            newPos.add(direction);
            return newPos;
        }
    }
}
class Utils {
    toHEX(rgb) {
        let rgbArray = [rgb.r, rgb.g, rgb.b];
        let hex = "";
        for (let val of rgbArray) {
            let h2 = val % 16;
            let h1 = (val - h2) / 16;
            let h = "0123456789ABCDEF".split("");
            hex += h[h1] + h[h2];
        }
        return hex;
    }
}
let utils = new Utils();
class Healthbar {
    constructor(game, hud) {
        this.game = game;
        this.hud = hud;
        this.container = document.createElement("healthcontainer");
        this.bar = document.createElement("healthbar");
        this.container.appendChild(this.bar);
        this.hud.element.appendChild(this.container);
    }
    update() {
        let health = this.game.level.player.hp;
        let maxHealth = this.game.level.player.maxHp;
        let scaleX = health / maxHealth;
        let translateX = -(1 - scaleX) * 100 / 2;
        this.bar.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
    }
}
class Hud {
    constructor(game) {
        this.game = game;
        this.propElement = document.createElement("hud");
        this.game.element.appendChild(this.element);
        this.isVisible = false;
        this.healthbar = new Healthbar(this.game, this);
    }
    get visible() {
        return this.isVisible;
    }
    set visible(visible) {
        if (visible != this.visible) {
            this.isVisible = visible;
            this.element.dataset.visible = String(this.isVisible);
        }
    }
    get element() {
        return this.propElement;
    }
    update() {
        this.healthbar.update();
        if (this.game.level.paused || this.game.level.name == "main_menu") {
            this.visible = false;
        }
        else {
            this.visible = true;
        }
    }
}
class Menu {
    constructor(game) {
        this.keyHandler = (e) => {
            if (e.keyCode == 13) {
                this.visible = !this.visible;
                if (this.visible) {
                    this.game.renderer.unlockPointer();
                }
                else {
                    this.game.renderer.lockPointer();
                }
            }
        };
        this.propGame = game;
        this.isVisible = false;
        this.state = "pause";
        this.element = document.createElement("gamemenu");
        this.game.element.appendChild(this.element);
        this.buttonsContainer = document.createElement("buttonscontainer");
        this.element.appendChild(this.buttonsContainer);
        this.headerElement = document.createElement("headertext");
        this.buttonsContainer.appendChild(this.headerElement);
        this.buttons = new Array();
        this.addButton(new MenuButton(this, "start", () => this.start(), ["main"], true));
        this.addButton(new MenuButton(this, "continue", () => this.continue(), ["pause"], true));
        this.addButton(new MenuButton(this, "next level", () => this.next(), ["level_complete"], true));
        this.addButton(new MenuButton(this, "reload level", () => this.reload(), ["pause", "dead", "level_complete"], true));
        this.addButton(new MenuButton(this, "quit", () => this.quit(), ["pause", "dead", "level_complete"], true));
        this.game.events.menuKeys = this.keyHandler;
        this.setState("main");
    }
    get game() { return this.propGame; }
    ;
    addButton(button) {
        this.buttons.push(button);
        this.buttonsContainer.appendChild(button.element);
    }
    set header(text) {
        this.headerElement.innerHTML = text;
    }
    setState(state) {
        if (state != this.state) {
            this.state = state;
            for (let button of this.buttons) {
                if (button.states.indexOf(state) != -1) {
                    button.visible = true;
                }
                else {
                    button.visible = false;
                }
            }
            switch (state) {
                case "main":
                    this.header = "Main Menu";
                    break;
                case "level_complete":
                    this.header = "Level Complete";
                    break;
                case "pause":
                    this.header = "Game Paused";
                    break;
                case "dead":
                    this.header = "You Died";
                    break;
            }
        }
    }
    start() {
        this.game.loadLevel("level_0");
    }
    next() {
        this.game.loadLevel(this.game.level.nextLevel);
    }
    continue() {
        this.visible = false;
        this.game.renderer.lockPointer();
    }
    reload() {
        this.game.loadLevel(this.game.level.name);
    }
    quit() {
        this.game.loadLevel("main_menu");
    }
    get visible() {
        return this.isVisible;
    }
    set visible(visible) {
        if (visible == false && (this.state == "dead" || this.state == "level_complete")) {
            return;
        }
        if (visible != this.visible) {
            this.isVisible = visible;
            this.element.dataset.visible = String(this.visible);
            if (this.state != "main") {
                this.game.level.paused = visible;
            }
        }
    }
    update() {
        this.visible = this.game.level.paused || this.game.level.name == "main_menu" || !this.game.renderer.pointerIsLocked;
        if (this.game.level.name == "main_menu") {
            this.setState("main");
        }
        else if (this.game.level.player.isDead) {
            this.setState("dead");
        }
        else if (this.game.level.complete) {
            this.setState("level_complete");
        }
        else {
            this.setState("pause");
        }
    }
}
class MenuButton {
    constructor(menu, name, func, states, visible = false) {
        this.el = document.createElement("menubutton");
        this.el.addEventListener("click", () => func());
        this.menu = menu;
        this.name = name;
        this.el.innerHTML = name;
        this.isVisible = visible;
        this.states = states;
        this.element.addEventListener("mouseenter", () => this.menu.game.sound.play("menu_button_hover", 0.5, true));
        this.element.addEventListener("click", () => this.menu.game.sound.play("menu_button_click", 1, true));
        this.visible = visible;
    }
    get element() { return this.el; }
    ;
    get visible() {
        return this.isVisible;
    }
    set visible(visible) {
        this.isVisible = visible;
        this.element.dataset.visible = String(visible);
    }
}
class MobileModel extends Model {
    constructor(level, model, modelSource = new ModelSource(), autoAdd = true) {
        super(level, model, modelSource, autoAdd);
        this.hasCollision = false;
        this.collisionBox = new CollisionBox(this);
        this.hasGravity = false;
        this.yVelocity = 0;
        this.jump = false;
        this.bottomDistance = 0;
        this.moving = new Moving();
        this.velocity = 35;
    }
    get collisionEnabled() {
        return this.hasCollision;
    }
    moveUpdate(delta, movingRotation = this.rotVector) {
        let moveZ = Math.abs(this.moving.forward);
        let moveX = Math.abs(this.moving.sideways);
        let moveTotal = moveZ + moveX;
        let direction = new THREE.Vector2(moveX, moveZ).normalize();
        if (this.collisionBox.collisionVisible) {
            this.collisionBox.rX = -this.rX;
            this.collisionBox.rY = -this.rY;
            this.collisionBox.rZ = -this.rZ;
        }
        if (moveTotal > 0) {
            let dirZ = this.moving.forward / moveZ;
            let dirX = this.moving.sideways / moveX;
            if (isNaN(dirZ)) {
                dirZ = 0;
            }
            if (isNaN(dirX)) {
                dirX = 0;
            }
            let velocityZ = direction.y * dirZ * this.velocity * delta;
            let velocityX = direction.x * dirX * this.velocity * delta;
            let front = this.collisionBox.front().distance;
            let back = this.collisionBox.back().distance;
            let right = this.collisionBox.right().distance;
            let left = this.collisionBox.left().distance;
            let transform = new THREE.Vector3(velocityX, 0, velocityZ);
            transform.applyAxisAngle(new THREE.Vector3(0, 1, 0), movingRotation.y);
            if (this.hasCollision) {
                if (transform.z > 0) {
                    if (front < transform.z) {
                        transform.z = front;
                    }
                }
                else if (transform.z < 0) {
                    if (back < -transform.z) {
                        transform.z = -back;
                    }
                }
                if (transform.x > 0) {
                    if (left < transform.x) {
                        transform.x = left;
                    }
                }
                else if (transform.x < 0) {
                    if (right < -transform.x) {
                        transform.x = -right;
                    }
                }
            }
            this.mesh.position.x += transform.x;
            this.mesh.position.z += transform.z;
        }
        if (this.hasGravity) {
            let bottom = this.collisionBox.bottom().distance;
            let top = this.collisionBox.top().distance;
            this.bottomDistance = bottom;
            let amount = 0;
            if (bottom <= 0 && this.yVelocity < 0) {
                amount = -bottom;
            }
            else {
                this.yVelocity -= 2.4 * delta;
                if (this.yVelocity < 0) {
                    if (bottom < -this.yVelocity) {
                        this.yVelocity = -bottom;
                    }
                }
                amount = this.yVelocity;
                if (this.yVelocity > 0 && top < this.yVelocity) {
                    this.yVelocity = 0;
                    amount = top;
                }
            }
            if (bottom <= 0.3 && this.jump) {
                this.yVelocity = 0.9;
                amount = this.yVelocity;
                this.jump = false;
            }
            else {
                this.jump = false;
            }
            this.mesh.translateY(amount);
        }
    }
    update(delta) {
        super.update(delta);
        this.moveUpdate(delta);
    }
}
class Bullet extends MobileModel {
    constructor(level, worldMatrix, target, barelOffset, ignoreModels = new Array(), ignoreNames = new Array(), color = 0xff0000, damage = 10) {
        super(level, "bullet");
        this.damage = damage;
        this.hasCollision = true;
        this.collisionBox = new CollisionBox(this, 1, 0.9, 6, 0, 0, -1.5, 5, false, true, new THREE.Vector3(1, 1, 1), true, ignoreModels, ignoreNames);
        var bulletMaterial = new THREE.MeshBasicMaterial({ color: color });
        this.mesh.material = bulletMaterial;
        this.despawnTimeout = 5;
        let position = new THREE.Vector3();
        position.x = barelOffset.x;
        position.y = barelOffset.y;
        position.z = barelOffset.z;
        position.applyMatrix4(worldMatrix);
        this.posVector = position;
        this.mesh.lookAt(target);
        this.moving.forward = 1;
        this.velocity = 180;
    }
    moveUpdate(delta) {
        this.despawnTimeout -= delta;
        if (this.despawnTimeout <= 0) {
            this.remove();
        }
        if (this.moving.forward > 0) {
            let front = this.collisionBox.front();
            if (front.distance <= 0 && front.intersected) {
                this.colided(front);
                return;
            }
            let amount = this.velocity * delta;
            if (front.distance < amount && front.intersected) {
                amount = front.distance + 0.5;
                this.mesh.translateZ(amount);
                this.colided(front);
                return;
            }
            this.mesh.translateZ(amount);
        }
    }
    colided(rayData) {
        this.moving.forward = 0;
        let model = this.level.getModelByName(rayData.model.userData.uniqueName);
        this.despawnTimeout = model.hit(this.damage);
    }
    remove() {
        this.level.removeModel(this);
    }
    update(delta) {
        this.moveUpdate(delta);
    }
}
class Door extends Model {
    constructor(level, modelSource = new ModelSource(), detect = false) {
        super(level, "door_frame", modelSource);
        this.detect = detect;
        this.isOpen = false;
        this.doorLeft = this.loadDoor();
        this.doorRight = this.loadDoor(-1);
        this.closeOffset = new THREE.Vector3(0, 0, 0);
        this.openOffset = new THREE.Vector3(7.8, 0, 0);
        this.openOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.rX);
        this.openOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rY);
        this.openOffset.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.rZ);
        this.openSpeed = 20;
        this.sound = new ModelSound(this.level.game, this, ["door"]);
    }
    get open() {
        return this.isOpen;
    }
    set open(state) {
        this.isOpen = state;
    }
    loadDoor(side = 1) {
        let door = new Model(this.level, "door");
        door.posVector = this.posVector;
        door.rotVector = this.rotVector;
        door.sX = side;
        return door;
    }
    detectPlayer() {
        let distance = this.posVector.distanceTo(this.level.player.posVector);
        this.open = distance < 20;
    }
    update(delta) {
        let wasOpen = this.open;
        if (this.detect) {
            this.detectPlayer();
        }
        else {
            let targetsDown = 0;
            for (let target of this.level.triggerTargets) {
                if (target.isDown) {
                    targetsDown++;
                }
            }
            this.open = targetsDown >= this.level.triggerTargets.length;
        }
        if (wasOpen != this.open) {
            this.sound.play("door", 1, true);
        }
        let newLeftPos = new THREE.Vector3().copy(this.posVector);
        let newRightPos = new THREE.Vector3().copy(this.posVector);
        if (this.open) {
            newLeftPos.add(this.openOffset);
            newRightPos.add(new THREE.Vector3().copy(this.openOffset).multiplyScalar(-1));
        }
        else {
            newLeftPos.add(this.closeOffset);
            newRightPos.add(new THREE.Vector3().copy(this.closeOffset).multiplyScalar(-1));
        }
        this.doorLeft.posVector = this.tween.vector(this.doorLeft.posVector, newLeftPos, this.openSpeed * delta);
        this.doorRight.posVector = this.tween.vector(this.doorRight.posVector, newRightPos, this.openSpeed * delta);
    }
}
class Gun extends Model {
    constructor(level, player) {
        super(level, "gun", undefined, false);
        this.fireStart = (e) => {
            if (e.button == 0) {
                this.firing = true;
            }
        };
        this.fireStop = (e) => {
            if (e.button == 0) {
                this.firing = false;
            }
        };
        this.player = player;
        this.enabled = false;
        this.firing = false;
        this.cooldown = 0;
        this.hand = player.getMesh().getObjectByName("hand.R");
        this.fireState = 0;
        this.rX = Math.PI;
        this.rY = Math.PI / 2;
        this.pX = -0.15;
        this.pY = -0.13;
        this.pZ = -0.36;
        this.hand.add(this.mesh);
        this.level.game.events.gunFireStart = this.fireStart;
        this.level.game.events.gunFireStop = this.fireStop;
        this.sound = new ModelSound(this.level.game, this, ["laser_9"]);
    }
    get isFiring() {
        return this.firing;
    }
    update(delta) {
        if (!this.player.isDead) {
            if (this.cooldown > 0) {
                this.cooldown -= delta;
            }
            else if (this.cooldown < 0) {
                this.cooldown = 0;
            }
            if (this.fireState == 0 && this.enabled && this.firing && this.cooldown == 0) {
                this.fireState = 1;
                this.sound.play("laser_9", 0.5, true);
            }
            if (this.fireState == 1) {
                this.fireState = 2;
            }
            else if (this.fireState == 2) {
                let targetVector = this.level.playerCam.getTarget();
                new Bullet(this.level, this.getWorldMatrix(), targetVector, new THREE.Vector3(-5, -0.40, 0), [this.player.modelName], undefined, 0xff0000);
                this.cooldown = 0.25;
                this.fireState = 0;
            }
        }
    }
    updateAlways() {
        this.enabled = !this.level.game.menu.visible;
    }
}
class Light extends GameObject {
    constructor(level, model, lightSource = new LightSource()) {
        super(level, model, "Light");
        this.lightSource = lightSource;
        let showShadowHelper = false;
        let color = parseInt("0x" + utils.toHEX(lightSource.data.color));
        if (lightSource.data.type == "SUN") {
            this.propLight = new THREE.DirectionalLight(color, lightSource.data.energy);
            if (lightSource.data.cast_shadow) {
                this.propLight.shadow.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.5, 200);
                this.propLight.target = this.level.player.getMesh();
                if (showShadowHelper) {
                    let camHelper = new THREE.CameraHelper(this.light.shadow.camera);
                    camHelper.name = "ShadowHelper";
                    this.level.getScene().add(camHelper);
                }
            }
        }
        else if (lightSource.data.type == "HEMI") {
            let horizon_color = parseInt("0x" + utils.toHEX(this.propLevel.skyColor));
            this.propLight = new THREE.HemisphereLight(horizon_color, color, lightSource.data.energy);
        }
        else if (lightSource.data.type == "SPOT") {
            this.propLight = new THREE.SpotLight(color, lightSource.data.energy, lightSource.data.distance, lightSource.data.spot_size, lightSource.data.spot_blend, lightSource.data.decay);
        }
        else {
            this.propLight = new THREE.PointLight(color, lightSource.data.energy, lightSource.data.distance, lightSource.data.decay);
        }
        this.propLight.castShadow = lightSource.data.cast_shadow;
        if (this.propLight.castShadow) {
            this.propLight.shadow.mapSize.width = 1000;
            this.propLight.shadow.mapSize.height = 1000;
        }
        this.propLight.position.set(lightSource.location.x, lightSource.location.y, lightSource.location.z);
        this.propLevel.addLight(this);
    }
    get light() {
        return this.propLight;
    }
    get pX() { return this.light.position.x; }
    ;
    get pY() { return this.light.position.y; }
    ;
    get pZ() { return this.light.position.z; }
    ;
    set pX(x) { this.light.position.x = x; }
    ;
    set pY(y) { this.light.position.y = y; }
    ;
    set pZ(z) { this.light.position.z = z; }
    ;
    get posVector() {
        return new THREE.Vector3(this.pX, this.pY, this.pZ);
    }
    set posVector(vector3) {
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }
    update() {
        if (this.modelName == "Sun") {
            this.propLight.position.set(this.lightSource.location.x + this.level.player.pX, this.lightSource.location.y + this.level.player.pY, this.lightSource.location.z + this.level.player.pZ);
        }
    }
}
class ModelSource {
    constructor() {
        this.name = "new_model";
        this.model = "new_model";
        this.type = "MESH";
        this.location = new LocRot();
        this.rotation = new LocRot();
        this.scale = new Scale();
        this.data = {
            spot_blend: 0,
            decay: 2,
            type: "SUN",
            distance: 25,
            cast_shadow: true,
            color: {
                r: 255,
                g: 255,
                b: 255
            },
            energy: 1,
            spot_size: 0
        };
    }
}
class Moving {
    constructor() {
        this.forward = 0;
        this.sideways = 0;
    }
}
class Player extends MobileModel {
    constructor(level, rotateY = 0) {
        super(level, "player");
        this.keyDownHandler = (e) => {
            e.stopPropagation();
            if (!e.repeat) {
                switch (e.keyCode) {
                    case this.upKey:
                        this.moving.forward = this.dirForward;
                        this.forward = true;
                        break;
                    case this.leftKey:
                        this.moving.sideways = this.dirLeft;
                        this.left = true;
                        break;
                    case this.downKey:
                        this.moving.forward = this.dirBackward;
                        this.backward = true;
                        break;
                    case this.rightKey:
                        this.moving.sideways = this.dirRight;
                        this.right = true;
                        break;
                    case this.jumpKey:
                        this.jump = true;
                        break;
                }
            }
        };
        this.keyUpHandler = (e) => {
            if (!e.repeat) {
                switch (e.keyCode) {
                    case this.upKey:
                        if (this.moving.forward == this.dirForward && !this.backward) {
                            this.moving.forward = 0;
                        }
                        else if (this.backward) {
                            this.moving.forward = this.dirBackward;
                        }
                        this.forward = false;
                        break;
                    case this.leftKey:
                        if (this.moving.sideways == this.dirLeft && !this.right) {
                            this.moving.sideways = 0;
                        }
                        else if (this.right) {
                            this.moving.sideways = this.dirRight;
                        }
                        this.left = false;
                        break;
                    case this.downKey:
                        if (this.moving.forward == this.dirBackward && !this.forward) {
                            this.moving.forward = 0;
                        }
                        else if (this.forward) {
                            this.moving.forward = this.dirForward;
                        }
                        this.backward = false;
                        break;
                    case this.rightKey:
                        if (this.moving.sideways == this.dirRight && !this.left) {
                            this.moving.sideways = 0;
                        }
                        else if (this.left) {
                            this.moving.sideways = this.dirLeft;
                        }
                        this.right = false;
                        break;
                    case this.jumpKey:
                        this.jump = false;
                        break;
                }
            }
        };
        this.cameraRotation = 0;
        this.hasCollision = true;
        this.hasGravity = true;
        this.rotationSpeed = 5 * Math.PI;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.health = 100;
        this.dead = false;
        this.timeSinceDeath = 0;
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.dirForward = 1;
        this.dirBackward = -1;
        this.dirLeft = 1;
        this.dirRight = -1;
        this.upKey = 87;
        this.leftKey = 65;
        this.downKey = 83;
        this.rightKey = 68;
        this.jumpKey = 32;
        this.level.game.events.moveStart = this.keyDownHandler;
        this.level.game.events.moveStop = this.keyUpHandler;
        this.gun = new Gun(this.level, this);
        if (this.hasCollision) {
            this.collisionBox = new CollisionBox(this, 2, 7.5, 2, 0, 7.5 / 2, 0, 5, true, false, new THREE.Vector3(1, 2, 1), true, [this.modelName, "turret_top"]);
        }
        this.rY = rotateY;
        this.playAction("idle", undefined, false);
        this.actionTimeScale("walk", 1.7);
    }
    get hp() { return this.health; }
    get maxHp() { return this.maxHealth; }
    get isDead() { return this.dead; }
    ;
    hit(damage) {
        if (this.health > 0) {
            this.health -= damage;
        }
        if (this.health < 0) {
            this.health = 0;
        }
        if (this.health <= 0) {
            this.dead = true;
            this.playAction("death", 0);
        }
        return 0.05;
    }
    moveUpdate(delta) {
        if (!this.dead) {
            if (this.gun.isFiring) {
                this.rotateToView(delta);
            }
            if (this.moving.forward != 0 || this.moving.sideways != 0) {
                if (!this.gun.isFiring) {
                    this.rotateToView(delta);
                }
                if (this.yVelocity > 0.1 && this.bottomDistance > 0.1) {
                    this.playAction("jump", 0);
                }
                else if (this.yVelocity <= 0.1 && this.bottomDistance > 0.5) {
                    this.playAction("falling");
                }
                else if (this.moving.forward > 0 && this.moving.sideways == 0) {
                    this.actionTimeScale("walk", 1.7);
                    this.playAction("walk");
                }
                else if (this.moving.sideways == 0) {
                    this.actionTimeScale("walk", -1.7);
                    this.playAction("walk");
                }
                else if (this.moving.sideways > 0 && this.moving.forward >= 0) {
                    this.actionTimeScale("strafe_left", 1.7);
                    this.playAction("strafe_left");
                }
                else if (this.moving.sideways < 0 && this.moving.forward >= 0) {
                    this.actionTimeScale("strafe_right", 1.7);
                    this.playAction("strafe_right");
                }
                else if (this.moving.forward < 0 && this.moving.sideways > 0) {
                    this.actionTimeScale("strafe_right", -1.7);
                    this.playAction("strafe_right");
                }
                else if (this.moving.forward < 0 && this.moving.sideways < 0) {
                    this.actionTimeScale("strafe_left", -1.7);
                    this.playAction("strafe_left");
                }
            }
            else if (this.yVelocity > 0.1 && this.bottomDistance > 0.1) {
                this.playAction("jump", 0);
            }
            else if (this.yVelocity < -1 && this.bottomDistance > 1) {
                this.playAction("falling");
            }
            else {
                this.playAction("idle");
            }
            super.moveUpdate(delta, new THREE.Vector3(0, this.level.playerCam.viewRotY, 0));
        }
        this.rY = ((this.rY + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
    }
    rotateToView(delta, instant = false) {
        let camRotationY = this.level.playerCam.viewRotY;
        if (instant) {
            this.rY = camRotationY;
        }
        else {
            this.rY = this.tween.radians(this.rY, camRotationY, this.rotationSpeed * delta);
        }
    }
    getCameraRotation() {
        return this.cameraRotation;
    }
    update(delta) {
        super.update(delta);
        if (this.dead) {
            this.timeSinceDeath += delta;
            if (this.timeSinceDeath > 1.5) {
                this.level.game.menu.visible = true;
                this.level.game.renderer.unlockPointer();
            }
        }
    }
}
class PracticeTarget extends Model {
    constructor(level, modelSource = new ModelSource()) {
        super(level, "practice_target", modelSource);
        this.down = false;
        this.rotationX = 0;
        this.rotationXUp = 0;
        this.rotationXDown = Math.PI / 2 - 0.2;
        this.rotationSpeed = 2 * Math.PI;
        this.rotationY = this.rY;
        this.resetTimeout = 0;
    }
    hit() {
        if (!this.down) {
            this.down = true;
            let max = 25;
            let min = 15;
            this.resetTimeout = (Math.random() * (max - min) + min);
        }
        return 0.1;
    }
    reset() {
        this.down = false;
    }
    update(delta) {
        this.rotVector = new THREE.Vector3();
        let newRotation;
        if (this.down) {
            newRotation = this.rotationXDown;
        }
        else {
            newRotation = this.rotationXUp;
        }
        this.rotationX = this.tween.radians(this.rotationX, newRotation, this.rotationSpeed * delta);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), this.rotationX);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.rotationY);
        if (this.resetTimeout > 0) {
            this.resetTimeout -= delta;
        }
        if (this.resetTimeout < 0) {
            this.resetTimeout = 0;
        }
        if (this.resetTimeout == 0 && this.down) {
            this.reset();
        }
    }
}
class TriggerTarget extends Model {
    constructor(level, modelSource = new ModelSource()) {
        super(level, "trigger_target", modelSource);
        this.down = false;
        this.rotationX = 0;
        this.rotationXUp = 0;
        this.rotationXDown = Math.PI;
        this.rotationSpeed = 2 * Math.PI;
        this.rotationY = this.rY;
    }
    hit() {
        if (!this.down) {
            this.down = true;
        }
        return 0.1;
    }
    get isDown() {
        return this.down;
    }
    update(delta) {
        this.rotVector = new THREE.Vector3();
        let newRotation;
        if (this.down) {
            newRotation = this.rotationXDown;
        }
        else {
            newRotation = this.rotationXUp;
        }
        this.rotationX = this.tween.radians(this.rotationX, newRotation, this.rotationSpeed * delta);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), this.rotationX);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.rotationY);
    }
}
class CollisionBox {
    constructor(model, sizeX = 0, sizeY = 0, sizeZ = 0, offsetX = 0, offsetY = 0, offsetZ = 0, extraDistance = 1, gravity = false, rotationEnabled = false, givenSegments = new THREE.Vector3(), centerVertex = true, ignoreModels = new Array(), ignoreNames = new Array()) {
        this.model = model;
        this.rotationEnabled = rotationEnabled;
        this.collisionVisible = false;
        ignoreModels.push(this.model.name);
        this.intersectsFilter = new IntersectsFilter(this.model.level, ignoreModels, ignoreNames);
        this.extraDistance = extraDistance;
        this.sideZ = new THREE.PlaneGeometry(0, 0);
        this.sideX = new THREE.PlaneGeometry(0, 0);
        this.sideY = new THREE.PlaneGeometry(0, 0);
        this.sides = new Array();
        this.boxSize = new THREE.Vector3(sizeX, sizeY, sizeZ);
        this.boxOffset = new THREE.Vector3(offsetX, offsetY, offsetZ);
        this.box = new THREE.LineSegments();
        if (model.collisionEnabled && sizeX > 0 && sizeY > 0 && sizeZ > 0) {
            let segments = new THREE.Vector3();
            function setSegment(seg) {
                seg = Math.floor(seg);
                if (seg < 1) {
                    return 1;
                }
                else {
                    return seg;
                }
            }
            if (givenSegments.x == 0) {
                segments.x = setSegment(this.boxSize.x);
            }
            else {
                segments.x = setSegment(givenSegments.x);
            }
            if (givenSegments.y == 0) {
                segments.y = setSegment(this.boxSize.y);
            }
            else {
                segments.y = setSegment(givenSegments.y);
            }
            if (givenSegments.z == 0) {
                segments.z = setSegment(this.boxSize.z);
            }
            else {
                segments.z = setSegment(givenSegments.z);
            }
            let boxGeometry = new THREE.BoxGeometry(this.boxSize.x, this.boxSize.y, this.boxSize.z, segments.x, segments.y, segments.z);
            boxGeometry.translate(this.boxOffset.x, this.boxOffset.y, this.boxOffset.z);
            let boxEdges = new THREE.EdgesGeometry(boxGeometry, 0);
            let boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
            this.box = boxLine;
            if (this.collisionVisible) {
                model.getMesh().add(this.box);
            }
            let sideGeomtries = [
                { side: "z", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.y, segments.x, segments.y), color: 0xff0000 },
                { side: "x", geometry: new THREE.PlaneGeometry(this.boxSize.z, this.boxSize.y, segments.z, segments.y), color: 0x0000ff },
                { side: "y", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.z, segments.x, segments.z), color: 0x00ff00 }
            ];
            if (centerVertex) {
                for (let side of sideGeomtries) {
                    side.geometry.vertices.push(new THREE.Vector3());
                }
            }
            else if (segments.x <= 1 && segments.z <= 1 && gravity) {
                sideGeomtries[0].geometry.vertices.push(new THREE.Vector3());
            }
            for (let sideGeo of sideGeomtries) {
                if (gravity) {
                    if (sideGeo.side == "x" || sideGeo.side == "z") {
                        for (let vertex of sideGeo.geometry.vertices) {
                            if (vertex.y == -this.boxSize.y / 2) {
                                if (this.boxSize.y >= 1) {
                                    vertex.y += 1;
                                }
                            }
                            if (vertex.x == this.boxSize.x / 2) {
                                vertex.x -= (this.boxSize.x / segments.x) / 10;
                            }
                            if (vertex.x == -this.boxSize.x / 2) {
                                vertex.x += (this.boxSize.x / segments.x) / 10;
                            }
                        }
                    }
                    if (sideGeo.side == "y") {
                        for (let vertex of sideGeo.geometry.vertices) {
                            if (vertex.y == this.boxSize.z / 2) {
                                vertex.y -= (this.boxSize.z / segments.z) / 3;
                            }
                            if (vertex.y == -this.boxSize.z / 2) {
                                vertex.y += (this.boxSize.z / segments.z) / 3;
                            }
                            if (vertex.x == this.boxSize.x / 2) {
                                vertex.x -= (this.boxSize.x / segments.x) / 3;
                            }
                            if (vertex.x == -this.boxSize.x / 2) {
                                vertex.x += (this.boxSize.x / segments.x) / 3;
                            }
                        }
                    }
                }
                if (sideGeo.side == "x") {
                    sideGeo.geometry.rotateY(Math.PI / 2);
                }
                else if (sideGeo.side == "y") {
                    sideGeo.geometry.rotateX(Math.PI / 2);
                }
                sideGeo.geometry.translate(this.boxOffset.x, this.boxOffset.y, this.boxOffset.z);
                if (this.collisionVisible) {
                    let edges = new THREE.EdgesGeometry(sideGeo.geometry, 0);
                    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: sideGeo.color }));
                    this.box.add(line);
                }
                if (sideGeo.side == "x") {
                    this.sideX = sideGeo.geometry;
                }
                else if (sideGeo.side == "y") {
                    this.sideY = sideGeo.geometry;
                }
                else if (sideGeo.side == "z") {
                    this.sideZ = sideGeo.geometry;
                }
            }
            this.sides.push(new CollisionSide("front", this.sideZ, this.boxSize.x, new THREE.Vector3(0, 0, 1)));
            this.sides.push(new CollisionSide("back", this.sideZ, this.boxSize.x, new THREE.Vector3(0, 0, -1)));
            this.sides.push(new CollisionSide("right", this.sideX, this.boxSize.z, new THREE.Vector3(-1, 0, 0)));
            this.sides.push(new CollisionSide("left", this.sideX, this.boxSize.z, new THREE.Vector3(1, 0, 0)));
            this.sides.push(new CollisionSide("top", this.sideY, this.boxSize.y, new THREE.Vector3(0, 1, 0)));
            this.sides.push(new CollisionSide("bottom", this.sideY, this.boxSize.y, new THREE.Vector3(0, -1, 0)));
        }
    }
    get rX() { return this.box.rotation.x; }
    ;
    set rX(x) { this.box.rotation.x = x; }
    ;
    get rY() { return this.box.rotation.y; }
    ;
    set rY(y) { this.box.rotation.y = y; }
    ;
    get rZ() { return this.box.rotation.z; }
    ;
    set rZ(z) { this.box.rotation.z = z; }
    ;
    checkSide(sideName) {
        let rayData = new RayData(0, new THREE.Vector3(), new THREE.Object3D(), false, 0);
        for (let side of this.sides) {
            if (side.side == sideName) {
                let direction = new THREE.Vector3().copy(side.direction);
                let geometry = new THREE.PlaneGeometry(0, 0).copy(side.geometry);
                let distance;
                distance = side.size / 2 + this.extraDistance;
                if (this.rotationEnabled) {
                    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.model.rX);
                    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.model.rY);
                    direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.model.rZ);
                    geometry.rotateX(this.model.rX);
                    geometry.rotateY(this.model.rY);
                    geometry.rotateZ(this.model.rZ);
                }
                geometry.translate(this.model.pX, this.model.pY, this.model.pZ);
                let shortestDistance = distance;
                let closestPoint = new THREE.Vector3();
                let closestModel = new THREE.Object3D();
                let intersected = false;
                let faceIndex = 0;
                for (let vertex of geometry.vertices) {
                    let raycaster = new THREE.Raycaster(vertex, direction, 0, distance);
                    let intersects = raycaster.intersectObjects(this.model.level.getScene().children);
                    intersects = this.intersectsFilter.check(intersects);
                    for (let intersect of intersects) {
                        if (intersect.distance < shortestDistance) {
                            shortestDistance = intersect.distance;
                            closestPoint = intersect.point;
                            closestModel = intersect.object;
                            intersected = true;
                            faceIndex = intersect.faceIndex;
                        }
                    }
                }
                rayData = new RayData(shortestDistance - side.size / 2, closestPoint, closestModel, intersected, faceIndex);
            }
        }
        return rayData;
    }
    front() { return this.checkSide("front"); }
    back() { return this.checkSide("back"); }
    right() { return this.checkSide("right"); }
    left() { return this.checkSide("left"); }
    top() { return this.checkSide("top"); }
    bottom() { return this.checkSide("bottom"); }
}
class CollisionSide {
    constructor(side, geometry, size, direction) {
        this.side = side;
        this.geometry = geometry;
        this.direction = direction;
        this.size = size;
    }
}
class IntersectsFilter {
    constructor(level, ignoreModels = new Array(), ignoreNames = new Array()) {
        this.level = level;
        let alwaysIgnoreModels = ["bullet", "gun", "ShadowHelper", "skybox"];
        this.ignoreModels = ignoreModels.concat(alwaysIgnoreModels);
        this.ignoreNames = ignoreNames;
    }
    check(intersects) {
        let fileteredIntersects = new Array();
        let ignoreNames = this.level.getNoCollisionNames();
        ignoreNames = ignoreNames.concat(this.ignoreNames);
        for (let intersect of intersects) {
            if (this.ignoreModels.indexOf(intersect.object.name) == -1 && ignoreNames.indexOf(intersect.object.userData.uniqueName) == -1) {
                fileteredIntersects.push(intersect);
            }
        }
        return fileteredIntersects;
    }
}
class TurretBase extends Model {
    constructor(level, modelSource = new ModelSource()) {
        super(level, "turret_base", modelSource);
        this.top = new TurretTop(level, this);
        let topPos = this.posVector;
        topPos.y += 8.7;
        this.top.posVector = topPos;
    }
    hit() {
        return this.top.hit();
    }
}
class TurretTop extends Model {
    constructor(level, turretBase) {
        super(level, "turret_top");
        this.turretBase = turretBase;
        this.target = new THREE.Vector3();
        this.cooldown = 0.5;
        this.intersectsFilter = new IntersectsFilter(this.level, ["practice_target"], [this.name, this.turretBase.name]);
        this.targetOffset = new THREE.Vector3(0, 3.5, 0);
        this.rotationSpeed = Math.PI / 2;
        this.currentRotX = this.rX;
        this.currentRotY = this.rY;
        this.playerSpotted = false;
        this.health = 100;
        this.destroyed = false;
        this.sound = new ModelSound(this.level.game, this, ["laser_2"]);
    }
    hit() {
        if (this.health > 0) {
            this.health -= 10;
        }
        if (this.health <= 0 && !this.destroyed) {
            this.destroyed = true;
            let target = new THREE.Vector3(this.level.player.posVector.x, this.pY, this.level.player.posVector.z);
            this.mesh.lookAt(target);
            this.level.addNoCollisionName(this.name);
            this.playAction("destroy", 0);
        }
        return 0.5;
    }
    turnToTarget(delta) {
        let target = new THREE.Vector3();
        target.subVectors(this.target, this.posVector);
        function calcAngle(x, y) {
            return Math.atan2(y, x);
        }
        this.rX = 0;
        this.rY = 0;
        this.rZ = 0;
        let distanceX = Math.abs(target.x);
        let distanceZ = Math.abs(target.z);
        let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceZ, 2));
        let toRotX = -calcAngle(distance, target.y);
        this.currentRotX = this.tween.radians(this.currentRotX, toRotX, this.rotationSpeed * delta);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), this.currentRotX);
        let toRotY = calcAngle(target.z, target.x);
        this.currentRotY = this.tween.radians(this.currentRotY, toRotY, this.rotationSpeed * delta);
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.currentRotY);
    }
    fire() {
        this.sound.play("laser_2", 1, true);
        new Bullet(this.level, this.mesh.matrixWorld, this.currentTarget, new THREE.Vector3(0, 0, 7), undefined, [this.name, this.turretBase.name], 0xccff00, 10);
    }
    get currentTarget() {
        let vector = new THREE.Vector3(0, 0, 10);
        vector.applyMatrix4(this.getWorldMatrix());
        return vector;
    }
    update(delta) {
        super.update(delta);
        let newTarget = this.level.player.posVector;
        newTarget.y += this.targetOffset.y;
        let distanceToTarget = this.posVector.distanceTo(newTarget);
        if (!this.destroyed && !this.level.player.isDead && distanceToTarget < 300) {
            let direction = new THREE.Vector3();
            direction.subVectors(newTarget, this.posVector).normalize();
            let raycaster = new THREE.Raycaster(this.posVector, direction, 0, 200);
            let intersects = raycaster.intersectObjects(this.level.getScene().children);
            intersects = this.intersectsFilter.check(intersects);
            if (this.cooldown > 0) {
                this.cooldown -= delta;
            }
            if (intersects.length > 0 && intersects[0].object.name == "player") {
                this.target = newTarget;
                this.turnToTarget(delta);
                this.playerSpotted = true;
            }
            if (this.cooldown <= 0 && this.playerSpotted) {
                this.fire();
                this.cooldown = 0.5;
            }
        }
    }
}
class Level {
    constructor(game, levelName, nextLevel = game.checkNextLevel(levelName)) {
        this.propGame = game;
        this.name = levelName;
        this.nextLevelName = nextLevel;
        this.isPaused = false;
        this.complete = false;
        this.noCollisionModels = ["bullet", "gun", "ShadowHelper", "skybox"];
        this.noCollisionNames = [];
        this.scene = new THREE.Scene();
        this.propSkyColor = { r: 255, g: 255, b: 255 };
        this.models = new Array();
        this.lights = new Array();
        this.triggerTargets = new Array();
        let levelSrcData = this.game.levelDataByName(levelName);
        this.propPlayer = new Player(this, levelSrcData.view_rotate);
        this.playerCamera = new PlayerCamera(this, this.player, levelSrcData.view_rotate);
        this.playerCamera.assignToRenderer(this.propGame.renderer);
        this.scene.add(this.playerCamera.camera);
        this.camera = new Camera(this);
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(this.ambientLight);
        this.player.pX = levelSrcData.player_start.x;
        this.player.pY = levelSrcData.player_start.y;
        this.player.pZ = levelSrcData.player_start.z;
        this.propSkyColor = levelSrcData.horizon_color;
        this.ambientLight.intensity = levelSrcData.environment_light;
        for (let key in levelSrcData.objects) {
            let obj = Object.create(levelSrcData.objects[key]);
            if (obj.model == "turret_base") {
                new TurretBase(this, obj);
            }
            else if (obj.model == "practice_target") {
                new PracticeTarget(this, obj);
            }
            else if (obj.model == "trigger_target") {
                this.triggerTargets.push(new TriggerTarget(this, obj));
            }
            else if (obj.model == "door_frame") {
                new Door(this, obj);
            }
            else if (obj.type == 'MESH') {
                new Model(this, obj.model, obj);
            }
            else if (obj.type == "LAMP") {
                new Light(this, obj.model, obj);
            }
        }
        this.end = new LevelEnd(this, levelSrcData);
        this.skybox = new Skybox(this, parseInt("0x" + utils.toHEX(this.propSkyColor)));
        this.assignToRenderer(this.game.renderer);
    }
    get player() {
        return this.propPlayer;
    }
    get skyColor() {
        return this.propSkyColor;
    }
    get game() {
        return this.propGame;
    }
    getScene() {
        return this.scene;
    }
    get nextLevel() {
        return this.nextLevelName;
    }
    get paused() { return this.isPaused; }
    set paused(paused) { this.isPaused = paused; }
    assignToRenderer(renderer) {
        renderer.scene = this.scene;
    }
    get playerCam() {
        return this.playerCamera;
    }
    get cam() {
        return this.camera;
    }
    addModelOnly(model) {
        this.models.push(model);
    }
    addModel(model) {
        this.addModelOnly(model);
        this.scene.add(model.getMesh());
    }
    addLight(light) {
        this.lights.push(light);
        this.scene.add(light.light);
    }
    addNoCollisionName(name) {
        this.noCollisionNames.push(name);
    }
    getNoCollisionNames() {
        return this.noCollisionNames;
    }
    getModelByName(name) {
        for (let model of this.models) {
            if (model.name == name) {
                return model;
            }
        }
        return null;
    }
    removeModel(model) {
        let modelsCount = this.models.length;
        for (let i = 0; i < modelsCount; i++) {
            if (this.models[i] == model) {
                this.models.splice(i, 1);
                this.scene.remove(model.getMesh());
            }
        }
    }
    removeModelByName(name) {
        let model = this.getModelByName(name);
        if (model) {
            this.removeModel(model);
        }
    }
    namesInUse() {
        let names = new Array();
        for (let model of this.models) {
            names.push(model.name);
        }
        for (let light of this.lights) {
            names.push(light.name);
        }
        return names;
    }
    update(delta) {
        if (!this.isPaused) {
            for (let model of this.models) {
                model.update(delta);
            }
            for (let light of this.lights) {
                light.update();
            }
            this.playerCamera.update();
            this.skybox.update();
        }
        for (let model of this.models) {
            model.updateAlways();
        }
        this.playerCamera.updateAlways();
        this.end.update();
    }
}
class MainMenu extends Level {
    constructor(game) {
        super(game, "main_menu");
        this.cam.assignToRenderer(this.game.renderer);
        this.cam.pY = 50;
        this.cam.pZ = 25;
    }
    update() {
    }
}
class GlobalSound {
    constructor(game) {
        let soundNames = ["menu_button_hover", "menu_button_click"];
        this.audioListener = new THREE.AudioListener();
        this.sounds = new Array();
        for (let soundName of soundNames) {
            let buffer = game.soundDataByName(soundName).buffer;
            let sound = new THREE.Audio(this.listener);
            sound.name = soundName;
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            this.sounds.push(sound);
        }
    }
    get listener() {
        return this.audioListener;
    }
    play(name, volume = 1, restart = false) {
        for (let sound of this.sounds) {
            if (sound.name == name) {
                if (restart && sound.isPlaying) {
                    sound.stop();
                }
                if (!sound.isPlaying) {
                    sound.setVolume(volume);
                    sound.play();
                }
                return;
            }
        }
    }
    pause(name, stop = false) {
        for (let sound of this.sounds) {
            if (sound.name == name) {
                if (stop && sound.isPlaying) {
                    sound.stop();
                }
                else if (sound.isPlaying) {
                    sound.pause();
                }
                return;
            }
        }
    }
}
class ModelSound {
    constructor(game, model, soundNames = []) {
        this.soundNames = soundNames;
        this.sounds = new Array();
        this.audioListener = game.sound.listener;
        for (let soundName of soundNames) {
            let buffer = game.soundDataByName(soundName).buffer;
            let sound = new THREE.PositionalAudio(this.audioListener);
            sound.name = soundName;
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            this.sounds.push(sound);
            model.getMesh().add(sound);
        }
    }
    play(name, volume = 1, restart = false) {
        for (let sound of this.sounds) {
            if (sound.name == name) {
                if (restart && sound.isPlaying) {
                    sound.stop();
                }
                if (!sound.isPlaying) {
                    sound.setVolume(volume);
                    sound.play();
                }
                return;
            }
        }
    }
    pause(name, stop = false) {
        for (let sound of this.sounds) {
            if (sound.name == name) {
                if (stop && sound.isPlaying) {
                    sound.stop();
                }
                else if (sound.isPlaying) {
                    sound.pause();
                }
                return;
            }
        }
    }
}
class SoundData {
    constructor(name, buffer) {
        this.name = name;
        this.buffer = buffer;
    }
}
//# sourceMappingURL=main.js.map
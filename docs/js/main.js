"use strict";
class Game {
    constructor(levelsData, meshesData) {
        this.gameloop = () => {
            let delta = this.propClock.getDelta();
            this.level.update(delta);
            this.renderer.update();
            requestAnimationFrame(() => this.gameloop());
        };
        this.levelsData = levelsData;
        this.meshesData = meshesData;
        this.propRenderer = new Renderer();
        this.propLevel = new Level(this, "level_1");
        this.propLevel.assignToRenderer(this.propRenderer);
        this.propClock = new THREE.Clock();
        this.gameloop();
    }
    get level() { return this.propLevel; }
    ;
    get renderer() { return this.propRenderer; }
    ;
    get clock() { return this.propClock; }
    ;
    getRenderer() { return this.propRenderer; }
    levelDataByName(name) {
        for (let levelData of this.levelsData) {
            if (levelData.name == name) {
                return levelData;
            }
        }
        return this.levelsData[0];
    }
    meshDataByName(name) {
        for (let meshData of this.meshesData) {
            if (meshData.name == name) {
                return meshData;
            }
        }
        return this.meshesData[0];
    }
}
let game;
class PreLoad {
    constructor() {
        this.assetsDir = "assets";
        this.modelsDir = this.assetsDir + "/models";
        this.levelsDir = this.assetsDir + "/levels";
        this.preloadedMeshes = {};
        this.loadedMeshes = new Array();
        this.preloadedLevels = {};
        this.loadedLevels = new Array();
        reqwest(this.assetsDir + "/preload_list.json", (preloadData) => {
            let modelNames = preloadData.models;
            let levelNames = preloadData.levels;
            for (let name of modelNames) {
                this.preloadedMeshes[name] = false;
                this.loadMesh(name);
            }
            for (let name of levelNames) {
                this.preloadedLevels[name] = false;
                this.loadLevel(name);
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
            return true;
        };
        if (!loadingDone()) {
            requestAnimationFrame(() => this.waitForLoad());
        }
        else {
            game = new Game(this.loadedLevels, this.loadedMeshes);
        }
    }
}
window.addEventListener("load", () => new PreLoad());
class Camera {
    constructor(level) {
        this.setSize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };
        this.level = level;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.09, 1000);
        window.addEventListener("resize", this.setSize);
    }
    getRotation() {
        return this.camera.rotation;
    }
    assignToRenderer(renderer) {
        renderer.camera = this.camera;
    }
    update() {
    }
}
class PlayerCamera extends Camera {
    constructor(level, model) {
        super(level);
        this.lockPointer = () => {
            this.renderElement.requestPointerLock();
            this.pointerLocked = true;
        };
        this.unlockPointer = () => {
            document.exitPointerLock();
            this.pointerLocked = false;
        };
        this.pointerLockChange = () => {
            if (document.pointerLockElement !== this.renderElement) {
                this.unlockPointer();
            }
        };
        this.mouseHandler = (e) => {
            if (this.pointerLocked) {
                let sens = 0.0015;
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
        };
        this.targetModel = model;
        this.yOffset = 10;
        this.defaultDistance = 15;
        this.distance = this.defaultDistance;
        this.viewRotateX = 0;
        this.viewRotateY = 0;
        this.pointerLocked = false;
        this.renderElement = this.level.game.renderer.element;
        window.addEventListener("mousemove", this.mouseHandler);
        this.renderElement.requestPointerLock = this.renderElement.requestPointerLock;
        document.exitPointerLock = document.exitPointerLock;
        this.renderElement.addEventListener("click", this.lockPointer);
        document.addEventListener('pointerlockchange', this.pointerLockChange, false);
        let crosshair = new Model(level, "crosshair", undefined, false);
        var crosshairMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
        crosshair.material = crosshairMaterial;
        crosshair.pZ = -0.1;
        crosshair.sY = 0.002;
        crosshair.sX = 0.002;
        this.camera.add(crosshair.getMesh());
    }
    getTarget() {
        let direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        let maxDistance = 200;
        let rayCaster = new THREE.Raycaster(this.camera.position, direction, this.distance, maxDistance);
        let intersects = rayCaster.intersectObjects(this.level.getScene().children);
        let i = 0;
        while (i < intersects.length) {
            if (this.level.noCollisionModels.indexOf(intersects[i].object.name) != -1) {
                intersects.splice(i, 1);
            }
            else {
                i++;
            }
        }
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
    get pointerIsLocked() {
        return this.pointerLocked;
    }
    get viewRotY() {
        return this.viewRotateY;
    }
    get viewRotX() {
        return this.viewRotateX;
    }
    update() {
        let cameraOffset = new THREE.Vector3(0, 0, -this.distance);
        let axisX = new THREE.Vector3(1, 0, 0);
        let angleX = this.viewRotateX;
        let axisY = new THREE.Vector3(0, 1, 0);
        let angleY = this.viewRotateY;
        cameraOffset.applyAxisAngle(axisX, angleX);
        cameraOffset.applyAxisAngle(axisY, angleY);
        cameraOffset.y += this.yOffset;
        let modelPos = this.targetModel.posVector;
        cameraOffset.x += modelPos.x;
        cameraOffset.y += modelPos.y;
        cameraOffset.z += modelPos.z;
        let cameraTarget = this.targetModel.posVector;
        cameraTarget.y += this.yOffset;
        this.camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
        this.camera.lookAt(cameraTarget);
    }
}
class Level {
    constructor(game, levelName) {
        this.propGame = game;
        this.scene = new THREE.Scene();
        this.propSkyColor = { r: 255, g: 255, b: 255 };
        this.models = new Array();
        this.lights = new Array();
        this.propPlayer = new Player(this);
        this.camera = new PlayerCamera(this, this.player);
        this.camera.assignToRenderer(this.propGame.renderer);
        this.scene.add(this.camera.camera);
        this.noCollisionModels = ["player", "bullet", "gun", "ShadowHelper", "skybox"];
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(this.ambientLight);
        let levelSrcData = this.game.levelDataByName(levelName);
        this.propSkyColor = levelSrcData.horizon_color;
        this.ambientLight.intensity = levelSrcData.environment_light;
        for (let key in levelSrcData.objects) {
            let obj = levelSrcData.objects[key];
            if (obj.model == "practice_target") {
                new PracticeTarget(this, obj);
            }
            else if (obj.type == 'MESH') {
                new Model(this, obj.model, obj);
            }
            else if (obj.type == "LAMP") {
                new Light(this, obj.model, obj);
            }
        }
        new Skybox(this);
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
    assignToRenderer(renderer) {
        renderer.scene = this.scene;
    }
    get cam() {
        return this.camera;
    }
    addModelName(name, model) {
        this.models.push(model);
    }
    addModel(model) {
        this.addModelName(model.name, model);
        this.scene.add(model.getMesh());
    }
    addLight(light) {
        this.lights.push(light);
        this.scene.add(light.light);
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
        for (let model of this.models) {
            model.update(delta);
        }
        for (let light of this.lights) {
            light.update(delta);
        }
        this.camera.update();
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
        this.assignedCamera = new THREE.PerspectiveCamera();
        this.assignedScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.setSize();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener("resize", this.setSize);
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
    update() {
        this.renderer.render(this.assignedScene, this.assignedCamera);
    }
}
class GameObject {
    constructor(level, name, objectType) {
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
        this.objectType = objectType;
    }
    get level() {
        return this.propLevel;
    }
    get type() {
        return this.objectType;
    }
}
class Model extends GameObject {
    constructor(level, meshName, modelSource = new ModelSource(), autoAdd = true) {
        super(level, meshName, "Model");
        let meshData = level.game.meshDataByName(meshName);
        this.mesh = meshData.mesh;
        let geometry = meshData.geometry;
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
            this.level.addModelName(this.name, this);
        }
        this.posVector = new THREE.Vector3(this.modelSource.location.x, this.modelSource.location.y, this.modelSource.location.z);
        this.rotVector = new THREE.Vector3(this.modelSource.rotation.x, this.modelSource.rotation.y, this.modelSource.rotation.z);
        this.scaleVector = new THREE.Vector3(this.modelSource.scale.x, this.modelSource.scale.y, this.modelSource.scale.z);
    }
    afterMeshLoad() {
    }
    hit() { }
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
    playAction(name, repetitions = Infinity) {
        if (name != this.playingAction) {
            for (let key in this.actions) {
                if (key == name) {
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
}
class Skybox extends Model {
    constructor(level) {
        super(level, "skybox");
        this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
        this.sX = 3;
        this.sY = 3;
        this.sZ = 3;
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
    moveUpdate(delta) {
        let moveZ = Math.abs(this.moving.forward);
        let moveX = Math.abs(this.moving.sideways);
        let moveTotal = moveZ + moveX;
        if (moveTotal > 0) {
            this.collisionBox.rX = -this.rX;
            this.collisionBox.rY = -this.rY;
            this.collisionBox.rZ = -this.rZ;
            let dirZ = this.moving.forward / moveZ;
            let dirX = this.moving.sideways / moveX;
            if (isNaN(dirZ)) {
                dirZ = 0;
            }
            if (isNaN(dirX)) {
                dirX = 0;
            }
            let velocityZ = (moveZ / moveTotal) * dirZ * this.velocity * delta;
            let velocityX = (moveX / moveTotal) * dirX * this.velocity * delta;
            let front = this.collisionBox.front().distance;
            let back = this.collisionBox.back().distance;
            let right = this.collisionBox.right().distance;
            let left = this.collisionBox.left().distance;
            let transform = new THREE.Vector3(velocityX, 0, velocityZ);
            transform.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rY);
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
    constructor(level, gun, target) {
        super(level, "bullet");
        this.hasCollision = true;
        this.collisionBox = new CollisionBox(this, 0.6, 0.5, 4, 0, 0, -1, 5, false, true, new THREE.Vector3(1, 1, 1));
        var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh.material = bulletMaterial;
        this.despawnTimeout = 5;
        let position = new THREE.Vector3();
        position.x = -5;
        position.z = -0.75;
        position.applyMatrix4(gun.getWorldMatrix());
        console.log();
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
                this.collided(front);
            }
            if (this.moving.forward > 0) {
                let amount = this.velocity * delta;
                if (front.distance < amount && front.intersected) {
                    amount = front.distance + 0.2;
                    this.collided(front);
                }
                this.mesh.translateZ(amount);
            }
        }
        else if (this.despawnTimeout > 1) {
            this.despawnTimeout = 1;
        }
    }
    collided(rayData) {
        this.moving.forward = 0;
        let model = this.level.getModelByName(rayData.model.userData.uniqueName);
        model.hit();
    }
    remove() {
        this.level.removeModel(this);
    }
    update(delta) {
        this.moveUpdate(delta);
    }
}
class Gun extends Model {
    constructor(level, player) {
        super(level, "gun", undefined, false);
        this.player = player;
        this.hand = player.getMesh().getObjectByName("hand.R");
        this.rX = Math.PI;
        this.rY = Math.PI / 2;
        this.pX = -0.15;
        this.pY = -0.13;
        this.pZ = -0.36;
        this.hand.add(this.mesh);
        window.addEventListener("click", (e) => this.fire(e));
    }
    fire(e) {
        this.player.rotateToView();
        new Bullet(this.level, this, this.level.cam.getTarget());
    }
}
class Light extends GameObject {
    constructor(level, model, lightSource = new LightSource()) {
        super(level, model, "Light");
        this.lightSource = lightSource;
        let color = parseInt("0x" + utils.toHEX(lightSource.data.color));
        if (lightSource.data.type == "SUN") {
            this.propLight = new THREE.DirectionalLight(color, lightSource.data.energy);
            this.propLight.shadow.camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.5, 200);
            this.propLight.target = this.level.player.getMesh();
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
            this.propLight.shadow.mapSize.width = 500;
            this.propLight.shadow.mapSize.height = 500;
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
    update(delta) {
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
    constructor(level) {
        super(level, "player");
        this.keyDownHandler = (e) => {
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
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        this.gun = new Gun(this.level, this);
        if (this.hasCollision) {
            this.collisionBox = new CollisionBox(this, 2, 7.5, 2, 0, 7.5 / 2, 0, 5, true, false, new THREE.Vector3(1, 2, 1));
        }
        this.playAction("idle");
        this.actionTimeScale("walk", 1.7);
    }
    afterMeshLoad() {
        super.afterMeshLoad();
    }
    moveUpdate(delta) {
        if (this.moving.forward != 0 || this.moving.sideways != 0) {
            this.rotateToView();
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
        super.moveUpdate(delta);
    }
    rotateToView() {
        let rotationY = this.propLevel.cam.viewRotY;
        this.rY = rotationY;
    }
    getCameraRotation() {
        return this.cameraRotation;
    }
    update(delta) {
        super.update(delta);
    }
}
class PracticeTarget extends Model {
    constructor(level, modelSource = new ModelSource()) {
        super(level, "practice_target", modelSource);
        this.down = false;
        this.rY = Math.random() * (Math.PI * 2);
    }
    hit() {
        if (!this.down) {
            this.mesh.rotateX(Math.PI / 2 - 0.2);
            this.down = true;
            let max = 25 * 1000;
            let min = 15 * 1000;
            setTimeout(() => {
                this.down = false;
                this.mesh.rotateX(-(Math.PI / 2 - 0.2));
            }, Math.random() * (max - min) + min);
        }
    }
}
class CollisionBox {
    constructor(model, sizeX = 0, sizeY = 0, sizeZ = 0, offsetX = 0, offsetY = 0, offsetZ = 0, extraDistance = 1, gravity = false, rotationEnabled = false, givenSegments = new THREE.Vector3()) {
        this.model = model;
        this.rotationEnabled = rotationEnabled;
        let collisionVisible = false;
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
            if (collisionVisible) {
                model.getMesh().add(this.box);
            }
            let sideGeomtries = [
                { side: "z", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.y, segments.x, segments.y), color: 0xff0000 },
                { side: "x", geometry: new THREE.PlaneGeometry(this.boxSize.z, this.boxSize.y, segments.z, segments.y), color: 0x0000ff },
                { side: "y", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.z, segments.x, segments.z), color: 0x00ff00 }
            ];
            if (segments.x <= 1 && segments.z <= 1 && gravity) {
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
                if (collisionVisible) {
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
                    direction.applyQuaternion(this.model.getMesh().quaternion);
                }
                geometry.translate(this.model.pX, this.model.pY, this.model.pZ);
                let skipObjects = [];
                skipObjects.push(this.model.name);
                let shortestDistance = distance;
                let closestPoint = new THREE.Vector3();
                let closestModel = new THREE.Object3D();
                let intersected = false;
                let faceIndex = 0;
                for (let vertex of geometry.vertices) {
                    let raycaster = new THREE.Raycaster(vertex, direction, 0, distance);
                    let intersects = raycaster.intersectObjects(this.model.level.getScene().children);
                    for (let intersect of intersects) {
                        if (skipObjects.indexOf(intersect.object.name) == -1 && this.model.level.noCollisionModels.indexOf(intersect.object.name) == -1) {
                            if (intersect.distance < shortestDistance) {
                                shortestDistance = intersect.distance;
                                closestPoint = intersect.point;
                                closestModel = intersect.object;
                                intersected = true;
                                faceIndex = intersect.faceIndex;
                            }
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
//# sourceMappingURL=main.js.map
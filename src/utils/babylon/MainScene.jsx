import React, { Component } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { CharacterController } from "babylonjs-charactercontroller";
import { Inspector } from "@babylonjs/inspector";
import axios from "axios";
import { joystickController } from "./joystickController";

class MainScene extends Component {
    constructor(props) {
        super(props);
        this.mainTitle = null;
        this.canvasRef = React.createRef();

        this.engine = null;
        this.scene = null;
        this.mainCamera = null;
        this.characterController = null;

        // model/meshes
        this.sceneModelMeshes = null;
        this.player = null;

        this.spotLight = null;
        this.spotLightPos = new BABYLON.Vector3(3.85, 4.05, -0.40);

        //joy stick
        this.HUD = null;
    }

    async componentDidMount() {
        this.engine = new BABYLON.Engine(this.canvasRef.current, true);
        this.scene = this.createScene();

        await this.loadModels();

        await this.setupEnvironment();
        this.createCharacterController();

        this.HUD = new joystickController(this.scene, this.canvasRef.current, this.engine);
        if (this.HUD._playerUI) this.createHUD();

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.scene.executeWhenReady(() => {
            this.props.setLoading(false);
        });
    }

    componentWillUnmount() {
        this.engine.stopRenderLoop();
        this.engine.dispose();
    }

    createScene() {
        const scene = new BABYLON.Scene(this.engine);
        new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 10, 0), scene);

        // scene.onPointerDown = (evt) => {
        //     if (evt.button === 0) this.engine.enterPointerlock();
        //     if (evt.button === 1) this.engine.exitPointerlock();
        // };

        const framesPerSecond = 60;
        const gravity = -9.81;
        scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);
        scene.collisionsEnabled = true;

        // Inspector.Show(this.scene, { embedMode: false });

        return scene;
    }

    async loadModels() {
        BABYLON.SceneLoader.ShowLoadingScreen = false;

        // load room model
        const { meshes: roomMeshes } = await BABYLON.SceneLoader.AppendAsync("./models/vrModernGallery.gltf", "", this.scene);
        this.sceneModelMeshes = roomMeshes;

        // load player model
        const { meshes: playerMeshes, skeletons: playerSkeletons } = await BABYLON.SceneLoader.ImportMeshAsync("", "./player/", "Vincent-backFacing.babylon", this.scene);
        this.player = playerMeshes[0];
        this.player.skeleton = playerSkeletons[0];
    }

    async setupEnvironment() {
        this.sceneModelMeshes.forEach((mesh) => {
            // if (mesh.name === "Room") {
            mesh.checkCollisions = true;
            mesh.collisionRetryCount = 4;
            // }
        });

        // get portfolio data
        const portfolioData = await this.getPortfolioData();
        if (portfolioData) {
            portfolioData.forEach((item, index) => {
                const paddedIndex = index.toString().padStart(3, "0");
                const meshName = `Frame.${paddedIndex}`;
                const mesh = this.scene.getMeshByName(meshName);
                if (mesh) {
                    const texture = new BABYLON.Texture(
                        item.image,
                        this.scene
                    );

                    const material = new BABYLON.PBRMaterial(
                        "material" + meshName,
                        this.scene
                    );
                    // material.diffuseTexture = texture;
                    material.albedoTexture = texture;
                    material.metallic = 0;
                    material.roughness = 1;
                    material.backFaceCulling = false;
                    mesh.material = material;
                    mesh.checkCollisions = true;

                    var spotLight = new BABYLON.SpotLight(
                        "spotLight" + index,
                        this.spotLightPos,
                        new BABYLON.Vector3(-0.6, -0.75, 0.1),
                        Math.PI / 3,
                        2,
                        this.scene
                    );

                    spotLight.parent = mesh.parent;
                    spotLight.position = this.spotLightPos;
                    spotLight.intensity = 200;
                    spotLight.includedOnlyMeshes = [mesh, this.sceneModelMeshes[0]];
                }
            });
        }
    }

    createHUD() {
        let isLeftJoystickActive = false;

        // for left joystick
        this.HUD.leftJoystickTouchArea.onPointerDownObservable.add((coordinates) => {
            isLeftJoystickActive = true;
            this.HUD.joystickStartX = (coordinates.x - this.HUD.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.HUD.LsideJoystickOffset;
            this.HUD.joystickStartY = (this.HUD._playerUI.getBaseSize().height - coordinates.y - this.HUD.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.HUD.LbottomJoystickOffset;
            this.HUD.leftPuck.floatLeft = this.HUD.joystickStartX;
            this.HUD.leftPuck.floatTop = this.HUD.joystickStartY * -1;
            this.HUD.leftPuck.left = this.HUD.leftPuck.floatLeft;
            this.HUD.leftPuck.top = this.HUD.leftPuck.floatTop;
            this.HUD.leftJoystickTouchArea.alpha = 1;
        });

        this.HUD.leftJoystickTouchArea.onPointerUpObservable.add((coordinates) => {
            isLeftJoystickActive = false;
            this.HUD.joystickStartX = 0;
            this.HUD.joystickStartY = 0;
            this.HUD.leftPuck.left = 0;
            this.HUD.leftPuck.top = 0;
            this.HUD.leftJoystickTouchArea.alpha = 0.4;
        });

        this.HUD.leftJoystickTouchArea.onPointerMoveObservable.add((coordinates) => {
            if (isLeftJoystickActive) {
                this.HUD.joystickStartX = (coordinates.x - this.HUD.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.HUD.LsideJoystickOffset;
                this.HUD.joystickStartY = (this.HUD._playerUI.getBaseSize().height - coordinates.y - this.HUD.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.HUD.LbottomJoystickOffset;
                this.HUD.leftPuck.floatLeft = this.HUD.joystickStartX;
                this.HUD.leftPuck.floatTop = this.HUD.joystickStartY * -1;
                this.HUD.leftPuck.left = this.HUD.leftPuck.floatLeft;
                this.HUD.leftPuck.top = this.HUD.leftPuck.floatTop;
            }
        });

        this.HUD.rightPuck.onPointerDownObservable.add((coordinates) => {
            this.HUD.rightPuck.alpha = 2;
            this.characterController.jump((true));
        });

        this.HUD.rightPuck.onPointerUpObservable.add((coordinates) => {
            this.HUD.rightPuck.alpha = 1;
            this.characterController.jump((false));
        });

        // enables touch detection outside of the joystickTouchArea
        this.scene.onPointerMove = (event) => {
            const coordinates = {
                x: event.clientX,
                y: event.clientY
            };

            if (isLeftJoystickActive) {
                this.HUD.joystickStartX = (coordinates.x - this.HUD.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.HUD.LsideJoystickOffset;
                this.HUD.joystickStartY = (this.HUD._playerUI.getBaseSize().height - coordinates.y - this.HUD.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.HUD.LbottomJoystickOffset;

                // distance from the center of the leftJoystickTouchArea to the new position
                const distance = Math.sqrt(
                    Math.pow(this.HUD.joystickStartX, 2) + Math.pow(this.HUD.joystickStartY, 2)
                );

                // maximum distance from the center to stay inside the circle
                const maxDistance = this.HUD.leftJoystickTouchArea._currentMeasure.width * 0.5;

                // values back to the circle boundary
                if (distance > maxDistance) {
                    const scaleFactor = maxDistance / distance;
                    this.HUD.joystickStartX *= scaleFactor;
                    this.HUD.joystickStartY *= scaleFactor;
                }

                // leftPuck position update
                this.HUD.leftPuck.floatLeft = this.HUD.joystickStartX;
                this.HUD.leftPuck.floatTop = this.HUD.joystickStartY * -1;
                this.HUD.leftPuck.left = this.HUD.leftPuck.floatLeft;
                this.HUD.leftPuck.top = this.HUD.leftPuck.floatTop;
            }
        };

        // check joystick position every frame and update camera rotation or movement
        this.scene.onBeforeRenderObservable.add(() => {
            if (isLeftJoystickActive) {
                checkMoveControl(this.HUD.joystickStartX, this.HUD.joystickStartY);
            } else {
                checkMoveControl(0, 0);
            }
        });

        const checkMoveControl = (x, y) => {
            const angle = Math.atan2(y, x);

            if (x === 0 && y === 0) {
                this.characterController.walk((false));
                this.characterController.walkBack((false));
                this.characterController.turnLeft((false));
                this.characterController.turnRight((false));
            } else {
                // Use the angle to determine the movement direction
                this.HUD.joystickLXangle = Math.cos(angle);
                this.HUD.joystickLYangle = Math.sin(angle);

                //check 8 angles and set this.characterController
                if (this.HUD.joystickLXangle > 0.5) {
                    this.characterController.turnRight(true);
                    this.characterController.turnLeft(false);

                    if (this.HUD.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.HUD.joystickLYangle < -0.5) {
                        this.characterController.walk(false);
                        this.characterController.walkBack(true);
                    } else {
                        this.characterController.walk(false);
                        this.characterController.walkBack(false);
                    }
                } else if (this.HUD.joystickLXangle < -0.5) {
                    this.characterController.turnLeft(true);
                    this.characterController.turnRight(false);

                    if (this.HUD.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.HUD.joystickLYangle < -0.5) {
                        this.characterController.walk(false);
                        this.characterController.walkBack(true);
                    } else {
                        this.characterController.walk(false);
                        this.characterController.walkBack(false);
                    }
                } else {
                    this.characterController.turnLeft(false);
                    this.characterController.turnRight(false);

                    if (this.HUD.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.HUD.joystickLYangle < -0.5) {
                        this.characterController.walk(false);
                        this.characterController.walkBack(true);
                    } else {
                        this.characterController.walk(false);
                        this.characterController.walkBack(false);
                    }
                }
            }
        }
    }

    createCharacterController() {
        try {
            this.player.skeleton.enableBlending(0.1);
            this.player.scaling.scaleInPlace(2);
            //if the skeleton does not have any animation ranges then set them as below
            // this.setAnimationRanges(skeleton);

            // var sm = this.player.material;
            // if (sm.diffuseTexture != null) {
            //     sm.backFaceCulling = true;
            //     sm.ambientColor = new BABYLON.Color3(1, 1, 1);
            // }

            this.player.position = new BABYLON.Vector3(0, 10, 0);
            this.player.checkCollisions = true;
            this.player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
            this.player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

            //rotate the camera behind the player
            this.player.rotation.y = Math.PI / 2;
            // var alpha = (Math.PI / 2 - this.player.rotation.y);
            var alpha = 0;
            var beta = Math.PI / 2;
            var target = new BABYLON.Vector3(this.player.position.x, this.player.position.y + 3.5, this.player.position.z);

            this.mainCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, this.scene);
            //standard camera setting
            this.mainCamera.wheelPrecision = 15;
            this.mainCamera.checkCollisions = true;
            //make sure the keyboard keys controlling camera are different from those controlling player
            //here we will not use any keyboard keys to control camera
            this.mainCamera.keysLeft = [];
            this.mainCamera.keysRight = [];
            this.mainCamera.keysUp = [];
            this.mainCamera.keysDown = [];
            //how close can the camera come to player
            this.mainCamera.lowerRadiusLimit = 2;
            //how far can the camera go from the player
            this.mainCamera.upperRadiusLimit = 10;

            this.mainCamera.attachControl();

            this.characterController = new CharacterController(this.player, this.mainCamera, this.scene);
            this.characterController.setFaceForward(false);
            this.characterController.setMode(0);
            this.characterController.setTurnSpeed(45);
            this.characterController.setTurningOff(true);
            //below makes the controller point the camera at the player head which is approximately where the eyes are
            this.characterController.setCameraTarget(new BABYLON.Vector3(0, 3.5, 0));

            //if the camera comes close to the player we want to enter first person mode.
            this.characterController.setNoFirstPerson(true);
            //the height of steps which the player can climb
            this.characterController.setStepOffset(0.4);
            //the minimum and maximum slope the player can go up
            //between the two the player will start sliding down if it stops
            this.characterController.setSlopeLimit(30, 60);

            // set
            // - which animation range should be used for which player animation
            // - rate at which to play that animation range
            // - wether the animation range should be looped
            // use this if name, rate or looping is different from default
            this.characterController.setIdleAnim("idle", 1, true);
            this.characterController.setTurnLeftAnim("turnLeft", 0.5, true);
            this.characterController.setTurnRightAnim("turnRight", 0.5, true);
            this.characterController.setWalkBackAnim("walkBack", 0.5, true);
            this.characterController.setIdleJumpAnim("idleJump", 0.5, false);
            this.characterController.setRunJumpAnim("runJump", 0.6, false);
            this.characterController.setFallAnim("fall", 2, false);
            this.characterController.setSlideBackAnim("slideBack", 1, false);

            // let walkSound = new BABYLON.Sound(
            //     "walk",
            //     "./sounds/footstep_carpet_000.ogg",
            //     this.scene,
            //     () => {
            //         this.characterController.setSound(walkSound);
            //     },
            //     { loop: false }
            // );

            var ua = window.navigator.userAgent;
            var isIE = /MSIE|Trident/.test(ua);
            if (isIE) {
                //IE specific code goes here
                this.characterController.setJumpKey("spacebar");
            }

            this.characterController.setCameraElasticity(true);
            // this.characterController.makeObstructionInvisible(true);
            this.characterController.start();

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            this.canvasRef.current.focus();
        }
        catch (err) {
            console.log(err);
        }
    }

    setAnimationRanges(skel) {
        this.delAnimRanges(skel);

        skel.createAnimationRange("fall", 0, 16);
        skel.createAnimationRange("idle", 21, 65);
        skel.createAnimationRange("jump", 70, 94);
        skel.createAnimationRange("run", 100, 121);
        skel.createAnimationRange("slideBack", 125, 129);
        skel.createAnimationRange("strafeLeft", 135, 179);
        skel.createAnimationRange("strafeRight", 185, 229);
        skel.createAnimationRange("turnLeft", 240, 262);
        skel.createAnimationRange("turnRight", 270, 292);
        skel.createAnimationRange("walk", 300, 335);
        skel.createAnimationRange("walkBack", 340, 366);
    }

    delAnimRanges(skel) {
        let ars = skel.getAnimationRanges();
        let l = ars.length;
        for (let i = 0; i < l; i++) {
            let ar = ars[i];
            // console.log(ar.name + "," + ar.from + "," + ar.to);
            skel.deleteAnimationRange(ar.name, false);
        }
    }


    async getPortfolioData() {
        const result = await axios.get('https://api.atitkharel.com.np/portfolio/atit/')
        this.mainTitle = result.data.title;
        return (result.data.portfolio);
    }

    render() {
        return (
            document.title = 'Portfolio Website | XR',
            <>
                <canvas ref={this.canvasRef}
                    id="renderCanvas"
                    style={{ width: '100vw', height: '100vh', display: 'block' }} />
            </>
        )
    }
}

export default MainScene;
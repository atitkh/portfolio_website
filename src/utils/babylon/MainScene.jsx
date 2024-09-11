import React, { Component } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { CharacterController } from "babylonjs-charactercontroller";
import { Inspector } from "@babylonjs/inspector";
import axios from "axios";
import { joystickController } from "./joystickController";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

class MainScene extends Component {
    constructor(props) {
        super(props);
        this.mainTitle = null;
        this.canvasRef = React.createRef();

        this.engine = null;
        this.scene = null;
        this.mainCamera = null;
        this.mapCamera = null;
        this.mapPlayer = null;
        this.characterController = null;

        // model/meshes
        this.sceneModelMeshes = null;
        this.player = null;
        this.loadingPercent = 0;
        this.progressMap = {};
        this.promiseArray = [];

        this.settings = {
            instructionMode: 1,
            enableGlow: false,
        }

        this.spotLight = null;
        this.spotLightPos = new BABYLON.Vector3(3.85, 4.05, -0.40);

        //joy stick
        this.UI = null;
    }

    loadingProgress(name, progress) {
        this.progressMap[name] = +progress;
        // calc precentage
        const sum = Object.keys(this.progressMap).reduce((prev, curr) => {
            return prev + this.progressMap[curr];
        }, 0);
        this.loadingPercent = Math.round(sum / Object.keys(this.progressMap).length);
        this.props.setLoadingPercent(this.loadingPercent);
        // console.log(`loading ${name}: ${progress}%`);
    }

    async componentDidMount() {
        this.engine = new BABYLON.Engine(this.canvasRef.current, true);
        this.scene = this.createScene();

        //initialize loader and models
        this.loadingProgress("roomMeshes", 0);
        this.loadingProgress("playerModel", 0);
        this.loadingProgress("portfolioData", 0);
        await this.loadModels();

        await this.setupEnvironment();
        this.createCharacterController();

        this.UI = new joystickController(this.scene, this.canvasRef.current, this.engine);
        if (this.UI.playerUI) {
            this.createUI();
            this.UI.playerUI.layer.layerMask = 1;
        }

        this.engine.runRenderLoop(() => {
            let divFps = document.getElementsByClassName("fps")[0];
            divFps.innerHTML = this.engine.getFps().toFixed() + " fps";

            if (this.scene) {
                this.scene.render();

                // for minimap
                // this.mapPlayer.position.x = this.player.position.x;
                // this.mapPlayer.position.z = this.player.position.z;
                // this.mapPlayer.position.y = 6;

                // this.mapPlayer.rotation.y = this.player.rotation.y + Math.PI;

                this.mapCamera.target.x = this.player.position.x;
                this.mapCamera.target.z = this.player.position.z;
                this.mapCamera.target.y = 0;
            }
        });

        this.canvasRef.current.focus();

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        Promise.all(this.promiseArray).then(() => {
            this.scene.executeWhenReady(() => {
                setTimeout(() => {
                    this.props.setLoading(false);

                    if (this.settings.instructionMode === 0) {
                        this.showInstructions();
                        this.characterController.pauseAnim();
                        this.characterController.stop();
                    }
                    else {
                        this.showWallInstructions();
                    }
                }, 1000);
            });
        });

        // this.optimizeScene(this.scene);
    }

    optimizeScene(scene, options) {
        options = new BABYLON.SceneOptimizerOptions()
        // options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1))
        var optimizer = new BABYLON.SceneOptimizer(scene, options)
        optimizer.start()
        BABYLON.SceneOptimizer.OptimizeAsync(scene, BABYLON.SceneOptimizerOptions.HighDegradationAllowed(),
            () => {
                console.log("[OPTIMIZER] Scene optimized");
            }, () => {
                console.log("[OPTIMIZER] Scene optimization unsuccessfull");
            });
        return optimizer
    }

    componentWillUnmount() {
        this.engine.stopRenderLoop();
        this.engine.dispose();
    }

    createScene() {
        const scene = new BABYLON.Scene(this.engine);
        // new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 10, 0), scene);
        var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
        light.position = new BABYLON.Vector3(20, 40, 20);
        light.intensity = 1;

        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/Studio_Softbox_2Umbrellas_cube_specular.dds", scene);
        hdrTexture.name = "envTex";
        hdrTexture.gammaSpace = false;
        hdrTexture.setReflectionTextureMatrix(BABYLON.Matrix.RotationY(2.4));
        scene.environmentTexture = hdrTexture;

        // sky
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        var skyboxMaterial = new BABYLON.PBRMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture.clone();
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.microSurface = 1.0;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.twoSidedLighting = true;
        skyboxMaterial._environmentBRDFTexture = hdrTexture.clone();
        skyboxMaterial._environmentBRDFTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial._environmentBRDFTexture.gammaSpace = false;
        skybox.material = skyboxMaterial;

        // scene.onPointerDown = (evt) => {
        //     if (evt.button === 0) this.engine.enterPointerlock();
        //     if (evt.button === 1) this.engine.exitPointerlock();
        // };

        const framesPerSecond = 60;
        const gravity = -9.81;
        scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);
        scene.collisionsEnabled = true;

        // minimap camera
        this.mapCamera = new BABYLON.ArcRotateCamera("MapCamera", 0, 0, 150, BABYLON.Vector3.Zero(), scene);
        this.mapCamera.layerMask = 2;
        this.mapCamera.viewport = new BABYLON.Viewport(0, 0, (2) / (this.canvasRef.current.width / 100) / 1.2, (2) / (this.canvasRef.current.height / 100) / 1.2);
        this.mapCamera.minZ = 142;
        this.mapCamera.fov = 0.3;

        // Inspector.Show(this.scene, { embedMode: false });

        return scene;
    }

    async loadModels() {
        BABYLON.SceneLoader.ShowLoadingScreen = false;

        // load room model
        this.promiseArray.push(await BABYLON.SceneLoader.ImportMeshAsync("", "https://dl.dropbox.com/scl/fi/cstrm562p1zmgera8bau1/", "gallery.glb?rlkey=se2v9d73zjyy8tp5ecn7ot2pz", this.scene, (evt) => {
            // onProgress
            var loadedPercent = 0;
            if (evt.lengthComputable) {
                loadedPercent = (evt.loaded * 100 / evt.total).toFixed();
            } else {
                // var dlCount = evt.loaded / (1024 * 1024);
                // loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
                // custom value for now
                var dlCount = evt.loaded / 6121680;
                loadedPercent = Math.floor(dlCount * 100.0);
            }
            this.loadingProgress("roomMeshes", loadedPercent);
        }).then((result) => {
            this.sceneModelMeshes = result.meshes;
            if (this.settings.enableGlow) {
                this.addGlow();
            }
        }));

        // load player model
        this.promiseArray.push(await BABYLON.SceneLoader.ImportMeshAsync("", "https://dl.dropbox.com/scl/fi/fsekzsa4t8sp1knos6qsn/", "player_ak_anim.glb?rlkey=effjdh05kjchm9wsmc99av800", this.scene, (evt) => {
            // onProgress
            var loadedPercent = 0;
            if (evt.lengthComputable) {
                loadedPercent = (evt.loaded * 100 / evt.total).toFixed();
            } else {
                var dlCount = evt.loaded / (1024 * 1024);
                loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
            }
            this.loadingProgress("playerModel", loadedPercent);
        }).then((result) => {
            this.player = result.meshes[0];
            this.player.skeleton = result.skeletons[0];

            // since the model is glb
            let animationGroups = result.animationGroups;
            let agMap = {};
            animationGroups.forEach((ag) => {
                agMap[ag.name] = ag;
            });
            this.player.animationGroups = agMap;
            this.player.rotation = this.player.rotationQuaternion.toEulerAngles();
            this.player.rotationQuaternion = null;
        }));
    }

    addGlow() {
        var glow = new BABYLON.GlowLayer("glow", this.scene, {
            mainTextureSamples: 4
        });
        //  only include meshes with name starting with frame
        let frameMeshes = this.sceneModelMeshes.filter((mesh) => {
            return mesh.name.startsWith("Cube.");
        });
        frameMeshes.forEach((mesh) => {
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.scaling.y += 0.01;
            mesh.scaling.z += 0.01;
        });
    }

    async setupEnvironment() {
        var totalLoadablePortfolio = 0;
        var totalLoadedPortfolio = 0;
        let portfolioProgress = 0;

        // default portfolio mat and texture
        let defaultTexture = new BABYLON.Texture(
            "./textures/comingsoon-min.jpg",
            this.scene
        );

        let defaultMaterial = new BABYLON.PBRMaterial("defaultMaterial", this.scene);
        defaultMaterial.metallic = 0;
        defaultMaterial.roughness = 1;
        defaultMaterial.backFaceCulling = false;
        defaultMaterial.albedoTexture = defaultTexture;

        // default nametag mat and texture
        let defaultNametagMaterial = new BABYLON.PBRMaterial("defaultNametagMaterial", this.scene);
        defaultNametagMaterial.metallic = 0;
        defaultNametagMaterial.roughness = 1;
        defaultNametagMaterial.backFaceCulling = false;
        defaultNametagMaterial.albedoColor = new BABYLON.Color3(1, 1, 1);

        let defaultNametagMesh = BABYLON.MeshBuilder.CreateBox(
            "defaultNametagMesh",
            { width: 1.2, height: 0.25 },
            this.scene
        );
        defaultNametagMesh.isVisible = false;
        defaultNametagMesh.material = defaultNametagMaterial;

        this.sceneModelMeshes.forEach((mesh) => {
            mesh.checkCollisions = true;
            mesh.collisionRetryCount = 4;

            if (mesh.name.startsWith("Frame")) {
                totalLoadablePortfolio++;
                mesh.material = defaultMaterial;
            }

            if (mesh.name === "Glass") {
                mesh.material.albedoTexture = new BABYLON.Texture(
                    "./textures/transparent.png",
                    this.scene
                );
                mesh.material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
            }
        });

        // get portfolio data
        const portfolioData = await this.getPortfolioData();
        if (portfolioData) {
            portfolioData.forEach((item, index) => {
                const paddedIndex = index.toString().padStart(3, "0");
                const meshName = `Frame.${paddedIndex}`;
                const mesh = this.scene.getMeshByName(meshName);
                if (mesh) {
                    // action
                    mesh.actionManager = new BABYLON.ActionManager(this.scene);
                    // click
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            () => {
                                this.props.handleOpenGModal(item);
                            }
                        )
                    );
                    //hover in
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOverTrigger,
                            () => {
                                mesh.scaling.x -= 0.01;
                                mesh.scaling.z -= 0.01;
                            }
                        ),
                    );

                    //hover out
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOutTrigger,
                            () => {
                                mesh.scaling.x += 0.01;
                                mesh.scaling.z += 0.01;
                            }
                        ),
                    );

                    // image
                    const texture = new BABYLON.Texture(
                        item.image,
                        this.scene,
                        '',
                        true,
                        '',
                        () => {
                            totalLoadedPortfolio++;
                            portfolioProgress = (totalLoadedPortfolio * 100 / totalLoadablePortfolio).toFixed();
                            this.loadingProgress("portfolioData", portfolioProgress);
                        },
                        () => {
                            // onError
                            console.log(`Error loading texture for ${item.title}`);
                        }
                    );

                    // for transparent textures
                    if (!this.settings.enableGlow) {
                        texture.getAlphaFromRGB = true;
                        texture.hasAlpha = true;
                    }

                    // title
                    const titleMesh = BABYLON.MeshBuilder.CreatePlane(
                        "titleMesh" + meshName,
                        { width: 1.2, height: 0.25 },
                        this.scene
                    );
                    titleMesh.parent = mesh.parent;
                    titleMesh.position = new BABYLON.Vector3(0.08, -1.1, 0);
                    titleMesh.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

                    const titleTexture = AdvancedDynamicTexture.CreateForMesh(titleMesh, 500, 100, false);
                    titleTexture.name = 'titleTexture';
                    const titleText = new TextBlock('titleText', item.title);
                    titleText.color = "black";
                    titleText.fontSize = 35;
                    titleText.textWrapping = true;
                    titleText.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
                    titleText.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
                    titleText.resizeToFit = true;
                    titleTexture.addControl(titleText);

                    // material
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

                    // nametag box
                    const nametagMesh = defaultNametagMesh.clone("nameTag." + meshName);
                    nametagMesh.isVisible = true;
                    nametagMesh.parent = mesh.parent;
                    nametagMesh.position = new BABYLON.Vector3(0, -1.1, 0);
                    nametagMesh.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
                    nametagMesh.scaling = new BABYLON.Vector3(1, 1, 0.08);

                    // var spotLight = new BABYLON.SpotLight(
                    //     "spotLight" + index,
                    //     this.spotLightPos,
                    //     new BABYLON.Vector3(-0.6, -0.75, 0.1),
                    //     Math.PI / 3,
                    //     2,
                    //     this.scene
                    // );

                    // // lighting
                    // spotLight.parent = mesh.parent;
                    // spotLight.position = this.spotLightPos;
                    // spotLight.intensity = 10;
                    // spotLight.includedOnlyMeshes = [mesh, this.sceneModelMeshes[0]];
                }
            })
        }
    }

    createUI() {
        let isLeftJoystickActive = false;
        let pointer = null;

        // for left joystick
        this.UI.leftJoystickTouchArea.onPointerDownObservable.add((coordinates, state) => {
            isLeftJoystickActive = true;
            pointer = state.userInfo.event.pointerId;
            this.UI.joystickStartX = (coordinates.x - this.UI.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.UI.LsideJoystickOffset;
            this.UI.joystickStartY = (this.UI.playerUI.getBaseSize().height - coordinates.y - this.UI.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.UI.LbottomJoystickOffset;
            this.UI.leftPuck.floatLeft = this.UI.joystickStartX;
            this.UI.leftPuck.floatTop = this.UI.joystickStartY * -1;
            this.UI.leftPuck.left = this.UI.leftPuck.floatLeft;
            this.UI.leftPuck.top = this.UI.leftPuck.floatTop;
            this.UI.leftJoystickTouchArea.alpha = 1;
        });

        this.UI.leftJoystickTouchArea.onPointerUpObservable.add((coordinates) => {
            isLeftJoystickActive = false;
            pointer = null;
            this.UI.joystickStartX = 0;
            this.UI.joystickStartY = 0;
            this.UI.leftPuck.left = 0;
            this.UI.leftPuck.top = 0;
            this.UI.leftJoystickTouchArea.alpha = 0.4;
        });

        this.UI.leftJoystickTouchArea.onPointerMoveObservable.add((coordinates) => {
            if (isLeftJoystickActive) {
                this.UI.joystickStartX = (coordinates.x - this.UI.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.UI.LsideJoystickOffset;
                this.UI.joystickStartY = (this.UI.playerUI.getBaseSize().height - coordinates.y - this.UI.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.UI.LbottomJoystickOffset;
                this.UI.leftPuck.floatLeft = this.UI.joystickStartX;
                this.UI.leftPuck.floatTop = this.UI.joystickStartY * -1;
                this.UI.leftPuck.left = this.UI.leftPuck.floatLeft;
                this.UI.leftPuck.top = this.UI.leftPuck.floatTop;
            }
        });

        this.UI.rightPuck.onPointerDownObservable.add((coordinates) => {
            this.UI.rightPuck.alpha = 2;
            this.characterController.jump((true));
        });

        this.UI.rightPuck.onPointerUpObservable.add((coordinates) => {
            this.UI.rightPuck.alpha = 1;
            this.characterController.jump((false));
        });

        // enables touch detection outside of the joystickTouchArea
        this.scene.onPointerMove = (event) => {
            const coordinates = {
                x: event.clientX,
                y: event.clientY
            };

            if (isLeftJoystickActive && pointer === event.pointerId) {
                this.UI.joystickStartX = (coordinates.x - this.UI.leftJoystickTouchArea._currentMeasure.width * 0.5) - this.UI.LsideJoystickOffset;
                this.UI.joystickStartY = (this.UI.playerUI.getBaseSize().height - coordinates.y - this.UI.leftJoystickTouchArea._currentMeasure.height * 0.5) - this.UI.LbottomJoystickOffset;

                // distance from the center of the leftJoystickTouchArea to the new position
                const distance = Math.sqrt(
                    Math.pow(this.UI.joystickStartX, 2) + Math.pow(this.UI.joystickStartY, 2)
                );

                // maximum distance from the center to stay inside the circle
                const maxDistance = this.UI.leftJoystickTouchArea._currentMeasure.width * 0.5;

                // values back to the circle boundary
                if (distance > maxDistance) {
                    const scaleFactor = maxDistance / distance;
                    this.UI.joystickStartX *= scaleFactor;
                    this.UI.joystickStartY *= scaleFactor;
                }

                // leftPuck position update
                this.UI.leftPuck.floatLeft = this.UI.joystickStartX;
                this.UI.leftPuck.floatTop = this.UI.joystickStartY * -1;
                this.UI.leftPuck.left = this.UI.leftPuck.floatLeft;
                this.UI.leftPuck.top = this.UI.leftPuck.floatTop;
            }
        };

        // check joystick position every frame and update camera rotation or movement
        this.scene.onBeforeRenderObservable.add(() => {
            if (isLeftJoystickActive) {
                checkMoveControl(this.UI.joystickStartX, this.UI.joystickStartY);
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
                this.UI.joystickLXangle = Math.cos(angle);
                this.UI.joystickLYangle = Math.sin(angle);

                //check 8 angles and set this.characterController
                if (this.UI.joystickLXangle > 0.5) {
                    this.characterController.turnRight(true);
                    this.characterController.turnLeft(false);

                    if (this.UI.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.UI.joystickLYangle < -0.5) {
                        this.characterController.walk(false);
                        this.characterController.walkBack(true);
                    } else {
                        this.characterController.walk(false);
                        this.characterController.walkBack(false);
                    }
                } else if (this.UI.joystickLXangle < -0.5) {
                    this.characterController.turnLeft(true);
                    this.characterController.turnRight(false);

                    if (this.UI.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.UI.joystickLYangle < -0.5) {
                        this.characterController.walk(false);
                        this.characterController.walkBack(true);
                    } else {
                        this.characterController.walk(false);
                        this.characterController.walkBack(false);
                    }
                } else {
                    this.characterController.turnLeft(false);
                    this.characterController.turnRight(false);

                    if (this.UI.joystickLYangle > 0.5) {
                        this.characterController.walk(true);
                        this.characterController.walkBack(false);
                    } else if (this.UI.joystickLYangle < -0.5) {
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
            // this.setAnimationRanges(this.player.skeleton);

            // var sm = this.player.material;
            // if (sm.diffuseTexture != null) {
            //     sm.backFaceCulling = true;
            //     sm.ambientColor = new BABYLON.Color3(1, 1, 1);
            // }

            this.player.position = new BABYLON.Vector3(19, 3, 40);
            this.player.checkCollisions = true;
            this.player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
            this.player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);
            this.player.getChildMeshes().forEach((mesh) => {
                mesh.layerMask = 1;
            });

            //rotate the camera behind the player
            this.player.rotation.y = Math.PI * 1.5;
            // var alpha = (Math.PI / 2 - this.player.rotation.y);
            var alpha = 0;
            var beta = Math.PI / 1.8;
            var target = new BABYLON.Vector3(this.player.position.x, this.player.position.y + 3.5, this.player.position.z);

            this.mainCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, this.scene);
            this.mainCamera.layerMask = 1;
            this.scene.activeCameras = [];
            this.scene.activeCameras.push(this.mainCamera);
            this.scene.activeCameras.push(this.mapCamera);

            this.scene.cameraToUseForPointers = this.mainCamera;

            // minimap player
            this.mapPlayer = BABYLON.MeshBuilder.CreateCylinder("MapPlayer", { diameter: 1, diameterTop: 0, height: 1.6 }, this.scene);
            this.mapPlayer.rotation.x = Math.PI / 2;
            this.mapPlayer.material = new BABYLON.StandardMaterial("MapPlayerMaterial", this.scene);
            this.mapPlayer.material.diffuseColor = new BABYLON.Color3(0, 0.84, 1);
            this.mapPlayer.material.specularColor = new BABYLON.Color3(0, 0.84, 1);
            this.mapPlayer.material.emissiveColor = new BABYLON.Color3(0, 0.84, 1);
            this.mapPlayer.layerMask = 2;
            this.mapPlayer.parent = this.player;
            this.mapPlayer.position = new BABYLON.Vector3(0, 2, 0.5);

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
            this.mainCamera.upperRadiusLimit = 8;
            this.mainCamera.radius = 8;

            this.mainCamera.attachControl();

            this.characterController = new CharacterController(this.player, this.mainCamera, this.scene, this.player.animationGroups);
            this.characterController.setFaceForward(true);
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
            // this.characterController.setGravity(this.scene.gravity.y);
            this.characterController.setJumpSpeed(4);  //default 6 m/s
            this.characterController.setWalkSpeed(4); //default 3 m/s
            // this.characterController.setRightFastSpeed(10); //default 3 m/s
            // this.characterController.setLeftFastSpeed(10); //default 3 m/s
            // this.characterController.setBackFastSpeed(10); //default 3 m/s

            // set
            // - which animation range should be used for which player animation
            // - rate at which to play that animation range
            // - wether the animation range should be looped
            // use this if name, rate or looping is different from default
            // this.characterController.setRunJumpAnim(this.player.animationGroups["runJump"], 0.95, true);
            // this.characterController.setIdleAnim("idle", 1, true);
            // this.characterController.setTurnLeftAnim("turnLeft", 0.5, true);
            // this.characterController.setTurnRightAnim("turnRight", 0.5, true);
            // this.characterController.setWalkBackAnim("walkBack", 0.5, true);
            // this.characterController.setIdleJumpAnim("idleJump", 0.5, false);
            // this.characterController.setRunJumpAnim("runJump", 0.6, false);
            // this.characterController.setFallAnim("fall", 2, false);
            // this.characterController.setSlideBackAnim("slideBack", 1, false);
            // this.characterController.setStrafeLeftAnim("strafeLeft", 0.5, true);
            // this.characterController.setStrafeRightAnim("strafeRight", 0.5, true);
            // this.characterController.setWalkAnim("walk", 0.5, true);
            // this.characterController.setRunAnim("run", 1, true);


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
        }
        catch (err) {
            console.log(err);
        }
    }

    showInstructions() {
        let instructionClosed = false;
        let waved = false;
        let pointed = false;

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.player.animationGroups) {
                if (!instructionClosed) {
                    if (!waved) {
                        this.player.animationGroups["waveHello"].play();
                        this.player.animationGroups["waveHello"].onAnimationEndObservable.add(() => {
                            waved = true;
                        });
                    } else if (!pointed) {
                        this.player.animationGroups["pointUp"].play();
                        this.player.animationGroups["pointUp"].onAnimationEndObservable.add(() => {
                            pointed = true;
                        });
                    }
                }
            }
        });

        //instruction panel mesh
        let instructionPanel = BABYLON.MeshBuilder.CreatePlane("instructionPanel", { width: 6, height: 5 }, this.scene);
        // instructionPanel.parent = this.player;
        instructionPanel.position = new BABYLON.Vector3(this.player.position.x, this.player.position.y + 5, this.player.position.z);
        instructionPanel.checkCollisions = false;
        instructionPanel.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        const instructionPanelData = require("./instructionPanel.json");
        let instructionTexture = AdvancedDynamicTexture.CreateForMesh(instructionPanel, 600, 500, false);
        instructionTexture.name = 'instructionTexture';
        instructionTexture.parseSerializedObject(instructionPanelData, true);

        let confirmButton = instructionTexture.getControlByName('button-bjs');
        confirmButton.onPointerClickObservable.add(() => {
            instructionClosed = true;
            instructionPanel.dispose();
            instructionTexture.dispose();
            this.characterController.start();
            this.characterController.resumeAnim()
            waved = false;
            pointed = false;

            const targetAlpha = Math.PI / 2 - this.player.rotation.y;
            const targetBeta = Math.PI / 2;
            const targetRadius = 5;

            // animate
            BABYLON.Animation.CreateAndStartAnimation(
                "cameraAnimation",
                this.mainCamera,
                "alpha",
                60,
                100,
                this.mainCamera.alpha,
                targetAlpha,
                0,
                new BABYLON.ExponentialEase(2).setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT)
            );

            BABYLON.Animation.CreateAndStartAnimation(
                "cameraAnimation",
                this.mainCamera,
                "beta",
                60,
                100,
                this.mainCamera.beta,
                targetBeta,
                0,
                new BABYLON.ExponentialEase(2).setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT)
            );

            BABYLON.Animation.CreateAndStartAnimation(
                "cameraAnimation",
                this.mainCamera,
                "radius",
                60,
                100,
                this.mainCamera.radius,
                targetRadius,
                0,
                new BABYLON.ExponentialEase(2).setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT)
            );
        });
    }

    showWallInstructions() {
        //rotate the camera behind the player
        this.player.rotation.y = Math.PI / 2;
        // var alpha = (Math.PI / 2 - this.player.rotation.y);
        this.mainCamera.alpha = Math.PI;
        this.mainCamera.beta = Math.PI / 2;

        // instruction panel mesh
        let instructionPanel = BABYLON.MeshBuilder.CreatePlane("instructionPanel", { width: 6, height: 5 }, this.scene);
        // instructionPanel.parent = this.player;
        instructionPanel.position = new BABYLON.Vector3(28, 5, 40);
        instructionPanel.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

        let instructionMaterial = new BABYLON.PBRMaterial("instructionMaterial", this.scene);
        instructionMaterial.metallic = 0;
        instructionMaterial.roughness = 1;
        instructionMaterial.backFaceCulling = false;
        instructionMaterial.albedoTexture = new BABYLON.Texture(
            "./textures/instruction/InstructionsPanel.png",
            this.scene
        );
        instructionPanel.material = instructionMaterial;
    }

    async getPortfolioData() {
        const result = await axios.get('https://api.atitkharel.com.np/portfolio/atit/');
        // const result = { data: null };
        // result.data = require("./atit.json");
        this.mainTitle = result.data.title;
        this.props.setPageTitle(this.mainTitle);
        return (result.data.portfolio);
    }

    render() {
        return (
            <>
                <canvas ref={this.canvasRef}
                    id="renderCanvas"
                    style={{ width: '100%', height: '100vh', display: 'block' }}
                />
            </>
        )
    }
}

export default MainScene;
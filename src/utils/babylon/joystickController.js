import * as BABYLON from 'babylonjs';
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Ellipse,
    GUI3DManager,
    HolographicButton,
    Rectangle
} from '@babylonjs/gui';
import {
    TransformNode
} from '@babylonjs/core';

export class joystickController {
    constructor(scene, camera) {
        // parameters
        this.scene = scene;
        this.onlyCamera = camera;
        // constants
        this.buttonSize = .05;
        this.buttonSpacing = 0.025;
        this.alpha = 0.7; // button opacity
        this.distance = .5;
        this.vertical = -0.1;
        this.verticalXR = -0.2;
        this.guiManager = new GUI3DManager(scene);
        this.buttons = [];
        this.root = new TransformNode("HUD");
        this.root.position = new BABYLON.Vector3(0, this.vertical, this.distance);

        this.deviceInfo = this.getDeviceInfo()
        this.isMobile = this.deviceInfo.isMobile

        // state variables
        scene.onActiveCameraChanged.add(() => this.trackCamera());
        window.addEventListener("resize", () => {
            this.rescaleHUD();
        });

        this._playerUI = null;

        this.leftJoystickTouchArea = null;
        this.rightJoystickTouchArea = null;
        this.leftPuck = null;
        this.rightPuck = null;
        this.LsideJoystickOffset = null;
        this.LbottomJoystickOffset = null;
        this.RsideJoystickOffset = null;
        this.RbottomJoystickOffset = null;

        this.joystickStartX = 0;
        this.joystickStartY = 0;
        this.joystickRStartX = 0;
        this.joystickRStartY = 0;
        this.joystickLXangle = 0;
        this.joystickLYangle = 0;

        this.enableJoystick = true;
        this.limitUpDown = false;

        if (this.isMobile) {
            console.log('HUD] creating mobile UI');
            this._createMobileHud();
        }
        // end Summerf

        this.trackCamera();
    }

    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor
        let isTouchable = 'ontouchend' in document;
        //let touchSupport = navigator.maxTouchPoints > 2
        let isIPad = /\b(\w*Macintosh\w*)\b/.test(userAgent) && isTouchable;
        let isIPhone = /\b(\w*iPhone\w*)\b/.test(userAgent) && /\b(\w*Mobile\w*)\b/.test(userAgent) && isTouchable;
        let isMobile = isIPad || isIPhone || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        let isMacOS = !isMobile && !(isIPad || isIPhone) && /Mac OS/i.test(userAgent);

        //when using emulator, vendor is not 'Apple'
        let isIOS = isMobile && (isIPad || isIPhone) &&
            /\b(\w*Apple\w*)\b/.test(vendor) &&
            !/\b(\w*CriOS\w*)\b/.test(userAgent) &&
            !/\b(\w*FxiOS\w*)\b/.test(userAgent);

        let isIOS_noVendor = isMobile && (isIPad || isIPhone)

        // // HACK ALERT
        // if (!isMobile && isMacOS && touchSupport) {
        //   isMobile = true;
        // }

        return {
            isTouchable,
            isIPad,
            isIPhone,
            isMobile,
            isMacOS,
            isIOS,
            isIOS_noVendor,
            vendor
        };
    }

    /**
    Handles camera change events, typically while entering/exiting VR.
     */
    trackCamera() {
        if (this.camera === this.scene.activeCamera) return

        // console.log("[HUD] tracking camera", this.scene.activeCamera.getClassName()); //," new position " + this.scene.activeCamera.position);

        this.camera = this.scene.activeCamera;
        if (this.onlyCamera) {
            if (this.camera === this.onlyCamera) {
                // TODO activate this HUD
            } else {
                // TODO deactivate this HUD
            }
        } else {
            this.root.parent = this.camera;
            if ("WebXRCamera" === this.camera.getClassName()) {
                this.root.scaling = new BABYLON.Vector3(.5, .5, .5);
                this.root.position = new BABYLON.Vector3(0, this.verticalXR, this.distance);
            } else {
                this.root.position = new BABYLON.Vector3(0, this.vertical, this.distance);
                this.rescaleHUD();
            }
        }
    }
    /**
    Window.resize event handler, rescales the HUD if aspect ratio is too small for all buttons to fit.
     */
    rescaleHUD() {
        //var aspectRatio = this.scene.getEngine().getAspectRatio(this.scene.activeCamera);
        var w = this.scene.getEngine().getRenderWidth();
        var h = this.scene.getEngine().getRenderHeight();
        var aspect = w / h;
        // TODO exactly calculate aspect ratio depending on number of buttons, size, spacing
        // 0.75 (10 buttons) on this distance fits at aspect of 2
        if (this.buttons.length) {
            var requiredRatio = this.buttons.length / 10 * 2;
            var scale = Math.min(1, aspect / requiredRatio);
            this.root.scaling = new BABYLON.Vector3(scale, scale, 1);
        }

        if (this.isMobile) {
            let sat = getComputedStyle(document.documentElement).getPropertyValue("--sat")
            let sab = getComputedStyle(document.documentElement).getPropertyValue("--sab")

            if (w > h) {
                this.LsideJoystickOffset = w * 0.15;
                this.LbottomJoystickOffset = h * 0.15;
                this.RsideJoystickOffset = w * 0.15;
                this.RbottomJoystickOffset = h * 0.15;
            } else {
                this.LsideJoystickOffset = w * 0.05;
                this.LbottomJoystickOffset = h * (this.deviceInfo.isIPhone ? 0.25 : 0.15);
                this.RsideJoystickOffset = w * 0.05;
                this.RbottomJoystickOffset = h * (this.deviceInfo.isIPhone ? 0.25 : 0.15);
            }

            this.leftJoystickTouchArea.left = this.LsideJoystickOffset;
            this.leftJoystickTouchArea.top = -this.LbottomJoystickOffset;
            this.rightJoystickTouchArea.left = -this.RsideJoystickOffset;
            this.rightJoystickTouchArea.top = -this.RbottomJoystickOffset;

            console.log('[HUD]', sat, sab, this.deviceInfo, this.LbottomJoystickOffset, this.leftJoystickTouchArea.top, this.RbottomJoystickOffset, this.rightJoystickTouchArea.top);
        }


        //this._playerUI.markAsDirty();
    }

    // UI
    _createMobileHud() {
        console.log('[HUD] create mobile HUD controls');
        this._playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // joystick left, jump point right

        // const joystickTouchAreaSize = this._playerUI.getBaseSize().width * 0.25 + "px";
        const joystickTouchAreaSize = "130px";
        const puckSize = "50px";

        let LsideJoystickOffset = this._playerUI.getBaseSize().width * 0.05;
        let LbottomJoystickOffset = this._playerUI.getBaseSize().height * 0.15;
        this.LsideJoystickOffset = LsideJoystickOffset;
        this.LbottomJoystickOffset = LbottomJoystickOffset;

        let RsideJoystickOffset = this._playerUI.getBaseSize().width * 0.05;
        let RbottomJoystickOffset = this._playerUI.getBaseSize().height * 0.15;
        this.RsideJoystickOffset = RsideJoystickOffset;
        this.RbottomJoystickOffset = RbottomJoystickOffset;

        const leftPuck = makeThumbArea("leftPuck", 0, "white", "white");
        const rightPuck = Button.CreateImageOnlyButton("rightPuck", "./textures/jump.png");
        const leftJoystickTouchArea = makeThumbArea("leftJoystickTouchArea", 2);
        const rightJoystickTouchArea = makeThumbArea("rightJoystickTouchArea", 0, "white");

        leftJoystickTouchArea.height = joystickTouchAreaSize;
        leftJoystickTouchArea.width = joystickTouchAreaSize;
        leftJoystickTouchArea.left = LsideJoystickOffset;
        leftJoystickTouchArea.top = -LbottomJoystickOffset;
        leftJoystickTouchArea.isPointerBlocker = true;
        leftJoystickTouchArea.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftJoystickTouchArea.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        leftJoystickTouchArea.alpha = 0.4;
        // leftJoystickTouchArea.clipChildren = false;
        // leftJoystickTouchArea.clipContent = false;
        this.leftJoystickTouchArea = leftJoystickTouchArea;

        leftPuck.height = puckSize;
        leftPuck.width = puckSize;
        leftPuck.left = 0;
        leftPuck.top = -0;
        leftPuck.isPointerBlocker = false;
        leftPuck.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        leftPuck.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        leftPuck.isVisible = true;
        this.leftPuck = leftPuck;

        rightJoystickTouchArea.height = joystickTouchAreaSize;
        rightJoystickTouchArea.width = joystickTouchAreaSize;
        rightJoystickTouchArea.left = -RsideJoystickOffset;
        rightJoystickTouchArea.top = -RbottomJoystickOffset;
        rightJoystickTouchArea.isPointerBlocker = true;
        rightJoystickTouchArea.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightJoystickTouchArea.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        rightJoystickTouchArea.alpha = 0.5;
        // rightJoystickTouchArea.clipChildren = false;
        // rightJoystickTouchArea.clipContent = false;

        this.rightJoystickTouchArea = rightJoystickTouchArea;

        rightPuck.height = puckSize;
        rightPuck.width = puckSize;
        rightPuck.left = 0;
        rightPuck.top = -0;
        rightPuck.alpha = 1;
        rightPuck.isPointerBlocker = false;
        rightPuck.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        rightPuck.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rightPuck.cornerRadius = 10;
        rightPuck.isVisible = true;
        this.rightPuck = rightPuck;

        leftJoystickTouchArea.addControl(leftPuck);
        rightJoystickTouchArea.addControl(rightPuck);
        this._playerUI.addControl(leftJoystickTouchArea);
        this._playerUI.addControl(rightJoystickTouchArea);
    }
}

const makeThumbArea = (name, thickness, color, background, curves = null) => {
    const ellipse = new Ellipse();
    ellipse.name = name;
    ellipse.thickness = thickness;
    ellipse.color = color;
    ellipse.background = background;
    ellipse.paddingLeft = "0px";
    ellipse.paddingRight = "0px";
    ellipse.paddingTop = "0px";
    ellipse.paddingBottom = "0px";

    return ellipse;
};
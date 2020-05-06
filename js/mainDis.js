"use strict";
var renderer, renderer2,
    scene, scene2, bog, element, intersects, point, camera,
    myCanvas = document.getElementById("myCanvas");
var frameip, oilip, supto, wheelaxleip, brakelever, bearing, airbrake;
var divFrame, divOil, divSupto, divWheel, divBrake, divBearing, divAirB;
var SHADOW_MAP_WIDTH = 2048,
    SHADOW_MAP_HEIGHT = 2048;

{

    //RENDERER
    renderer = new THREE.WebGLRenderer({
        canvas: myCanvas,
        antialias: true,
    });
    //renderer 1
    renderer.info.reset();
    renderer.setClearColor(0x4a4a4a);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; //Shadow
    renderer.shadowMapSoft = true; // Shadow
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.05;
    renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);

    //CSS3D Renderer
    //renderer 2
    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize(window.innerWidth, window.innerHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    document.body.appendChild(renderer2.domElement);
    //CAMERA
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    var controls = new THREE.OrbitControls(camera);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.LEFT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.RIGHT
    }
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.autoRotateSpeed = 0.5;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    camera.position.set(0, 4.5, 0);

    var raycaster = new THREE.Raycaster(); // Needed for object intersection
    var mouse = new THREE.Vector3(); //Needed for mouse coordinates
    //SCENE
    scene = new THREE.Scene();
    //Scene2
    scene2 = new THREE.Scene();
    //LIGHTS
    var skyColor = 0xB1E1FF; // light blue
    var groundColor = 0xB97A20; // brownish orange
    var intensity = 5;
    var light1 = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light1);
    var color = 0x4a4a4a;
    var intensity = 2;
    var light2 = new THREE.DirectionalLight(color, intensity);
    light2.position.set(5, 10, 2);
    light2.shadow.mapSize.width = 2048; // default
    light2.shadow.mapSize.height = 2048; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 500 // default
    light2.castShadow = true;
    light2.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000));
    light2.shadow.bias = -0.0001;
    light2.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    light2.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    scene.add(light2);

    var loader = new THREE.RGBELoader();
    loader.load('../hdr/hdrsky.hdr', function (texture) {
        texture.encoding = THREE.RGBEEncoding;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.flipY = true;
        var cubeGenerator = new THREE.EquirectangularToCubeGenerator(texture, {
            resolution: 1024
        });
        cubeGenerator.update(renderer);
        var pmremGenerator = new THREE.PMREMGenerator(cubeGenerator.renderTarget.texture);
        pmremGenerator.update(renderer);
        var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
        pmremCubeUVPacker.update(renderer);
        var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
        // model
        var loader = new THREE.GLTFLoader().setPath('../models/');
        loader.load('frame.gltf', function (gltf) {
            frameip = gltf.scene;
            frameip.traverse(function (child) {
                if (child.isMesh) {
                    // child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(frameip);
        });
        loader.load('wheel.gltf', function (gltf) {
            wheelaxleip = gltf.scene;
            wheelaxleip.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(wheelaxleip);
        });
        loader.load('bolster.gltf', function (gltf) {
            supto = gltf.scene;
            supto.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(supto);
            supto.position.z = 1;
        });
        loader.load('brakelever.gltf', function (gltf) {
            brakelever = gltf.scene;
            brakelever.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(brakelever);
        });
        loader.load('oil.gltf', function (gltf) {
            oilip = gltf.scene;
            oilip.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(oilip);

        });
        loader.load('bearing.gltf', function (gltf) {
            bearing = gltf.scene;
            bearing.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(bearing);
        });
        loader.load('airbrake.gltf', function (gltf) {
            airbrake = gltf.scene;
            airbrake.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                }
            });

            scene.add(airbrake);
        });
        pmremGenerator.dispose();
        pmremCubeUVPacker.dispose();
        scene.background = cubeGenerator.renderTarget;

    });



    var geom = new THREE.PlaneGeometry(2000, 2000, .01);
    var mat = new THREE.ShadowMaterial({
        // color: 0x4a4a4a,
        side: THREE.DoubleSide
    });
    var shadowPlane = new THREE.Mesh(geom, mat);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlane.rotateX(-Math.PI / 2);


    //RayCaster
    // Onclick on bogie to add label
    document.addEventListener('dblclick', onClickadd, true);
    //remove
    document.addEventListener('mouseup', onClickrem, true);

    //resize window event
    window.addEventListener('resize', onWindowResize, false);
}

render();
animate();


function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = (window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
}

// var frameip,oilip,supto,wheelaxleip,brakelever,bearing,airbrake;
function onClickadd(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObject(frameip, true);

    //here comes event
    camera.position.set(0, 4.5, 0);
    if (intersects.length > 0) {

        frameip.position.set(2.8, 1.2, 1);
        frameip.castShadow = false;
        scene.remove(oilip, supto, wheelaxleip, brakelever, bearing, airbrake);

        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/frame.html");
        // element.innerHTML = '';
        element.className = 'three-div';
        //CSS Object
        divFrame = new THREE.CSS3DObject(element);
        divFrame.rotation.x = Math.PI / -2; //-90deg;
        divFrame.position.set(-1, 1.5, 0);
        divFrame.scale.x = .009;
        divFrame.scale.y = .008;
        console.log(camera);
        scene2.add(divFrame);
    }

    intersects = raycaster.intersectObject(bearing, true);
    if (intersects.length > 0) {

        bearing.position.set(.8, 1.2, -1.2);
        bearing.castShadow = false;

        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/bearing.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divBearing = new THREE.CSS3DObject(element);
        divBearing.rotation.x = Math.PI / -2; //-90deg;
        divBearing.position.set(-1, 1.2, 0);
        divBearing.scale.x = .009;
        divBearing.scale.y = .008;
        scene.remove(oilip, supto, wheelaxleip, brakelever, frameip, airbrake);
        scene2.add(divBearing);
    }
    intersects = raycaster.intersectObject(supto, true);
    if (intersects.length > 0) {

        supto.position.set(-.8, 1.2, .85);
        supto.castShadow = false;

        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/bolster.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divSupto = new THREE.CSS3DObject(element);
        divSupto.rotation.x = Math.PI / -2; //-90deg;
        divSupto.position.set(-1, 1.2, 0);
        divSupto.scale.x = .009;
        divSupto.scale.y = .008;
        scene.remove(oilip, bearing, wheelaxleip, brakelever, frameip, airbrake);
        scene2.add(divSupto);
    }
    intersects = raycaster.intersectObject(oilip, true);
    if (intersects.length > 0) {

        oilip.position.set(.8, 1.2, .85);
        oilip.castShadow = false;

        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/oiltank.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divOil = new THREE.CSS3DObject(element);
        divOil.rotation.x = Math.PI / -2; //-90deg;
        divOil.position.set(-1, 1.2, 0);
        divOil.scale.x = .009;
        divOil.scale.y = .008;
        scene.remove(supto, bearing, wheelaxleip, brakelever, frameip, airbrake);
        scene2.add(divOil);
    }
    intersects = raycaster.intersectObject(airbrake, true);
    if (intersects.length > 0) {

        airbrake.position.set(0, 1.2, .85);
        airbrake.castShadow = false;
        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/airbrake.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divAirB = new THREE.CSS3DObject(element);
        divAirB.rotation.x = Math.PI / -2; //-90deg;
        divAirB.position.set(-1, 1.2, 0);
        divAirB.scale.x = .009;
        divAirB.scale.y = .008;
        scene.remove(supto, bearing, wheelaxleip, brakelever, frameip, oilip);
        scene2.add(divAirB);
    }
    intersects = raycaster.intersectObject(wheelaxleip, true);
    if (intersects.length > 0) {

        wheelaxleip.position.set(1.8, 1.2, .7);
        wheelaxleip.castShadow = false;
        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/wheelaxle.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divWheel = new THREE.CSS3DObject(element);
        divWheel.rotation.x = Math.PI / -2; //-90deg;
        divWheel.position.set(-1, 1.2, 0);
        divWheel.scale.x = .009;
        divWheel.scale.y = .008;
        scene.remove(supto, bearing, airbrake, brakelever, frameip, oilip);
        scene2.add(divWheel);
    }
    intersects = raycaster.intersectObject(brakelever, true);
    if (intersects.length > 0) {

        brakelever.position.set(2.5, 1.2, -1);
        brakelever.castShadow = false;
        //Info' tag  after onClick
        element = document.createElement('iframe');
        element.setAttribute("src", "../pages/brakelever.html");
        // element.innerHTML = 'Roller bearings are used on the ICF coaches. These bearings are press fitted on the axle journal by heating the bearings at a temperature of 80 to 100 °C in an induction furnace. Before fitting the roller bearing, an axle collar is press fitted. The collar ensures that the bearing does not move towards the center of the axle. After pressing the collar, a rear cover for the axle box is fitted. The rear cover has two main grooves. In one of the grooves, a nitrile rubber sealing ring is placed. ';
        element.className = 'three-div';
        //CSS Object
        divBrake = new THREE.CSS3DObject(element);
        divBrake.rotation.x = Math.PI / -2; //-90deg;
        divBrake.position.set(-1, 1.2, 0);
        divBrake.scale.x = .009;
        divBrake.scale.y = .008;
        scene.remove(supto, bearing, airbrake, wheelaxleip, frameip, oilip);
        scene2.add(divBrake);
    }

}

function onClickrem(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObject(frameip, true);
    if (intersects.length > 0) {
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        frameip.position.set(0, 0, 0);
        scene2.remove(divFrame); //removing div tag
        scene.add(oilip, supto, wheelaxleip, brakelever, bearing, airbrake);
    }
    intersects = raycaster.intersectObject(wheelaxleip, true);
    if (intersects.length > 0) {
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        wheelaxleip.position.set(0, 0, 0);
        scene2.remove(divWheel); //removing div tag
        scene.add(oilip, supto, frameip, brakelever, bearing, airbrake);
    }
    intersects = raycaster.intersectObject(bearing, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        bearing.position.set(0, 0, 0);
        scene2.remove(divBearing); //removing div tag
        scene.add(oilip, supto, wheelaxleip, brakelever, frameip, airbrake);
    }
    intersects = raycaster.intersectObject(supto, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        supto.position.set(0, 0, 1);
        scene2.remove(divSupto); //removing div tag
        scene.add(oilip, bearing, wheelaxleip, brakelever, frameip, airbrake);
    }
    intersects = raycaster.intersectObject(airbrake, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        airbrake.position.set(0, 0, 0);
        scene2.remove(divAirB); //removing div tag
        scene.add(oilip, bearing, wheelaxleip, brakelever, frameip, supto);
    }
    intersects = raycaster.intersectObject(wheelaxleip, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        wheelaxleip.position.set(0, 0, 0);
        scene2.remove(divWheel); //removing div tag
        scene.add(oilip, bearing, airbrake, brakelever, frameip, supto);

    }
    intersects = raycaster.intersectObject(brakelever, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        brakelever.position.set(0, 0, 0);
        scene2.remove(divBrake); //removing div tag
        scene.add(oilip, bearing, airbrake, wheelaxleip, frameip, supto);

    }
    intersects = raycaster.intersectObject(oilip, true);
    if (intersects.length > 0) {
        // camera.rotation.set(0,0,0);
        camera.position.set(0, 4.5, 0);
        //here comes event
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        oilip.position.set(0, 0, 0);
        scene2.remove(divOil); //removing div tag
        scene.add(brakelever, bearing, airbrake, wheelaxleip, frameip, supto);

    }
}

function render() {
    renderer.render(scene, camera);
    console.clear();

}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    renderer2.render(scene2, camera);
}
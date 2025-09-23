import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    SphereGeometry
} from 'three';

let scene, camera, renderer;
let cube;
let hand1, hand2;
const jointMeshes = []; // Array to hold the spheres for the joints

function init() {
    // Basic scene setup
    scene = new Scene();
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // A simple cube to show something
    const cubeGeometry = new BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
    cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.position.z = -1;
    scene.add(cube);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    // Add a button to enter AR
    const arButton = document.createElement('button');
    arButton.textContent = 'Enter AR';
    arButton.style.position = 'absolute';
    arButton.style.bottom = '20px';
    arButton.style.left = '50%';
    arButton.style.transform = 'translateX(-50%)';
    arButton.style.padding = '12px';
    arButton.style.border = 'none';
    arButton.style.borderRadius = '4px';
    arButton.style.backgroundColor = '#fff';
    arButton.style.color = '#000';
    arButton.style.cursor = 'pointer';
    arButton.style.zIndex = '1000';
    document.body.appendChild(arButton);
    arButton.addEventListener('click', startAR);

    // Hand tracking setup
    hand1 = renderer.xr.getHand(0);
    scene.add(hand1);
    hand2 = renderer.xr.getHand(1);
    scene.add(hand2);

    // Create 50 dots for the hand joints (25 for each hand)
    const jointGeometry = new SphereGeometry(0.005, 8, 8);
    const jointMaterial = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 50; i++) {
        const joint = new Mesh(jointGeometry, jointMaterial);
        joint.visible = false;
        jointMeshes.push(joint);
        scene.add(joint);
    }

    // Start the render loop
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(timestamp, frame) {
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    let jointIndex = 0;

    const processHand = (hand) => {
        // hand.joints is an object containing all 25 joints
        if (hand && hand.joints && Object.keys(hand.joints).length > 0) {
            for (const joint of Object.values(hand.joints)) {
                const jointMesh = jointMeshes[jointIndex];
                if (jointMesh) {
                    jointMesh.position.copy(joint.position);
                    jointMesh.visible = true;
                }
                jointIndex++;
            }
        }
    };

    // Hide all joints before processing each frame
    jointMeshes.forEach(joint => joint.visible = false);

    processHand(hand1);
    processHand(hand2);

    renderer.render(scene, camera);
}


async function startAR() {
    if ('xr' in navigator) {
        try {
            renderer.xr.enabled = true;
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local', 'hit-test'],
                optionalFeatures: ['anchors', 'hand-tracking']
            });
            renderer.xr.setSession(session);

            const arButton = document.querySelector('button');
            if (arButton) arButton.style.display = 'none';

        } catch (e) {
            console.error("Failed to start AR session:", e);
        }
    } else {
        console.error("WebXR not supported in this browser.");
    }
}

// Initialize the application
init();

AFRAME.registerComponent('hand-tracking', {
  init: function () {
    this.el.sceneEl.addEventListener('ar-video-loaded', (e) => {
      this.video = e.detail.video;
      this.setupHandTracking();
    });
  },

  setupHandTracking: function () {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    this.hands.onResults(this.onResults.bind(this));

    // Start sending the video to MediaPipe
    this.sendToMediaPipe();

    // Setup the dot meshes
    this.dotMeshes = [];
    const dotGeometry = new THREE.SphereGeometry(0.01, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    for (let i = 0; i < 42; i++) { // 21 landmarks per hand
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.visible = false;
        this.el.sceneEl.object3D.add(dot);
        this.dotMeshes.push(dot);
    }
  },

  sendToMediaPipe: async function() {
    if (!this.video.videoWidth) {
        requestAnimationFrame(this.sendToMediaPipe.bind(this));
        return;
    }
    await this.hands.send({ image: this.video });
    requestAnimationFrame(this.sendToMediaPipe.bind(this));
  },

  onResults: function (results) {
    let dotIndex = 0;
    this.dotMeshes.forEach(dot => dot.visible = false);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        for (const landmark of landmarks) {
          if (this.dotMeshes[dotIndex]) {
            // Convert normalized 2D screen coordinates to 3D world space
            const screenX = landmark.x * this.video.videoWidth;
            const screenY = landmark.y * this.video.videoHeight;

            // This is a simplified unprojection and will need the camera's help
            const vector = new THREE.Vector3(
                (landmark.x * 2) - 1,
                -(landmark.y * 2) + 1,
                0.5
            );
            vector.unproject(this.el.sceneEl.camera);

            this.dotMeshes[dotIndex].position.copy(vector);
            this.dotMeshes[dotIndex].visible = true;
          }
          dotIndex++;
        }
      }
    }
  }
});
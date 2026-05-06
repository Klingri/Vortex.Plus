//==UserScript==
// @name Vortex DLSS 3.5 or Raytracing???
// @namespace https://vortex.towerstats.com/
// @version 1.6.0
// @description Adds raytracing shader to Classic House.
// @match https://vortex.towerstats.com/classic-house*
// @run-at document-idle
// @grant unsafeWindow
//==/UserScript==

//Good luck
//Btw I had Co-Pilot help me with ts math portions at some points, not a guy willing to be doing math first thing in the morning

(function () {'use strict';
    const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const AUTO_ENABLE = true; //Might want this on lowky
    const TOGGLE_KEY = 'F7'; //This key will toggle the shader
    const POLL_MS = 250;
    const MAX_WAIT_MS = 30000; //Time till the shader is called off by Vortex not responding, might be a skill issue if it is a problem though
    const POST_RENDER_SCALE = 0.72;
    const SHADOW_MAP_SIZE = 1024; //Quality, ts has proven to tank your performance
    const SHADOW_UPDATE_INTERVAL = 5; //How often you want your little shadows to update
    const DAY_LENGTH_SECONDS = 240; //This is only set to 240 for faster times to test out both day and night
    const DAY_SATURATION = 0.92; //How do you love your sugar?
    const NIGHT_SATURATION = 0.40; //How do you hate your darkness?
    const MAX_SCENE_EXPOSURE = 0.72;
    const MIN_SCENE_EXPOSURE = 0.90;
    function log(...args) {
        console.info('Raytracing or DLSS 3.5?', ...args);}
    function isTypingTarget(target) {
        if (!target) return false;
        const tag = (target.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || target.isContentEditable;}
    //Patience is key
    function waitForVortex() {
        const started = Date.now();
        return new Promise((resolve, reject) => {
            const timer = page.setInterval(() => {const ready = page.THREE && page.THREE.WebGLRenderer && page._vortex && page._vortex.scene && page._vortex.getCamera;
                if (ready) {page.clearInterval(timer); resolve(); return;}
                if (Date.now() - started > MAX_WAIT_MS) {page.clearInterval(timer);reject(new Error('Ts wont load scene.'));}}, POLL_MS);});}
    //Unironically installs the shader to the game
    function installShader() {const THREE = page.THREE; const vortex = page._vortex; const scene = vortex.scene;
        if (!THREE || !vortex || !scene) {return { ok: false, reason: 'Scene not done.' };}
        if (page.VortexRaytraceShader && page.VortexRaytraceShader.dispose) {page.VortexRaytraceShader.dispose();}
        const rendererProto = THREE.WebGLRenderer.prototype; const baseRender = rendererProto.__vortexRaytraceBaseRender || rendererProto.render;
        rendererProto.__vortexRaytraceBaseRender = baseRender;
        const postScene = new THREE.Scene(); const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const planeGeo = THREE.PlaneBufferGeometry ? new THREE.PlaneBufferGeometry(2, 2) : new THREE.PlaneGeometry(2, 2);
        const uniforms = {tDiffuse: { value: null }, time: { value: 0 }, resolution: { value: new THREE.Vector2(1, 1) }, cameraPos: { value: new THREE.Vector3() }, projectionInv: { value: new THREE.Matrix4() }, cameraWorld: { value: new THREE.Matrix4() }, sunDir: { value: new THREE.Vector3(0.42, 0.78, 0.32).normalize() }, moonDir: { value: new THREE.Vector3(-0.42, -0.78, -0.32).normalize() }, dayAmount: { value: 1 }, twilightAmount: { value: 0 },};
        const vertexShader = `varying vec2 vUv; void main() {vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0);}`;
        const fragmentShader = `precision highp float; uniform sampler2D tDiffuse; uniform vec2 resolution; uniform float time; uniform vec3 cameraPos; uniform mat4 projectionInv; uniform mat4 cameraWorld; uniform vec3 sunDir; uniform vec3 moonDir; uniform float dayAmount; uniform float twilightAmount;
            varying vec2 vUv;
            float sat(float x) { return clamp(x, 0.0, 1.0); } vec3 sat3(vec3 x) { return clamp(x, vec3(0.0), vec3(1.0)); }
            float hash(vec2 p) {p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y);}
            float noise(vec2 p) {vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0)); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);}
            vec3 filmic(vec3 x) {x = max(vec3(0.0), x - 0.004); return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);}
            vec3 getRay(vec2 uv) {vec2 ndc = uv * 2.0 - 1.0; vec4 view = projectionInv * vec4(ndc, 1.0, 1.0); view.xyz /= max(view.w, 0.0001); return normalize((cameraWorld * vec4(view.xyz, 0.0)).xyz);}
            vec3 sky(vec3 rd, vec3 sun) {float h = sat(rd.y * 0.5 + 0.5); vec3 low = vec3(0.45, 0.70, 0.95); vec3 high = vec3(0.05, 0.18, 0.38); float glow = pow(sat(dot(rd, sun)), 18.0); float core = pow(sat(dot(rd, sun)), 320.0); return mix(low, high, h) + vec3(1.0, 0.74, 0.42) * glow * 0.65 + vec3(1.0, 0.92, 0.76) * core * 3.0;}
            float sphereHit(vec3 ro, vec3 rd, vec3 c, float r) {vec3 oc = ro - c; float b = dot(oc, rd); float h = b * b - dot(oc, oc) + r * r; if (h < 0.0) return -1.0; h = sqrt(h); float t = -b - h; return t > 0.0 ? t : -b + h; }
            void main() {
                vec2 uv = vUv; vec2 px = 1.0 / max(resolution, vec2(1.0)); vec2 fromCenter = uv - 0.5;
                float vignette = smoothstep(0.92, 0.18, length(fromCenter));
                vec2 aberration = fromCenter * (0.0012 + 0.0032 * (1.0 - vignette));
                vec3 col;
                col.r = texture2D(tDiffuse, uv + aberration).r; col.g = texture2D(tDiffuse, uv).g; col.b = texture2D(tDiffuse, uv - aberration).b;
                float luma = dot(col, vec3(0.2126, 0.7152, 0.0722)); float lumaX = dot(texture2D(tDiffuse, uv + vec2(px.x, 0.0)).rgb, vec3(0.2126, 0.7152, 0.0722)); float lumaY = dot(texture2D(tDiffuse, uv + vec2(0.0, px.y)).rgb, vec3(0.2126, 0.7152, 0.0722));
                vec2 grad = vec2(luma - lumaX, luma - lumaY);
                float edge = sat(length(grad) * 14.0);
                vec3 ro = cameraPos; vec3 rd = getRay(uv); vec3 sun = normalize(sunDir); vec3 moon = normalize(moonDir);
                float nightAmount = 1.0 - dayAmount; float sunAmount = sat(dot(rd, sun)); float moonAmount = sat(dot(rd, moon)); float sunBloom = (pow(sunAmount, 80.0) * 0.45 + pow(sunAmount, 10.0) * 0.035) * (dayAmount + twilightAmount * 0.55); float moonBloom = (pow(moonAmount, 120.0) * 0.11 + pow(moonAmount, 18.0) * 0.018) * nightAmount;
                col += vec3(1.0, 0.70, 0.42) * sunBloom; col += vec3(0.28, 0.34, 0.56) * moonBloom;
                float groundT = (1.6 - ro.y) / max(rd.y, -0.0001);
                if (groundT > 0.0 && rd.y < -0.001) {vec3 gp = ro + rd * groundT; float wet = 0.08 + 0.07 * noise(gp.xz * 0.035 + time * 0.05); float fresnel = pow(1.0 - sat(abs(dot(rd, vec3(0.0, 1.0, 0.0)))), 4.0); vec3 refl = sky(reflect(rd, vec3(0.0, 1.0, 0.0)), sun); float studSheen = pow(sat(sin(gp.x * 3.14159) * sin(gp.z * 3.14159)), 18.0) * 0.05; col = mix(col, refl, sat(wet * fresnel * 0.42)); col += vec3(0.35, 0.65, 0.42) * studSheen;}
                vec3 mirrorCenter = vec3(sin(time * 0.22) * 18.0, 32.0 + sin(time * 0.31) * 3.0, cos(time * 0.2) * 18.0);
                float sphereT = sphereHit(ro, rd, mirrorCenter, 9.0);
                if (sphereT > 0.0) {vec3 hp = ro + rd * sphereT; vec3 n = normalize(hp - mirrorCenter); vec3 reflected = sky(reflect(rd, n), sun); float rim = pow(1.0 - sat(dot(-rd, n)), 3.0); float shade = sat(dot(n, sun) * 0.5 + 0.5); vec3 orb = reflected * (0.25 + 0.75 * shade) + vec3(0.65, 0.9, 1.0) * rim; col = mix(col, orb, 0.18 * (1.0 - smoothstep(0.0, 160.0, sphereT)));}
                float ao = 1.0 - edge * 0.16;
                col *= ao; col += edge * mix(vec3(0.018, 0.028, 0.04), vec3(0.03, 0.045, 0.062), dayAmount);
                float exposurePulse = mix(0.10, 0.72, dayAmount) + twilightAmount * 0.055 + sin(time * 0.18) * 0.006;
                col = filmic(col * exposurePulse); col = mix(col, col * col * (3.0 - 2.0 * col), mix(0.05, 0.12, dayAmount)); col *= 0.70 + vignette * 0.22; col = mix(col * vec3(0.26, 0.31, 0.48), col, dayAmount); col += vec3(0.18, 0.08, 0.025) * twilightAmount * 0.08;
                float gray = dot(col, vec3(0.299, 0.587, 0.114));
                float saturation = mix(${NIGHT_SATURATION.toFixed(2)}, ${DAY_SATURATION.toFixed(2)}, dayAmount);
                col = mix(vec3(gray), col, saturation); col *= mix(${MIN_SCENE_EXPOSURE.toFixed(2)}, ${MAX_SCENE_EXPOSURE.toFixed(2)}, dayAmount);
                float grain = hash(uv * resolution + time * 71.0) - 0.5;
                col += grain * mix(0.012, 0.006, dayAmount); gl_FragColor = vec4(sat3(col), 1.0);}`;
        const postMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false,});
        postScene.add(new THREE.Mesh(planeGeo, postMaterial));
        let target = null;
        let inPost = false;
        let enabled = AUTO_ENABLE;
        const addedLights = [];
        const addedObjects = [];
        const originalLightStates = [];
        const rendererShadowState = new Map();
        let upgradedMaterials = 0;
        let frameIndex = 0;
        const originalSceneAdd = scene.add;
        function setMatrixInverse(out, matrix) {if (out.copy && out.invert) return out.copy(matrix).invert(); if (out.getInverse) return out.getInverse(matrix); return out.copy(matrix);}
        function ensureTarget(renderer) {const size = renderer.getDrawingBufferSize ? renderer.getDrawingBufferSize(new THREE.Vector2()) : renderer.getSize(new THREE.Vector2());
            const width = Math.max(1, Math.floor(size.x * POST_RENDER_SCALE));
            const height = Math.max(1, Math.floor(size.y * POST_RENDER_SCALE));
            if (!target || target.width !== width || target.height !== height) {
                if (target) target.dispose();
                target = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false,});
                uniforms.resolution.value.set(width, height);}}
        function configureRendererShadows(renderer) {
            if (!renderer || !renderer.shadowMap) return;
            if (!rendererShadowState.has(renderer)) {
                rendererShadowState.set(renderer, {enabled: renderer.shadowMap.enabled, type: renderer.shadowMap.type, autoUpdate: renderer.shadowMap.autoUpdate, needsUpdate: renderer.shadowMap.needsUpdate,});}
            renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap || renderer.shadowMap.type; renderer.shadowMap.autoUpdate = false;}
        function restoreRendererShadows() {
            rendererShadowState.forEach((state, renderer) => {if (!renderer || !renderer.shadowMap) return;
                renderer.shadowMap.enabled = state.enabled; renderer.shadowMap.type = state.type; renderer.shadowMap.autoUpdate = state.autoUpdate; renderer.shadowMap.needsUpdate = state.needsUpdate;});}
        function configureDirectionalShadow(light, range) {
            if (!light || !light.shadow) return;
            light.castShadow = true;
            light.shadow.mapSize.width = SHADOW_MAP_SIZE;
            light.shadow.mapSize.height = SHADOW_MAP_SIZE;
            light.shadow.camera.near = 1;
            light.shadow.camera.far = 460;
            light.shadow.camera.left = -range;
            light.shadow.camera.right = range;
            light.shadow.camera.top = range;
            light.shadow.camera.bottom = -range;
            light.shadow.bias = -0.00018;
            light.shadow.normalBias = 0.03;
            light.shadow.radius = 4;
            light.shadow.autoUpdate = false;
            light.shadow.needsUpdate = true;
            light.shadow.camera.updateProjectionMatrix();}
        function configureExistingShadows() {
            scene.traverse((node) => {
                if (node.isDirectionalLight) {
                    originalLightStates.push({light: node, intensity: node.intensity, color: node.color.clone(), castShadow: node.castShadow, });
                    node.castShadow = false;}
                else if (node.isAmbientLight) {
                    originalLightStates.push({light: node, intensity: node.intensity, color: node.color.clone(), castShadow: node.castShadow,});}
                else if (node.isSpotLight && node.shadow) {
                    originalLightStates.push({light: node, intensity: node.intensity, color: node.color.clone(), castShadow: node.castShadow,});
                    node.castShadow = true;
                    node.shadow.mapSize.width = 1024;
                    node.shadow.mapSize.height = 1024;
                    node.shadow.bias = -0.00015;
                    node.shadow.normalBias = 0.025;
                    node.shadow.needsUpdate = true;}});}
        function restoreOriginalLights() {
            originalLightStates.forEach((state) => {state.light.intensity = state.intensity; state.light.color.copy(state.color); state.light.castShadow = state.castShadow;});}

        function upgradeMaterial(material) {
            if (!material || (material.userData && material.userData.vortexRaytraced)) return material;
            if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                material.roughness = Math.min(material.roughness == null ? 0.6 : material.roughness, 0.58); //Material roughness
                material.metalness = Math.max(material.metalness == null ? 0.0 : material.metalness, 0.02); //Material metallic
                material.userData = material.userData || {};
                material.userData.vortexRaytraced = true;
                material.needsUpdate = true;
                return material;}
            if (!THREE.MeshStandardMaterial) return material;
            const next = new THREE.MeshStandardMaterial({color: material.color ? material.color.clone() : new THREE.Color(0xffffff), map: material.map || null, transparent: !!material.transparent, opacity: material.opacity == null ? 1 : material.opacity, roughness: 0.46, metalness: 0.035,});
            next.userData.vortexRaytraced = true;
            upgradedMaterials += 1;
            return next;}
        function upgradeObjectTree(object) {
            if (!object) return;
            object.traverse((node) => {
                if (node.userData && node.userData.vortexRtHelper) return;
                if (!node.isMesh || node.isSprite || !node.material) return;
                if (node.material.isShaderMaterial) return; node.material = Array.isArray(node.material) ? node.material.map(upgradeMaterial) : upgradeMaterial(node.material);
                node.castShadow = true;
                node.receiveShadow = true;});}
        scene.add = function patchedSceneAdd(...objects) {const result = originalSceneAdd.apply(this, objects); objects.forEach(upgradeObjectTree); return result;};
        upgradeObjectTree(scene);
        scene.fog = new THREE.FogExp2(0x9ed7ff, 0.0028);
        const hemi = new THREE.HemisphereLight(0xcdeeff, 0x172018, 0.34);
        const rim = new THREE.DirectionalLight(0xb7ddff, 0.28);
        const glint = new THREE.PointLight(0x8fdcff, 0.72, 80, 2.0);
        const shadowTarget = new THREE.Object3D();
        const shadowSun = new THREE.DirectionalLight(0xfff1d0, 0.82);
        const moonLight = new THREE.DirectionalLight(0x9fb7ff, 0.12);
        const skyUniforms = { sunDir: uniforms.sunDir, moonDir: uniforms.moonDir, dayAmount: uniforms.dayAmount, twilightAmount: uniforms.twilightAmount, time: uniforms.time,};
        const skyGeo = THREE.SphereGeometry ? new THREE.SphereGeometry(1800, 32, 16) : new THREE.SphereBufferGeometry(1800, 32, 16);
        const skyMat = new THREE.ShaderMaterial({uniforms: skyUniforms, vertexShader:
            `
                varying vec3 vWorldDir;
                void main( ) {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldDir = normalize(worldPosition.xyz - cameraPosition);
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }
            `, fragmentShader:
            `
                precision highp float;
                uniform vec3 sunDir;
                uniform vec3 moonDir;
                uniform float dayAmount;
                uniform float twilightAmount;
                uniform float time;
                varying vec3 vWorldDir;
                float sat(float x) { return clamp(x, 0.0, 1.0); }
                float hash(vec2 p) {p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 19.19); return fract(p.x * p.y);}
                float hash21(vec2 p) {p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y);}
                vec2 hash22(vec2 p) {float n = hash21(p); return vec2(n, hash21(p + n + 17.17));}
                float starLayer(vec2 uv, float scale, float cutoff, float size, float twinkleRate) {vec2 grid = uv * scale; vec2 cell = floor(grid); vec2 local = fract(grid); vec2 point = hash22(cell); float seed = hash21(cell + 9.31); float exists = step(cutoff, seed); float dist = length(local - point); float core = smoothstep(size, 0.0, dist); float glow = smoothstep(size * 3.4, 0.0, dist) * 0.28; float twinkle = 0.72 + 0.28 * sin(time * twinkleRate + seed * 43.0); return (core + glow) * exists * twinkle;}
                void main() {
                    vec3 rd = normalize(vWorldDir);
                    float nightAmount = 1.0 - dayAmount;
                    float horizon = sat(rd.y * 0.5 + 0.5);
                    vec3 dayLow = vec3(0.50, 0.72, 0.90);
                    vec3 dayMid = vec3(0.20, 0.46, 0.82);
                    vec3 dayHigh = vec3(0.035, 0.15, 0.42);
                    vec3 twilightLow = vec3(0.95, 0.40, 0.17);
                    vec3 twilightMid = vec3(0.52, 0.18, 0.32);
                    vec3 twilightHigh = vec3(0.06, 0.04, 0.14);
                    vec3 nightLow = vec3(0.012, 0.016, 0.030);
                    vec3 nightMid = vec3(0.006, 0.010, 0.026);
                    vec3 nightHigh = vec3(0.001, 0.003, 0.011);
                    vec3 daySky = mix(dayLow, dayMid, smoothstep(0.05, 0.65, horizon));
                    daySky = mix(daySky, dayHigh, smoothstep(0.62, 1.0, horizon));
                    vec3 twilightSky = mix(twilightLow, twilightMid, smoothstep(0.02, 0.55, horizon));
                    twilightSky = mix(twilightSky, twilightHigh, smoothstep(0.48, 1.0, horizon));
                    vec3 nightSky = mix(nightLow, nightMid, smoothstep(0.04, 0.65, horizon));
                    nightSky = mix(nightSky, nightHigh, smoothstep(0.50, 1.0, horizon));
                    vec3 sky = mix(nightSky, daySky, dayAmount);
                    sky = mix(sky, twilightSky, twilightAmount);
                    float sun = sat(dot(rd, normalize(sunDir)));
                    float moon = sat(dot(rd, normalize(moonDir)));
                    float glow = pow(sun, 18.0) * dayAmount;
                    float core = pow(sun, 900.0) * dayAmount;
                    float moonGlow = pow(moon, 26.0) * nightAmount;
                    float moonCore = pow(moon, 700.0) * nightAmount;
                    float haze = pow(1.0 - abs(rd.y), 3.0) * (mix(0.02, 0.11, dayAmount) + twilightAmount * 0.18);
                    float grain = hash(rd.xz * 700.0 + time * 0.01) * mix(0.012, 0.003, dayAmount);
                    float longitude = atan(rd.z, rd.x) / 6.28318530718 + 0.5;
                    float latitude = asin(clamp(rd.y, 0.0, 1.0)) / 1.57079632679;
                    vec2 starUv = vec2(longitude, latitude);
                    float upperSky = smoothstep(0.05, 0.42, rd.y);
                    float starMask = starLayer(starUv + vec2(0.013, 0.071), 42.0, 0.968, 0.070, 1.7) + starLayer(starUv + vec2(0.379, 0.211), 82.0, 0.988, 0.055, 2.5);
                    starMask *= upperSky * smoothstep(0.18, 0.92, nightAmount) * (1.0 - twilightAmount * 0.85);
                    sky += vec3(1.0, 0.70, 0.36) * glow * 0.42;
                    sky += vec3(1.0, 0.92, 0.72) * core * 2.6;
                    sky += vec3(0.38, 0.45, 0.62) * moonGlow * 0.36;
                    sky += vec3(0.75, 0.82, 0.95) * moonCore * 1.8;
                    sky += vec3(0.52, 0.66, 0.82) * haze + grain;
                    sky += vec3(0.70, 0.78, 0.96) * starMask;
                    float gray = dot(sky, vec3(0.299, 0.587, 0.114));
                    sky = mix(vec3(gray), sky, mix(${NIGHT_SATURATION.toFixed(2)}, ${DAY_SATURATION.toFixed(2)}, dayAmount));
                    gl_FragColor = vec4(sky, 1.0);}
            `, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,});
        //I am locked and geeked at the same time
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 128;
        sunCanvas.height = 128;
        const sunCtx = sunCanvas.getContext('2d');
        const sunGrad = sunCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        sunGrad.addColorStop(0.0, 'rgba(255,250,218,1)');
        sunGrad.addColorStop(0.22, 'rgba(255,227,145,0.92)');
        sunGrad.addColorStop(0.55, 'rgba(255,166,70,0.32)');
        sunGrad.addColorStop(1.0, 'rgba(255,166,70,0)');
        sunCtx.fillStyle = sunGrad;
        sunCtx.fillRect(0, 0, 128, 128);
        const sunTexture = new THREE.CanvasTexture(sunCanvas);
        const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({map: sunTexture, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, depthTest: true, fog: false, blending: THREE.AdditiveBlending,}));
        const moonCanvas = document.createElement('canvas');
        moonCanvas.width = 128;
        moonCanvas.height = 128;
        const moonCtx = moonCanvas.getContext('2d');
        const moonGrad = moonCtx.createRadialGradient(56, 50, 0, 64, 64, 54);
        moonGrad.addColorStop(0.0, 'rgba(230,238,255,0.95)');
        moonGrad.addColorStop(0.55, 'rgba(154,174,218,0.72)');
        moonGrad.addColorStop(1.0, 'rgba(80,100,150,0)');
        moonCtx.fillStyle = moonGrad;
        moonCtx.beginPath();
        moonCtx.arc(64, 64, 50, 0, Math.PI * 2);
        moonCtx.fill();
        moonCtx.globalCompositeOperation = 'destination-out';
        moonCtx.fillStyle = 'rgba(0,0,0,0.86)';
        moonCtx.beginPath();
        moonCtx.arc(82, 54, 48, 0, Math.PI * 2);
        moonCtx.fill();
        moonCtx.globalCompositeOperation = 'source-over';
        const moonTexture = new THREE.CanvasTexture(moonCanvas);
        const moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({map: moonTexture, color: 0xc9d6ff, transparent: true, opacity: 0, depthWrite: false, depthTest: true, fog: false, blending: THREE.AdditiveBlending,}));
        skyDome.userData.vortexRtHelper = true;
        sunSprite.userData.vortexRtHelper = true;
        moonSprite.userData.vortexRtHelper = true;
        sunSprite.renderOrder = -998;
        moonSprite.renderOrder = -998;
        skyDome.renderOrder = -999;
        rim.position.set(-120, 180, -90);
        glint.position.set(18, 46, 18);
        shadowTarget.position.set(0, 0, 0);
        shadowSun.position.set(110, 190, 95);
        shadowSun.target = shadowTarget;
        moonLight.target = shadowTarget;
        rim.castShadow = false;
        glint.castShadow = false;
        moonLight.castShadow = false;
        configureDirectionalShadow(shadowSun, 96);
        configureExistingShadows();
        addedLights.push(hemi, rim, glint, shadowSun, moonLight);
        addedObjects.push(shadowTarget, skyDome, sunSprite, moonSprite);
        scene.add(skyDome, sunSprite, moonSprite, shadowTarget, hemi, rim, glint, shadowSun, moonLight);
        //I feel I don't need to explain everything that goes on because of the names
        rendererProto.render = function patchedVortexRaytraceRender(renderScene, renderCamera) {
            if (inPost || !enabled || renderScene !== scene) {return baseRender.call(this, renderScene, renderCamera);}
            frameIndex += 1;
            configureRendererShadows(this);
            if (this.shadowMap && frameIndex % SHADOW_UPDATE_INTERVAL === 0) {this.shadowMap.needsUpdate = true;}
            ensureTarget(this);
            const oldTarget = this.getRenderTarget ? this.getRenderTarget() : null;
            const oldAutoClear = this.autoClear;
            this.setRenderTarget(target);
            this.autoClear = true;
            baseRender.call(this, renderScene, renderCamera);
            this.setRenderTarget(oldTarget);
            uniforms.tDiffuse.value = target.texture;
            uniforms.time.value = performance.now() * 0.001;
            uniforms.cameraPos.value.copy(renderCamera.position);
            if (renderCamera.projectionMatrixInverse) {uniforms.projectionInv.value.copy(renderCamera.projectionMatrixInverse);} else {setMatrixInverse(uniforms.projectionInv.value, renderCamera.projectionMatrix);}
            uniforms.cameraWorld.value.copy(renderCamera.matrixWorld);
            inPost = true; this.autoClear = true; baseRender.call(this, postScene, postCamera); this.autoClear = oldAutoClear; inPost = false;};
        //Math functions
        function clamp01(value) {return Math.max(0, Math.min(1, value));}
        function clamp(value, min, max) {return Math.max(min, Math.min(max, value));}
        function smoothstep(edge0, edge1, value) {const x = clamp01((value - edge0) / (edge1 - edge0)); return x * x * (3 - 2 * x);}
        //Just the lerp function
        function lerp(a, b, t) {return a + (b - a) * t;}
        //Day cycle blending
        function mixColor(color, night, day, amount) {color.setRGB(lerp(night[0], day[0], amount), lerp(night[1], day[1], amount), lerp(night[2], day[2], amount));}
        //This might just be more math
        function getCycleState(timeSeconds) {
            const cycle = ((timeSeconds / DAY_LENGTH_SECONDS) % 1 + 1) % 1;
            const angle = cycle * Math.PI * 2;
            const elevation = Math.sin(angle);
            const travel = Math.cos(angle);
            const cross = Math.sin(angle * 0.5 + 0.8) * 0.18;
            const sunVector = new THREE.Vector3(travel * 0.72 + cross, elevation, travel * 0.48 - cross * 0.6).normalize();
            const moonVector = sunVector.clone().multiplyScalar(-1);
            const dayAmount = smoothstep(-0.04, 0.34, elevation);
            const twilightAmount = (1 - smoothstep(0.10, 0.48, Math.abs(elevation))) * smoothstep(-0.30, -0.02, elevation) * (1 - smoothstep(0.45, 0.95, dayAmount));
            const warmAmount = twilightAmount + smoothstep(-0.02, 0.12, elevation) * (1 - smoothstep(0.12, 0.42, elevation)) * 0.55;
            return { sunVector, moonVector, dayAmount, twilightAmount, warmAmount, nightAmount: 1 - dayAmount };}
        //Ts here is just repetitive back and forth, don't care to stopping by
        function animateExtras() {if (!page.VortexRaytraceShader || page.VortexRaytraceShader.disposed) return;
            const t = performance.now() * 0.001; const character = vortex.getCharacter && vortex.getCharacter(); const position = character ? character.position : { x: 0, y: 28, z: 0 }; const shadowFocusY = Math.max(8, position.y + 8); const { sunVector, moonVector, dayAmount, twilightAmount, warmAmount, nightAmount } = getCycleState(t); const activeShadow = smoothstep(0.04, 0.30, sunVector.y) * dayAmount;
            glint.position.set(position.x + Math.sin(t * 0.55) * 15, position.y + 17 + Math.sin(t * 1.1) * 2, position.z + Math.cos(t * 0.48) * 15);
            glint.intensity = enabled ? lerp(0.015, 0.42, dayAmount) + warmAmount * 0.10 : 0;
            rim.position.set(position.x - sunVector.x * 125, shadowFocusY + 120, position.z - sunVector.z * 125);
            shadowTarget.position.set(position.x, shadowFocusY, position.z);
            shadowSun.position.set(position.x + sunVector.x * 170, shadowFocusY + Math.max(0.08, sunVector.y) * 170, position.z + sunVector.z * 170);
            moonLight.position.set(position.x + moonVector.x * 130, shadowFocusY + Math.max(0.1, moonVector.y) * 130, position.z + moonVector.z * 130);
            skyDome.position.set(position.x, shadowFocusY, position.z);
            sunSprite.position.set(position.x + sunVector.x * 880, shadowFocusY + sunVector.y * 880, position.z + sunVector.z * 880);
            moonSprite.position.set(position.x + moonVector.x * 880, shadowFocusY + moonVector.y * 880, position.z + moonVector.z * 880);
            sunSprite.scale.set(lerp(46, 76, dayAmount + warmAmount * 0.35), lerp(46, 76, dayAmount + warmAmount * 0.35), 1);
            moonSprite.scale.set(58, 58, 1);
            sunSprite.material.opacity = enabled ? clamp01(dayAmount * 0.62 + warmAmount * 0.42) : 0;
            moonSprite.material.opacity = enabled ? smoothstep(0.18, 0.86, nightAmount) * (1 - twilightAmount * 0.55) * 0.68 : 0;
            mixColor(hemi.color, [0.05, 0.07, 0.14], [0.72, 0.84, 0.95], dayAmount);
            mixColor(hemi.groundColor, [0.015, 0.018, 0.026], [0.18, 0.28, 0.18], dayAmount);
            mixColor(rim.color, [0.16, 0.20, 0.38], [0.70, 0.84, 1.00], dayAmount);
            mixColor(shadowSun.color, [0.35, 0.28, 0.18], [1.00, 0.88, 0.66], dayAmount);
            if (warmAmount > 0.02) {rim.color.lerp(new THREE.Color(0xff8a3d), warmAmount * 0.45);shadowSun.color.lerp(new THREE.Color(0xff9d43), warmAmount * 0.35);}
            hemi.intensity = enabled ? lerp(0.012, 0.26, dayAmount) + twilightAmount * 0.018 : 0;
            rim.intensity = enabled ? lerp(0.006, 0.16, dayAmount) + warmAmount * 0.08 : 0;
            shadowSun.intensity = enabled ? (0.66 * activeShadow + warmAmount * 0.16) : 0;
            moonLight.intensity = enabled ? 0.105 * smoothstep(0.22, 0.94, nightAmount) * (1 - twilightAmount * 0.7) : 0;
            originalLightStates.forEach(({ light, intensity }) => {
                if (!enabled) return;
                if (light.isAmbientLight) {
                    mixColor(light.color, [0.018, 0.024, 0.050], [0.72, 0.78, 0.82], dayAmount);
                    if (warmAmount > 0.02) light.color.lerp(new THREE.Color(0xff7a38), warmAmount * 0.18);
                    light.intensity = intensity * (lerp(0.015, 0.22, dayAmount) + twilightAmount * 0.035);} else if (light.isDirectionalLight) {mixColor(light.color, [0.10, 0.13, 0.24], [1.00, 0.88, 0.68], dayAmount);
                    if (warmAmount > 0.02) light.color.lerp(new THREE.Color(0xff8a32), warmAmount * 0.32);
                    light.intensity = intensity * (lerp(0.0, 0.16, dayAmount) + warmAmount * 0.08);} else {light.intensity = intensity * lerp(0.04, 0.55, dayAmount);}});
            if (scene.fog) {scene.fog.density = lerp(0.0125, 0.0026, dayAmount) + twilightAmount * 0.0015; mixColor(scene.fog.color, [0.010, 0.014, 0.026], [0.48, 0.64, 0.78], dayAmount); if (warmAmount > 0.02) scene.fog.color.lerp(new THREE.Color(0x9b4d2a), warmAmount * 0.28);}
            shadowSun.target.updateMatrixWorld();
            moonLight.target.updateMatrixWorld();
            if (frameIndex % SHADOW_UPDATE_INTERVAL === 0) {shadowSun.shadow.needsUpdate = true;}
            uniforms.sunDir.value.copy(sunVector);
            uniforms.moonDir.value.copy(moonVector);
            uniforms.dayAmount.value = dayAmount;
            uniforms.twilightAmount.value = twilightAmount;
            page.requestAnimationFrame(animateExtras);}
        page.VortexRaytraceShader = {
            get enabled() {return enabled;},
            set enabled(value) {
                enabled = !!value;
                addedLights.forEach((light) => {light.visible = enabled;});
                addedObjects.forEach((object) => {object.visible = enabled;});
                if (!enabled) restoreOriginalLights(); log(enabled ? 'enabled' : 'disabled');},
            upgradedMaterials,
            dispose() {
                this.disposed = true;
                enabled = false;
                rendererProto.render = rendererProto.__vortexRaytraceBaseRender || baseRender;
                scene.add = originalSceneAdd;
                addedLights.forEach((light) => scene.remove(light));
                addedObjects.forEach((object) => scene.remove(object));
                restoreOriginalLights();
                restoreRendererShadows();
                if (target) target.dispose();
                planeGeo.dispose();
                postMaterial.dispose();
                skyGeo.dispose();
                skyMat.dispose();
                sunTexture.dispose();
                sunSprite.material.dispose();
                moonTexture.dispose();
                moonSprite.material.dispose();
                log('disposed');}, toggle() {this.enabled = !enabled;},};
        animateExtras();
        //congrads
        log('installed', {upgradedMaterials, addedLights: addedLights.length, toggleKey: TOGGLE_KEY,}); return { ok: true, upgradedMaterials, addedLights: addedLights.length };}
    page.addEventListener('keydown', (event) => {
        if (isTypingTarget(event.target)) return;
        const shader = page.VortexRaytraceShader;
        if (!shader) return;
        if (event.code === TOGGLE_KEY) {event.preventDefault(); shader.toggle(); return;}}, true);
    //waiting
    waitForVortex()
        .then(() => {if (AUTO_ENABLE) installShader();}) .catch((error) => console.warn('Raytracing -->', error));})();
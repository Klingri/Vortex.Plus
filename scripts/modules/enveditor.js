(function(){
    document.getElementById('smiley-env-editor')?.remove();
    if(window.__seeStop) window.__seeStop();

    const V = window._vortex;
    const useThree = !!(V && V.scene && window.THREE);
    const THREE = window.THREE;
    const scene = useThree ? V.scene : null;
    const getCam = () => V?.getCamera?.();
    const getChar = () => V?.getCharacter?.();
    const TWO_PI = Math.PI * 2;

    const SAVE_KEY = 'smiley-env-editor';

    const defaults = {
        snow: { on:false, speed:1, size:1, density:1 },
        rain: { on:false, speed:1, size:1, density:1 },
        galaxy: { on:false, density:1, size:1, twinkle:1, nebula:1, rotation:0.3, shooting:1 },
        fog: { on:false, color:'#8090a0', density:0.015 },
        time: { on:false, hour:12 },
        ambient: { on:false, color:'#ffffff', intensity:0.5 },
        sun: { on:false, color:'#ffe8c0', intensity:1, angle:45 },
        grading: { on:false, saturation:1, contrast:1, brightness:1, hue:0, exposure:1 },
        dynamic: { on:false, dayTime:0.3, cycleSeconds:180, paused:false, sunIntensity:1, ambientIntensity:1, fogTint:true },
        playerLight: { on:false, color:'#ffeecc', intensity:1.6, distance:40, flicker:0.06, height:4 },
        camLight: { on:false, color:'#ffffff', intensity:1.4, distance:50 },
        ui: { x:60, y:60, openSections:{ weather:true, sky:true, lighting:true, dynamic:true } }
    };

    function loadSave(){
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if(!raw) return JSON.parse(JSON.stringify(defaults));
            const parsed = JSON.parse(raw);
            const merged = JSON.parse(JSON.stringify(defaults));
            for(const k in parsed){
                if(merged[k]) Object.assign(merged[k], parsed[k]);
            }
            return merged;
        } catch(e){ return JSON.parse(JSON.stringify(defaults)); }
    }

    const state = loadSave();
    state.snow._sys = null;
    state.rain._sys = null;
    state.galaxy._sys = null;
    state.fog._saved = null;
    state.time._saved = null;
    state.ambient._light = null;
    state.sun._light = null;
    state.dynamic._sys = null;
    state.playerLight._ref = null;
    state.camLight._ref = null;

    let saveTimer = null;
    function save(){
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const out = {};
            for(const k in state){
                if(k === 'ui'){ out.ui = state.ui; continue; }
                if(typeof state[k] !== 'object') continue;
                out[k] = {};
                for(const p in state[k]){
                    if(p.startsWith('_')) continue;
                    out[k][p] = state[k][p];
                }
            }
            try { localStorage.setItem(SAVE_KEY, JSON.stringify(out)); } catch(e){}
        }, 250);
    }

    function buildSnow(){
        if(state.snow._sys || !useThree) return;
        const COUNT = 600, AREA = 40, HEIGHT = 25;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(COUNT * 3);
        const data = [];
        for(let i=0;i<COUNT;i++){
            data.push({ x:(Math.random()-0.5)*AREA, y:Math.random()*HEIGHT, z:(Math.random()-0.5)*AREA, fall:1.2+Math.random()*1.6, drift:Math.random()*Math.PI*2, driftSpeed:0.3+Math.random()*0.7, driftAmp:0.2+Math.random()*0.4 });
            pos[i*3]=data[i].x; pos[i*3+1]=data[i].y; pos[i*3+2]=data[i].z;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const canvas = document.createElement('canvas'); canvas.width=32; canvas.height=32;
        const c = canvas.getContext('2d');
        const g = c.createRadialGradient(16,16,0,16,16,16);
        g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.6)'); g.addColorStop(1,'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0,0,32,32);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.PointsMaterial({ map:tex, color:0xffffff, size:0.18, transparent:true, opacity:0.9, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true });
        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        scene.add(pts);
        state.snow._sys = { pts, geo, mat, tex, pos, data, COUNT, AREA, HEIGHT };
    }
    function updateSnow(dt){
        const s = state.snow._sys; if(!s) return;
        const ch = getChar();
        const cx = ch ? ch.position.x : 0;
        const cy = ch ? ch.position.y : 0;
        const cz = ch ? ch.position.z : 0;
        const half = s.AREA * 0.5;
        s.mat.size = 0.18 * state.snow.size;
        const visible = Math.floor(s.COUNT * Math.min(1, state.snow.density));
        s.geo.setDrawRange(0, visible);
        for(let i=0;i<visible;i++){
            const d = s.data[i];
            d.y -= d.fall * state.snow.speed * dt;
            d.drift += d.driftSpeed * dt;
            d.x += Math.sin(d.drift) * d.driftAmp * dt;
            d.z += Math.cos(d.drift*0.8) * d.driftAmp * dt;
            const rx = d.x - cx, rz = d.z - cz;
            if(rx > half) d.x -= s.AREA; else if(rx < -half) d.x += s.AREA;
            if(rz > half) d.z -= s.AREA; else if(rz < -half) d.z += s.AREA;
            if(d.y < cy - 1){ d.y = cy + s.HEIGHT - Math.random()*4; d.x = cx + (Math.random()-0.5)*s.AREA; d.z = cz + (Math.random()-0.5)*s.AREA; }
            s.pos[i*3]=d.x; s.pos[i*3+1]=d.y; s.pos[i*3+2]=d.z;
        }
        s.geo.attributes.position.needsUpdate = true;
    }
    function clearSnow(){
        const s = state.snow._sys; if(!s) return;
        scene.remove(s.pts);
        s.geo.dispose(); s.mat.dispose(); s.tex.dispose();
        state.snow._sys = null;
    }

    function buildRain(){
        if(state.rain._sys || !useThree) return;
        const COUNT = 1200, AREA = 50, HEIGHT = 30;
        const positions = new Float32Array(COUNT * 6);
        const data = [];
        for(let i=0;i<COUNT;i++){
            const x = (Math.random()-0.5)*AREA, y = Math.random()*HEIGHT, z = (Math.random()-0.5)*AREA;
            data.push({ x, y, z, baseSpeed:35+Math.random()*25, baseLength:0.8+Math.random()*0.7 });
            positions[i*6]=x; positions[i*6+1]=y; positions[i*6+2]=z;
            positions[i*6+3]=x; positions[i*6+4]=y-data[i].baseLength; positions[i*6+5]=z;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({ color:0xaaccff, transparent:true, opacity:0.55, depthWrite:false, blending:THREE.AdditiveBlending });
        const lines = new THREE.LineSegments(geo, mat);
        lines.frustumCulled = false;
        scene.add(lines);
        state.rain._sys = { lines, geo, mat, positions, data, COUNT, AREA, HEIGHT };
    }
    function updateRain(dt){
        const s = state.rain._sys; if(!s) return;
        const ch = getChar();
        const cx = ch ? ch.position.x : 0;
        const cy = ch ? ch.position.y : 0;
        const cz = ch ? ch.position.z : 0;
        const ground = cy - 1.5;
        const half = s.AREA * 0.5;
        const visible = Math.floor(s.COUNT * Math.min(1, state.rain.density));
        s.geo.setDrawRange(0, visible * 2);
        for(let i=0;i<visible;i++){
            const d = s.data[i];
            d.y -= d.baseSpeed * state.rain.speed * dt;
            const rx = d.x - cx, rz = d.z - cz;
            if(rx > half) d.x -= s.AREA; else if(rx < -half) d.x += s.AREA;
            if(rz > half) d.z -= s.AREA; else if(rz < -half) d.z += s.AREA;
            if(d.y < ground){ d.y = cy + s.HEIGHT - Math.random()*4; d.x = cx + (Math.random()-0.5)*s.AREA; d.z = cz + (Math.random()-0.5)*s.AREA; }
            const len = d.baseLength * state.rain.size;
            s.positions[i*6]=d.x; s.positions[i*6+1]=d.y; s.positions[i*6+2]=d.z;
            s.positions[i*6+3]=d.x; s.positions[i*6+4]=d.y-len; s.positions[i*6+5]=d.z;
        }
        s.geo.attributes.position.needsUpdate = true;
    }
    function clearRain(){
        const s = state.rain._sys; if(!s) return;
        scene.remove(s.lines);
        s.geo.dispose(); s.mat.dispose();
        state.rain._sys = null;
    }

    function buildGalaxy(){
        if(state.galaxy._sys || !useThree) return;
        const RADIUS = 400, STAR_MAX = 8000, NEBULA_MAX = 1200;
        const skyGeo = new THREE.SphereGeometry(RADIUS * 1.05, 32, 16);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false,
            vertexShader: `varying vec3 vWP; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vWP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
            fragmentShader: `varying vec3 vWP; void main(){ vec3 d = normalize(vWP); float h = d.y*0.5+0.5; vec3 t = vec3(0.015,0.01,0.04); vec3 m = vec3(0.04,0.02,0.09); vec3 b = vec3(0.08,0.03,0.14); vec3 c = mix(b,m,smoothstep(0.0,0.4,h)); c = mix(c,t,smoothstep(0.4,1.0,h)); gl_FragColor = vec4(c,1.0); }`
        });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        skyDome.frustumCulled = false;
        scene.add(skyDome);

        const starPos = new Float32Array(STAR_MAX * 3);
        const starColor = new Float32Array(STAR_MAX * 3);
        const starSize = new Float32Array(STAR_MAX);
        const starPhase = new Float32Array(STAR_MAX);
        const starFreq = new Float32Array(STAR_MAX);
        for(let i=0;i<STAR_MAX;i++){
            const u = Math.random(), v = Math.random();
            const th = 2*Math.PI*u, ph = Math.acos(2*v-1);
            const r = RADIUS * (0.92 + Math.random() * 0.08);
            starPos[i*3] = r*Math.sin(ph)*Math.cos(th);
            starPos[i*3+1] = r*Math.cos(ph);
            starPos[i*3+2] = r*Math.sin(ph)*Math.sin(th);
            const tier = Math.random();
            const col = tier < 0.7 ? new THREE.Color(0xffffff) : tier < 0.85 ? new THREE.Color(0xaaccff) : tier < 0.95 ? new THREE.Color(0xffeecc) : new THREE.Color(0xffaa88);
            starColor[i*3]=col.r; starColor[i*3+1]=col.g; starColor[i*3+2]=col.b;
            starSize[i] = 0.5 + Math.pow(Math.random(),4) * 4;
            starPhase[i] = Math.random() * Math.PI * 2;
            starFreq[i] = 0.5 + Math.random() * 2.5;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('aColor', new THREE.BufferAttribute(starColor, 3));
        starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1));
        starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhase, 1));
        starGeo.setAttribute('aFreq', new THREE.BufferAttribute(starFreq, 1));

        const sc = document.createElement('canvas'); sc.width=64; sc.height=64;
        const sctx = sc.getContext('2d');
        const sgrad = sctx.createRadialGradient(32,32,0,32,32,32);
        sgrad.addColorStop(0,'rgba(255,255,255,1)'); sgrad.addColorStop(0.2,'rgba(255,255,255,0.7)'); sgrad.addColorStop(0.5,'rgba(255,255,255,0.2)'); sgrad.addColorStop(1,'rgba(255,255,255,0)');
        sctx.fillStyle = sgrad; sctx.fillRect(0,0,64,64);
        const starTex = new THREE.CanvasTexture(sc);

        const starMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uTime:{value:0}, uTex:{value:starTex}, uSize:{value:1}, uTwinkle:{value:1}, uPR:{value:devicePixelRatio||1} },
            vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aPhase; attribute float aFreq; varying vec3 vC; varying float vA; uniform float uTime; uniform float uSize; uniform float uTwinkle; uniform float uPR;
                void main(){ vC=aColor; float tw=mix(1.0, 0.4+0.6*(0.5+0.5*sin(uTime*aFreq+aPhase)), uTwinkle); vA=tw; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=aSize*uSize*uPR*(300.0/-mv.z); }`,
            fragmentShader: `varying vec3 vC; varying float vA; uniform sampler2D uTex; void main(){ vec4 t=texture2D(uTex, gl_PointCoord); gl_FragColor=vec4(vC*t.rgb, t.a*vA); }`
        });
        const stars = new THREE.Points(starGeo, starMat);
        stars.frustumCulled = false;

        const nebPos = new Float32Array(NEBULA_MAX * 3);
        const nebColor = new Float32Array(NEBULA_MAX * 3);
        const nebSize = new Float32Array(NEBULA_MAX);
        for(let i=0;i<NEBULA_MAX;i++){
            const cluster = Math.floor(Math.random()*4);
            const cx = [0.4,-0.3,0.1,-0.5][cluster];
            const cy = [0.2,0.4,-0.2,0.1][cluster];
            const cz = [0.5,-0.6,-0.7,0.4][cluster];
            const sp = 0.35;
            const dx=(Math.random()-0.5)*sp, dy=(Math.random()-0.5)*sp*0.6, dz=(Math.random()-0.5)*sp;
            const dir = new THREE.Vector3(cx+dx, cy+dy, cz+dz).normalize();
            const r = RADIUS * 0.95;
            nebPos[i*3]=dir.x*r; nebPos[i*3+1]=dir.y*r; nebPos[i*3+2]=dir.z*r;
            const palette = [0x4a2080, 0x802040, 0x205080, 0x603090][cluster];
            const nc = new THREE.Color(palette);
            const tint = 0.7 + Math.random() * 0.6;
            nebColor[i*3]=nc.r*tint; nebColor[i*3+1]=nc.g*tint; nebColor[i*3+2]=nc.b*tint;
            nebSize[i] = 30 + Math.random() * 80;
        }
        const nebGeo = new THREE.BufferGeometry();
        nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
        nebGeo.setAttribute('aColor', new THREE.BufferAttribute(nebColor, 3));
        nebGeo.setAttribute('aSize', new THREE.BufferAttribute(nebSize, 1));

        const nc2 = document.createElement('canvas'); nc2.width=128; nc2.height=128;
        const nctx = nc2.getContext('2d');
        const ngrad = nctx.createRadialGradient(64,64,0,64,64,64);
        ngrad.addColorStop(0,'rgba(255,255,255,0.35)'); ngrad.addColorStop(0.4,'rgba(255,255,255,0.12)'); ngrad.addColorStop(1,'rgba(255,255,255,0)');
        nctx.fillStyle = ngrad; nctx.fillRect(0,0,128,128);
        const nebTex = new THREE.CanvasTexture(nc2);

        const nebMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uTex:{value:nebTex}, uOpacity:{value:1}, uPR:{value:devicePixelRatio||1} },
            vertexShader: `attribute vec3 aColor; attribute float aSize; varying vec3 vC; uniform float uPR; void main(){ vC=aColor; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=aSize*uPR*(300.0/-mv.z); }`,
            fragmentShader: `varying vec3 vC; uniform sampler2D uTex; uniform float uOpacity; void main(){ vec4 t=texture2D(uTex, gl_PointCoord); gl_FragColor=vec4(vC*t.rgb*3.0, t.a*uOpacity); }`
        });
        const nebula = new THREE.Points(nebGeo, nebMat);
        nebula.frustumCulled = false;

        const galaxyGroup = new THREE.Group();
        galaxyGroup.add(stars);
        galaxyGroup.add(nebula);
        scene.add(galaxyGroup);

        const SHOOTING_POOL = 6;
        const shooters = [];
        for(let i=0;i<SHOOTING_POOL;i++){
            const sp = new Float32Array(6);
            const sg = new THREE.BufferGeometry();
            sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
            const sm = new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending });
            const ln = new THREE.Line(sg, sm);
            ln.frustumCulled = false;
            scene.add(ln);
            shooters.push({ line:ln, geo:sg, mat:sm, posArr:sp, life:0, maxLife:0, start:new THREE.Vector3(), end:new THREE.Vector3(), active:false });
        }

        state.galaxy._sys = { skyDome, skyGeo, skyMat, stars, starGeo, starMat, starTex, nebula, nebGeo, nebMat, nebTex, galaxyGroup, shooters, RADIUS, STAR_MAX, NEBULA_MAX, shootTimer:0 };
    }
    function updateGalaxy(dt, now){
        const s = state.galaxy._sys; if(!s) return;
        const cam = getCam();
        if(cam){
            s.skyDome.position.copy(cam.position);
            s.galaxyGroup.position.copy(cam.position);
        }
        s.galaxyGroup.rotation.y += dt * state.galaxy.rotation * 0.05;
        s.starMat.uniforms.uTime.value = now / 1000;
        s.starMat.uniforms.uSize.value = state.galaxy.size;
        s.starMat.uniforms.uTwinkle.value = state.galaxy.twinkle;
        s.nebMat.uniforms.uOpacity.value = state.galaxy.nebula;
        const sc = Math.floor(s.STAR_MAX * Math.min(1, state.galaxy.density * 0.6 + 0.4));
        s.starGeo.setDrawRange(0, sc);
        const ncount = Math.floor(s.NEBULA_MAX * Math.min(1, state.galaxy.nebula));
        s.nebGeo.setDrawRange(0, ncount);

        s.shootTimer -= dt;
        if(s.shootTimer <= 0 && state.galaxy.shooting > 0){
            s.shootTimer = (3 + Math.random() * 6) / state.galaxy.shooting;
            const sh = s.shooters.find(x => !x.active);
            if(sh){
                const u = Math.random(), v = Math.random();
                const th = 2*Math.PI*u, ph = Math.acos(2*v-1);
                const r = s.RADIUS * 0.95;
                sh.start.set(r*Math.sin(ph)*Math.cos(th), Math.abs(r*Math.cos(ph))*0.8 + s.RADIUS*0.1, r*Math.sin(ph)*Math.sin(th));
                const da = Math.random()*Math.PI*2;
                const len = 60 + Math.random()*80;
                sh.end.set(sh.start.x + Math.cos(da)*len, sh.start.y - 30 - Math.random()*40, sh.start.z + Math.sin(da)*len);
                sh.life = 0; sh.maxLife = 0.8 + Math.random()*0.6; sh.active = true;
            }
        }
        for(const sh of s.shooters){
            if(!sh.active) continue;
            sh.life += dt;
            const k = sh.life / sh.maxLife;
            if(k >= 1){ sh.active = false; sh.mat.opacity = 0; continue; }
            const ht = Math.min(1, k*1.2), tt = Math.max(0, k*1.2 - 0.25);
            const hx = sh.start.x+(sh.end.x-sh.start.x)*ht, hy = sh.start.y+(sh.end.y-sh.start.y)*ht, hz = sh.start.z+(sh.end.z-sh.start.z)*ht;
            const tx = sh.start.x+(sh.end.x-sh.start.x)*tt, ty = sh.start.y+(sh.end.y-sh.start.y)*tt, tz = sh.start.z+(sh.end.z-sh.start.z)*tt;
            sh.posArr[0]=tx; sh.posArr[1]=ty; sh.posArr[2]=tz;
            sh.posArr[3]=hx; sh.posArr[4]=hy; sh.posArr[5]=hz;
            sh.geo.attributes.position.needsUpdate = true;
            sh.mat.opacity = Math.sin(k*Math.PI);
        }
    }
    function clearGalaxy(){
        const s = state.galaxy._sys; if(!s) return;
        scene.remove(s.skyDome);
        scene.remove(s.galaxyGroup);
        for(const sh of s.shooters){ scene.remove(sh.line); sh.geo.dispose(); sh.mat.dispose(); }
        s.skyGeo.dispose(); s.skyMat.dispose();
        s.starGeo.dispose(); s.starMat.dispose(); s.starTex.dispose();
        s.nebGeo.dispose(); s.nebMat.dispose(); s.nebTex.dispose();
        state.galaxy._sys = null;
    }

    function applyFog(){
        if(!useThree) return;
        if(state.fog.on){
            if(state.fog._saved === null) state.fog._saved = scene.fog || false;
            scene.fog = new THREE.FogExp2(new THREE.Color(state.fog.color).getHex(), state.fog.density);
        } else {
            scene.fog = state.fog._saved === false ? null : state.fog._saved;
        }
    }
    function applyAmbient(){
        if(!useThree) return;
        if(state.ambient.on){
            if(!state.ambient._light){
                state.ambient._light = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(state.ambient._light);
            }
            state.ambient._light.color.set(state.ambient.color);
            state.ambient._light.intensity = state.ambient.intensity;
        } else if(state.ambient._light){
            scene.remove(state.ambient._light);
            state.ambient._light = null;
        }
    }
    function applySun(){
        if(!useThree) return;
        if(state.sun.on){
            if(!state.sun._light){
                state.sun._light = new THREE.DirectionalLight(0xffffff, 1);
                scene.add(state.sun._light);
            }
            state.sun._light.color.set(state.sun.color);
            state.sun._light.intensity = state.sun.intensity;
            const a = state.sun.angle * Math.PI / 180;
            state.sun._light.position.set(Math.cos(a)*100, Math.sin(a)*100, 50);
        } else if(state.sun._light){
            scene.remove(state.sun._light);
            state.sun._light = null;
        }
    }
    function applyTime(){
        if(!useThree) return;
        if(state.dynamic.on) return;
        if(state.time.on){
            const h = state.time.hour;
            let bg;
            if(h < 5) bg = new THREE.Color(0x0a0a20);
            else if(h < 7) bg = new THREE.Color().setHSL(0.05, 0.6, 0.3 + (h-5)*0.1);
            else if(h < 17) bg = new THREE.Color(0x88bbff);
            else if(h < 19) bg = new THREE.Color().setHSL(0.05, 0.7, 0.5 - (h-17)*0.15);
            else if(h < 21) bg = new THREE.Color().setHSL(0.7, 0.5, 0.2 - (h-19)*0.05);
            else bg = new THREE.Color(0x0a0a20);
            if(state.time._saved === null) state.time._saved = scene.background || false;
            scene.background = bg;
        } else if(state.time._saved !== null){
            scene.background = state.time._saved === false ? null : state.time._saved;
            state.time._saved = null;
        }
    }

    function applyGrading(){
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(c => {
            if(c.closest('#smiley-env-editor')) return;
            if(state.grading.on){
                const g = state.grading;
                c.style.filter = `saturate(${g.saturation}) contrast(${g.contrast}) brightness(${g.brightness * g.exposure}) hue-rotate(${g.hue}deg)`;
            } else {
                c.style.filter = '';
            }
        });
    }

    function buildDynamic(){
        if(state.dynamic._sys || !useThree) return;
        const SKY_DIST = 1400, SUN_RADIUS = 90, MOON_RADIUS = 70;

        let oldAmbient = null, oldSun = null;
        scene.traverse(o => {
            if(o.isAmbientLight && !oldAmbient && o !== state.ambient._light) oldAmbient = o;
            if(o.isDirectionalLight && !oldSun && o !== state.sun._light) oldSun = o;
        });
        const oldAmbState = oldAmbient ? { intensity: oldAmbient.intensity, visible: oldAmbient.visible } : null;
        const oldSunState = oldSun ? { intensity: oldSun.intensity, visible: oldSun.visible, castShadow: oldSun.castShadow } : null;
        if(oldAmbient){ oldAmbient.intensity = 0; oldAmbient.visible = false; }
        if(oldSun){ oldSun.intensity = 0; oldSun.visible = false; oldSun.castShadow = false; }

        const ambient = new THREE.HemisphereLight(0x87ceeb, 0x3a3a2a, 0.55);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 1500;
        sun.shadow.camera.left = -240;
        sun.shadow.camera.right = 240;
        sun.shadow.camera.top = 240;
        sun.shadow.camera.bottom = -240;
        sun.shadow.bias = -0.0005;
        sun.shadow.normalBias = 0.04;
        sun.target.position.set(0, 0, 0);
        scene.add(sun);
        scene.add(sun.target);

        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 256; sunCanvas.height = 256;
        const sctx = sunCanvas.getContext('2d');
        const sgrad = sctx.createRadialGradient(128,128,0,128,128,128);
        sgrad.addColorStop(0.0,'rgba(255,255,240,1)');
        sgrad.addColorStop(0.25,'rgba(255,240,180,0.95)');
        sgrad.addColorStop(0.5,'rgba(255,200,120,0.55)');
        sgrad.addColorStop(0.8,'rgba(255,140,80,0.15)');
        sgrad.addColorStop(1.0,'rgba(255,100,60,0)');
        sctx.fillStyle = sgrad; sctx.fillRect(0,0,256,256);
        const sunTex = new THREE.CanvasTexture(sunCanvas);
        sunTex.minFilter = THREE.LinearFilter; sunTex.magFilter = THREE.LinearFilter;

        const moonCanvas = document.createElement('canvas');
        moonCanvas.width = 256; moonCanvas.height = 256;
        const mctx = moonCanvas.getContext('2d');
        const mgrad = mctx.createRadialGradient(128,128,0,128,128,128);
        mgrad.addColorStop(0.0,'rgba(245,245,255,1)');
        mgrad.addColorStop(0.4,'rgba(220,225,240,0.9)');
        mgrad.addColorStop(0.7,'rgba(180,190,220,0.3)');
        mgrad.addColorStop(1.0,'rgba(140,150,200,0)');
        mctx.fillStyle = mgrad; mctx.fillRect(0,0,256,256);
        mctx.globalAlpha = 0.25; mctx.fillStyle = '#7a85a5';
        for(let i=0;i<14;i++){
            const x = 60 + Math.random()*136, y = 60 + Math.random()*136, r = 6 + Math.random()*18;
            const dx = x-128, dy = y-128;
            if(dx*dx+dy*dy > 90*90) continue;
            mctx.beginPath(); mctx.arc(x,y,r,0,TWO_PI); mctx.fill();
        }
        const moonTex = new THREE.CanvasTexture(moonCanvas);
        moonTex.minFilter = THREE.LinearFilter; moonTex.magFilter = THREE.LinearFilter;

        const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:sunTex, transparent:true, depthTest:false, depthWrite:false, blending:THREE.AdditiveBlending, fog:false }));
        sunSprite.scale.set(SUN_RADIUS*2, SUN_RADIUS*2, 1);
        sunSprite.renderOrder = -10;
        scene.add(sunSprite);

        const sunCore = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS*0.45, 24, 16), new THREE.MeshBasicMaterial({ color:0xfff2c4, fog:false, depthTest:false, depthWrite:false }));
        sunCore.renderOrder = -9;
        scene.add(sunCore);

        const moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:moonTex, transparent:true, depthTest:false, depthWrite:false, fog:false }));
        moonSprite.scale.set(MOON_RADIUS*2, MOON_RADIUS*2, 1);
        moonSprite.renderOrder = -10;
        scene.add(moonSprite);

        const starCount = 600;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount*3);
        const starCol = new Float32Array(starCount*3);
        for(let i=0;i<starCount;i++){
            const u = Math.random(), w = Math.random();
            const theta = TWO_PI*u, phi = Math.acos(2*w-1);
            const r = SKY_DIST*0.95;
            const x = r*Math.sin(phi)*Math.cos(theta);
            const y = Math.abs(r*Math.cos(phi))*0.7 + 60;
            const z = r*Math.sin(phi)*Math.sin(theta);
            starPos[i*3]=x; starPos[i*3+1]=y; starPos[i*3+2]=z;
            const tint = 0.7 + Math.random()*0.3;
            starCol[i*3]=tint; starCol[i*3+1]=tint; starCol[i*3+2]=Math.min(1, tint+Math.random()*0.2);
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starCol,3));
        const starMat = new THREE.PointsMaterial({ size:4, sizeAttenuation:true, transparent:true, opacity:0, vertexColors:true, depthTest:false, depthWrite:false, fog:false });
        const stars = new THREE.Points(starGeo, starMat);
        stars.renderOrder = -11;
        scene.add(stars);

        let savedBg = scene.background;
        let savedFog = scene.fog;

        state.dynamic._sys = {
            ambient, sun, sunSprite, sunCore, moonSprite, stars,
            sunTex, moonTex, starGeo, starMat,
            oldAmbient, oldSun, oldAmbState, oldSunState,
            savedBg, savedFog,
            SKY_DIST, SUN_RADIUS, MOON_RADIUS
        };
    }

    const skyDay = useThree ? new THREE.Color(0x87ceeb) : null;
    const skyNoon = useThree ? new THREE.Color(0xa8d8f0) : null;
    const skyDusk = useThree ? new THREE.Color(0xff7733) : null;
    const skyNight = useThree ? new THREE.Color(0x05071a) : null;
    const skyDawn = useThree ? new THREE.Color(0xffaa66) : null;
    const sunNoonColor = useThree ? new THREE.Color(0xfff5e1) : null;
    const sunDuskColor = useThree ? new THREE.Color(0xff7733) : null;
    const sunNightColor = useThree ? new THREE.Color(0x4466aa) : null;
    const groundDay = useThree ? new THREE.Color(0x4a3a20) : null;
    const groundNight = useThree ? new THREE.Color(0x0a0a18) : null;
    const fogNight = useThree ? new THREE.Color(0x05051a) : null;
    const fogDusk = useThree ? new THREE.Color(0xff8855) : null;

    function lerpColor(out, a, b, t){ out.r = a.r+(b.r-a.r)*t; out.g = a.g+(b.g-a.g)*t; out.b = a.b+(b.b-a.b)*t; return out; }
    function smoothstep(e0, e1, x){ const t = Math.max(0, Math.min(1, (x-e0)/(e1-e0))); return t*t*(3-2*t); }

    function updateDynamic(dt){
        const s = state.dynamic._sys; if(!s) return;
        if(!state.dynamic.paused){
            const speed = state.dynamic.cycleSeconds > 0 ? 1 / state.dynamic.cycleSeconds : 0;
            state.dynamic.dayTime = (state.dynamic.dayTime + speed * dt) % 1;
        }
        const t = state.dynamic.dayTime;
        const angle = t * TWO_PI - Math.PI/2;
        const sx = Math.cos(angle), sy = Math.sin(angle);

        const ch = getChar();
        const cx = ch ? ch.position.x : 0;
        const cy = ch ? ch.position.y : 0;
        const cz = ch ? ch.position.z : 0;

        s.sun.position.set(cx + sx*320, cy + sy*320, cz + sx*0.3*320);
        s.sun.target.position.set(cx, cy, cz);
        s.sun.target.updateMatrixWorld();
        s.sunSprite.position.set(cx + sx*s.SKY_DIST, cy + sy*s.SKY_DIST, cz + sx*0.3*s.SKY_DIST);
        s.sunCore.position.copy(s.sunSprite.position);
        s.moonSprite.position.set(cx - sx*s.SKY_DIST, cy - sy*s.SKY_DIST, cz - sx*0.3*s.SKY_DIST);
        s.stars.position.set(cx, cy, cz);

        const dayFactor = Math.max(0, sy);
        const nightFactor = Math.max(0, -sy);

        const skyColor = new THREE.Color();
        if(sy > 0.05){
            lerpColor(skyColor, skyDay, skyNoon, smoothstep(0.05, 0.7, sy));
            const duskBlend = smoothstep(0.3, 0.05, sy);
            if(duskBlend > 0) lerpColor(skyColor, skyColor, sx > 0 ? skyDawn : skyDusk, duskBlend * 0.6);
        } else {
            const k = smoothstep(-0.3, 0.05, sy);
            const horizonColor = sx > 0 ? skyDawn : skyDusk;
            const t1 = lerpColor(new THREE.Color(), skyNight, horizonColor, smoothstep(-0.3, 0, sy));
            lerpColor(skyColor, t1, skyDay, k);
            if(sy < -0.2) lerpColor(skyColor, skyColor, skyNight, smoothstep(-0.2, -0.5, sy));
        }
        scene.background = skyColor;

        if(scene.fog && state.dynamic.fogTint){
            const fogColor = new THREE.Color();
            if(sy > 0.05) fogColor.copy(skyColor);
            else if(sy > -0.2) lerpColor(fogColor, fogDusk, skyColor, smoothstep(-0.2, 0.05, sy));
            else fogColor.copy(fogNight);
            scene.fog.color.copy(fogColor);
        }

        const sunIntensity = (Math.max(0, sy*1.2) + Math.max(0, smoothstep(-0.05, 0.1, sy))*0.2) * state.dynamic.sunIntensity;
        s.sun.intensity = sunIntensity;

        const sunColor = new THREE.Color();
        if(sy > 0.3) sunColor.copy(sunNoonColor);
        else if(sy > 0) lerpColor(sunColor, sunDuskColor, sunNoonColor, smoothstep(0, 0.3, sy));
        else if(sy > -0.15) lerpColor(sunColor, sunNightColor, sunDuskColor, smoothstep(-0.15, 0, sy));
        else sunColor.copy(sunNightColor);
        s.sun.color.copy(sunColor);

        const sunVisAlpha = smoothstep(-0.12, 0.05, sy);
        s.sunSprite.material.opacity = sunVisAlpha;
        s.sunSprite.visible = sunVisAlpha > 0.01;
        s.sunCore.visible = sunVisAlpha > 0.01;

        const sunDiscColor = new THREE.Color();
        if(sy > 0.25) sunDiscColor.setRGB(1, 0.96, 0.85);
        else if(sy > 0){ const k = smoothstep(0, 0.25, sy); sunDiscColor.setRGB(1, 0.55+k*0.41, 0.25+k*0.6); }
        else { const k = smoothstep(-0.12, 0, sy); sunDiscColor.setRGB(1, 0.4+k*0.15, 0.15+k*0.1); }
        s.sunSprite.material.color.copy(sunDiscColor);
        s.sunCore.material.color.copy(sunDiscColor).lerp(new THREE.Color(0xffffff), 0.4);

        const sizeBoost = 1 + (1 - smoothstep(0, 0.2, sy)) * 0.5;
        s.sunSprite.scale.set(s.SUN_RADIUS*2*sizeBoost, s.SUN_RADIUS*2*sizeBoost, 1);

        const moonAlpha = smoothstep(-0.05, 0.15, -sy);
        s.moonSprite.material.opacity = moonAlpha;
        s.moonSprite.visible = moonAlpha > 0.01;

        s.starMat.opacity = smoothstep(-0.05, -0.25, sy);
        s.stars.visible = s.starMat.opacity > 0.01;

        const ambSky = new THREE.Color(), ambGround = new THREE.Color();
        if(sy > 0){ ambSky.copy(skyColor); lerpColor(ambGround, groundNight, groundDay, smoothstep(0, 0.5, sy)); }
        else { lerpColor(ambSky, skyNight, skyColor, smoothstep(-0.3, 0, sy)); ambGround.copy(groundNight); }
        s.ambient.color.copy(ambSky);
        s.ambient.groundColor.copy(ambGround);
        s.ambient.intensity = (0.25 + dayFactor*0.4 + nightFactor*0.05) * state.dynamic.ambientIntensity;
    }

    function clearDynamic(){
        const s = state.dynamic._sys; if(!s) return;
        scene.remove(s.ambient); scene.remove(s.sun); scene.remove(s.sun.target);
        scene.remove(s.sunSprite); scene.remove(s.sunCore); scene.remove(s.moonSprite); scene.remove(s.stars);
        s.sunTex.dispose(); s.moonTex.dispose();
        s.sunSprite.material.dispose(); s.sunCore.material.dispose(); s.moonSprite.material.dispose();
        s.sunCore.geometry.dispose(); s.starGeo.dispose(); s.starMat.dispose();
        if(s.oldAmbient && s.oldAmbState){ s.oldAmbient.intensity = s.oldAmbState.intensity; s.oldAmbient.visible = s.oldAmbState.visible; }
        if(s.oldSun && s.oldSunState){ s.oldSun.intensity = s.oldSunState.intensity; s.oldSun.visible = s.oldSunState.visible; s.oldSun.castShadow = s.oldSunState.castShadow; }
        scene.background = s.savedBg;
        state.dynamic._sys = null;
    }

    function applyPlayerLight(){
        if(!useThree) return;
        if(state.playerLight.on){
            const ch = getChar();
            if(!ch){ setTimeout(applyPlayerLight, 250); return; }
            if(!state.playerLight._ref){
                const pl = new THREE.PointLight(0xffffff, 1, 40, 1.7);
                scene.add(pl);
                state.playerLight._ref = { light: pl, seed: Math.random()*1000 };
            }
            const r = state.playerLight._ref;
            r.light.color.set(state.playerLight.color);
            r.baseIntensity = state.playerLight.intensity;
            r.light.distance = state.playerLight.distance;
            r.flicker = state.playerLight.flicker;
            r.height = state.playerLight.height;
        } else if(state.playerLight._ref){
            scene.remove(state.playerLight._ref.light);
            state.playerLight._ref = null;
        }
    }
    function applyCamLight(){
        if(!useThree) return;
        if(state.camLight.on){
            if(!state.camLight._ref){
                const pl = new THREE.PointLight(0xffffff, 1, 50, 1.6);
                scene.add(pl);
                state.camLight._ref = { light: pl };
            }
            const r = state.camLight._ref;
            r.light.color.set(state.camLight.color);
            r.light.intensity = state.camLight.intensity;
            r.light.distance = state.camLight.distance;
        } else if(state.camLight._ref){
            scene.remove(state.camLight._ref.light);
            state.camLight._ref = null;
        }
    }

    function updateAttachedLights(now){
        if(state.playerLight._ref){
            const r = state.playerLight._ref;
            const ch = getChar();
            if(ch){
                r.light.position.set(ch.position.x, ch.position.y + state.playerLight.height, ch.position.z);
            }
            let intensity = r.baseIntensity;
            if(r.flicker > 0){
                const t = now / 1000;
                const n = Math.sin(t*14 + r.seed)*0.5 + Math.sin(t*23 + r.seed*1.3)*0.3 + Math.sin(t*43 + r.seed*2.1)*0.2;
                intensity += n * r.flicker * r.baseIntensity;
            }
            r.light.intensity = Math.max(0, intensity);
        }
        if(state.camLight._ref){
            const cam = getCam();
            if(cam) state.camLight._ref.light.position.copy(cam.position);
        }
    }

    function onChange(key){
        switch(key){
            case 'snow': state.snow.on ? buildSnow() : clearSnow(); break;
            case 'rain': state.rain.on ? buildRain() : clearRain(); break;
            case 'galaxy': state.galaxy.on ? buildGalaxy() : clearGalaxy(); break;
            case 'fog': applyFog(); break;
            case 'time': applyTime(); break;
            case 'ambient': applyAmbient(); break;
            case 'sun': applySun(); break;
            case 'grading': applyGrading(); break;
            case 'dynamic':
                if(state.dynamic.on){ buildDynamic(); }
                else { clearDynamic(); applyTime(); }
                break;
            case 'playerLight': applyPlayerLight(); break;
            case 'camLight': applyCamLight(); break;
        }
        save();
    }

    let raf, last = performance.now(), running = true;
    function loop(now){
        if(!running) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if(state.snow.on) updateSnow(dt);
        if(state.rain.on) updateRain(dt);
        if(state.galaxy.on) updateGalaxy(dt, now);
        if(state.dynamic.on) updateDynamic(dt);
        updateAttachedLights(now);
    }
    raf = requestAnimationFrame(loop);

    window.__seeStop = () => {
        running = false;
        cancelAnimationFrame(raf);
        clearSnow(); clearRain(); clearGalaxy(); clearDynamic();
        if(state.fog._saved !== null && useThree) scene.fog = state.fog._saved === false ? null : state.fog._saved;
        if(state.time._saved !== null && useThree) scene.background = state.time._saved === false ? null : state.time._saved;
        if(state.ambient._light){ scene.remove(state.ambient._light); state.ambient._light = null; }
        if(state.sun._light){ scene.remove(state.sun._light); state.sun._light = null; }
        if(state.playerLight._ref){ scene.remove(state.playerLight._ref.light); state.playerLight._ref = null; }
        if(state.camLight._ref){ scene.remove(state.camLight._ref.light); state.camLight._ref = null; }
        document.querySelectorAll('canvas').forEach(c => { if(!c.closest('#smiley-env-editor')) c.style.filter = ''; });
        document.getElementById('smiley-env-editor')?.remove();
        window.__seeStop = null;
    };

    const ui = document.createElement('div');
    ui.id = 'smiley-env-editor';
    ui.innerHTML = `
        <div class="see-bar" id="see-bar">
            <div class="see-bar-l">
                <div class="see-dot"></div>
                <span class="see-name">Smiley Environment Editor</span>
            </div>
            <button class="see-x" id="see-close" title="Close">×</button>
        </div>
        <div class="see-list" id="see-list"></div>
    `;
    document.body.appendChild(ui);

    const css = document.createElement('style');
    css.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        #smiley-env-editor{position:fixed;top:${state.ui.y}px;left:${state.ui.x}px;width:240px;z-index:2147483646;background:#15151b;border:1px solid #26262e;border-radius:6px;color:#d4d4dc;font-family:'Inter',-apple-system,system-ui,sans-serif;font-size:11px;box-shadow:0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02);overflow:hidden;user-select:none;}
        #smiley-env-editor *{box-sizing:border-box;}
        .see-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#1c1c24;border-bottom:1px solid #26262e;cursor:move;}
        .see-bar-l{display:flex;align-items:center;gap:8px;}
        .see-dot{width:8px;height:8px;border-radius:50%;background:#7c5cff;box-shadow:0 0 8px rgba(124,92,255,0.7);}
        .see-name{font-size:11px;font-weight:500;letter-spacing:0.1px;color:#e4e4ec;}
        .see-x{width:18px;height:18px;border:none;background:transparent;color:#7a7a86;font-size:14px;line-height:1;cursor:pointer;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:inherit;padding:0;}
        .see-x:hover{background:#2a2a34;color:#fff;}
        .see-list{max-height:560px;overflow-y:auto;}
        .see-list::-webkit-scrollbar{width:5px;}
        .see-list::-webkit-scrollbar-track{background:#15151b;}
        .see-list::-webkit-scrollbar-thumb{background:#2a2a34;border-radius:2px;}
        .see-list::-webkit-scrollbar-thumb:hover{background:#3a3a44;}
        .see-section{border-bottom:1px solid #1f1f27;}
        .see-section:last-child{border-bottom:none;}
        .see-sec-head{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;cursor:pointer;font-size:10px;color:#9090a0;font-weight:500;letter-spacing:0.6px;text-transform:uppercase;background:#181820;}
        .see-sec-head:hover{background:#1d1d26;color:#c4c4cc;}
        .see-arrow{width:8px;height:8px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);transition:transform 0.15s;}
        .see-sec-open .see-arrow{transform:rotate(45deg);}
        .see-sec-body{display:none;padding:2px 0 6px;}
        .see-sec-open .see-sec-body{display:block;}
        .see-mod{padding:6px 10px;border-top:1px solid #1d1d24;}
        .see-mod:first-child{border-top:none;}
        .see-mod-head{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:3px 0;}
        .see-mod-name{font-size:11px;color:#d4d4dc;font-weight:500;}
        .see-mod-name.see-mod-on{color:#fff;}
        .see-check{width:12px;height:12px;border:1.5px solid #3a3a44;border-radius:3px;background:#15151b;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.12s;}
        .see-check.see-on{background:#7c5cff;border-color:#7c5cff;}
        .see-check.see-on::after{content:'';width:5px;height:8px;border-right:1.5px solid #fff;border-bottom:1.5px solid #fff;transform:rotate(45deg) translate(-1px,-1px);}
        .see-mod-body{display:none;padding:6px 0 2px;}
        .see-mod-expanded .see-mod-body{display:block;}
        .see-row{margin-top:5px;}
        .see-row:first-child{margin-top:0;}
        .see-row-head{display:flex;justify-content:space-between;font-size:10px;color:#8a8a96;margin-bottom:3px;}
        .see-row-val{color:#a48bff;font-variant-numeric:tabular-nums;}
        .see-slider{-webkit-appearance:none;appearance:none;width:100%;height:14px;background:transparent;cursor:pointer;}
        .see-slider::-webkit-slider-runnable-track{height:3px;background:#26262e;border-radius:1.5px;}
        .see-slider::-moz-range-track{height:3px;background:#26262e;border-radius:1.5px;}
        .see-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:11px;height:11px;border-radius:50%;background:#7c5cff;margin-top:-4px;cursor:pointer;border:none;}
        .see-slider::-webkit-slider-thumb:hover{background:#9d8aff;}
        .see-slider::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#7c5cff;border:none;cursor:pointer;}
        .see-color-row{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
        .see-color-row span{font-size:10px;color:#8a8a96;}
        .see-color{width:24px;height:16px;border-radius:3px;border:1px solid #2a2a34;background:transparent;cursor:pointer;padding:0;overflow:hidden;}
        .see-color::-webkit-color-swatch-wrapper{padding:0;}
        .see-color::-webkit-color-swatch{border:none;border-radius:2px;}
        .see-color::-moz-color-swatch{border:none;border-radius:2px;}
        .see-bool-row{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
        .see-bool-row span{font-size:10px;color:#8a8a96;}
    `;
    ui.appendChild(css);

    const list = ui.querySelector('#see-list');

    const layout = [
        { id:'weather', label:'Weather', modules:[
            { key:'snow', name:'Snow', sliders:[
                { p:'speed', label:'speed', min:0.1, max:5, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'size', label:'size', min:0.2, max:4, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'density', label:'density', min:0.1, max:2, step:0.05, fmt:v=>v.toFixed(2) }
            ]},
            { key:'rain', name:'Rain', sliders:[
                { p:'speed', label:'speed', min:0.1, max:5, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'size', label:'size', min:0.2, max:4, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'density', label:'density', min:0.1, max:2, step:0.05, fmt:v=>v.toFixed(2) }
            ]},
            { key:'fog', name:'Fog', colors:[{ p:'color', label:'color' }], sliders:[
                { p:'density', label:'density', min:0.001, max:0.1, step:0.001, fmt:v=>v.toFixed(3) }
            ]}
        ]},
        { id:'sky', label:'Sky', modules:[
            { key:'galaxy', name:'Galaxy', sliders:[
                { p:'density', label:'star density', min:0.1, max:2, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'size', label:'star size', min:0.2, max:4, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'twinkle', label:'twinkle', min:0, max:2, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'nebula', label:'nebula', min:0, max:2, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'rotation', label:'rotation', min:0, max:3, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'shooting', label:'shooting stars', min:0, max:3, step:0.05, fmt:v=>v.toFixed(2) }
            ]},
            { key:'time', name:'Time of Day', sliders:[
                { p:'hour', label:'hour', min:0, max:24, step:0.5, fmt:v=>{ const h=Math.floor(v); const m=v%1?'30':'00'; return h+':'+m; } }
            ]}
        ]},
        { id:'dynamic', label:'Dynamic Lighting', modules:[
            { key:'dynamic', name:'Day / Night Cycle', sliders:[
                { p:'dayTime', label:'time of day', min:0, max:1, step:0.005, fmt:v=>{ const h=Math.floor(v*24); const m=Math.floor((v*24-h)*60).toString().padStart(2,'0'); return h+':'+m; } },
                { p:'cycleSeconds', label:'cycle length (s)', min:10, max:1200, step:5, fmt:v=>Math.round(v)+'s' },
                { p:'sunIntensity', label:'sun intensity', min:0, max:3, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'ambientIntensity', label:'ambient intensity', min:0, max:3, step:0.05, fmt:v=>v.toFixed(2) }
            ], bools:[
                { p:'paused', label:'pause time' },
                { p:'fogTint', label:'tint fog with sky' }
            ]},
            { key:'playerLight', name:'Player Light', colors:[{ p:'color', label:'color' }], sliders:[
                { p:'intensity', label:'intensity', min:0, max:5, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'distance', label:'distance', min:5, max:120, step:1, fmt:v=>Math.round(v) },
                { p:'height', label:'height offset', min:-2, max:10, step:0.1, fmt:v=>v.toFixed(1) },
                { p:'flicker', label:'flicker', min:0, max:0.5, step:0.01, fmt:v=>v.toFixed(2) }
            ]},
            { key:'camLight', name:'Camera Light', colors:[{ p:'color', label:'color' }], sliders:[
                { p:'intensity', label:'intensity', min:0, max:5, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'distance', label:'distance', min:5, max:120, step:1, fmt:v=>Math.round(v) }
            ]}
        ]},
        { id:'lighting', label:'Lighting', modules:[
            { key:'ambient', name:'Ambient Light', colors:[{ p:'color', label:'color' }], sliders:[
                { p:'intensity', label:'intensity', min:0, max:3, step:0.05, fmt:v=>v.toFixed(2) }
            ]},
            { key:'sun', name:'Sun Light', colors:[{ p:'color', label:'color' }], sliders:[
                { p:'intensity', label:'intensity', min:0, max:5, step:0.05, fmt:v=>v.toFixed(2) },
                { p:'angle', label:'angle', min:0, max:180, step:1, fmt:v=>Math.round(v)+'°' }
            ]},
            { key:'grading', name:'Color Grading', sliders:[
                { p:'saturation', label:'saturation', min:0, max:3, step:0.01, fmt:v=>v.toFixed(2) },
                { p:'contrast', label:'contrast', min:0, max:3, step:0.01, fmt:v=>v.toFixed(2) },
                { p:'brightness', label:'brightness', min:0, max:3, step:0.01, fmt:v=>v.toFixed(2) },
                { p:'exposure', label:'exposure', min:0, max:3, step:0.01, fmt:v=>v.toFixed(2) },
                { p:'hue', label:'hue shift', min:-180, max:180, step:1, fmt:v=>Math.round(v)+'°' }
            ]}
        ]}
    ];

    for(const sec of layout){
        const secEl = document.createElement('div');
        secEl.className = 'see-section';
        const open = state.ui.openSections[sec.id] !== false;
        if(open) secEl.classList.add('see-sec-open');
        secEl.innerHTML = `
            <div class="see-sec-head"><span>${sec.label}</span><div class="see-arrow"></div></div>
            <div class="see-sec-body"></div>
        `;
        const body = secEl.querySelector('.see-sec-body');
        secEl.querySelector('.see-sec-head').addEventListener('click', () => {
            const isOpen = secEl.classList.toggle('see-sec-open');
            state.ui.openSections[sec.id] = isOpen;
            save();
        });

        for(const mod of sec.modules){
            const modEl = document.createElement('div');
            modEl.className = 'see-mod';
            if(state[mod.key].on) modEl.classList.add('see-mod-expanded');

            const head = document.createElement('div');
            head.className = 'see-mod-head';
            head.innerHTML = `
                <span class="see-mod-name ${state[mod.key].on?'see-mod-on':''}">${mod.name}</span>
                <div class="see-check ${state[mod.key].on?'see-on':''}"></div>
            `;
            modEl.appendChild(head);

            const modBody = document.createElement('div');
            modBody.className = 'see-mod-body';

            if(mod.colors){
                for(const c of mod.colors){
                    const row = document.createElement('div');
                    row.className = 'see-color-row';
                    row.innerHTML = `<span>${c.label}</span><input type="color" class="see-color" value="${state[mod.key][c.p]}">`;
                    row.querySelector('input').addEventListener('input', e => {
                        state[mod.key][c.p] = e.target.value;
                        if(state[mod.key].on) onChange(mod.key); else save();
                    });
                    modBody.appendChild(row);
                }
            }

            if(mod.sliders){
                for(const s of mod.sliders){
                    const row = document.createElement('div');
                    row.className = 'see-row';
                    row.innerHTML = `
                        <div class="see-row-head"><span>${s.label}</span><span class="see-row-val">${s.fmt(state[mod.key][s.p])}</span></div>
                        <input type="range" class="see-slider" min="${s.min}" max="${s.max}" step="${s.step}" value="${state[mod.key][s.p]}">
                    `;
                    const valEl = row.querySelector('.see-row-val');
                    row.querySelector('input').addEventListener('input', e => {
                        const v = parseFloat(e.target.value);
                        state[mod.key][s.p] = v;
                        valEl.textContent = s.fmt(v);
                        if(state[mod.key].on) onChange(mod.key); else save();
                    });
                    modBody.appendChild(row);
                }
            }

            if(mod.bools){
                for(const b of mod.bools){
                    const row = document.createElement('div');
                    row.className = 'see-bool-row';
                    row.innerHTML = `<span>${b.label}</span><div class="see-check ${state[mod.key][b.p]?'see-on':''}"></div>`;
                    row.addEventListener('click', () => {
                        state[mod.key][b.p] = !state[mod.key][b.p];
                        row.querySelector('.see-check').classList.toggle('see-on', state[mod.key][b.p]);
                        if(state[mod.key].on) onChange(mod.key); else save();
                    });
                    modBody.appendChild(row);
                }
            }

            modEl.appendChild(modBody);

            const check = head.querySelector('.see-check');
            head.addEventListener('click', e => {
                if(e.target.closest('input')) return;
                state[mod.key].on = !state[mod.key].on;
                check.classList.toggle('see-on', state[mod.key].on);
                head.querySelector('.see-mod-name').classList.toggle('see-mod-on', state[mod.key].on);
                modEl.classList.toggle('see-mod-expanded', state[mod.key].on);
                onChange(mod.key);
            });

            body.appendChild(modEl);
        }

        list.appendChild(secEl);
    }

    ui.querySelector('#see-close').addEventListener('click', () => window.__seeStop?.());

    let drag = false, ox = 0, oy = 0;
    const bar = ui.querySelector('#see-bar');
    bar.addEventListener('mousedown', e => {
        if(e.target.closest('button')) return;
        drag = true; ox = e.clientX - ui.offsetLeft; oy = e.clientY - ui.offsetTop;
    });
    document.addEventListener('mousemove', e => {
        if(!drag) return;
        const x = Math.max(0, Math.min(window.innerWidth - ui.offsetWidth, e.clientX - ox));
        const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - oy));
        ui.style.left = x + 'px';
        ui.style.top = y + 'px';
        state.ui.x = x; state.ui.y = y;
    });
    document.addEventListener('mouseup', () => { if(drag){ drag = false; save(); } });

    if(state.snow.on) buildSnow();
    if(state.rain.on) buildRain();
    if(state.galaxy.on) buildGalaxy();
    if(state.fog.on) applyFog();
    if(state.dynamic.on) buildDynamic(); else if(state.time.on) applyTime();
    if(state.ambient.on) applyAmbient();
    if(state.sun.on) applySun();
    if(state.grading.on) applyGrading();
    if(state.playerLight.on) applyPlayerLight();
    if(state.camLight.on) applyCamLight();
})();
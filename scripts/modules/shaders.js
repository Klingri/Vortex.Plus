// ==UserScript==
// @name         Vortex — Cinematic RTX Shader
// @namespace    https://vortex.towerstats.com/
// @version      7.0.0
// @description  Full cinematic RTX: PBR, PCF shadows, ACES tonemap, SSAO, bloom, god rays,
//               lens flares, aurora borealis, volumetric moon, Christmas lights with glow halos,
//               falling snow, and a smooth day/night cycle. Classic House only. Toggle: F7
// @author       Idk / skelebones
// @match        https://vortex.towerstats.com/classic-house*
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==

/**
 * ██╗   ██╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗    ██████╗ ████████╗██╗  ██╗
 * ██║   ██║██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝    ██╔══██╗╚══██╔══╝╚██╗██╔╝
 * ██║   ██║██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝     ██████╔╝   ██║    ╚███╔╝
 * ╚██╗ ██╔╝██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗     ██╔══██╗   ██║    ██╔██╗
 *  ╚████╔╝ ╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗    ██║  ██║   ██║   ██╔╝ ██╗
 *   ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
 *
 *    ✦  VORTEX CINEMATIC RTX  v7.0  ·  by IDK / SKELEBONES  ✦
 *    ·  F7 toggle  ·  Aurora  ·  Volumetric Moon  ·  Christmas lights  ·  Snow  ·
 */

(function () {
    'use strict';

    console.log(
        '%c\n' +
        '  ╔═══════════════════════════════════════╗  \n' +
        '  ║  VORTEX  CINEMATIC  RTX   v7.0        ║  \n' +
        '  ║                                       ║  \n' +
        '  ║  ✦  IDK / SKELEBONES  ✦               ║  \n' +
        '  ║  🎄 Christmas · Aurora · F7 toggle    ║  \n' +
        '  ╚═══════════════════════════════════════╝  \n',
        'background:#04060f;color:#a0f0ff;font-size:13px;font-weight:900;' +
        'font-family:"Courier New",monospace;padding:10px 18px;' +
        'border:2px solid #2af4ff;border-radius:8px;' +
        'text-shadow:0 0 10px #2af4ff;letter-spacing:1px;'
    );

    // ─── Config ───────────────────────────────────────────────────────────────────
    const CFG = {
        AUTO_ENABLE:            true,
        TOGGLE_KEY:             'F7',
        POLL_MS:                1000,
        MAX_WAIT_MS:            30_000,

        POST_RENDER_SCALE:      0.50,
        SHADOW_MAP_SIZE:        256,
        SHADOW_UPDATE_INTERVAL: 10,

        // 3-minute full day/night cycle — starts at dusk for immediate beauty
        DAY_LENGTH_SECONDS:     180,
        CYCLE_OFFSET:           0.70,   // 0=dawn  0.25=noon  0.50=dusk  0.75=midnight

        DAY_SATURATION:         1.08,
        NIGHT_SATURATION:       0.55,
        DAY_EXPOSURE:           0.82,
        NIGHT_EXPOSURE:         1.35,

        ABERRATION_STRENGTH:    0.0014,
        GRAIN_STRENGTH:         0.006,
        SSAO_RADIUS:            0,
        SSAO_STRENGTH:          0,
        BLOOM_THRESHOLD:        0.55,
        BLOOM_STRENGTH:         0.085,
        GOD_RAY_STRENGTH:       0.040,
        LENS_FLARE_STRENGTH:    0.30,

        SUN_SIZE_DAY:           120,
        SUN_SIZE_TWILIGHT:      180,

        // Christmas lights — bigger bulbs, more lights
        XMAS_ENABLE:            true,
        XMAS_BULB_COUNT:        10,
        XMAS_LIGHT_RADIUS:      20,
        XMAS_TWINKLE_SPEED:     2.0,
        XMAS_BULB_SCALE:        6.0,    // sprite size
        XMAS_HALO_SCALE:        14.0,   // glow halo scale

        // Snow
        SNOW_ENABLE:            true,
        SNOW_COUNT:             200,
    };

    const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function log(...a) { console.info('%c[VortexRTX v6]','color:#a0f0ff;font-weight:bold;font-family:monospace',...a); }
    function isTyping(el) {
        if (!el) return false;
        const t = (el.tagName||'').toLowerCase();
        return t==='input'||t==='textarea'||el.isContentEditable;
    }

    // ─── Wait for scene ───────────────────────────────────────────────────────────
    function waitForVortex() {
        const dead = Date.now() + CFG.MAX_WAIT_MS;
        return new Promise((res, rej) => {
            const iv = page.setInterval(() => {
                if (page.THREE?.WebGLRenderer && page._vortex?.scene && page._vortex?.getCamera) {
                    page.clearInterval(iv); res();
                } else if (Date.now() > dead) {
                    page.clearInterval(iv); rej(new Error('timeout'));
                }
            }, CFG.POLL_MS);
        });
    }

    // ─── DOM GUI ──────────────────────────────────────────────────────────────────
    function createGUI() {
        const el = document.createElement('div');
        el.id = 'vortex-rtx-hud';
        el.style.cssText = [
            'position:fixed','top:7px','left:50%','transform:translateX(-50%)',
            'background:rgba(4,6,15,0.78)','color:#a0f0ff',
            'font:700 10px/1 "Courier New",monospace','padding:5px 14px 6px',
            'border-radius:6px','border:1px solid rgba(42,244,255,0.40)',
            'z-index:2147483647','pointer-events:none','white-space:nowrap',
            'letter-spacing:0.9px','user-select:none',
            'text-shadow:0 0 8px #2af4ff',
            'box-shadow:0 0 14px rgba(42,244,255,0.16)',
            'display:flex','align-items:center','gap:6px',
        ].join(';');

        const btnStyle = (active) =>
            'cursor:pointer;pointer-events:auto;padding:2px 7px;border-radius:4px;' +
            'border:1px solid rgba(42,244,255,0.55);color:#2af4ff;' +
            'background:rgba(42,244,255,' + (active ? '0.18' : '0.04') + ');' +
            'opacity:' + (active ? '1' : '0.42') + ';' +
            'transition:opacity .25s,background .25s;text-shadow:0 0 6px #2af4ff;';

        el.innerHTML =
            '<span style="color:#fff;opacity:.9">🎄 VORTEX RTX v7</span>' +
            '<span style="opacity:.5">·</span>' +
            '<span style="color:#a0f0ff;opacity:.7">F7</span>' +
            '<span style="opacity:.5">·</span>' +
            '<span id="vrtx-q-full" style="' + btnStyle(true)  + '">FULL</span>' +
            '<span id="vrtx-q-none" style="' + btnStyle(false) + '">NONE</span>' +
            '<span style="opacity:.5">·</span>' +
            '<span id="vrtx-tod" style="color:#ffdd88"></span>';

        document.body.appendChild(el);
        return el;
    }

    // ─── Main install ─────────────────────────────────────────────────────────────
    function installShader() {
        const THREE  = page.THREE;
        const vortex = page._vortex;
        const scene  = vortex.scene;
        if (!THREE || !vortex || !scene) { log('Aborting — no scene.'); return; }

        page.VortexRTX?.dispose?.();

        const gui = createGUI();
        const todEl = document.getElementById('vrtx-tod');

        const rendererProto = THREE.WebGLRenderer.prototype;
        const baseRender    = rendererProto.__vxBase || rendererProto.render;
        rendererProto.__vxBase = baseRender;

        // ── Render target ─────────────────────────────────────────────────────────
        let rt = null;
        function ensureRT(renderer) {
            const sz = (renderer.getDrawingBufferSize||renderer.getSize).call(renderer, new THREE.Vector2());
            const w  = Math.max(1, Math.floor(sz.x * CFG.POST_RENDER_SCALE));
            const h  = Math.max(1, Math.floor(sz.y * CFG.POST_RENDER_SCALE));
            if (!rt || rt.width !== w || rt.height !== h) {
                rt?.dispose();
                rt = new THREE.WebGLRenderTarget(w, h, {
                    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false,
                });
                U.resolution.value.set(w, h);
                U.texelSize.value.set(1/w, 1/h);
            }
        }

        // ── Uniforms ──────────────────────────────────────────────────────────────
        const U = {
            tDiffuse:       { value: null },
            time:           { value: 0 },
            resolution:     { value: new THREE.Vector2(1,1) },
            texelSize:      { value: new THREE.Vector2(1,1) },
            cameraPos:      { value: new THREE.Vector3() },
            projInv:        { value: new THREE.Matrix4() },
            camWorld:       { value: new THREE.Matrix4() },
            sunDir:         { value: new THREE.Vector3(0.42,0.78,0.32).normalize() },
            moonDir:        { value: new THREE.Vector3(-0.42,-0.78,-0.32).normalize() },
            sunUV:          { value: new THREE.Vector2(0.5,0.5) },
            dayAmt:         { value: 0.0 },
            twilightAmt:    { value: 0.0 },
            sunriseAmt:     { value: 0.0 },
            duskAmt:        { value: 0.0 },
            nightAmt:       { value: 1.0 },
            aberStr:        { value: CFG.ABERRATION_STRENGTH },
            grainStr:       { value: CFG.GRAIN_STRENGTH },
            ssaoR:          { value: CFG.SSAO_RADIUS },
            ssaoS:          { value: CFG.SSAO_STRENGTH },
            bloomThr:       { value: CFG.BLOOM_THRESHOLD },
            bloomStr:       { value: CFG.BLOOM_STRENGTH },
            godRayStr:      { value: CFG.GOD_RAY_STRENGTH },
            flareStr:       { value: CFG.LENS_FLARE_STRENGTH },
        };

        // ── Vertex ────────────────────────────────────────────────────────────────
        const vert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

        // ── Fragment shader — full cinematic RTX pipeline ─────────────────────────
        const buildPostShader = (hq) => `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2  resolution, texelSize, sunUV;
uniform float time, dayAmt, twilightAmt, nightAmt;
uniform float aberStr, grainStr, ssaoR, ssaoS, bloomThr, bloomStr, godRayStr, flareStr;
uniform vec3  cameraPos, sunDir, moonDir;
uniform mat4  projInv, camWorld;
varying vec2  vUv;

// ── Utilities ──────────────────────────────────────────────────────────────────
float sat(float x){return clamp(x,0.,1.);}
vec3  sat3(vec3 x){return clamp(x,0.,1.);}
float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
float sms(float e0,float e1,float v){float x=sat((v-e0)/(e1-e0));return x*x*(3.-2.*x);}

// ── Hash / noise ───────────────────────────────────────────────────────────────
float hash(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
float hash1(float p){p=fract(p*.1031);p*=p+33.33;return fract(p*(p+p));}
vec2  hash2(vec2 p){float n=hash(p);return vec2(n,hash(p+n+17.17));}
float noise2(vec2 p){
    vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise2(p);p*=2.1;a*=.50;}return v;}

// ── ACES filmic tonemap (Hill 2017) ───────────────────────────────────────────
vec3 aces(vec3 x){const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;return sat3((x*(a*x+b))/(x*(c*x+d)+e));}

// ── Uncharted 2 for warm highlights ───────────────────────────────────────────
vec3 uc2(vec3 x){return((x*(.15*x+.10*.50)+.20*.02)/(x*(.15*x+.50)+.20*.30))-.02/.30;}

// ── Ray helpers ───────────────────────────────────────────────────────────────
vec3 getRay(vec2 uv){
    vec2 ndc=uv*2.-1.; vec4 v=projInv*vec4(ndc,1.,1.);
    v.xyz/=max(v.w,0.0001);
    return normalize((camWorld*vec4(v.xyz,0.)).xyz);
}
float sphereHit(vec3 ro,vec3 rd,vec3 c,float r){
    vec3 oc=ro-c; float b=dot(oc,rd),h=b*b-dot(oc,oc)+r*r;
    if(h<0.)return -1.; h=sqrt(h); float t=-b-h; return t>0.?t:-b+h;
}

// ── Sky colour (used for reflections / orb) ────────────────────────────────────
vec3 skyCol(vec3 rd,vec3 sun){
    float h=sat(rd.y*.5+.5);
    vec3 lo=mix(vec3(.50,.73,.94),vec3(.88,.36,.14),twilightAmt*.8);
    vec3 hi=vec3(.04,.14,.38);
    float glow=pow(sat(dot(rd,sun)),12.);
    vec3 base=mix(lo,hi,h);
    base+=mix(vec3(1.,.76,.44),vec3(1.,.44,.14),twilightAmt)*glow*.9;
    return base;
}

${hq ? `
// ── SSAO — 12-tap rotated kernel ──────────────────────────────────────────────
float ssao(vec2 uv){
    float ctr=luma(texture2D(tDiffuse,uv).rgb);
    vec2 r=texelSize*(ssaoR*400.);
    float s=0.;
    const vec2 k0[8]=vec2[8](
        vec2(1.,0.),vec2(.707,.707),vec2(0.,1.),vec2(-.707,.707),
        vec2(-1.,0.),vec2(-.707,-.707),vec2(0.,-1.),vec2(.707,-.707));
    for(int i=0;i<8;i++) s+=abs(ctr-luma(texture2D(tDiffuse,uv+k0[i]*r).rgb))*(i%2==0?1.0:.75);
    vec2 r2=r*.35;
    for(int i=0;i<4;i++) s+=abs(ctr-luma(texture2D(tDiffuse,uv+k0[i*2]*r2).rgb))*.40;
    return 1.-sat(s*ssaoS*1.6);
}
` : `
// ── SSAO — 4-tap light kernel ──────────────────────────────────────────────────
float ssao(vec2 uv){
    float ctr=luma(texture2D(tDiffuse,uv).rgb);
    vec2 r=texelSize*(ssaoR*400.);
    float s=0.;
    const vec2 k0[4]=vec2[4](
        vec2(1.,0.),vec2(0.,1.),vec2(-1.,0.),vec2(0.,-1.));
    for(int i=0;i<4;i++) s+=abs(ctr-luma(texture2D(tDiffuse,uv+k0[i]*r).rgb));
    return 1.-sat(s*ssaoS*2.0);
}
`}

${hq ? `
// ── Dual-pass bloom (wide+tight) ──────────────────────────────────────────────
vec3 bloom(vec2 uv){
    float hw[7]; hw[0]=.054;hw[1]=.093;hw[2]=.134;hw[3]=.153;hw[4]=.134;hw[5]=.093;hw[6]=.054;
    vec3 acc=vec3(0.); float wt=0.;
    for(int i=0;i<7;i++){
        float o=float(i-3);
        vec3 s=texture2D(tDiffuse,uv+vec2(o*texelSize.x*5.,0.)).rgb;
        float b=sat((luma(s)-bloomThr)/(1.-bloomThr));
        acc+=s*b*hw[i]; wt+=hw[i];
    }
    for(int i=0;i<7;i++){
        float o=float(i-3);
        vec3 s=texture2D(tDiffuse,uv+vec2(0.,o*texelSize.y*5.)).rgb;
        float b=sat((luma(s)-bloomThr)/(1.-bloomThr));
        acc+=s*b*hw[i]*.65; wt+=hw[i]*.65;
    }
    for(int i=0;i<7;i++){
        float o=float(i-3);
        vec3 s=texture2D(tDiffuse,uv+vec2(o*texelSize.x*2.,0.)).rgb;
        float b=sat((luma(s)-(bloomThr+.10))/(1.-bloomThr-.10));
        acc+=s*b*hw[i]*.35; wt+=hw[i]*.35;
    }
    return acc/max(wt,.001);
}
` : `
// ── Bloom — single 5-tap separable pass ───────────────────────────────────────
vec3 bloom(vec2 uv){
    float hw[5]; hw[0]=.08;hw[1]=.22;hw[2]=.40;hw[3]=.22;hw[4]=.08;
    vec3 acc=vec3(0.); float wt=0.;
    for(int i=0;i<5;i++){
        float o=float(i-2);
        vec3 sx=texture2D(tDiffuse,uv+vec2(o*texelSize.x*4.,0.)).rgb;
        vec3 sy=texture2D(tDiffuse,uv+vec2(0.,o*texelSize.y*4.)).rgb;
        float bx=sat((luma(sx)-bloomThr)/(1.-bloomThr));
        float by=sat((luma(sy)-bloomThr)/(1.-bloomThr));
        acc+=(sx*bx+sy*by*.70)*hw[i]; wt+=hw[i]*1.70;
    }
    return acc/max(wt,.001);
}
`}

${hq ? `
// ── Volumetric god rays — 12 steps ────────────────────────────────────────────
vec3 godRays(vec2 uv){
    vec2 d=(sunUV-uv)*(1./12.);
    vec2 pos=uv; vec3 a=vec3(0.); float w=1.;
    for(int i=0;i<12;i++){
        vec3 s=texture2D(tDiffuse,clamp(pos,0.001,.999)).rgb;
        float b=sat((luma(s)-.45)/.55);
        a+=s*b*w; pos+=d; w*=.86;
    }
    return a*(1./12.);
}
` : `
// ── Volumetric god rays — 6 steps ─────────────────────────────────────────────
vec3 godRays(vec2 uv){
    vec2 d=(sunUV-uv)*(1./6.);
    vec2 pos=uv; vec3 a=vec3(0.); float w=1.;
    for(int i=0;i<6;i++){
        vec3 s=texture2D(tDiffuse,clamp(pos,0.001,.999)).rgb;
        float b=sat((luma(s)-.45)/.55);
        a+=s*b*w; pos+=d; w*=.84;
    }
    return a*(1./6.);
}
`}

// ── Prismatic lens flare — 8 spikes + halo rings ──────────────────────────────
vec3 lensFlare(vec2 uv){
    vec2 d=uv-sunUV; float dist=length(d);
    vec3 col=vec3(0.);
    // Diffraction spikes
    for(int i=0;i<8;i++){
        float ang=float(i)*.7854;
        vec2 ax=vec2(cos(ang),sin(ang));
        float sp=pow(abs(dot(normalize(d+.0001),ax)),20.)*(1.-sat(dist*2.4));
        vec3 hue=vec3(.5+.5*cos(float(i)*1.57),.5+.5*cos(float(i)*1.57+2.09),.5+.5*cos(float(i)*1.57+4.19));
        col+=sp*hue*.60;
    }
    // Inner halo
    float h1=smoothstep(.20,.16,dist)*smoothstep(.09,.16,dist);
    col+=vec3(.85,.92,1.)*h1*.38;
    // Outer ring
    float h2=smoothstep(.38,.34,dist)*smoothstep(.28,.34,dist);
    col+=vec3(.60,.75,1.)*h2*.14;
    // Ghost reflection
    vec2 gd=sunUV+sunUV-uv; float gLen=length(gd-.5);
    float ghost=smoothstep(.12,.06,gLen)*.18;
    col+=vec3(.4,.6,1.)*ghost;
    return col*(1.-sat(dist*1.0))*dayAmt;
}

// ── Moon glow in post pass ─────────────────────────────────────────────────────
vec3 moonGlow(vec3 rd){
    vec3 mn=normalize(moonDir);
    float md=sat(dot(rd,mn));
    // Atmosphere scatter
    vec3 mg =vec3(.38,.45,.68)*pow(md,14.)*nightAmt*.55;
    // Corona
    mg+=vec3(.65,.72,.92)*pow(md,120.)*nightAmt*1.2;
    // Disc edge brightening
    mg+=vec3(.88,.92,1.0)*pow(md,1800.)*nightAmt*4.0;
    return mg;
}

void main(){
    vec2  uv  = vUv;
    vec2  fc  = uv-.5;
    float dist= length(fc);

    // ── Prismatic aberration + barrel distortion ───────────────────────────────
    float brl = 1.+dot(fc,fc)*.28;
    vec2  ab  = fc*aberStr*brl;
    vec3 col;
    col.r = texture2D(tDiffuse,uv+ab*1.40).r;
    col.g = texture2D(tDiffuse,uv        ).g;
    col.b = texture2D(tDiffuse,uv-ab*1.40).b;

    // ── SSAO ──────────────────────────────────────────────────────────────────
    float ao=ssao(uv);
    col *= mix(1.,ao,.65);

    // ── Bloom ─────────────────────────────────────────────────────────────────
    float bBoost=mix(1.8,1.2,dayAmt)+twilightAmt*.6;
    col += bloom(uv)*bloomStr*bBoost;

    // ── World-space effects ───────────────────────────────────────────────────
    vec3 ro=cameraPos, rd=getRay(uv);
    vec3 sun=normalize(sunDir);

    // Sun lens bloom
    float sdot=sat(dot(rd,sun));
    float sb= pow(sdot,400.)*2.8
            + pow(sdot, 60.)*.32
            + pow(sdot,  9.)*.055;
    sb*=(dayAmt+twilightAmt*.80);
    col+=vec3(1.,.82,.50)*sb;

    // Moon post-pass glow
    col+=moonGlow(rd);

    // God rays (day + twilight only)
    float sv=sat(sunDir.y*4.)*(dayAmt+twilightAmt*.60);
    col+=godRays(uv)*godRayStr*sv*1.8;

    // Lens flare
    col+=lensFlare(uv)*flareStr*sat(1.-dist*1.15);

    // ── Wet-ground Fresnel reflections ────────────────────────────────────────
    float gt=(1.6-ro.y)/max(-rd.y,0.0001);
    if(gt>0.&&rd.y<-.001){
        vec3 gp=ro+rd*gt;
        float wet=.10+.09*noise2(gp.xz*.025+time*.03);
        float fr=pow(1.-sat(abs(dot(rd,vec3(0,1,0)))),5.5);
        vec3 ref=skyCol(reflect(rd,vec3(0,1,0)),sun);
        // Christmas-light coloured puddle flicks
        float stud=pow(sat(sin(gp.x*3.14159)*sin(gp.z*3.14159)),22.)*.055;
        col=mix(col,ref,sat(wet*fr*.55));
        col+=vec3(.32,.62,.40)*stud*dayAmt;
        // Night puddle — reflect moon glow
        vec3 moonRef=moonGlow(reflect(rd,vec3(0,1,0)));
        col+=moonRef*sat(wet*fr*.30)*nightAmt;
    }

    // ── Reflective orb (floating) ─────────────────────────────────────────────
    vec3 orbP=vec3(sin(time*.22)*18.,32.+sin(time*.31)*3.,cos(time*.20)*18.);
    float st=sphereHit(ro,rd,orbP,9.);
    if(st>0.){
        vec3 hp=ro+rd*st, n=normalize(hp-orbP);
        vec3 rf=skyCol(reflect(rd,n),sun);
        float rim=pow(1.-sat(dot(-rd,n)),2.8);
        float sh=sat(dot(n,sun)*.5+.5);
        vec3 irid=mix(vec3(.55,.90,1.),vec3(1.,.68,.45),rim*.65);
        vec3 orb=rf*(.18+.82*sh)+irid*rim*1.0;
        col=mix(col,orb,.22*(1.-sms(0.,200.,st)));
    }

    // ── Screen-space edge outlines ────────────────────────────────────────────
    float lc=luma(col);
    float lx=luma(texture2D(tDiffuse,uv+vec2(texelSize.x,0.)).rgb);
    float ly=luma(texture2D(tDiffuse,uv+vec2(0.,texelSize.y)).rgb);
    float edge=sat(length(vec2(lc-lx,lc-ly))*16.);
    col+=edge*mix(vec3(.012,.020,.036),vec3(.024,.038,.058),dayAmt);

    // ── ACES tonemap ──────────────────────────────────────────────────────────
    float expo=mix(${CFG.NIGHT_EXPOSURE.toFixed(3)},${CFG.DAY_EXPOSURE.toFixed(3)},dayAmt)
              +twilightAmt*.10+sin(time*.18)*.003;
    col=aces(col*expo);

    // ── S-curve contrast ──────────────────────────────────────────────────────
    col=mix(col,col*col*(3.-2.*col),mix(.02,.18,dayAmt));

    // ── Vignette (subtle) ─────────────────────────────────────────────────────
    float vig=smoothstep(.92,.18,dist);
    col*=.72+vig*.26;

    // ── Night colour grade ────────────────────────────────────────────────────
    // Deep blue-purple tint at night, warms through orange at twilight
    col=mix(col*vec3(.18,.24,.50),col,dayAmt);
    // Twilight warm grade
    col+=vec3(.30,.12,.02)*twilightAmt*.16;
    // Night cool grade
    col+=vec3(.02,.04,.10)*nightAmt*.08;

    // ── Saturation ────────────────────────────────────────────────────────────
    float gray=dot(col,vec3(.299,.587,.114));
    float sat2=mix(${CFG.NIGHT_SATURATION.toFixed(3)},${CFG.DAY_SATURATION.toFixed(3)},dayAmt);
    col=mix(vec3(gray),col,sat2);

    // ── Film grain ────────────────────────────────────────────────────────────
    float grain=(hash(uv*resolution+time*79.)-0.5)*2.;
    col+=grain*grainStr*mix(2.0,.65,dayAmt);

    gl_FragColor=vec4(sat3(col),1.);
}`;
        const frag = buildPostShader(true);

        // ── Post quad ─────────────────────────────────────────────────────────────
        const postScene  = new THREE.Scene();
        const postCam    = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        const PlaneGeo   = THREE.PlaneBufferGeometry || THREE.PlaneGeometry;
        const quadGeo    = new PlaneGeo(2,2);
        const quadMat    = new THREE.ShaderMaterial({
            uniforms: U, vertexShader: vert, fragmentShader: frag,
            depthTest: false, depthWrite: false,
        });
        postScene.add(new THREE.Mesh(quadGeo, quadMat));

        // ── State ─────────────────────────────────────────────────────────────────
        let inPost=false, enabled=CFG.AUTO_ENABLE, frameIdx=0, upgradedMats=0;
        const addedLights=[], addedObjects=[], origLights=[], shadowState=new Map();

        // ── Shadow setup ──────────────────────────────────────────────────────────
        function cfgRendShadows(r){
            if(!r?.shadowMap) return;
            if(!shadowState.has(r)) shadowState.set(r,{enabled:r.shadowMap.enabled,type:r.shadowMap.type,autoUpdate:r.shadowMap.autoUpdate});
            r.shadowMap.enabled=true;
            r.shadowMap.type=THREE.PCFSoftShadowMap??r.shadowMap.type;
            r.shadowMap.autoUpdate=false;
        }
        function restoreShadows(){ shadowState.forEach((s,r)=>r?.shadowMap&&Object.assign(r.shadowMap,s)); }
        function cfgDirShadow(l,range){
            if(!l?.shadow) return;
            l.castShadow=true;
            Object.assign(l.shadow,{bias:-0.00014,normalBias:0.028,radius:8,autoUpdate:false,needsUpdate:true});
            l.shadow.mapSize.set(CFG.SHADOW_MAP_SIZE,CFG.SHADOW_MAP_SIZE);
            Object.assign(l.shadow.camera,{near:1,far:520,left:-range,right:range,top:range,bottom:-range});
            l.shadow.camera.updateProjectionMatrix();
        }
        function captureLights(){
            scene.traverse(n=>{
                if(n.isDirectionalLight||n.isAmbientLight||n.isSpotLight){
                    origLights.push({light:n,intensity:n.intensity,color:n.color.clone(),castShadow:n.castShadow});
                    if(n.isDirectionalLight) n.castShadow=false;
                    if(n.isSpotLight&&n.shadow){
                        n.castShadow=true;
                        n.shadow.mapSize.set(1024,1024);
                        Object.assign(n.shadow,{bias:-0.00014,normalBias:0.022,needsUpdate:true});
                    }
                }
            });
        }
        function restoreLights(){
            origLights.forEach(({light,intensity,color,castShadow})=>{
                light.intensity=intensity; light.color.copy(color); light.castShadow=castShadow;
            });
        }

        // ── PBR material upgrade ──────────────────────────────────────────────────
        function upgradeMat(m){
            if(!m||m.userData?.vx) return m;
            if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial){
                m.roughness=Math.min(m.roughness??0.6,0.50);
                m.metalness=Math.max(m.metalness??0.0,0.03);
                m.envMapIntensity=Math.max(m.envMapIntensity??1.0,1.1);
                m.userData.vx=true; m.needsUpdate=true; return m;
            }
            if(!THREE.MeshStandardMaterial) return m;
            const u=new THREE.MeshStandardMaterial({
                color:m.color?.clone()??new THREE.Color(0xffffff),
                map:m.map??null, normalMap:m.normalMap??null, aoMap:m.aoMap??null,
                transparent:!!m.transparent, opacity:m.opacity??1,
                roughness:0.45, metalness:0.04,
            });
            u.userData.vx=true; upgradedMats++; return u;
        }
        function upgradeTree(root){
            root?.traverse(n=>{
                if(n.userData?.vxH) return;
                if(!n.isMesh||n.isSprite||!n.material||n.material.isShaderMaterial) return;
                n.material=Array.isArray(n.material)?n.material.map(upgradeMat):upgradeMat(n.material);
                n.castShadow=true; n.receiveShadow=true;
            });
        }
        const origAdd=scene.add;
        scene.add=function(...o){ const r=origAdd.apply(this,o); o.forEach(upgradeTree); return r; };
        upgradeTree(scene);

        // ── Fog ───────────────────────────────────────────────────────────────────
        scene.fog=new THREE.FogExp2(0x9ed7ff,0.0022);

        // ── Core lights ───────────────────────────────────────────────────────────
        const hemi       = new THREE.HemisphereLight(0xcdeeff,0x172018,0.55);
        const rimLight   = new THREE.DirectionalLight(0xb7ddff,0.38);
        const fillLight  = new THREE.DirectionalLight(0xfff6ea,0.32);
        const glint      = new THREE.PointLight(0x8fdcff,0.75,90,2.0);
        const shadowSun  = new THREE.DirectionalLight(0xfff2d0,0.95);
        const moonLight  = new THREE.DirectionalLight(0xa4beff,0.28);
        const nightFill  = new THREE.AmbientLight(0x1a2040,0.60);
        const shadowTgt  = new THREE.Object3D();

        rimLight.castShadow=false; glint.castShadow=false;
        moonLight.castShadow=false; fillLight.castShadow=false;
        shadowSun.target=shadowTgt; moonLight.target=shadowTgt;
        cfgDirShadow(shadowSun,110);
        fillLight.position.set(-80,60,40);
        captureLights();
        addedLights.push(hemi,rimLight,fillLight,glint,shadowSun,moonLight,nightFill);

        // ── Sky dome — GLSL sky shader ────────────────────────────────────────────
        const skyU={
            sunDir:U.sunDir, moonDir:U.moonDir,
            dayAmt:U.dayAmt, twilightAmt:U.twilightAmt, nightAmt:U.nightAmt,
            sunriseAmt:U.sunriseAmt, duskAmt:U.duskAmt,
            time:U.time,
        };

        const SkyGeo = THREE.SphereGeometry || THREE.SphereBufferGeometry;
        const skyMesh = new THREE.Mesh(new SkyGeo(2000,48,24), new THREE.ShaderMaterial({
            uniforms: skyU,
            vertexShader:`
                varying vec3 vW;
                void main(){
                    vec4 wp=modelMatrix*vec4(position,1.);
                    vW=normalize(wp.xyz-cameraPosition);
                    gl_Position=projectionMatrix*viewMatrix*wp;
                }
            `,
            fragmentShader:`
                precision highp float;
                uniform vec3  sunDir, moonDir;
                uniform float dayAmt, twilightAmt, nightAmt, sunriseAmt, duskAmt, time;
                varying vec3  vW;

                float sat(float x){return clamp(x,0.,1.);}
                float sms(float e0,float e1,float v){float x=sat((v-e0)/(e1-e0));return x*x*(3.-2.*x);}

                float hash1(float p){p=fract(p*.1031);p*=p+33.33;return fract(p*(p+p));}
                float hv(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
                float h21(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
                vec2  h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.17));}
                float noise2(vec2 p){
                    vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
                    return mix(mix(hv(i),hv(i+vec2(1,0)),f.x),mix(hv(i+vec2(0,1)),hv(i+vec2(1,1)),f.x),f.y);
                }
                float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise2(p);p*=2.1;a*=.50;}return v;}

                // ── Star field ────────────────────────────────────────────────────
                float star(vec2 uv,float sc,float dens,float sz,float rt){
                    vec2 g=uv*sc, c=floor(g), l=fract(g);
                    vec2 pt=h22(c); float sd=h21(c+9.31), d=length(l-pt);
                    float co=smoothstep(sz,0.,d), gw=smoothstep(sz*5.,0.,d)*.22;
                    float tw=.60+.40*sin(time*rt+sd*43.+hash1(sd)*6.28);
                    return (co+gw)*step(dens,sd)*tw;
                }

                // ── Aurora borealis ───────────────────────────────────────────────
                vec3 aurora(vec2 suv, float nf){
                    if(nf<0.01) return vec3(0.);
                    float lat=suv.y;
                    // Band centred ~55-70 deg latitude
                    float band=smoothstep(.55,.72,lat)*smoothstep(.90,.72,lat);
                    if(band<0.001) return vec3(0.);
                    float lon=suv.x;
                    float wave=fbm(vec2(lon*3.+time*.04, lat*8.))*0.5
                              +fbm(vec2(lon*6.-time*.02, lat*16.+1.))*0.25;
                    float curtain=smoothstep(.28,.55,wave)*band;
                    // Aurora colours — green base with pink/purple top
                    float ht=sat((lat-.58)/.14);
                    vec3 green =vec3(.08,1.,.38);
                    vec3 purple=vec3(.72,.18,1.);
                    vec3 aCol  =mix(green,purple,ht);
                    float shimmer=.55+.45*sin(time*1.8+lon*12.+lat*9.);
                    return aCol*curtain*shimmer*nf*0.65;
                }

                void main(){
                    vec3 rd=normalize(vW);
                    float night=nightAmt;
                    float hz=sat(rd.y*.5+.5);

                    // ── Base sky gradient per phase ──────────────────────────────
                    // Day: horizon cerulean -> zenith deep blue
                    vec3 day=mix(
                        mix(vec3(.52,.74,.94),vec3(.22,.50,.88),sms(.04,.60,hz)),
                        vec3(.03,.12,.42), sms(.55,1.,hz)
                    );
                    // Sunrise: soft peach-pink horizon -> mauve -> pale indigo zenith
                    vec3 sunrise=mix(
                        mix(vec3(.98,.60,.42),vec3(.74,.46,.68),sms(.02,.48,hz)),
                        vec3(.18,.24,.58), sms(.40,1.,hz)
                    );
                    // Dusk: fiery orange horizon -> crimson-purple -> dark indigo zenith
                    vec3 twl=mix(
                        mix(vec3(1.,.45,.15),vec3(.65,.22,.38),sms(.02,.50,hz)),
                        vec3(.10,.06,.20), sms(.44,1.,hz)
                    );
                    // Night: deep navy -> near-black zenith
                    vec3 ngt=mix(
                        mix(vec3(.014,.018,.038),vec3(.008,.012,.030),sms(.04,.60,hz)),
                        vec3(.003,.004,.014), sms(.45,1.,hz)
                    );

                    // Smooth four-phase blend: night -> sunrise -> day -> dusk -> night
                    vec3 sky=mix(ngt, day, dayAmt);
                    sky=mix(sky, sunrise, sunriseAmt);
                    sky=mix(sky, twl,     duskAmt);

                    // ── Sun disc + halo ──────────────────────────────────────────
                    float sd=sat(dot(rd,normalize(sunDir)));
                    // Atmosphere scatter — day (white-blue)
                    sky+=mix(vec3(1.,.72,.38),vec3(1.,.52,.18),0.)*pow(sd,8.)*dayAmt*.55;
                    sky+=mix(vec3(1.,.90,.60),vec3(1.,.60,.22),0.)*pow(sd,50.)*dayAmt*1.3;
                    // Bright disc (day)
                    sky+=vec3(1.,.98,.92)*pow(sd,300.)*dayAmt*4.5;
                    sky+=vec3(1.,1.,.98)*pow(sd,2200.)*dayAmt*9.;
                    // Sunrise horizon glow — soft peach-pink
                    sky+=vec3(1.,.62,.44)*pow(sd,4.)*sunriseAmt*.55;
                    sky+=vec3(1.,.80,.62)*pow(sd,30.)*sunriseAmt*1.4;
                    sky+=vec3(1.,.95,.85)*pow(sd,500.)*sunriseAmt*2.8;
                    // Dusk horizon burn — fiery orange-red
                    sky+=vec3(1.,.30,.05)*pow(sd,4.)*duskAmt*.70;
                    sky+=vec3(1.,.55,.08)*pow(sd,30.)*duskAmt*1.6;
                    sky+=vec3(1.,.90,.70)*pow(sd,500.)*duskAmt*3.0;

                    // ── Moon disc + glow ─────────────────────────────────────────
                    float md=sat(dot(rd,normalize(moonDir)));
                    sky+=vec3(.42,.52,.72)*pow(md,16.)*night*.45;
                    sky+=vec3(.72,.80,.96)*pow(md,200.)*night*1.8;
                    sky+=vec3(.90,.94,1.0)*pow(md,1200.)*night*3.5;
                    sky+=vec3(1.,1.,1.   )*pow(md,6000.)*night*6.0;  // sharp disc

                    // ── Horizon scatter tint ─────────────────────────────────────
                    sky+=vec3(.52,.66,.84)*pow(1.-abs(rd.y),3.8)
                        *(mix(.018,.16,dayAmt)+twilightAmt*.28);

                    // ── Stars — ONLY visible at night, hard-gated against daylight ─
                    float lon=atan(rd.z,rd.x)*(1./6.2832)+.5;
                    float lat=asin(clamp(rd.y,-1.,1.))*(1./1.5708)*.5+.5;
                    vec2 suv=vec2(lon,lat);
                    float up=sms(.04,.45,rd.y);
                    // nightGate = 1 only when dayAmt is essentially zero
                    float nightGate=sms(.06,.00,dayAmt);
                    float nf=sms(.12,.75,night)*nightGate*(1.-twilightAmt*0.97);

                    float stars=
                        star(suv+vec2(.013,.071), 44., .030, .072, 1.7)
                       +star(suv+vec2(.652,.438),150., .006, .038, 3.8)
                       +star(suv+vec2(.297,.734),200., .004, .028, 5.1);
                    sky+=vec3(.85,.92,1.)*stars*up*nf*1.8;

                    // ── Milky Way band ───────────────────────────────────────────
                    float mw=fbm(suv*vec2(4.,14.)+.3)+fbm(suv*vec2(8.,28.)+1.8)*.35;
                    float mwm=smoothstep(.34,.52,abs(fract(lat*.5+.25)-.5)*2.);
                    sky+=vec3(.32,.38,.60)*mw*mwm*nf*.55;

                    // ── Aurora ───────────────────────────────────────────────────
                    sky+=aurora(suv,nf);

                    // ── Cloud wisps (daytime only) ────────────────────────────────
                    float cloud=fbm(vec2(rd.x*2.+time*.008,rd.z*2.+time*.005)*.6);
                    float cloudMask=smoothstep(.42,.62,cloud)*sms(.06,.40,rd.y)*dayAmt;
                    sky=mix(sky,sky+vec3(.92,.95,.98)*cloudMask*.35,cloudMask*.45);

                    // ── Saturation per phase ──────────────────────────────────────
                    float gr=dot(sky,vec3(.299,.587,.114));
                    float sat2=mix(.52,1.06,dayAmt);
                    sky=mix(vec3(gr),sky,sat2);

                    gl_FragColor=vec4(sky,1.);
                }
            `,
            side: THREE.BackSide, depthWrite:false, depthTest:false, fog:false,
        }));
        skyMesh.userData.vxH=true; skyMesh.renderOrder=-999;

        // ── Sun sprite ────────────────────────────────────────────────────────────
        function makeSprite(drawFn,col,op){
            const cv=document.createElement('canvas'); cv.width=cv.height=512;
            drawFn(cv.getContext('2d'));
            const s=new THREE.Sprite(new THREE.SpriteMaterial({
                map:new THREE.CanvasTexture(cv),color:col,transparent:true,opacity:op,
                depthWrite:false,depthTest:true,fog:false,blending:THREE.AdditiveBlending,
            }));
            s.userData.vxH=true; s.renderOrder=-998; return s;
        }

        const sunSprite=makeSprite(ctx=>{
            const [cx,cy]=[256,256];
            // Outer scatter
            const og=ctx.createRadialGradient(cx,cy,0,cx,cy,256);
            og.addColorStop(0,'rgba(255,200,100,0)'); og.addColorStop(.30,'rgba(255,160,40,.06)');
            og.addColorStop(.60,'rgba(255,110,10,.20)'); og.addColorStop(.88,'rgba(230,70,0,.36)');
            og.addColorStop(1,'rgba(180,40,0,0)');
            ctx.fillStyle=og; ctx.fillRect(0,0,512,512);
            // Mid corona
            const mc=ctx.createRadialGradient(cx,cy,0,cx,cy,195);
            mc.addColorStop(0,'rgba(255,252,200,0)'); mc.addColorStop(.28,'rgba(255,240,155,.12)');
            mc.addColorStop(.55,'rgba(255,215,110,.62)'); mc.addColorStop(.82,'rgba(255,175,50,.90)');
            mc.addColorStop(1,'rgba(255,110,0,0)');
            ctx.fillStyle=mc; ctx.fillRect(0,0,512,512);
            // Chromosphere
            const ch=ctx.createRadialGradient(cx,cy,38,cx,cy,74);
            ch.addColorStop(0,'rgba(255,255,210,.94)'); ch.addColorStop(.6,'rgba(255,228,105,.74)');
            ch.addColorStop(1,'rgba(255,140,20,0)');
            ctx.fillStyle=ch; ctx.beginPath(); ctx.arc(cx,cy,74,0,Math.PI*2); ctx.fill();
            // Photosphere disc
            const disc=ctx.createRadialGradient(cx,cy,0,cx,cy,46);
            disc.addColorStop(0,'rgba(255,255,252,1)'); disc.addColorStop(.4,'rgba(255,250,225,1)');
            disc.addColorStop(.82,'rgba(255,240,188,1)'); disc.addColorStop(1,'rgba(255,205,125,.8)');
            ctx.fillStyle=disc; ctx.beginPath(); ctx.arc(cx,cy,46,0,Math.PI*2); ctx.fill();
            // Diffraction spikes ×8
            for(let i=0;i<8;i++){
                const a=(i/8)*Math.PI*2, len=215+(i%2)*60;
                ctx.save(); ctx.globalAlpha=i%2===0?.28:.14;
                ctx.strokeStyle='rgba(255,230,160,1)'; ctx.lineWidth=i%2===0?3.8:1.8;
                ctx.beginPath();
                ctx.moveTo(cx+Math.cos(a)*48,cy+Math.sin(a)*48);
                ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);
                ctx.stroke(); ctx.restore();
            }
        },0xffffff,0.94);

        // ── Moon sprite — crescent shape ──────────────────────────────────────────
        const moonSprite=makeSprite(ctx=>{
            const [cx,cy]=[256,256];
            // Outer glow
            const og=ctx.createRadialGradient(cx,cy,0,cx,cy,220);
            og.addColorStop(0,'rgba(200,220,255,0)'); og.addColorStop(.5,'rgba(160,190,255,.08)');
            og.addColorStop(.8,'rgba(120,160,240,.22)'); og.addColorStop(1,'rgba(80,120,200,0)');
            ctx.fillStyle=og; ctx.fillRect(0,0,512,512);
            // Moon face
            const b=ctx.createRadialGradient(236,220,0,cx,cy,210);
            b.addColorStop(0,'rgba(242,248,255,.98)'); b.addColorStop(.55,'rgba(168,188,236,.85)');
            b.addColorStop(1,'rgba(90,115,175,0)');
            ctx.fillStyle=b; ctx.beginPath(); ctx.arc(cx,cy,210,0,Math.PI*2); ctx.fill();
            // Crescent shadow
            ctx.globalCompositeOperation='destination-out';
            ctx.fillStyle='rgba(0,0,0,.90)';
            ctx.beginPath(); ctx.arc(cx+80,cy-52,196,0,Math.PI*2); ctx.fill();
            ctx.globalCompositeOperation='source-over';
            // Subtle craters
            ctx.fillStyle='rgba(190,208,255,.06)';
            for(let i=0;i<7;i++){
                ctx.beginPath(); ctx.arc(155+i*16,238+(i%2)*18,13+i*3,0,Math.PI*2); ctx.fill();
            }
        },0xd0e2ff,0);

        addedObjects.push(shadowTgt,skyMesh,sunSprite,moonSprite);
        scene.add(skyMesh,sunSprite,moonSprite,shadowTgt,hemi,rimLight,fillLight,glint,shadowSun,moonLight,nightFill);

        // ════════════════════════════════════════════════════════════════════════
        // 🎄  CHRISTMAS LIGHTS — redesigned with halo sprites
        // ════════════════════════════════════════════════════════════════════════
        const xmasObjects=[], xmasLights=[], xmasBulbs=[], xmasHalos=[];

        const BULB_COLORS=[
            0xff2020, // red
            0x22ff44, // green
            0xffd700, // gold
            0x2288ff, // blue
            0xff80ff, // pink
            0xffffff, // white
            0xff6600, // orange
            0x00ffee, // cyan
        ];

        function buildStrandPath(origin){
            // origin.y = floor of house (min Y from bounding box)
            // Use houseBounds to derive real roof dimensions if available
            const ox=origin.x, oz=origin.z;
            const pts=[];

            let houseH, houseW, houseD;
            if(houseBounds){
                houseH=houseBounds.max.y-houseBounds.min.y;
                houseW=(houseBounds.max.x-houseBounds.min.x)*0.5;
                houseD=(houseBounds.max.z-houseBounds.min.z)*0.5;
            } else {
                houseH=20; houseW=18; houseD=12;
            }

            // Clamp to reasonable sizes in case the bounding box is huge
            houseW=Math.min(houseW,28);
            houseD=Math.min(houseD,20);
            houseH=Math.min(houseH,40);

            const FLOOR=origin.y;            // world Y of house floor
            const EAVE_H   =FLOOR+houseH*0.70;  // eave at ~70% of house height
            const PEAK_H   =FLOOR+houseH*0.98;  // ridge just below very top
            const SIDE_H   =FLOOR+houseH*0.58;  // side eave slightly lower
            const ROOF_W   =houseW;
            const DEPTH    =houseD*0.85;         // front face z-offset

            // Front eave only (left to right)
            for(let i=0;i<=18;i++){
                const t=i/18;
                pts.push(new THREE.Vector3(ox+(-ROOF_W+t*ROOF_W*2), EAVE_H, oz+DEPTH));
            }
            return pts;
        }

        // Build a canvas bulb sprite for a given hex colour
        function makeBulbCanvas(hexCol){
            const cv=document.createElement('canvas'); cv.width=cv.height=128;
            const ctx=cv.getContext('2d');
            const r=(hexCol>>16)&0xff, g=(hexCol>>8)&0xff, b=hexCol&0xff;
            // Glow radial
            const grd=ctx.createRadialGradient(64,64,0,64,64,64);
            grd.addColorStop(0,`rgba(${Math.min(r+100,255)},${Math.min(g+100,255)},${Math.min(b+100,255)},1)`);
            grd.addColorStop(.35,`rgba(${r},${g},${b},0.95)`);
            grd.addColorStop(.70,`rgba(${r},${g},${b},0.45)`);
            grd.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=grd; ctx.fillRect(0,0,128,128);
            // Bulb body
            ctx.fillStyle=`rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},1)`;
            ctx.beginPath(); ctx.arc(64,72,18,0,Math.PI*2); ctx.fill();
            // Specular highlight
            ctx.fillStyle='rgba(255,255,255,0.7)';
            ctx.beginPath(); ctx.arc(58,66,6,0,Math.PI*2); ctx.fill();
            // Cap
            ctx.fillStyle='rgba(170,170,170,0.95)';
            ctx.fillRect(60,50,8,22);
            ctx.fillStyle='rgba(140,140,140,0.90)';
            ctx.fillRect(58,48,12,6);
            return cv;
        }

        // Large soft halo sprite for the glow bloom
        function makeHaloCanvas(hexCol){
            const cv=document.createElement('canvas'); cv.width=cv.height=256;
            const ctx=cv.getContext('2d');
            const r=(hexCol>>16)&0xff, g=(hexCol>>8)&0xff, b=hexCol&0xff;
            const grd=ctx.createRadialGradient(128,128,0,128,128,128);
            grd.addColorStop(0,`rgba(${Math.min(r+80,255)},${Math.min(g+80,255)},${Math.min(b+80,255)},0.90)`);
            grd.addColorStop(.30,`rgba(${r},${g},${b},0.55)`);
            grd.addColorStop(.65,`rgba(${r},${g},${b},0.18)`);
            grd.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=grd; ctx.fillRect(0,0,256,256);
            return cv;
        }

        function buildXmasLights(origin){
            // cleanup
            [...xmasLights,...xmasBulbs,...xmasHalos,...xmasObjects].forEach(o=>scene.remove(o));
            xmasLights.length=0; xmasBulbs.length=0; xmasHalos.length=0; xmasObjects.length=0;

            const pts=buildStrandPath(origin);
            if(pts.length<2) return;

            // Wire
            const strandGeo=new THREE.BufferGeometry().setFromPoints(pts);
            const strandMat=new THREE.LineBasicMaterial({color:0x111111,transparent:true,opacity:0.50});
            const strand=new THREE.Line(strandGeo,strandMat);
            strand.userData.vxH=true; scene.add(strand); xmasObjects.push(strand);

            const total=pts.length-1;
            for(let i=0;i<=CFG.XMAS_BULB_COUNT;i++){
                const t=i/CFG.XMAS_BULB_COUNT;
                const idx=Math.min(Math.floor(t*total),total-1);
                const lp=pts[idx];
                const hexCol=BULB_COLORS[i%BULB_COLORS.length];
                const threeCol=new THREE.Color(hexCol);
                const seed=i*0.618+Math.random()*0.5;

                // Point light
                const pl=new THREE.PointLight(hexCol,2.2,CFG.XMAS_LIGHT_RADIUS,2.0);
                pl.position.copy(lp);
                pl.userData={vxXmas:true,seed,baseIntensity:2.2};
                scene.add(pl); xmasLights.push(pl); addedLights.push(pl);

                // Bulb sprite
                const bulbSprite=new THREE.Sprite(new THREE.SpriteMaterial({
                    map:new THREE.CanvasTexture(makeBulbCanvas(hexCol)),
                    transparent:true, opacity:0.95, depthWrite:false,
                    blending:THREE.AdditiveBlending, fog:false,
                }));
                bulbSprite.position.copy(lp);
                bulbSprite.scale.set(CFG.XMAS_BULB_SCALE,CFG.XMAS_BULB_SCALE,1);
                bulbSprite.userData={vxH:true,seed};
                scene.add(bulbSprite); xmasBulbs.push(bulbSprite); xmasObjects.push(bulbSprite);

                // Halo glow sprite (bigger, softer)
                const haloSprite=new THREE.Sprite(new THREE.SpriteMaterial({
                    map:new THREE.CanvasTexture(makeHaloCanvas(hexCol)),
                    transparent:true, opacity:0.0, depthWrite:false,
                    blending:THREE.AdditiveBlending, fog:false,
                }));
                haloSprite.position.copy(lp);
                haloSprite.scale.set(CFG.XMAS_HALO_SCALE,CFG.XMAS_HALO_SCALE,1);
                haloSprite.userData={vxH:true,seed};
                scene.add(haloSprite); xmasHalos.push(haloSprite); xmasObjects.push(haloSprite);
            }
            log(`Christmas lights: ${xmasLights.length} bulbs placed.`);
        }

        // ════════════════════════════════════════════════════════════════════════
        // ❄️  SNOW PARTICLES
        // ════════════════════════════════════════════════════════════════════════
        let snowSystem=null;
        function buildSnow(origin){
            if(snowSystem){scene.remove(snowSystem);snowSystem.geometry.dispose();snowSystem.material.dispose();snowSystem=null;}
            if(!CFG.SNOW_ENABLE) return;
            const N=CFG.SNOW_COUNT;
            const pos=new Float32Array(N*3), vel=new Float32Array(N), phase=new Float32Array(N);
            const RANGE=140, YMIN=-5, YMAX=90;
            for(let i=0;i<N;i++){
                pos[i*3+0]=origin.x+(Math.random()-.5)*RANGE;
                pos[i*3+1]=origin.y+YMIN+Math.random()*(YMAX-YMIN);
                pos[i*3+2]=origin.z+(Math.random()-.5)*RANGE;
                vel[i]=0.7+Math.random()*1.5;
                phase[i]=Math.random()*Math.PI*2;
            }
            const geo=new THREE.BufferGeometry();
            geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
            geo.userData={vel,phase,origin:{x:origin.x,y:origin.y+YMIN,z:origin.z},RANGE,YMAX:origin.y+YMAX};

            const sCv=document.createElement('canvas'); sCv.width=sCv.height=32;
            const sCtx=sCv.getContext('2d');
            const sg=sCtx.createRadialGradient(16,16,0,16,16,16);
            sg.addColorStop(0,'rgba(255,255,255,1)');
            sg.addColorStop(.4,'rgba(220,235,255,0.85)');
            sg.addColorStop(1,'rgba(180,210,255,0)');
            sCtx.fillStyle=sg; sCtx.fillRect(0,0,32,32);

            snowSystem=new THREE.Points(geo,new THREE.PointsMaterial({
                map:new THREE.CanvasTexture(sCv),size:1.0,sizeAttenuation:true,
                transparent:true,opacity:0.80,depthWrite:false,
                blending:THREE.AdditiveBlending,color:0xddeeff,
            }));
            snowSystem.userData.vxH=true;
            scene.add(snowSystem); xmasObjects.push(snowSystem);
        }

        // ── Helpers ───────────────────────────────────────────────────────────────
        let houseBounds=null;
        function detectHouseCentre(){
            const box=new THREE.Box3(); let found=false;
            scene.traverse(n=>{
                if(n.userData?.vxH||n.isSprite||n.isLight) return;
                if(n.isMesh&&n.geometry){
                    const b=new THREE.Box3().setFromObject(n);
                    if(b.max.y-b.min.y>5){box.union(b);found=true;}
                }
            });
            if(found){
                houseBounds=box;
                const c=new THREE.Vector3();
                box.getCenter(c);
                c.y=box.min.y; // use floor of house, not centre
                return c;
            }
            return new THREE.Vector3(0,0,0);
        }

        const _sv4=new THREE.Vector4();
        function updateSunUV(cam,sv){
            _sv4.set(sv.x*9000,sv.y*9000,sv.z*9000,1.0);
            _sv4.applyMatrix4(cam.matrixWorldInverse);
            _sv4.applyMatrix4(cam.projectionMatrix);
            if(Math.abs(_sv4.w)>.0001){
                U.sunUV.value.set(
                    Math.max(-.5,Math.min(1.5,_sv4.x/_sv4.w*.5+.5)),
                    Math.max(-.5,Math.min(1.5,_sv4.y/_sv4.w*.5+.5))
                );
            }
        }

        // ── Patched render ─────────────────────────────────────────────────────────
        rendererProto.render=function patchedRender(rs,rc){
            if(inPost||!enabled||rs!==scene) return baseRender.call(this,rs,rc);
            frameIdx++;
            cfgRendShadows(this);
            if(this.shadowMap&&frameIdx%CFG.SHADOW_UPDATE_INTERVAL===0) this.shadowMap.needsUpdate=true;
            ensureRT(this);
            updateSunUV(rc,U.sunDir.value);
            const prev=this.getRenderTarget?.()??null;
            const pAC=this.autoClear;
            this.setRenderTarget(rt); this.autoClear=true;
            baseRender.call(this,rs,rc);
            this.setRenderTarget(prev);
            U.tDiffuse.value=rt.texture;
            U.time.value=performance.now()*.001;
            U.cameraPos.value.copy(rc.position);
            U.camWorld.value.copy(rc.matrixWorld);
            const inv=U.projInv.value;
            if(rc.projectionMatrixInverse) inv.copy(rc.projectionMatrixInverse);
            else if(inv.copy&&inv.invert) inv.copy(rc.projectionMatrix).invert();
            else inv.getInverse?.(rc.projectionMatrix);
            inPost=true; this.autoClear=true;
            baseRender.call(this,postScene,postCam);
            this.autoClear=pAC; inPost=false;
        };

        // ── Math helpers ──────────────────────────────────────────────────────────
        const cl01 = v=>Math.max(0,Math.min(1,v));
        const sms  = (e0,e1,v)=>{const x=cl01((v-e0)/(e1-e0));return x*x*(3-2*x);};
        const lerp = (a,b,t)=>a+(b-a)*t;
        function mixC(c,n,d,t){c.setRGB(lerp(n[0],d[0],t),lerp(n[1],d[1],t),lerp(n[2],d[2],t));}

        // ── Day/night cycle ────────────────────────────────────────────────────────
        // Offset so we start at dusk (CYCLE_OFFSET=0.70 ≈ late evening)
        function getCycle(ts){
            const cyc=(((ts/CFG.DAY_LENGTH_SECONDS)+CFG.CYCLE_OFFSET)%1+1)%1;
            const ang=cyc*Math.PI*2;
            const elev=Math.sin(ang), travel=Math.cos(ang), cross=Math.sin(ang*.5+.8)*.18;
            const sv=new THREE.Vector3(travel*.72+cross,elev,travel*.48-cross*.6).normalize();
            const mv=sv.clone().multiplyScalar(-1);
            const dayAmt =sms(-0.06,0.32,elev);
            const twilAmt=(1-sms(.08,.44,Math.abs(elev)))*sms(-0.32,-0.04,elev)*(1-sms(.42,.94,dayAmt));
            const warmAmt=twilAmt+sms(-0.03,.10,elev)*(1-sms(.10,.40,elev))*.55;
            const nightAmt=1-dayAmt;

            // Split twilight: sunrise (sun rising) vs dusk (sun setting)
            const isRising  = Math.max(0, travel);
            const isSetting = Math.max(0,-travel);
            const sunriseAmt = twilAmt * isRising;
            const duskAmt    = twilAmt * isSetting;

            // HUD time-of-day label
            if(todEl){
                const h=Math.floor(cyc*24), m=Math.floor((cyc*24-h)*60);
                const pad=n=>String(n).padStart(2,'0');
                let label='';
                if     (cyc<0.06||cyc>0.94) label='🌑 Night';
                else if(cyc<0.18)            label='🌅 Sunrise';
                else if(cyc<0.42)            label='☀️ Morning';
                else if(cyc<0.58)            label='🌞 Day';
                else if(cyc<0.78)            label='🌇 Dawn';
                else                         label='🌑 Night';
                todEl.textContent=`${label} ${pad(h)}:${pad(m)}`;
            }
            return {sv,mv,dayAmt,twilAmt,warmAmt,nightAmt,sunriseAmt,duskAmt};
        }

        // ── Snow update ────────────────────────────────────────────────────────────
        function updateSnow(dt,t){
            if(!snowSystem) return;
            const geo=snowSystem.geometry, pos=geo.attributes.position.array;
            const {vel,phase,origin,RANGE,YMAX}=geo.userData;
            const N=pos.length/3;
            for(let i=0;i<N;i++){
                pos[i*3+1]-=vel[i]*dt*0.55;
                pos[i*3+0]+=Math.sin(t*.5+phase[i])*.018;
                pos[i*3+2]+=Math.cos(t*.4+phase[i])*.012;
                if(pos[i*3+1]<origin.y){
                    pos[i*3+1]=YMAX;
                    pos[i*3+0]=origin.x+(Math.random()-.5)*RANGE;
                    pos[i*3+2]=origin.z+(Math.random()-.5)*RANGE;
                }
            }
            geo.attributes.position.needsUpdate=true;
        }

        // ── Main animation loop ────────────────────────────────────────────────────
        let lastT=performance.now()*.001, houseOrigin=null, initDone=false;

        function animate(){
            if(!page.VortexRTX||page.VortexRTX.disposed) return;
            const t=performance.now()*.001;
            const dt=Math.min(t-lastT,.05); lastT=t;

            const chr=vortex.getCharacter?.();
            const pos=chr?.position??{x:0,y:28,z:0};
            const focusY=Math.max(8,pos.y+8);

            if(!initDone&&t>2.0){
                houseOrigin=detectHouseCentre();
                if(CFG.XMAS_ENABLE)  buildXmasLights(houseOrigin);
                if(CFG.SNOW_ENABLE)  buildSnow(houseOrigin);
                initDone=true;
                log('House origin:',houseOrigin);
            }

            const {sv,mv,dayAmt,twilAmt,warmAmt,nightAmt,sunriseAmt,duskAmt}=getCycle(t);
            const activeShadow=sms(.04,.28,sv.y)*dayAmt;

            // Positions
            glint.position.set(pos.x+Math.sin(t*.55)*15, pos.y+18+Math.sin(t*1.1)*2.5, pos.z+Math.cos(t*.48)*15);
            rimLight.position.set(pos.x-sv.x*125, focusY+120, pos.z-sv.z*125);
            fillLight.position.set(pos.x+sv.z*80, focusY+50, pos.z-sv.x*80);
            shadowTgt.position.set(pos.x,focusY,pos.z);
            shadowSun.position.set(pos.x+sv.x*200, focusY+Math.max(.08,sv.y)*200, pos.z+sv.z*200);
            moonLight.position.set(pos.x+mv.x*150, focusY+Math.max(.10,mv.y)*150, pos.z+mv.z*150);
            skyMesh.position.set(pos.x,focusY,pos.z);
            sunSprite.position.set(pos.x+sv.x*950, focusY+sv.y*950, pos.z+sv.z*950);
            moonSprite.position.set(pos.x+mv.x*950, focusY+mv.y*950, pos.z+mv.z*950);

            const sunSz=lerp(CFG.SUN_SIZE_DAY,CFG.SUN_SIZE_TWILIGHT,warmAmt*.70);
            sunSprite.scale.set(sunSz,sunSz,1);
            moonSprite.scale.set(130,130,1);
            sunSprite.material.opacity  =enabled?cl01(dayAmt*.65+warmAmt*.55):0;
            moonSprite.material.opacity =enabled?sms(.10,.55,nightAmt)*(1-twilAmt*.40)*.95:0;

            // Lights
            mixC(hemi.color,       [.04,.06,.14],[.72,.84,.96],dayAmt);
            mixC(hemi.groundColor, [.010,.014,.022],[.16,.28,.16],dayAmt);
            mixC(rimLight.color,   [.14,.18,.38],[.70,.84,1.00],dayAmt);
            mixC(shadowSun.color,  [.36,.28,.16],[1.,.88,.66],dayAmt);
            mixC(fillLight.color,  [.08,.12,.26],[1.,.95,.86],dayAmt);

            if(warmAmt>.02){
                rimLight.color.lerp(new THREE.Color(0xff8030),warmAmt*.52);
                shadowSun.color.lerp(new THREE.Color(0xff9438),warmAmt*.42);
                fillLight.color.lerp(new THREE.Color(0xff7020),warmAmt*.20);
            }

            hemi.intensity      =enabled?lerp(.06,.34,dayAmt)+twilAmt*.05:0;
            rimLight.intensity  =enabled?lerp(.04,.20,dayAmt)+warmAmt*.12:0;
            fillLight.intensity =enabled?lerp(.10,.30,dayAmt)+nightAmt*.14:0;
            glint.intensity     =enabled?lerp(.02,.46,dayAmt)+warmAmt*.16:0;
            shadowSun.intensity =enabled?0.82*activeShadow+warmAmt*.22:0;
            moonLight.intensity =enabled?0.32*sms(.18,.90,nightAmt)*(1-twilAmt*.55):0;
            nightFill.intensity =enabled?lerp(.50,.04,dayAmt):0;

            origLights.forEach(({light,intensity})=>{
                if(!enabled) return;
                if(light.isAmbientLight){
                    mixC(light.color,[.016,.022,.050],[.72,.78,.82],dayAmt);
                    if(warmAmt>.02) light.color.lerp(new THREE.Color(0xff7228),warmAmt*.22);
                    light.intensity=intensity*(lerp(.06,.26,dayAmt)+twilAmt*.06);
                } else if(light.isDirectionalLight){
                    mixC(light.color,[.08,.12,.24],[1.,.88,.68],dayAmt);
                    if(warmAmt>.02) light.color.lerp(new THREE.Color(0xff8220),warmAmt*.36);
                    light.intensity=intensity*(lerp(.02,.18,dayAmt)+warmAmt*.10);
                } else {
                    light.intensity=intensity*lerp(.05,.60,dayAmt);
                }
            });

            // Fog
            if(scene.fog){
                scene.fog.density=lerp(.014,.0020,dayAmt)+twilAmt*.0018;
                mixC(scene.fog.color,[.006,.010,.022],[.46,.62,.80],dayAmt);
                if(warmAmt>.02) scene.fog.color.lerp(new THREE.Color(0x9b4418),warmAmt*.32);
            }

            shadowTgt.updateMatrixWorld();
            moonLight.target.updateMatrixWorld();
            if(frameIdx%CFG.SHADOW_UPDATE_INTERVAL===0) shadowSun.shadow.needsUpdate=true;

            U.sunDir.value.copy(sv);
            U.moonDir.value.copy(mv);
            U.dayAmt.value=dayAmt;
            U.twilightAmt.value=twilAmt;
            U.sunriseAmt.value=sunriseAmt;
            U.duskAmt.value=duskAmt;
            U.nightAmt.value=nightAmt;

            // ── Christmas lights twinkle ───────────────────────────────────────
            if(CFG.XMAS_ENABLE&&initDone){
                xmasLights.forEach((l,i)=>{
                    const seed=l.userData.seed;
                    const twinkle=0.5+0.5*Math.sin(t*CFG.XMAS_TWINKLE_SPEED+seed*5.3)
                                  *Math.sin(t*1.9+seed*3.1);
                    const base=enabled?(0.8+2.0*twinkle):0;
                    l.intensity=base*nightAmt*2.2;
                });
                xmasBulbs.forEach((s,i)=>{
                    const seed=s.userData.seed;
                    const tw=0.5+0.5*Math.sin(t*CFG.XMAS_TWINKLE_SPEED+seed*5.3)
                              *Math.sin(t*1.9+seed*3.1);
                    const vis=enabled?(0.60+0.40*tw)*nightAmt:0;
                    s.material.opacity=vis;
                });
                xmasHalos.forEach((s,i)=>{
                    const seed=s.userData.seed;
                    const tw=0.5+0.5*Math.sin(t*CFG.XMAS_TWINKLE_SPEED+seed*5.3)
                              *Math.sin(t*1.9+seed*3.1);
                    const vis=enabled?(0.20+0.65*tw)*nightAmt:0;
                    s.material.opacity=vis;
                });
            }

            // ── Snow ──────────────────────────────────────────────────────────
            if(CFG.SNOW_ENABLE&&initDone) updateSnow(dt,t);

            page.requestAnimationFrame(animate);
        }

        // ── Quality presets ───────────────────────────────────────────────────────
        const PRESETS = {
            full: { renderScale:0.92, bloomStr:0.120, ssaoS:0.58, godRayStr:0.055, flareStr:0.30, aberStr:0.0014, snow:true,  xmas:true  },
            none: { renderScale:0.65, bloomStr:0.030, ssaoS:0.00, godRayStr:0.00,  flareStr:0.00, aberStr:0.00,   snow:false, xmas:false },
        };
        let activePreset = 'full';

        function applyPreset(name) {
            const p = PRESETS[name]; if (!p) return;
            activePreset = name;

            // Render scale — force RT rebuild on next frame
            CFG.POST_RENDER_SCALE = p.renderScale;
            rt = null;

            // Shader uniforms
            U.bloomStr.value  = p.bloomStr;
            U.ssaoS.value     = p.ssaoS;
            U.godRayStr.value = p.godRayStr;
            U.flareStr.value  = p.flareStr;
            U.aberStr.value   = p.aberStr;

            // Snow
            if (snowSystem) snowSystem.visible = enabled && p.snow;

            // Christmas lights
            xmasObjects.forEach(o => { o.visible = enabled && p.xmas; });
            xmasLights.forEach(l  => { l.visible  = enabled && p.xmas; });

            // Update button active styles
            ['full','none'].forEach(k => {
                const btn = document.getElementById('vrtx-q-' + k);
                if (!btn) return;
                const on = k === name;
                btn.style.opacity    = on ? '1'                     : '0.42';
                btn.style.background = on ? 'rgba(42,244,255,0.18)' : 'rgba(42,244,255,0.04)';
            });
            log('Quality preset:', name);
        }

        // Wire up HUD buttons
        ['full','none'].forEach(k => {
            const btn = document.getElementById('vrtx-q-' + k);
            if (btn) btn.addEventListener('click', e => { e.stopPropagation(); applyPreset(k); });
        });

        // ── Public API ────────────────────────────────────────────────────────────
        page.VortexRTX={
            get enabled(){ return enabled; },
            set enabled(val){
                enabled=!!val;
                addedLights.forEach(l=>{l.visible=enabled;});
                addedObjects.forEach(o=>{o.visible=enabled;});
                xmasObjects.forEach(o=>{o.visible=enabled;});
                if(gui) gui.style.display=enabled?'':'none';
                if(!enabled) restoreLights();
                log(enabled?'RTX ON.':'RTX OFF.');
            },
            toggle(){ this.enabled=!enabled; },
            setPreset(name){ applyPreset(name); },
            get preset(){ return activePreset; },
            get upgradedMaterials(){ return upgradedMats; },
            dispose(){
                this.disposed=true; enabled=false;
                rendererProto.render=baseRender;
                scene.add=origAdd;
                [...addedLights,...addedObjects,...xmasObjects].forEach(o=>scene.remove(o));
                restoreLights(); restoreShadows();
                rt?.dispose(); quadGeo.dispose(); quadMat.dispose();
                skyMesh.geometry.dispose(); skyMesh.material.dispose();
                [sunSprite,moonSprite].forEach(s=>{s.material.map?.dispose();s.material.dispose();});
                if(snowSystem){snowSystem.geometry.dispose();snowSystem.material.dispose();}
                if(gui) gui.remove();
                log('RTX v7 disposed.');
            },
        };

        animate();
        log('RTX v7.0 installed ✓',{mats:upgradedMats,lights:addedLights.length,xmas:xmasLights.length});
        return {ok:true};
    }

    // ─── Keyboard toggle ──────────────────────────────────────────────────────────
    page.addEventListener('keydown',e=>{
        if(isTyping(e.target)) return;
        if(e.code===CFG.TOGGLE_KEY){ e.preventDefault(); page.VortexRTX?.toggle(); }
    },true);

    // ─── Boot ─────────────────────────────────────────────────────────────────────
    waitForVortex()
        .then(()=>{ if(CFG.AUTO_ENABLE) installShader(); })
        .catch(err=>console.warn('[VortexRTX v6] Boot failed:',err));
})();

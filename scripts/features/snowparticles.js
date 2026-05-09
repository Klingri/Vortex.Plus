(function(){
    document.getElementById('snow-particles-overlay')?.remove();
    if(window.__snowStop) window.__snowStop();

    const V = window._vortex;
    const useThree = !!(V && V.scene && window.THREE);

    if(useThree){
        const THREE = window.THREE;
        const scene = V.scene;
        const char = V.getCharacter?.();

        const COUNT = 600;
        const AREA = 40;
        const HEIGHT = 25;

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(COUNT * 3);
        const data = [];

        for(let i=0;i<COUNT;i++){
            data.push({
                x: (Math.random()-0.5) * AREA,
                y: Math.random() * HEIGHT,
                z: (Math.random()-0.5) * AREA,
                fall: 1.2 + Math.random() * 1.6,
                drift: Math.random() * Math.PI * 2,
                driftSpeed: 0.3 + Math.random() * 0.7,
                driftAmp: 0.2 + Math.random() * 0.4
            });
            pos[i*3] = data[i].x;
            pos[i*3+1] = data[i].y;
            pos[i*3+2] = data[i].z;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,32,32);
        const tex = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({
            map: tex,
            color: 0xffffff,
            size: 0.18,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        scene.add(points);

        let raf, last = performance.now(), running = true;
        const half = AREA * 0.5;

        function tick(now){
            if(!running) return;
            raf = requestAnimationFrame(tick);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const cx = char ? char.position.x : 0;
            const cz = char ? char.position.z : 0;
            const cy = char ? char.position.y : 0;

            for(let i=0;i<COUNT;i++){
                const d = data[i];
                d.y -= d.fall * dt;
                d.drift += d.driftSpeed * dt;
                d.x += Math.sin(d.drift) * d.driftAmp * dt;
                d.z += Math.cos(d.drift * 0.8) * d.driftAmp * dt;

                const rx = d.x - cx;
                const rz = d.z - cz;
                if(rx > half) d.x -= AREA;
                else if(rx < -half) d.x += AREA;
                if(rz > half) d.z -= AREA;
                else if(rz < -half) d.z += AREA;

                if(d.y < cy - 1){
                    d.y = cy + HEIGHT - Math.random() * 4;
                    d.x = cx + (Math.random()-0.5) * AREA;
                    d.z = cz + (Math.random()-0.5) * AREA;
                }

                pos[i*3] = d.x;
                pos[i*3+1] = d.y;
                pos[i*3+2] = d.z;
            }
            geo.attributes.position.needsUpdate = true;
        }
        raf = requestAnimationFrame(tick);

        window.__snowStop = () => {
            running = false;
            cancelAnimationFrame(raf);
            scene.remove(points);
            geo.dispose();
            mat.dispose();
            tex.dispose();
            window.__snowStop = null;
        };
        return;
    }

    const overlay = document.createElement('canvas');
    overlay.id = 'snow-particles-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;';
    document.body.appendChild(overlay);
    const ctx = overlay.getContext('2d');

    function resize(){
        overlay.width = window.innerWidth * devicePixelRatio;
        overlay.height = window.innerHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 250;
    const flakes = [];
    for(let i=0;i<COUNT;i++){
        flakes.push({
            x: Math.random() * overlay.width,
            y: Math.random() * overlay.height,
            r: 1 + Math.random() * 3.5,
            vy: 30 + Math.random() * 60,
            vx: (Math.random()-0.5) * 20,
            drift: Math.random() * Math.PI * 2,
            driftSpeed: 0.5 + Math.random() * 1.2,
            opacity: 0.5 + Math.random() * 0.5
        });
    }

    let raf, last = performance.now(), running = true;
    function tick(now){
        if(!running) return;
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        for(let i=0;i<flakes.length;i++){
            const f = flakes[i];
            f.drift += f.driftSpeed * dt;
            f.y += f.vy * dt * devicePixelRatio;
            f.x += (f.vx + Math.sin(f.drift) * 25) * dt * devicePixelRatio;
            if(f.y > overlay.height + 10){
                f.y = -10;
                f.x = Math.random() * overlay.width;
            }
            if(f.x > overlay.width + 10) f.x = -10;
            else if(f.x < -10) f.x = overlay.width + 10;

            ctx.beginPath();
            const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
            grad.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
            grad.addColorStop(0.4, `rgba(255,255,255,${f.opacity * 0.4})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    raf = requestAnimationFrame(tick);

    window.__snowStop = () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        overlay.remove();
        window.__snowStop = null;
    };
})();
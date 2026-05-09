(() => {
    if (window.__fovGui) return
    window.__fovGui = 1

    const el = document.createElement('div')
    el.style.cssText = `
        position:fixed;
        right:12px;
        bottom:12px;
        width:150px;
        padding:10px;
        background:rgba(0,0,0,.55);
        color:#ccc;
        font:12px monospace;
        z-index:999999;
    `

    const label = document.createElement('div')

    const s = document.createElement('input')
    s.type = 'range'
    s.min = 20
    s.max = 160
    s.value = camera.fov
    s.style.width = '100%'

    const u = () => {
        camera.fov = +s.value
        camera.updateProjectionMatrix()
        label.textContent = `fov: ${camera.fov|0}`
    }

    s.oninput = u
    u()

    el.append(label, s)
    document.body.appendChild(el)
})()
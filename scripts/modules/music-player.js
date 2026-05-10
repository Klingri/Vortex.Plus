// Created by Hayden.
(function () {
    const STORAGE_KEY = 'vortex_player_state';

    const player = {
        audio: null,
        isPlaying: false,
        isLooping: false,
        currentFile: null,
        currentFileData: null,
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        isExpanded: true,
        saveTimer: null,

        init() {
            this.audio = new Audio();
            this.createUI();
            this.attachEvents();
            this.restoreState();

            // Save state periodically while playing.
            setInterval(() => this.saveState(), 1000);
        },

        createUI() {
            // Main player container.
            const playerContainer = document.createElement('div');
            playerContainer.id = 'vortex-dvd-player';
            playerContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 300px;
                background: #1a1a1a;
                border: 2px solid #333;
                border-radius: 0;
                box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.8);
                font-family: 'Courier New', monospace;
                z-index: 10000;
                cursor: grab;
                user-select: none;
                overflow: hidden;
            `;

            // Header with title and toggle.
            const header = document.createElement('div');
            header.style.cssText = `
                background: #222;
                color: #ccc;
                padding: 8px 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: normal;
                cursor: grab;
                border-bottom: 1px solid #333;
                font-size: 12px;
            `;
            header.innerHTML = `
                <span style="letter-spacing: 1px;">[ PLAYER ]</span>
                <button id="player-toggle" style="
                    background: none;
                    border: 1px solid #333;
                    color: #ccc;
                    font-size: 12px;
                    cursor: pointer;
                    padding: 2px 6px;
                    font-family: 'Courier New', monospace;
                ">_</button>
            `;

            // Display Area.
            const display = document.createElement('div');
            display.id = 'player-display';
            display.style.cssText = `
                background: #111;
                border-bottom: 1px solid #333;
                padding: 8px;
                color: #888;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.4;
                min-height: 60px;
            `;
            display.innerHTML = `
                <div id="track-name" style="color: #999; margin-bottom: 4px; word-break: break-all;">-- No Track --</div>
                <div id="time-display" style="font-size: 10px; color: #666;">00:00 / 00:00</div>
            `;

            // Progress bar.
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                background: #0d0d0d;
                height: 3px;
                margin: 6px 8px;
                border: 1px solid #2a2a2a;
                cursor: pointer;
                overflow: hidden;
            `;
            const progressFill = document.createElement('div');
            progressFill.id = 'progress-fill';
            progressFill.style.cssText = `
                background: #555;
                height: 100%;
                width: 0%;
            `;
            progressBar.appendChild(progressFill);

            // Controls Container.
            const controlsContainer = document.createElement('div');
            controlsContainer.id = 'controls-container';
            controlsContainer.style.cssText = `
                padding: 6px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            `;

            // File input (hidden).
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'music-file-input';
            fileInput.accept = 'audio/*';
            fileInput.style.display = 'none';

            // Select file button.
            const selectBtn = document.createElement('button');
            selectBtn.innerHTML = '[Load]';
            selectBtn.style.cssText = `
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 4px 6px;
                border-radius: 0;
                cursor: pointer;
                font-size: 10px;
                font-family: 'Courier New', monospace;
                text-transform: lowercase;
            `;
            selectBtn.onmouseover = () => selectBtn.style.color = '#ccc';
            selectBtn.onmouseout = () => selectBtn.style.color = '#888';
            selectBtn.onclick = () => fileInput.click();

            // Playback Controls.
            const buttonRow1 = document.createElement('div');
            buttonRow1.style.cssText = 'display: flex; gap: 3px;';

            const playBtn = document.createElement('button');
            playBtn.id = 'play-btn';
            playBtn.innerHTML = '[▶]';
            playBtn.style.cssText = `
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 4px;
                border-radius: 0;
                cursor: pointer;
                font-size: 10px;
                font-family: 'Courier New', monospace;
            `;
            playBtn.onmouseover = () => playBtn.style.color = '#ccc';
            playBtn.onmouseout = () => playBtn.style.color = '#888';

            const pauseBtn = document.createElement('button');
            pauseBtn.id = 'pause-btn';
            pauseBtn.innerHTML = '[⏸]';
            pauseBtn.style.cssText = `
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 4px;
                border-radius: 0;
                cursor: pointer;
                font-size: 10px;
                font-family: 'Courier New', monospace;
            `;
            pauseBtn.onmouseover = () => pauseBtn.style.color = '#ccc';
            pauseBtn.onmouseout = () => pauseBtn.style.color = '#888';

            const stopBtn = document.createElement('button');
            stopBtn.id = 'stop-btn';
            stopBtn.innerHTML = '[■]';
            stopBtn.style.cssText = `
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 4px;
                border-radius: 0;
                cursor: pointer;
                font-size: 10px;
                font-family: 'Courier New', monospace;
            `;
            stopBtn.onmouseover = () => stopBtn.style.color = '#ccc';
            stopBtn.onmouseout = () => stopBtn.style.color = '#888';

            buttonRow1.appendChild(playBtn);
            buttonRow1.appendChild(pauseBtn);
            buttonRow1.appendChild(stopBtn);

            // Loop and Volume Controls.
            const buttonRow2 = document.createElement('div');
            buttonRow2.style.cssText = 'display: flex; gap: 3px;';

            const loopBtn = document.createElement('button');
            loopBtn.id = 'loop-btn';
            loopBtn.innerHTML = '[Loop]';
            loopBtn.style.cssText = `
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 4px;
                border-radius: 0;
                cursor: pointer;
                font-size: 10px;
                font-family: 'Courier New', monospace;
            `;
            loopBtn.onmouseover = () => loopBtn.style.color = '#ccc';
            loopBtn.onmouseout = () => loopBtn.style.color = '#888';

            const volumeLabel = document.createElement('label');
            volumeLabel.style.cssText = 'flex: 1; display: flex; align-items: center; gap: 3px; font-size: 9px; color: #666;';
            volumeLabel.innerHTML = 'vol';
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.id = 'volume-slider';
            volumeSlider.min = '0';
            volumeSlider.max = '100';
            volumeSlider.value = '70';
            volumeSlider.style.cssText = 'flex: 1; cursor: pointer; height: 3px;';
            volumeLabel.appendChild(volumeSlider);

            buttonRow2.appendChild(loopBtn);
            buttonRow2.appendChild(volumeLabel);

            // Assemble controls Container.
            controlsContainer.appendChild(selectBtn);
            controlsContainer.appendChild(buttonRow1);
            controlsContainer.appendChild(buttonRow2);

            // Assemble Player.
            playerContainer.appendChild(header);
            playerContainer.appendChild(display);
            playerContainer.appendChild(progressBar);
            playerContainer.appendChild(controlsContainer);
            playerContainer.appendChild(fileInput);

            // Store references.
            this.playerContainer = playerContainer;
            this.display = display;
            this.controls = controlsContainer;
            this.header = header;

            document.body.appendChild(playerContainer);
        },

        attachEvents() {
            const self = this;

            // Dragging.
            this.header.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                self.isDragging = true;
                self.offsetX = e.clientX - self.playerContainer.getBoundingClientRect().left;
                self.offsetY = e.clientY - self.playerContainer.getBoundingClientRect().top;
                self.playerContainer.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (self.isDragging) {
                    self.playerContainer.style.left = (e.clientX - self.offsetX) + 'px';
                    self.playerContainer.style.bottom = 'auto';
                    self.playerContainer.style.top = (e.clientY - self.offsetY) + 'px';
                    self.saveState();
                }
            });

            document.addEventListener('mouseup', () => {
                if (self.isDragging) {
                    self.isDragging = false;
                    self.playerContainer.style.cursor = 'grab';
                }
            });

            // Toggle expand/collapse.
            document.getElementById('player-toggle').addEventListener('click', () => {
                self.isExpanded = !self.isExpanded;
                const toggle = document.getElementById('player-toggle');
                toggle.innerHTML = self.isExpanded ? '_' : '+';
                self.controls.style.display = self.isExpanded ? 'flex' : 'none';
                self.display.style.display = self.isExpanded ? 'block' : 'none';
                document.getElementById('progress-fill').parentElement.style.display = self.isExpanded ? 'block' : 'none';
            });

            // File Selection.
            document.getElementById('music-file-input').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        self.currentFileData = evt.target.result;
                        self.currentFile = file.name;
                        const url = URL.createObjectURL(file);
                        self.audio.src = url;
                        document.getElementById('track-name').textContent = file.name;
                        document.getElementById('track-name').style.color = '#999';
                        self.saveState();
                    };
                    reader.readAsArrayBuffer(file);
                }
            });

            // Playback Controls.
            document.getElementById('play-btn').addEventListener('click', () => {
                if (self.currentFile) {
                    self.audio.play();
                    self.isPlaying = true;
                    document.getElementById('play-btn').style.opacity = '0.5';
                    self.saveState();
                }
            });

            document.getElementById('pause-btn').addEventListener('click', () => {
                self.audio.pause();
                self.isPlaying = false;
                document.getElementById('play-btn').style.opacity = '1';
                self.saveState();
            });

            document.getElementById('stop-btn').addEventListener('click', () => {
                self.audio.pause();
                self.audio.currentTime = 0;
                self.isPlaying = false;
                document.getElementById('play-btn').style.opacity = '1';
                document.getElementById('progress-fill').style.width = '0%';
                document.getElementById('time-display').textContent = '00:00 / 00:00';
                self.saveState();
            });

            // Loop Toggle.
            document.getElementById('loop-btn').addEventListener('click', () => {
                self.isLooping = !self.isLooping;
                const loopBtn = document.getElementById('loop-btn');
                self.audio.loop = self.isLooping;
                loopBtn.innerHTML = self.isLooping ? '[Loop On]' : '[Loop]';
                loopBtn.style.color = self.isLooping ? '#ccc' : '#888';
                self.saveState();
            });

            // Volume Control.
            document.getElementById('volume-slider').addEventListener('input', (e) => {
                self.audio.volume = e.target.value / 100;
                self.saveState();
            });

            // Progress bar Click.
            const progressBar = document.querySelector('#progress-fill').parentElement;
            progressBar.addEventListener('click', (e) => {
                if (self.currentFile) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    self.audio.currentTime = percent * self.audio.duration;
                    self.saveState();
                }
            });

            // Update progress and Time Display.
            this.audio.addEventListener('timeupdate', () => {
                const percent = (self.audio.currentTime / self.audio.duration) * 100;
                document.getElementById('progress-fill').style.width = percent + '%';

                const current = self.formatTime(self.audio.currentTime);
                const duration = self.formatTime(self.audio.duration);
                document.getElementById('time-display').textContent = `${current} / ${duration}`;
            });

            this.audio.addEventListener('ended', () => {
                self.isPlaying = false;
                document.getElementById('play-btn').style.opacity = '1';
                self.saveState();
            });
        },

        saveState() {
            try {
                chrome.storage.local.set({
                    [STORAGE_KEY]: {
                        fileName: this.currentFile,
                        currentTime: this.audio.currentTime,
                        isLooping: this.isLooping,
                        isPlaying: this.isPlaying,
                        volume: this.audio.volume,
                        position: {
                            left: this.playerContainer.style.left,
                            top: this.playerContainer.style.top
                        }
                    }
                });
            } catch (e) {
                console.error('Failed to save player state:', e);
            }
        },

        restoreState() {
            try {
                chrome.storage.local.get([STORAGE_KEY], (result) => {
                    const state = result[STORAGE_KEY];
                    if (state) {
                        if (state.position && state.position.left) {
                            this.playerContainer.style.left = state.position.left;
                            this.playerContainer.style.top = state.position.top;
                        }
                        if (state.volume) {
                            this.audio.volume = state.volume;
                            document.getElementById('volume-slider').value = state.volume * 100;
                        }
                        if (state.isLooping) {
                            this.isLooping = true;
                            this.audio.loop = true;
                            document.getElementById('loop-btn').innerHTML = '[Loop On]';
                            document.getElementById('loop-btn').style.color = '#ccc';
                        }
                    }
                });
            } catch (e) {
                console.error('Failed to restore player state:', e);
            }
        },

        formatTime(seconds) {
            if (isNaN(seconds)) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    // Initialize when DOM is ready.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => player.init());
    } else {
        player.init();
    }
})();

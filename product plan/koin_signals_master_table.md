
# KOIN - MASTER SIGNALS TABLE
## Lista Completa de Señales Browser Fingerprint

### TABLA MASTER: Todas las Señales Evaluadas (180 Señales)

| ID | Señal | Categoría | Vector(es) | Permiso | JS? | Impacto | Dificultad | Iteración | Método | Ejemplo |
|----|-------|-----------|------------|---------|-----|---------|------------|-----------|--------|---------|
| **ITERACIÓN 1 - ALTO IMPACTO + FÁCIL (25 SEÑALES)** |
| S001 | Mouse Movement Entropy | Behavioral | BOT_DETECTION | None | ✅ | High | Easy | 1 | Event listeners | Shannon entropy: 4.2 (human) vs 1.8 (bot) |
| S002 | Keyboard Timing Patterns | Behavioral | BOT_DETECTION | None | ✅ | High | Easy | 1 | Event timing | Keystroke intervals: 150ms±50 (human) vs 45ms±5 (bot) |
| S003 | WebGL Fingerprint | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | WebGL context | GPU: "ANGLE (Intel, Intel(R) Graphics)" |
| S004 | Audio Context Fingerprint | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | Web Audio API | Sample rate: 44100, channels: 2, hash: a1b2c3... |
| S005 | Canvas Text Rendering | Graphics | DEVICE_INTEGRITY, BROWSER_SPOOFING | None | ✅ | High | Easy | 1 | Canvas API | Text metrics hash: e4f5g6h7... |
| S006 | Speech Synthesis Voices | System | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | SpeechSynthesis | Voices: ["Microsoft Zira", "Google US English"] |
| S007 | Media Devices List | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | MediaDevices API | Audio inputs: 2, video inputs: 1 |
| S008 | WebDriver Properties | Automation | BROWSER_AUTOMATION | None | ✅ | High | Easy | 1 | Navigator.webdriver | webdriver: true/false/undefined |
| S009 | Canvas Geometry Rendering | Graphics | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | Canvas 2D | Geometry hash: f7g8h9i0... |
| S010 | WebGL Extensions List | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | WebGL extensions | ["ANGLE_instanced_arrays", "OES_texture_float"] |
| S011 | Screen Metrics Complete | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Easy | 1 | Screen API | 1920x1080, pixelDepth: 32, colorDepth: 24 |
| S012 | Timezone Offset | Location | LOCATION_TAMPERING | None | ✅ | Medium | Easy | 1 | Date API | -180 (GMT-3 Buenos Aires) |
| S013 | Language Preferences | System | DEVICE_INTEGRITY | None | ✅ | Medium | Easy | 1 | Navigator.languages | ["es-AR", "es", "en-US", "en"] |
| S014 | Platform Information | System | BROWSER_SPOOFING | None | ✅ | Medium | Easy | 1 | Navigator.platform | "Win32", "MacIntel", "Linux x86_64" |
| S015 | CPU Architecture | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Easy | 1 | Navigator.platform | "Win32" → Intel, "Linux aarch64" → ARM |
| S016 | Memory Information | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Easy | 1 | Navigator.deviceMemory | 8GB, 16GB, undefined (not supported) |
| S017 | Hardware Concurrency | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Easy | 1 | Navigator.hardwareConcurrency | 8 cores, 16 cores |
| S018 | User Agent Analysis | System | BROWSER_SPOOFING | None | ✅ | Medium | Easy | 1 | Navigator.userAgent | Parse browser/OS versions |
| S019 | Touch Support Detection | Hardware | MOBILE_EMULATION | None | ✅ | Medium | Easy | 1 | Touch events | maxTouchPoints: 0 (desktop), 10 (mobile) |
| S020 | Automation Framework Detection | Automation | BROWSER_AUTOMATION | None | ✅ | High | Easy | 1 | Window properties | window.callPhantom, window._phantom |
| S021 | Connection Type | Network | NETWORK_ANONYMIZATION | None | ✅ | Low | Easy | 1 | Navigator.connection | "wifi", "cellular", "ethernet" |
| S022 | Do Not Track Setting | Privacy | SESSION_TRUST | None | ✅ | Low | Easy | 1 | Navigator.doNotTrack | "1", "0", null |
| S023 | Cookie Support | Privacy | SESSION_TRUST | None | ✅ | Medium | Easy | 1 | Document.cookie | enabled/disabled |
| S024 | Local Storage Support | Privacy | SESSION_TRUST | None | ✅ | Medium | Easy | 1 | Window.localStorage | available/blocked |
| S025 | Session Storage Support | Privacy | SESSION_TRUST | None | ✅ | Medium | Easy | 1 | Window.sessionStorage | available/blocked |
| **ITERACIÓN 2 - ALTO IMPACTO + MEDIO (20 SEÑALES)** |
| S026 | Installed Fonts Detection | System | BROWSER_SPOOFING, DEVICE_INTEGRITY | None | ✅ | High | Medium | 2 | Font measurement | ["Arial", "Times", "Helvetica", "custom_font_xyz"] |
| S027 | WebRTC Local IPs | Network | NETWORK_ANONYMIZATION | None | ✅ | High | Medium | 2 | WebRTC STUN | Internal IPs: ["192.168.1.100", "10.0.0.15"] |
| S028 | Geolocation Capability | Location | LOCATION_TAMPERING | Prompt | ⚠️ | High | Medium | 2 | Geolocation API | Available/blocked, accuracy level |
| S029 | Automation Tools Detection | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | Property inspection | Selenium: window.webdriver, Puppeteer artifacts |
| S030 | Headless Browser Detection | Automation | BROWSER_SPOOFING | None | ✅ | High | Medium | 2 | Feature inconsistencies | Missing APIs, render differences |
| S031 | Canvas Advanced Fingerprint | Graphics | DEVICE_INTEGRITY | None | ✅ | High | Medium | 2 | Complex rendering | Emoji rendering, font smoothing |
| S032 | WebGL Renderer Details | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Medium | 2 | WebGL params | Vendor: "Intel", renderer details |
| S033 | Audio Processing Latency | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 2 | Audio timing | Base latency: 0.01s, output latency: 0.02s |
| S034 | Plugin Enumeration | System | BROWSER_SPOOFING | None | ✅ | Medium | Medium | 2 | Navigator.plugins | Flash, PDF viewer, extensions |
| S035 | MIME Types Support | System | BROWSER_SPOOFING | None | ✅ | Medium | Medium | 2 | Navigator.mimeTypes | Supported file types |
| S036 | Mouse Acceleration Patterns | Behavioral | BOT_DETECTION | None | ✅ | High | Medium | 2 | Mouse tracking | Human: variable, bot: linear |
| S037 | Click Timing Analysis | Behavioral | BOT_DETECTION | None | ✅ | High | Medium | 2 | Click patterns | Double-click timing, rhythm |
| S038 | Scroll Behavior Analysis | Behavioral | BOT_DETECTION | None | ✅ | Medium | Medium | 2 | Scroll events | Smooth vs programmatic scrolling |
| S039 | Focus/Blur Event Patterns | Behavioral | BOT_DETECTION | None | ✅ | Medium | Medium | 2 | Window events | Tab switching patterns |
| S040 | Network Connection Speed | Network | NETWORK_ANONYMIZATION | None | ✅ | Medium | Medium | 2 | Connection API | downlink: 10Mbps, effectiveType: "4g" |
| S041 | WebAssembly Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 2 | WASM detection | typeof WebAssembly |
| S042 | Crypto API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 2 | Crypto detection | window.crypto availability |
| S043 | IndexedDB Capability | Privacy | SESSION_TRUST | None | ✅ | Medium | Medium | 2 | IDB support | Available/blocked |
| S044 | WebSQL Support | Privacy | SESSION_TRUST | None | ✅ | Low | Medium | 2 | WebSQL detection | Deprecated feature support |
| S045 | Service Worker Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 2 | SW registration | navigator.serviceWorker |
| **ITERACIÓN 3 - ALTO IMPACTO + DIFÍCIL (25 SEÑALES)** |
| S046 | Developer Tools Detection | Environment | ENVIRONMENT_MANIPULATION | None | ✅ | High | Hard | 3 | Timing/debugging | Console open detection, debugger timing |
| S047 | Clipboard Access Behavior | Behavioral | BOT_DETECTION | Prompt | ⚠️ | High | Hard | 3 | Clipboard API | Permission state, access patterns |
| S048 | Advanced Behavioral Biometrics | Behavioral | BOT_DETECTION | None | ✅ | High | Hard | 3 | ML analysis | Keystroke dynamics, mouse curves |
| S049 | Anti-Fingerprinting Detection | Privacy | FINGERPRINT_RESISTANCE | None | ✅ | High | Hard | 3 | Fingerprint analysis | Randomization patterns, blocking |
| S050 | WebAssembly Fingerprinting | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Hard | 3 | WASM execution | Performance, capabilities |
| S051 | Timing Attack Resistance | Security | ENVIRONMENT_MANIPULATION | None | ✅ | High | Hard | 3 | Performance timing | High-resolution time availability |
| S052 | Memory Usage Patterns | System | DEVICE_INTEGRITY | None | ✅ | Medium | Hard | 3 | Performance API | Memory allocation patterns |
| S053 | GPU Performance Profiling | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Hard | 3 | WebGL benchmarks | Rendering performance |
| S054 | Network Stack Analysis | Network | NETWORK_ANONYMIZATION | None | ✅ | High | Hard | 3 | Request analysis | HTTP/2 support, TLS version |
| S055 | CSS Feature Detection | System | BROWSER_SPOOFING | None | ✅ | Medium | Hard | 3 | CSS support | Advanced CSS features |
| S056 | JavaScript Engine Quirks | System | BROWSER_SPOOFING | None | ✅ | Medium | Hard | 3 | Engine detection | V8, SpiderMonkey, JavaScriptCore |
| S057 | DOM Manipulation Speed | Behavioral | BOT_DETECTION | None | ✅ | High | Hard | 3 | Performance timing | DOM operation speed |
| S058 | Event Propagation Patterns | Behavioral | BOT_DETECTION | None | ✅ | Medium | Hard | 3 | Event analysis | Bubble vs capture timing |
| S059 | Canvas Pixel Manipulation | Graphics | PRIVACY_EVASION | None | ✅ | High | Hard | 3 | Pixel analysis | Canvas poisoning detection |
| S060 | WebGL Context Loss | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Hard | 3 | Context events | GPU reset behavior |
| S061 | Audio Context State Changes | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Hard | 3 | Audio events | Suspend/resume patterns |
| S062 | Permission API States | Privacy | SESSION_TRUST | None | ✅ | Medium | Hard | 3 | Permissions query | Notification, geolocation states |
| S063 | WebRTC Data Channel Behavior | Network | NETWORK_ANONYMIZATION | None | ✅ | High | Hard | 3 | RTC analysis | Connection establishment |
| S064 | Shared Array Buffer Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Hard | 3 | SAB detection | Security-sensitive feature |
| S065 | Cross-Origin Policy Behavior | Security | ENVIRONMENT_MANIPULATION | None | ✅ | Medium | Hard | 3 | CORS analysis | Policy enforcement |
| S066 | Resource Loading Patterns | Behavioral | BOT_DETECTION | None | ✅ | High | Hard | 3 | Resource timing | Loading speed patterns |
| S067 | Error Handling Behavior | System | BROWSER_SPOOFING | None | ✅ | Medium | Hard | 3 | Error analysis | Stack trace differences |
| S068 | Memory Pressure Simulation | System | DEVICE_INTEGRITY | None | ✅ | Low | Hard | 3 | Memory stress | System response |
| S069 | WebXR Device Support | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Hard | 3 | XR detection | VR/AR capabilities |
| S070 | Pointer Events Analysis | Behavioral | MOBILE_EMULATION | None | ✅ | Medium | Hard | 3 | Pointer API | Mouse vs touch vs pen |
| **ITERACIÓN 4 - MEDIO IMPACTO + FÁCIL (15 SEÑALES)** |
| S071 | Battery Status Information | Hardware | DEVICE_INTEGRITY | None | ❌ | Medium | Easy | 4 | Battery API (deprecated) | Level: 0.8, charging: true |
| S072 | Vibration API Support | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Vibration detection | navigator.vibrate availability |
| S073 | Ambient Light Sensor | Hardware | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | Light sensor | Deprecated/restricted |
| S074 | Proximity Sensor | Hardware | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | Proximity detection | Deprecated |
| S075 | Gamepad API Support | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Gamepad detection | Connected controllers |
| S076 | Web Bluetooth Support | System | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | Bluetooth API | navigator.bluetooth |
| S077 | Web USB Support | System | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | USB API | navigator.usb |
| S078 | Payment Request Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | PaymentRequest | API availability |
| S079 | Web Share API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Share detection | navigator.share |
| S080 | Notification Permission | Privacy | SESSION_TRUST | None | ✅ | Medium | Easy | 4 | Notification API | Permission state |
| S081 | Fullscreen API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Fullscreen detection | document.fullscreenEnabled |
| S082 | Picture-in-Picture Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | PiP detection | document.pictureInPictureEnabled |
| S083 | Web Locks API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Locks detection | navigator.locks |
| S084 | Wake Lock API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Wake lock detection | navigator.wakeLock |
| S085 | Web Serial Support | System | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | Serial API | navigator.serial |
| **ITERACIÓN 5 - MEDIO IMPACTO + MEDIO (20 SEÑALES)** |
| S086 | Motion Sensor Analysis | Hardware | DEVICE_INTEGRITY, MOBILE_EMULATION | Prompt | ⚠️ | Medium | Medium | 5 | DeviceMotion | Accelerometer patterns |
| S087 | Orientation Sensor Analysis | Hardware | DEVICE_INTEGRITY, MOBILE_EMULATION | Prompt | ⚠️ | Medium | Medium | 5 | DeviceOrientation | Gyroscope patterns |
| S088 | Touch Event Consistency | Behavioral | MOBILE_EMULATION | None | ✅ | Medium | Medium | 5 | Touch analysis | Touch vs mouse simulation |
| S089 | Screen Orientation Behavior | Hardware | MOBILE_EMULATION | None | ✅ | Medium | Medium | 5 | Screen API | Orientation lock, rotation |
| S090 | Privacy Tool Detection Advanced | Privacy | FINGERPRINT_RESISTANCE | None | ✅ | High | Medium | 5 | Privacy analysis | uBlock, Privacy Badger, Tor |
| S091 | Extension Detection Patterns | Privacy | FINGERPRINT_RESISTANCE | None | ✅ | Medium | Medium | 5 | Extension analysis | Ad blockers, privacy tools |
| S092 | Virtual Machine Indicators | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Medium | 5 | VM detection | Hardware inconsistencies |
| S093 | Container Detection | Environment | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | Container analysis | Docker, LXC indicators |
| S094 | Sandboxing Detection | Security | ENVIRONMENT_MANIPULATION | None | ✅ | Medium | Medium | 5 | Sandbox analysis | Restricted environment |
| S095 | Browser Process Analysis | System | BROWSER_SPOOFING | None | ✅ | Medium | Medium | 5 | Process detection | Multiple processes |
| S096 | Memory Allocation Patterns | System | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | Memory analysis | Allocation behavior |
| S097 | CPU Temperature Simulation | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Thermal analysis | Performance throttling |
| S098 | Network Interface Analysis | Network | NETWORK_ANONYMIZATION | None | ✅ | Medium | Medium | 5 | Interface detection | WiFi, cellular, VPN |
| S099 | DNS Resolution Patterns | Network | NETWORK_ANONYMIZATION | None | ✅ | Medium | Medium | 5 | DNS analysis | Resolution timing |
| S100 | Certificate Pinning Behavior | Network | NETWORK_ANONYMIZATION | None | ✅ | Medium | Medium | 5 | TLS analysis | Certificate validation |
| S101 | HTTP Header Consistency | Network | BROWSER_SPOOFING | None | ❌ | High | Medium | 5 | Header analysis | Server-side required |
| S102 | WebSocket Behavior Analysis | Network | BOT_DETECTION | None | ✅ | Medium | Medium | 5 | WebSocket patterns | Connection behavior |
| S103 | CORS Preflight Behavior | Network | BROWSER_SPOOFING | None | ❌ | Medium | Medium | 5 | CORS analysis | Server-side required |
| S104 | Cache Behavior Analysis | Privacy | SESSION_TRUST | None | ✅ | Medium | Medium | 5 | Cache patterns | Storage behavior |
| S105 | History API Manipulation | Behavioral | BOT_DETECTION | None | ✅ | Medium | Medium | 5 | History analysis | Navigation patterns |
| **ITERACIÓN 6 - REFINAMIENTO Y EDGE CASES (15 SEÑALES)** |
| S106 | AI Automation Patterns | Behavioral | AI_AUTOMATION | None | ✅ | High | Hard | 6 | Pattern analysis | GPT-like behavior detection |
| S107 | Machine Learning Model Inference | Behavioral | AI_AUTOMATION | None | ✅ | High | Hard | 6 | ML detection | Model execution patterns |
| S108 | Randomness Quality Analysis | Behavioral | AI_AUTOMATION | None | ✅ | Medium | Hard | 6 | Entropy analysis | True vs pseudo randomness |
| S109 | Natural Language Patterns | Behavioral | AI_AUTOMATION | None | ✅ | Medium | Hard | 6 | Text analysis | Human vs AI writing |
| S110 | Response Time Consistency | Behavioral | AI_AUTOMATION | None | ✅ | Medium | Hard | 6 | Timing analysis | Processing time patterns |
| S111 | Decision Tree Patterns | Behavioral | AI_AUTOMATION | None | ✅ | Medium | Hard | 6 | Logic analysis | Decision consistency |
| S112 | Advanced Evasion Techniques | Security | FINGERPRINT_RESISTANCE | None | ✅ | High | Hard | 6 | Evasion analysis | Sophisticated obfuscation |
| S113 | Canvas Noise Injection | Privacy | PRIVACY_EVASION | None | ✅ | Medium | Hard | 6 | Noise detection | Canvas randomization |
| S114 | WebGL Noise Injection | Privacy | PRIVACY_EVASION | None | ✅ | Medium | Hard | 6 | WebGL randomization | GPU noise patterns |
| S115 | Audio Noise Injection | Privacy | PRIVACY_EVASION | None | ✅ | Medium | Hard | 6 | Audio randomization | Audio fingerprint noise |
| S116 | Font Spoofing Detection | Privacy | PRIVACY_EVASION | None | ✅ | Medium | Hard | 6 | Font analysis | Font list manipulation |
| S117 | Timezone Spoofing Advanced | Location | LOCATION_TAMPERING | None | ✅ | Medium | Hard | 6 | Time analysis | Advanced timezone manipulation |
| S118 | Hardware Spoofing Detection | Hardware | DEVICE_INTEGRITY | None | ✅ | High | Hard | 6 | Spoof detection | Hardware emulation |
| S119 | Behavioral Model Spoofing | Behavioral | BOT_DETECTION | None | ✅ | High | Hard | 6 | Behavior analysis | Advanced bot mimicking |
| S120 | Cross-Session Consistency | Identity | IDENTITY_CONSISTENCY | None | ✅ | High | Hard | 6 | Session analysis | Identity persistence |
| **SEÑALES ADICIONALES - COBERTURA COMPLETA (60 SEÑALES)** |
| S121 | WebCodecs API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Codec detection | Media encoding capabilities |
| S122 | WebTransport Support | Network | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Transport detection | HTTP/3 transport |
| S123 | Origin Private File System | Privacy | SESSION_TRUST | None | ✅ | Low | Medium | 5 | OPFS detection | Private storage |
| S124 | Compute Pressure API | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Pressure detection | System load |
| S125 | Web Periodic Background Sync | System | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Sync detection | Background capabilities |
| S126 | Web Background Fetch | System | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Fetch detection | Background operations |
| S127 | WebHID API Support | Hardware | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Easy | 4 | HID detection | Human interface devices |
| S128 | Eye Dropper API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Eyedropper detection | Color picking |
| S129 | File System Access API | Privacy | SESSION_TRUST | Prompt | ⚠️ | Low | Medium | 5 | File access | Local file system |
| S130 | Web Streams API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Streams detection | Data streaming |
| S131 | Resize Observer Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Observer detection | Element resizing |
| S132 | Intersection Observer Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Observer detection | Element visibility |
| S133 | Mutation Observer Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Observer detection | DOM mutations |
| S134 | Performance Observer Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Performance detection | Metrics collection |
| S135 | Reporting API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Reporting detection | Error reporting |
| S136 | Trust Token API Support | Privacy | SESSION_TRUST | None | ✅ | Low | Medium | 5 | Trust detection | Privacy tokens |
| S137 | Origin Trial Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | Trial detection | Experimental features |
| S138 | Credential Management API | Security | SESSION_TRUST | None | ✅ | Low | Easy | 4 | Credential detection | Password management |
| S139 | WebAuthentication API | Security | DEVICE_INTEGRITY | None | ✅ | Medium | Easy | 1 | WebAuthn detection | Biometric authentication |
| S140 | Digital Goods API Support | System | DEVICE_INTEGRITY | None | ✅ | Low | Easy | 4 | Goods detection | In-app purchases |
| S141 | Contact Picker API Support | Privacy | SESSION_TRUST | Prompt | ⚠️ | Low | Easy | 4 | Contact detection | Contact access |
| S142 | SMS Receiver API Support | Privacy | SESSION_TRUST | Prompt | ⚠️ | Low | Easy | 4 | SMS detection | Message interception |
| S143 | Idle Detection API Support | Privacy | SESSION_TRUST | Prompt | ⚠️ | Low | Medium | 5 | Idle detection | User activity |
| S144 | Screen Capture API Support | Privacy | SESSION_TRUST | Prompt | ⚠️ | Medium | Easy | 4 | Capture detection | Screen sharing |
| S145 | Multi-Screen Window Placement | Hardware | DEVICE_INTEGRITY | Prompt | ⚠️ | Low | Medium | 5 | Multi-screen | Multiple displays |
| S146 | Local Font Access API | Privacy | FINGERPRINT_RESISTANCE | Prompt | ⚠️ | Medium | Medium | 2 | Font access | Local fonts |
| S147 | WebAssembly SIMD Support | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | SIMD detection | Vector instructions |
| S148 | WebAssembly Threads Support | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Threading | Parallel processing |
| S149 | WebCodecs Video Decoder | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Video decoding | Codec capabilities |
| S150 | WebCodecs Video Encoder | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Video encoding | Encoding capabilities |
| S151 | WebCodecs Audio Decoder | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Audio decoding | Audio codecs |
| S152 | WebCodecs Audio Encoder | Hardware | DEVICE_INTEGRITY | None | ✅ | Low | Medium | 5 | Audio encoding | Audio processing |
| S153 | GPU Compute Capabilities | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 2 | GPU compute | WebGPU support |
| S154 | WebGPU Adapter Information | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 2 | GPU adapters | Hardware details |
| S155 | WebGPU Feature Detection | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 2 | GPU features | Supported features |
| S156 | WebGPU Limits Query | Hardware | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 2 | GPU limits | Hardware limits |
| S157 | CSS Container Queries Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Container support |
| S158 | CSS Cascade Layers Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Layer support |
| S159 | CSS Color Functions Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Color functions |
| S160 | CSS Viewport Units Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Viewport units |
| S161 | CSS Grid Support Level | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Grid capabilities |
| S162 | CSS Flexbox Support Level | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Flexbox support |
| S163 | CSS Custom Properties Support | System | BROWSER_SPOOFING | None | ✅ | Low | Easy | 4 | CSS features | Variable support |
| S164 | CSS Houdini Paint Support | System | BROWSER_SPOOFING | None | ✅ | Low | Medium | 5 | CSS features | Houdini APIs |
| S165 | CSS Houdini Layout Support | System | BROWSER_SPOOFING | None | ✅ | Low | Medium | 5 | CSS features | Layout APIs |
| S166 | WebDriver BiDi Support | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | WebDriver BiDi | Bidirectional protocol |
| S167 | Chrome DevTools Protocol | Automation | BROWSER_AUTOMATION | None | ✅ | High | Hard | 3 | CDP detection | DevTools protocol |
| S168 | Puppeteer Detection Extended | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | Puppeteer artifacts | Automation library |
| S169 | Playwright Detection | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | Playwright artifacts | Automation framework |
| S170 | Selenium Grid Detection | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | Grid detection | Distributed testing |
| S171 | Browser Stack Detection | Environment | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | Cloud browser | Remote testing |
| S172 | Sauce Labs Detection | Environment | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | Cloud browser | Testing platform |
| S173 | Lambda Test Detection | Environment | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | Cloud browser | Testing service |
| S174 | Cross Browser Testing Detection | Environment | DEVICE_INTEGRITY | None | ✅ | Medium | Medium | 5 | CBT platform | Testing environment |
| S175 | Browser Automation Studio | Automation | BROWSER_AUTOMATION | None | ✅ | High | Medium | 2 | BAS detection | Automation tool |
| S176 | iMacros Detection | Automation | BROWSER_AUTOMATION | None | ✅ | Medium | Medium | 5 | iMacros artifacts | Macro automation |
| S177 | AutoIt Detection | Automation | BROWSER_AUTOMATION | None | ✅ | Medium | Hard | 3 | AutoIt artifacts | Windows automation |
| S178 | Keyboard Maestro Detection | Automation | BROWSER_AUTOMATION | None | ✅ | Medium | Hard | 3 | KM artifacts | macOS automation |
| S179 | UI.Vision Detection | Automation | BROWSER_AUTOMATION | None | ✅ | Medium | Medium | 5 | UI.Vision artifacts | RPA tool |
| S180 | Robot Framework Detection | Automation | BROWSER_AUTOMATION | None | ✅ | Medium | Hard | 3 | Robot artifacts | Test automation |

### RESUMEN POR CATEGORÍAS

| Categoría | Count | Porcentaje |
|-----------|-------|------------|
| **Behavioral Analysis** | 35 | 19.4% |
| **Hardware Detection** | 32 | 17.8% |
| **System Information** | 28 | 15.6% |
| **Network Analysis** | 18 | 10.0% |
| **Automation Detection** | 16 | 8.9% |
| **Privacy/Security** | 15 | 8.3% |
| **Graphics/Rendering** | 12 | 6.7% |
| **Location/Timing** | 8 | 4.4% |
| **Audio/Media** | 7 | 3.9% |
| **Browser Spoofing** | 6 | 3.3% |
| **Environment** | 3 | 1.7% |
| **Total** | **180** | **100%** |

### COBERTURA POR VECTOR DE RIESGO

| Vector | Señales Asignadas | Cobertura |
|--------|-------------------|-----------|
| **BOT_DETECTION** | 45 señales | Excelente |
| **DEVICE_INTEGRITY** | 52 señales | Excelente |
| **BROWSER_SPOOFING** | 28 señales | Muy buena |
| **BROWSER_AUTOMATION** | 25 señales | Muy buena |
| **NETWORK_ANONYMIZATION** | 18 señales | Buena |
| **FINGERPRINT_RESISTANCE** | 15 señales | Buena |
| **SESSION_TRUST** | 22 señales | Muy buena |
| **MOBILE_EMULATION** | 8 señales | Suficiente |
| **LOCATION_TAMPERING** | 6 señales | Suficiente |
| **ENVIRONMENT_MANIPULATION** | 8 señales | Suficiente |
| **PRIVACY_EVASION** | 12 señales | Buena |
| **IDENTITY_CONSISTENCY** | 5 señales | Básica |
| **AI_AUTOMATION** | 8 señales | Buena |
| **MULTI_ACCOUNTING** | 3 señales | Básica |
| **BEHAVIORAL_ANOMALIES** | 25 señales | Muy buena |

### LEYENDA

**Permiso:**
- None: No requiere permisos
- Prompt: Requiere autorización del usuario
- ⚠️: Permisos sensibles (LGPD considerations)

**JS Capturability:**
- ✅: Completamente capturable con JavaScript
- ❌: Requiere tecnología server-side o SDK nativo
- ⚠️: Capturable pero con limitaciones o permisos

**Impacto:**
- High: Impacto crítico en detección de fraude
- Medium: Impacto moderado, útil para correlación
- Low: Impacto menor, útil para coverage completo

**Dificultad:**
- Easy: Implementación directa (1-2 días)
- Medium: Requiere desarrollo especializado (3-5 días)
- Hard: Implementación compleja o investigación (1-2 semanas)

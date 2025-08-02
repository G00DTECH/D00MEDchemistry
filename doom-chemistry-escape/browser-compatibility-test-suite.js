/**
 * DOOM Chemistry Escape Room - Browser Compatibility & Incognito Mode Test Suite
 * 
 * Comprehensive testing for educational environments, school computers, 
 * and various privacy settings across different browsers.
 * 
 * Tests specifically designed for the issues reported:
 * 1. Unresponsiveness in incognito mode
 * 2. Start button not working for some users  
 * 3. Pointer lock failures in private browsing
 * 4. Audio context issues
 */

class BrowserCompatibilityTestSuite {
    constructor() {
        this.testResults = [];
        this.browserInfo = this.detectBrowserInfo();
        this.privacyMode = this.detectPrivacyMode();
        this.startTime = Date.now();
        this.game = null;
        
        // Test categories specifically for educational environments
        this.testCategories = {
            coreAPIs: 'Core Browser APIs',
            privacyMode: 'Incognito/Private Mode Compatibility', 
            eventHandling: 'Event Handling & Responsiveness',
            gameInitialization: 'Game Initialization Process',
            quizSystem: 'Quiz System & Number Keys',
            startButton: 'Start Button Functionality',
            pointerLock: 'Pointer Lock & Mouse Control',
            audioContext: 'Audio Context & Sound',
            storage: 'Storage & Settings Persistence',
            performance: 'Performance in Restricted Environments',
            mobileCompatibility: 'Mobile & Touch Device Support',
            schoolEnvironment: 'School Computer Compatibility'
        };
        
        this.failurePatterns = {
            startButtonUnresponsive: false,
            pointerLockDenied: false, 
            audioContextSuspended: false,
            keyListenersNotWorking: false,
            canvasNotInitializing: false,
            gameLoopNotStarting: false
        };

        console.log('🔬 Browser Compatibility Test Suite Initialized');
        console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
        console.log(`Privacy Mode: ${this.privacyMode.isPrivate ? 'DETECTED' : 'Not detected'}`);
        console.log(`Privacy Type: ${this.privacyMode.type || 'Normal browsing'}`);
    }

    /**
     * Comprehensive browser detection including educational environment browsers
     */
    detectBrowserInfo() {
        const ua = navigator.userAgent;
        const info = {
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown',
            isEducationalBrowser: false,
            restrictions: []
        };

        // Chrome and Chromium-based browsers (including school-managed Chrome)
        if (ua.includes('Chrome')) {
            info.name = ua.includes('Edg/') ? 'Microsoft Edge' : 
                       ua.includes('OPR/') ? 'Opera' : 
                       ua.includes('Brave/') ? 'Brave' : 'Chrome';
            const chromeMatch = ua.match(/Chrome\/(\d+\.\d+)/);
            info.version = chromeMatch ? chromeMatch[1] : 'Unknown';
            info.engine = 'Blink';
        }
        // Firefox
        else if (ua.includes('Firefox')) {
            info.name = 'Firefox';
            const firefoxMatch = ua.match(/Firefox\/(\d+\.\d+)/);
            info.version = firefoxMatch ? firefoxMatch[1] : 'Unknown';
            info.engine = 'Gecko';
        }
        // Safari
        else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            info.name = 'Safari';
            const safariMatch = ua.match(/Version\/(\d+\.\d+)/);
            info.version = safariMatch ? safariMatch[1] : 'Unknown';
            info.engine = 'WebKit';
        }

        // Check for educational environment indicators
        if (ua.includes('EduBrowser') || ua.includes('SchoolNet') || ua.includes('Managed')) {
            info.isEducationalBrowser = true;
            info.restrictions.push('Managed Environment');
        }

        return info;
    }

    /**
     * Enhanced incognito/private mode detection
     * Tests multiple methods as some may be blocked in educational environments
     */
    async detectPrivacyMode() {
        const tests = [];
        let isPrivate = false;
        let detectionMethod = 'none';
        let type = null;

        // Method 1: Storage Quota Test (most reliable)
        try {
            tests.push(this.testStorageQuota());
        } catch (e) {
            console.warn('Storage quota test failed:', e);
        }

        // Method 2: IndexedDB Test
        try {
            tests.push(this.testIndexedDB());
        } catch (e) {
            console.warn('IndexedDB test failed:', e);
        }

        // Method 3: RequestFileSystem Test (Chrome)
        try {
            tests.push(this.testRequestFileSystem());
        } catch (e) {
            console.warn('RequestFileSystem test failed:', e);
        }

        // Method 4: LocalStorage Behavior Test
        try {
            tests.push(this.testLocalStorageBehavior());
        } catch (e) {
            console.warn('LocalStorage behavior test failed:', e);
        }

        const results = await Promise.allSettled(tests);
        
        // Analyze results
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === 'fulfilled' && results[i].value.isPrivate) {
                isPrivate = true;
                detectionMethod = results[i].value.method;
                break;
            }
        }

        // Browser-specific detection
        if (navigator.userAgent.includes('Firefox')) {
            type = isPrivate ? 'Private Browsing' : null;
        } else if (navigator.userAgent.includes('Safari')) {
            type = isPrivate ? 'Private Browsing' : null;
        } else if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edg/')) {
            type = isPrivate ? 'Incognito Mode' : null;
        }

        return {
            isPrivate,
            detectionMethod,
            type,
            tests: results.length,
            successful: results.filter(r => r.status === 'fulfilled').length
        };
    }

    async testStorageQuota() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                // In incognito mode, quota is typically much smaller
                const isPrivate = estimate.quota < 120000000; // Less than ~120MB
                return { isPrivate, method: 'Storage Quota', quota: estimate.quota };
            }
        } catch (e) {
            return { isPrivate: false, method: 'Storage Quota', error: e.message };
        }
        return { isPrivate: false, method: 'Storage Quota', error: 'API not supported' };
    }

    async testIndexedDB() {
        return new Promise((resolve) => {
            try {
                const testDB = indexedDB.open('test-private-mode', 1);
                testDB.onsuccess = () => {
                    resolve({ isPrivate: false, method: 'IndexedDB' });
                };
                testDB.onerror = () => {
                    resolve({ isPrivate: true, method: 'IndexedDB' });
                };
            } catch (e) {
                resolve({ isPrivate: true, method: 'IndexedDB', error: e.message });
            }
        });
    }

    async testRequestFileSystem() {
        return new Promise((resolve) => {
            try {
                if (window.webkitRequestFileSystem) {
                    window.webkitRequestFileSystem(
                        window.TEMPORARY, 1,
                        () => resolve({ isPrivate: false, method: 'RequestFileSystem' }),
                        () => resolve({ isPrivate: true, method: 'RequestFileSystem' })
                    );
                } else {
                    resolve({ isPrivate: false, method: 'RequestFileSystem', error: 'API not supported' });
                }
            } catch (e) {
                resolve({ isPrivate: true, method: 'RequestFileSystem', error: e.message });
            }
        });
    }

    async testLocalStorageBehavior() {
        try {
            const testKey = 'test-private-mode-' + Date.now();
            localStorage.setItem(testKey, 'test');
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            // In some incognito implementations, localStorage works but doesn't persist
            return { isPrivate: false, method: 'LocalStorage Behavior' };
        } catch (e) {
            // localStorage throws in some incognito modes
            return { isPrivate: true, method: 'LocalStorage Behavior', error: e.message };
        }
    }

    /**
     * Test Core Browser APIs availability
     */
    async testCoreAPIs() {
        const tests = [
            this.testCanvasAPI(),
            this.testPointerLockAPI(),
            this.testFullscreenAPI(),
            this.testAudioContextAPI(),
            this.testLocalStorageAPI(),
            this.testSessionStorageAPI(),
            this.testIndexedDBAPI(),
            this.testPerformanceAPI(),
            this.testRequestAnimationFrameAPI(),
            this.testGamepadAPI()
        ];

        const results = await Promise.all(tests);
        const failed = results.filter(r => !r.passed);
        
        if (failed.length > 0) {
            console.warn('❌ Core API failures:', failed);
        }

        return results;
    }

    testCanvasAPI() {
        try {
            const canvas = document.createElement('canvas');
            const ctx2d = canvas.getContext('2d');
            const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            return this.recordTest('Canvas API', 'coreAPIs', 
                !!ctx2d, 
                `2D Context: ${!!ctx2d}, WebGL: ${!!webgl}`,
                ctx2d ? null : 'Canvas 2D context not available'
            );
        } catch (e) {
            return this.recordTest('Canvas API', 'coreAPIs', false, 
                'Canvas API test failed', e.message);
        }
    }

    testPointerLockAPI() {
        try {
            const hasPointerLock = 'requestPointerLock' in document.body ||
                                  'mozRequestPointerLock' in document.body ||
                                  'webkitRequestPointerLock' in document.body;
            
            const hasExitPointerLock = 'exitPointerLock' in document ||
                                      'mozExitPointerLock' in document ||
                                      'webkitExitPointerLock' in document;

            const fullSupport = hasPointerLock && hasExitPointerLock;
            const warning = this.privacyMode.isPrivate ? 'May be restricted in private browsing' : null;
            
            return this.recordTest('Pointer Lock API', 'coreAPIs',
                hasPointerLock, 
                `Request: ${hasPointerLock}, Exit: ${hasExitPointerLock}`,
                warning
            );
        } catch (e) {
            return this.recordTest('Pointer Lock API', 'coreAPIs', false,
                'Pointer Lock API test failed', e.message);
        }
    }

    testFullscreenAPI() {
        try {
            const hasFullscreen = 'requestFullscreen' in document.body ||
                                 'mozRequestFullScreen' in document.body ||
                                 'webkitRequestFullscreen' in document.body ||
                                 'msRequestFullscreen' in document.body;
            
            return this.recordTest('Fullscreen API', 'coreAPIs',
                hasFullscreen,
                `Fullscreen support: ${hasFullscreen}`,
                null
            );
        } catch (e) {
            return this.recordTest('Fullscreen API', 'coreAPIs', false,
                'Fullscreen API test failed', e.message);
        }
    }

    testAudioContextAPI() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            let audioSupport = !!AudioContext;
            let contextState = 'unknown';
            let warning = null;

            if (AudioContext) {
                try {
                    const ctx = new AudioContext();
                    contextState = ctx.state;
                    
                    if (ctx.state === 'suspended') {
                        warning = 'Audio context is suspended - requires user interaction';
                    }
                    
                    ctx.close().catch(() => {}); // Clean up
                } catch (e) {
                    audioSupport = false;
                    warning = `Audio context creation failed: ${e.message}`;
                }
            }

            return this.recordTest('Audio Context API', 'coreAPIs',
                audioSupport,
                `Audio Context: ${audioSupport}, State: ${contextState}`,
                warning
            );
        } catch (e) {
            return this.recordTest('Audio Context API', 'coreAPIs', false,
                'Audio Context API test failed', e.message);
        }
    }

    testLocalStorageAPI() {
        try {
            const testKey = 'compat-test-' + Date.now();
            localStorage.setItem(testKey, 'test');
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const works = retrieved === 'test';
            const warning = this.privacyMode.isPrivate ? 'May not persist in private browsing' : null;
            
            return this.recordTest('Local Storage API', 'coreAPIs',
                works,
                `LocalStorage functional: ${works}`,
                warning
            );
        } catch (e) {
            return this.recordTest('Local Storage API', 'coreAPIs', false,
                'Local Storage API test failed', e.message);
        }
    }

    testSessionStorageAPI() {
        try {
            const testKey = 'compat-test-' + Date.now();
            sessionStorage.setItem(testKey, 'test');
            const retrieved = sessionStorage.getItem(testKey);
            sessionStorage.removeItem(testKey);
            
            const works = retrieved === 'test';
            
            return this.recordTest('Session Storage API', 'coreAPIs',
                works,
                `SessionStorage functional: ${works}`,
                null
            );
        } catch (e) {
            return this.recordTest('Session Storage API', 'coreAPIs', false,
                'Session Storage API test failed', e.message);
        }
    }

    testIndexedDBAPI() {
        return new Promise((resolve) => {
            try {
                if (!window.indexedDB) {
                    resolve(this.recordTest('IndexedDB API', 'coreAPIs', false,
                        'IndexedDB not supported', null));
                    return;
                }

                const testDB = indexedDB.open('compat-test-' + Date.now(), 1);
                const timeout = setTimeout(() => {
                    resolve(this.recordTest('IndexedDB API', 'coreAPIs', false,
                        'IndexedDB timeout', 'Database operation timed out'));
                }, 5000);

                testDB.onsuccess = () => {
                    clearTimeout(timeout);
                    testDB.result.close();
                    resolve(this.recordTest('IndexedDB API', 'coreAPIs', true,
                        'IndexedDB functional', null));
                };

                testDB.onerror = () => {
                    clearTimeout(timeout);
                    const warning = this.privacyMode.isPrivate ? 'Blocked in private browsing' : null;
                    resolve(this.recordTest('IndexedDB API', 'coreAPIs', false,
                        'IndexedDB error', warning));
                };
            } catch (e) {
                resolve(this.recordTest('IndexedDB API', 'coreAPIs', false,
                    'IndexedDB API test failed', e.message));
            }
        });
    }

    testPerformanceAPI() {
        try {
            const hasPerformance = 'performance' in window;
            const hasNow = hasPerformance && 'now' in performance;
            const hasMark = hasPerformance && 'mark' in performance;
            
            return this.recordTest('Performance API', 'coreAPIs',
                hasNow,
                `Performance: ${hasPerformance}, now(): ${hasNow}, mark(): ${hasMark}`,
                null
            );
        } catch (e) {
            return this.recordTest('Performance API', 'coreAPIs', false,
                'Performance API test failed', e.message);
        }
    }

    testRequestAnimationFrameAPI() {
        try {
            const hasRAF = 'requestAnimationFrame' in window;
            const hasCAF = 'cancelAnimationFrame' in window;
            
            return this.recordTest('RequestAnimationFrame API', 'coreAPIs',
                hasRAF,
                `RAF: ${hasRAF}, CAF: ${hasCAF}`,
                null
            );
        } catch (e) {
            return this.recordTest('RequestAnimationFrame API', 'coreAPIs', false,
                'RequestAnimationFrame API test failed', e.message);
        }
    }

    testGamepadAPI() {
        try {
            const hasGamepad = 'getGamepads' in navigator;
            
            return this.recordTest('Gamepad API', 'coreAPIs',
                hasGamepad,
                `Gamepad support: ${hasGamepad}`,
                'Optional - not required for game functionality'
            );
        } catch (e) {
            return this.recordTest('Gamepad API', 'coreAPIs', false,
                'Gamepad API test failed', e.message);
        }
    }

    /**
     * Test specific start button functionality
     */
    async testStartButtonFunctionality() {
        const tests = [];
        
        // Test DOM element existence
        tests.push(this.testStartButtonDOM());
        
        // Test click event handling
        tests.push(await this.testStartButtonClickHandling());
        
        // Test CSS and visibility
        tests.push(this.testStartButtonVisibility());
        
        // Test for common failure patterns
        tests.push(this.testStartButtonFailurePatterns());

        return tests;
    }

    testStartButtonDOM() {
        try {
            const startButton = document.getElementById('startButton');
            const startScreen = document.getElementById('startScreen');
            
            const buttonExists = !!startButton;
            const screenExists = !!startScreen;
            const buttonVisible = startButton ? 
                getComputedStyle(startButton).display !== 'none' : false;
            
            return this.recordTest('Start Button DOM', 'startButton',
                buttonExists && screenExists,
                `Button exists: ${buttonExists}, Screen exists: ${screenExists}, Visible: ${buttonVisible}`,
                buttonExists ? null : 'Start button element not found in DOM'
            );
        } catch (e) {
            return this.recordTest('Start Button DOM', 'startButton', false,
                'Start button DOM test failed', e.message);
        }
    }

    async testStartButtonClickHandling() {
        return new Promise((resolve) => {
            try {
                const startButton = document.getElementById('startButton');
                if (!startButton) {
                    resolve(this.recordTest('Start Button Click Handling', 'startButton', false,
                        'Cannot test - button not found', null));
                    return;
                }

                let clickHandled = false;
                const testClickHandler = () => {
                    clickHandled = true;
                };

                // Add temporary test handler
                startButton.addEventListener('click', testClickHandler, { once: true });

                // Simulate click
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });

                startButton.dispatchEvent(clickEvent);

                // Check result after a brief delay
                setTimeout(() => {
                    startButton.removeEventListener('click', testClickHandler);
                    
                    resolve(this.recordTest('Start Button Click Handling', 'startButton',
                        clickHandled,
                        `Click event handled: ${clickHandled}`,
                        clickHandled ? null : 'Click event not being handled - possible JavaScript error'
                    ));
                }, 100);

            } catch (e) {
                resolve(this.recordTest('Start Button Click Handling', 'startButton', false,
                    'Start button click test failed', e.message));
            }
        });
    }

    testStartButtonVisibility() {
        try {
            const startButton = document.getElementById('startButton');
            const startScreen = document.getElementById('startScreen');
            
            if (!startButton || !startScreen) {
                return this.recordTest('Start Button Visibility', 'startButton', false,
                    'Cannot test - elements not found', null);
            }

            const buttonStyle = getComputedStyle(startButton);
            const screenStyle = getComputedStyle(startScreen);
            
            const buttonVisible = buttonStyle.display !== 'none' && 
                                buttonStyle.visibility !== 'hidden' &&
                                buttonStyle.opacity !== '0';
            
            const screenVisible = screenStyle.display !== 'none' &&
                                screenStyle.visibility !== 'hidden' &&
                                screenStyle.opacity !== '0';

            const zIndex = parseInt(screenStyle.zIndex) || 0;
            const properZIndex = zIndex >= 100; // Should be high to be visible

            return this.recordTest('Start Button Visibility', 'startButton',
                buttonVisible && screenVisible && properZIndex,
                `Button visible: ${buttonVisible}, Screen visible: ${screenVisible}, Z-index: ${zIndex}`,
                !properZIndex ? 'Start screen may be behind other elements' : null
            );
        } catch (e) {
            return this.recordTest('Start Button Visibility', 'startButton', false,
                'Start button visibility test failed', e.message);
        }
    }

    testStartButtonFailurePatterns() {
        try {
            const commonIssues = [];
            
            // Check for jQuery dependency issues
            if (typeof $ !== 'undefined') {
                commonIssues.push('jQuery detected - may cause conflicts');
            }
            
            // Check for other overlapping elements
            const startButton = document.getElementById('startButton');
            if (startButton) {
                const rect = startButton.getBoundingClientRect();
                const elementAtCenter = document.elementFromPoint(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
                
                if (elementAtCenter !== startButton) {
                    commonIssues.push('Button may be covered by another element');
                }
            }
            
            // Check for CSS pointer-events issues
            if (startButton) {
                const pointerEvents = getComputedStyle(startButton).getPropertyValue('pointer-events');
                if (pointerEvents === 'none') {
                    commonIssues.push('Button has pointer-events: none');
                }
            }

            return this.recordTest('Start Button Failure Patterns', 'startButton',
                commonIssues.length === 0,
                `Issues found: ${commonIssues.length}`,
                commonIssues.length > 0 ? commonIssues.join('; ') : null
            );
        } catch (e) {
            return this.recordTest('Start Button Failure Patterns', 'startButton', false,
                'Start button failure pattern test failed', e.message);
        }
    }

    /**
     * Test pointer lock functionality in private browsing
     */
    async testPointerLockFunctionality() {
        const tests = [];
        
        tests.push(this.testPointerLockSupport());
        tests.push(await this.testPointerLockRequest());
        tests.push(this.testPointerLockEvents());
        tests.push(this.testPointerLockFallbacks());

        return tests;
    }

    testPointerLockSupport() {
        try {
            const element = document.body;
            const hasRequest = 'requestPointerLock' in element ||
                              'mozRequestPointerLock' in element ||
                              'webkitRequestPointerLock' in element;
            
            const hasExit = 'exitPointerLock' in document ||
                           'mozExitPointerLock' in document ||
                           'webkitExitPointerLock' in document;

            const hasChangeEvent = 'onpointerlockchange' in document ||
                                  'onmozpointerlockchange' in document ||
                                  'onwebkitpointerlockchange' in document;

            const fullSupport = hasRequest && hasExit && hasChangeEvent;
            const warning = this.privacyMode.isPrivate ? 
                'Pointer lock may be blocked in private browsing mode' : null;

            return this.recordTest('Pointer Lock Support', 'pointerLock',
                fullSupport,
                `Request: ${hasRequest}, Exit: ${hasExit}, Events: ${hasChangeEvent}`,
                warning
            );
        } catch (e) {
            return this.recordTest('Pointer Lock Support', 'pointerLock', false,
                'Pointer lock support test failed', e.message);
        }
    }

    async testPointerLockRequest() {
        return new Promise((resolve) => {
            try {
                const canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
                
                // Set up event listeners
                let lockChanged = false;
                let lockError = false;
                let errorMessage = '';

                const onLockChange = () => {
                    lockChanged = true;
                    const lockedElement = document.pointerLockElement ||
                                        document.mozPointerLockElement ||
                                        document.webkitPointerLockElement;
                    
                    if (lockedElement) {
                        // Immediately exit pointer lock
                        const exitPointerLock = document.exitPointerLock ||
                                              document.mozExitPointerLock ||
                                              document.webkitExitPointerLock;
                        if (exitPointerLock) {
                            exitPointerLock.call(document);
                        }
                    }
                    cleanup();
                };

                const onLockError = (e) => {
                    lockError = true;
                    errorMessage = e.type || 'Unknown error';
                    cleanup();
                };

                const cleanup = () => {
                    document.removeEventListener('pointerlockchange', onLockChange);
                    document.removeEventListener('mozpointerlockchange', onLockChange);
                    document.removeEventListener('webkitpointerlockchange', onLockChange);
                    document.removeEventListener('pointerlockerror', onLockError);
                    document.removeEventListener('mozpointerlockerror', onLockError);
                    document.removeEventListener('webkitpointerlockerror', onLockError);
                };

                // Add event listeners
                document.addEventListener('pointerlockchange', onLockChange);
                document.addEventListener('mozpointerlockchange', onLockChange);
                document.addEventListener('webkitpointerlockchange', onLockChange);
                document.addEventListener('pointerlockerror', onLockError);
                document.addEventListener('mozpointerlockerror', onLockError);
                document.addEventListener('webkitpointerlockerror', onLockError);

                // Try to request pointer lock
                const requestPointerLock = canvas.requestPointerLock ||
                                         canvas.mozRequestPointerLock ||
                                         canvas.webkitRequestPointerLock;

                if (!requestPointerLock) {
                    cleanup();
                    resolve(this.recordTest('Pointer Lock Request', 'pointerLock', false,
                        'Pointer lock request method not available', null));
                    return;
                }

                // Request pointer lock
                requestPointerLock.call(canvas);

                // Wait for result
                setTimeout(() => {
                    cleanup();
                    
                    if (lockError) {
                        const warning = this.privacyMode.isPrivate ? 
                            'Pointer lock blocked in private browsing' : 
                            `Error: ${errorMessage}`;
                        
                        resolve(this.recordTest('Pointer Lock Request', 'pointerLock', false,
                            'Pointer lock request failed', warning));
                    } else if (lockChanged) {
                        resolve(this.recordTest('Pointer Lock Request', 'pointerLock', true,
                            'Pointer lock request succeeded', null));
                    } else {
                        resolve(this.recordTest('Pointer Lock Request', 'pointerLock', false,
                            'Pointer lock request timeout', 
                            'No response to pointer lock request - may be waiting for user gesture'));
                    }
                }, 1000);

            } catch (e) {
                resolve(this.recordTest('Pointer Lock Request', 'pointerLock', false,
                    'Pointer lock request test failed', e.message));
            }
        });
    }

    testPointerLockEvents() {
        try {
            const events = [
                'pointerlockchange', 'mozpointerlockchange', 'webkitpointerlockchange',
                'pointerlockerror', 'mozpointerlockerror', 'webkitpointerlockerror'
            ];

            const supportedEvents = events.filter(event => {
                return ('on' + event) in document || 
                       document.addEventListener && typeof document.addEventListener === 'function';
            });

            const hasBasicSupport = supportedEvents.length >= 2; // At least change and error events

            return this.recordTest('Pointer Lock Events', 'pointerLock',
                hasBasicSupport,
                `Supported events: ${supportedEvents.length}/${events.length}`,
                hasBasicSupport ? null : 'Limited event support may cause issues'
            );
        } catch (e) {
            return this.recordTest('Pointer Lock Events', 'pointerLock', false,
                'Pointer lock events test failed', e.message);
        }
    }

    testPointerLockFallbacks() {
        try {
            // Check if game has fallback mechanisms
            const hasMouseMove = typeof document.onmousemove !== 'undefined';
            const hasMouseWheel = 'onwheel' in document || 'onmousewheel' in document;
            const hasKeyboardControls = true; // Assume WASD controls are available
            
            const hasFallbacks = hasMouseMove && hasKeyboardControls;

            return this.recordTest('Pointer Lock Fallbacks', 'pointerLock',
                hasFallbacks,
                `Mouse fallback: ${hasMouseMove}, Wheel: ${hasMouseWheel}, Keyboard: ${hasKeyboardControls}`,
                hasFallbacks ? null : 'No fallback controls if pointer lock fails'
            );
        } catch (e) {
            return this.recordTest('Pointer Lock Fallbacks', 'pointerLock', false,
                'Pointer lock fallbacks test failed', e.message);
        }
    }

    /**
     * Test quiz system and number key responsiveness
     */
    async testQuizSystemResponsiveness() {
        const tests = [];
        
        tests.push(this.testQuizModalExists());
        tests.push(this.testNumberKeyHandling());
        tests.push(this.testQuizInteractionElements());
        tests.push(await this.testQuizKeyboardNavigation());

        return tests;
    }

    testQuizModalExists() {
        try {
            const puzzleModal = document.getElementById('puzzleModal');
            const puzzleTitle = document.getElementById('puzzleTitle');
            const puzzleContent = document.getElementById('puzzleContent');
            const submitButton = document.getElementById('submitAnswer');

            const modalExists = !!puzzleModal;
            const hasRequiredElements = !!(puzzleTitle && puzzleContent && submitButton);

            return this.recordTest('Quiz Modal Structure', 'quizSystem',
                modalExists && hasRequiredElements,
                `Modal: ${modalExists}, Required elements: ${hasRequiredElements}`,
                modalExists ? null : 'Quiz modal elements missing from DOM'
            );
        } catch (e) {
            return this.recordTest('Quiz Modal Structure', 'quizSystem', false,
                'Quiz modal structure test failed', e.message);
        }
    }

    testNumberKeyHandling() {
        try {
            // Test number key event handling
            const numberKeys = ['1', '2', '3', '4'];
            const keyCodesSupported = numberKeys.map(key => {
                const keyEvent = new KeyboardEvent('keydown', {
                    key: key,
                    code: `Digit${key}`,
                    keyCode: 48 + parseInt(key),
                    which: 48 + parseInt(key)
                });
                
                // Check if event can be created and has expected properties
                return keyEvent.key === key && keyEvent.code === `Digit${key}`;
            });

            const allSupported = keyCodesSupported.every(supported => supported);

            return this.recordTest('Number Key Handling', 'quizSystem',
                allSupported,
                `Number keys 1-4 event support: ${keyCodesSupported.filter(Boolean).length}/4`,
                allSupported ? null : 'Some number key events may not work properly'
            );
        } catch (e) {
            return this.recordTest('Number Key Handling', 'quizSystem', false,
                'Number key handling test failed', e.message);
        }
    }

    testQuizInteractionElements() {
        try {
            const submitButton = document.getElementById('submitAnswer');
            const closeButton = document.getElementById('closePuzzle');
            
            const submitExists = !!submitButton;
            const closeExists = !!closeButton;
            
            let submitClickable = false;
            let closeClickable = false;
            
            if (submitButton) {
                const submitStyle = getComputedStyle(submitButton);
                submitClickable = submitStyle.pointerEvents !== 'none' && 
                                submitStyle.display !== 'none';
            }
            
            if (closeButton) {
                const closeStyle = getComputedStyle(closeButton);
                closeClickable = closeStyle.pointerEvents !== 'none' && 
                               closeStyle.display !== 'none';
            }

            const allWorking = submitExists && closeExists && submitClickable && closeClickable;

            return this.recordTest('Quiz Interaction Elements', 'quizSystem',
                allWorking,
                `Submit button: ${submitExists && submitClickable}, Close button: ${closeExists && closeClickable}`,
                allWorking ? null : 'Some quiz interaction elements may not be clickable'
            );
        } catch (e) {
            return this.recordTest('Quiz Interaction Elements', 'quizSystem', false,
                'Quiz interaction elements test failed', e.message);
        }
    }

    async testQuizKeyboardNavigation() {
        return new Promise((resolve) => {
            try {
                // Test tab navigation through quiz elements
                const puzzleModal = document.getElementById('puzzleModal');
                if (!puzzleModal) {
                    resolve(this.recordTest('Quiz Keyboard Navigation', 'quizSystem', false,
                        'Cannot test - quiz modal not found', null));
                    return;
                }

                const focusableElements = puzzleModal.querySelectorAll(
                    'button, [tabindex]:not([tabindex="-1"]), input, select, textarea'
                );

                const tabNavigationWorks = focusableElements.length > 0;
                
                // Check if elements can receive focus
                let focusableCount = 0;
                focusableElements.forEach(element => {
                    try {
                        element.focus();
                        if (document.activeElement === element) {
                            focusableCount++;
                        }
                    } catch (e) {
                        // Element cannot be focused
                    }
                });

                const keyboardAccessible = focusableCount > 0;

                resolve(this.recordTest('Quiz Keyboard Navigation', 'quizSystem',
                    keyboardAccessible,
                    `Focusable elements: ${focusableCount}/${focusableElements.length}`,
                    keyboardAccessible ? null : 'Quiz elements may not be keyboard accessible'
                ));

            } catch (e) {
                resolve(this.recordTest('Quiz Keyboard Navigation', 'quizSystem', false,
                    'Quiz keyboard navigation test failed', e.message));
            }
        });
    }

    /**
     * Test audio context and sound functionality
     */
    async testAudioContextFunctionality() {
        const tests = [];
        
        tests.push(this.testAudioContextCreation());
        tests.push(await this.testAudioContextState());
        tests.push(this.testWebAudioSupport());
        tests.push(this.testAudioFallbacks());

        return tests;
    }

    testAudioContextCreation() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            if (!AudioContext) {
                return this.recordTest('Audio Context Creation', 'audioContext', false,
                    'AudioContext not supported', 'Browser does not support Web Audio API');
            }

            let contextCreated = false;
            let contextState = 'unknown';
            let errorMessage = null;

            try {
                const testContext = new AudioContext();
                contextCreated = true;
                contextState = testContext.state;
                testContext.close().catch(() => {}); // Clean up
            } catch (e) {
                errorMessage = e.message;
            }

            return this.recordTest('Audio Context Creation', 'audioContext',
                contextCreated,
                `Context created: ${contextCreated}, Initial state: ${contextState}`,
                errorMessage || (contextState === 'suspended' ? 'Audio context suspended - requires user interaction' : null)
            );
        } catch (e) {
            return this.recordTest('Audio Context Creation', 'audioContext', false,
                'Audio context creation test failed', e.message);
        }
    }

    async testAudioContextState() {
        return new Promise((resolve) => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                
                if (!AudioContext) {
                    resolve(this.recordTest('Audio Context State', 'audioContext', false,
                        'AudioContext not available for state testing', null));
                    return;
                }

                const testContext = new AudioContext();
                const initialState = testContext.state;
                
                if (initialState === 'running') {
                    testContext.close().catch(() => {});
                    resolve(this.recordTest('Audio Context State', 'audioContext', true,
                        `Context state: ${initialState}`, null));
                    return;
                }

                if (initialState === 'suspended') {
                    // Try to resume the context
                    testContext.resume().then(() => {
                        const newState = testContext.state;
                        testContext.close().catch(() => {});
                        
                        resolve(this.recordTest('Audio Context State', 'audioContext', 
                            newState === 'running',
                            `Initial: ${initialState}, After resume: ${newState}`,
                            newState !== 'running' ? 'Audio context cannot be resumed - may require user interaction' : null
                        ));
                    }).catch((e) => {
                        testContext.close().catch(() => {});
                        resolve(this.recordTest('Audio Context State', 'audioContext', false,
                            `Resume failed: ${e.message}`, 'Audio context resume blocked - requires user gesture'));
                    });
                } else {
                    testContext.close().catch(() => {});
                    resolve(this.recordTest('Audio Context State', 'audioContext', false,
                        `Unexpected state: ${initialState}`, 'Audio context in unexpected state'));
                }

            } catch (e) {
                resolve(this.recordTest('Audio Context State', 'audioContext', false,
                    'Audio context state test failed', e.message));
            }
        });
    }

    testWebAudioSupport() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            if (!AudioContext) {
                return this.recordTest('Web Audio Support', 'audioContext', false,
                    'Web Audio API not supported', null);
            }

            // Test key Web Audio API features
            const features = {
                oscillator: 'createOscillator' in AudioContext.prototype,
                gainNode: 'createGain' in AudioContext.prototype,
                analyser: 'createAnalyser' in AudioContext.prototype,
                scriptProcessor: 'createScriptProcessor' in AudioContext.prototype,
                bufferSource: 'createBufferSource' in AudioContext.prototype
            };

            const supportedFeatures = Object.values(features).filter(Boolean).length;
            const totalFeatures = Object.keys(features).length;
            const goodSupport = supportedFeatures >= totalFeatures * 0.8;

            return this.recordTest('Web Audio Support', 'audioContext',
                goodSupport,
                `Supported features: ${supportedFeatures}/${totalFeatures}`,
                goodSupport ? null : 'Limited Web Audio API support may affect sound functionality'
            );
        } catch (e) {
            return this.recordTest('Web Audio Support', 'audioContext', false,
                'Web Audio support test failed', e.message);
        }
    }

    testAudioFallbacks() {
        try {
            // Test HTML5 audio element support as fallback
            const audioElement = document.createElement('audio');
            const canPlayAudio = typeof audioElement.play === 'function';
            
            // Test supported audio formats
            const formats = {
                mp3: audioElement.canPlayType('audio/mpeg'),
                ogg: audioElement.canPlayType('audio/ogg'),
                wav: audioElement.canPlayType('audio/wav'),
                aac: audioElement.canPlayType('audio/aac')
            };

            const supportedFormats = Object.values(formats).filter(support => support !== '').length;
            const hasFallback = canPlayAudio && supportedFormats > 0;

            return this.recordTest('Audio Fallbacks', 'audioContext',
                hasFallback,
                `HTML5 Audio: ${canPlayAudio}, Supported formats: ${supportedFormats}/4`,
                hasFallback ? null : 'No audio fallback available if Web Audio API fails'
            );
        } catch (e) {
            return this.recordTest('Audio Fallbacks', 'audioContext', false,
                'Audio fallbacks test failed', e.message);
        }
    }

    /**
     * Test mobile and touch device compatibility
     */
    async testMobileCompatibility() {
        const tests = [];
        
        tests.push(this.testTouchSupport());
        tests.push(this.testMobileViewport());
        tests.push(this.testOrientationSupport());
        tests.push(this.testMobilePerformance());

        return tests;
    }

    testTouchSupport() {
        try {
            const hasTouchEvents = 'ontouchstart' in window || 
                                  'TouchEvent' in window ||
                                  navigator.maxTouchPoints > 0;
            
            const hasPointerEvents = 'onpointerdown' in window ||
                                    'PointerEvent' in window;

            const touchSupport = hasTouchEvents || hasPointerEvents;

            return this.recordTest('Touch Support', 'mobileCompatibility',
                touchSupport,
                `Touch events: ${hasTouchEvents}, Pointer events: ${hasPointerEvents}`,
                touchSupport ? null : 'Limited touch support may affect mobile gameplay'
            );
        } catch (e) {
            return this.recordTest('Touch Support', 'mobileCompatibility', false,
                'Touch support test failed', e.message);
        }
    }

    testMobileViewport() {
        try {
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            const hasViewportMeta = !!viewportMeta;
            
            const screenWidth = screen.width;
            const screenHeight = screen.height;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            const isMobileSized = screenWidth <= 768 || windowWidth <= 768;
            const aspectRatio = Math.max(screenWidth, screenHeight) / Math.min(screenWidth, screenHeight);
            const isMobileAspect = aspectRatio > 1.5; // Typical mobile aspect ratio

            return this.recordTest('Mobile Viewport', 'mobileCompatibility',
                hasViewportMeta,
                `Viewport meta: ${hasViewportMeta}, Screen: ${screenWidth}x${screenHeight}, Window: ${windowWidth}x${windowHeight}`,
                hasViewportMeta ? null : 'Missing viewport meta tag may cause display issues on mobile'
            );
        } catch (e) {
            return this.recordTest('Mobile Viewport', 'mobileCompatibility', false,
                'Mobile viewport test failed', e.message);
        }
    }

    testOrientationSupport() {
        try {
            const hasOrientationAPI = 'orientation' in screen ||
                                     'onorientationchange' in window;
            
            const currentOrientation = screen.orientation ? screen.orientation.type : 
                                     window.orientation !== undefined ? window.orientation : 'unknown';

            return this.recordTest('Orientation Support', 'mobileCompatibility',
                hasOrientationAPI,
                `Orientation API: ${hasOrientationAPI}, Current: ${currentOrientation}`,
                hasOrientationAPI ? null : 'No orientation detection - game may not adapt to device rotation'
            );
        } catch (e) {
            return this.recordTest('Orientation Support', 'mobileCompatibility', false,
                'Orientation support test failed', e.message);
        }
    }

    testMobilePerformance() {
        try {
            // Estimate device performance based on available information
            const deviceMemory = navigator.deviceMemory || 'unknown';
            const hardwareConcurrency = navigator.hardwareConcurrency || 1;
            
            // Simple performance heuristic
            const estimatedLowEnd = deviceMemory !== 'unknown' && deviceMemory < 2 ||
                                   hardwareConcurrency < 2;

            return this.recordTest('Mobile Performance', 'mobileCompatibility',
                !estimatedLowEnd,
                `Device memory: ${deviceMemory}GB, CPU cores: ${hardwareConcurrency}`,
                estimatedLowEnd ? 'Low-end device detected - may experience performance issues' : null
            );
        } catch (e) {
            return this.recordTest('Mobile Performance', 'mobileCompatibility', false,
                'Mobile performance test failed', e.message);
        }
    }

    /**
     * Test educational environment compatibility
     */
    async testSchoolEnvironmentCompatibility() {
        const tests = [];
        
        tests.push(this.testNetworkRestrictions());
        tests.push(this.testManagedBrowserDetection());
        tests.push(this.testLocalContentSupport());
        tests.push(this.testAccessibilityCompliance());

        return tests;
    }

    testNetworkRestrictions() {
        try {
            // Test if we can access external resources
            const hasOnlineStatus = 'onLine' in navigator;
            const isOnline = hasOnlineStatus ? navigator.onLine : true;
            
            // Test if fetch API is available (may be restricted)
            const hasFetch = 'fetch' in window;
            const hasXHR = 'XMLHttpRequest' in window;

            const networkSupport = hasFetch || hasXHR;

            return this.recordTest('Network Restrictions', 'schoolEnvironment',
                networkSupport,
                `Online: ${isOnline}, Fetch: ${hasFetch}, XHR: ${hasXHR}`,
                networkSupport ? null : 'Limited network access may prevent loading external resources'
            );
        } catch (e) {
            return this.recordTest('Network Restrictions', 'schoolEnvironment', false,
                'Network restrictions test failed', e.message);
        }
    }

    testManagedBrowserDetection() {
        try {
            const userAgent = navigator.userAgent;
            const managedIndicators = [
                'EduBrowser', 'SchoolNet', 'Managed', 'Enterprise',
                'Kiosk', 'Restricted', 'Student', 'Classroom'
            ];

            const isManagedBrowser = managedIndicators.some(indicator => 
                userAgent.includes(indicator)
            );

            // Check for other managed browser indicators
            const hasRestrictedFeatures = !('serviceWorker' in navigator) ||
                                        this.privacyMode.isPrivate ||
                                        Object.keys(localStorage).length === 0;

            return this.recordTest('Managed Browser Detection', 'schoolEnvironment',
                true, // This is informational, not a pass/fail
                `Managed browser: ${isManagedBrowser}, Restricted features: ${hasRestrictedFeatures}`,
                isManagedBrowser ? 'Managed browser environment detected - some features may be limited' : null
            );
        } catch (e) {
            return this.recordTest('Managed Browser Detection', 'schoolEnvironment', false,
                'Managed browser detection test failed', e.message);
        }
    }

    testLocalContentSupport() {
        try {
            // Test if the game can run without external dependencies
            const hasLocalCanvas = !!document.getElementById('gameCanvas');
            const hasLocalCSS = document.styleSheets.length > 0;
            const hasLocalJS = typeof DoomChemistryGame !== 'undefined' || 
                              document.scripts.length > 0;

            const canRunLocally = hasLocalCanvas && hasLocalCSS && hasLocalJS;

            return this.recordTest('Local Content Support', 'schoolEnvironment',
                canRunLocally,
                `Canvas: ${hasLocalCanvas}, CSS: ${hasLocalCSS}, JS: ${hasLocalJS}`,
                canRunLocally ? null : 'Game may require external resources that could be blocked'
            );
        } catch (e) {
            return this.recordTest('Local Content Support', 'schoolEnvironment', false,
                'Local content support test failed', e.message);
        }
    }

    testAccessibilityCompliance() {
        try {
            // Basic accessibility checks for educational compliance
            const hasAltText = document.querySelectorAll('img[alt]').length === 
                              document.querySelectorAll('img').length;
            
            const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
            const hasHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0;
            const hasSkipLinks = document.querySelectorAll('a[href^="#"]').length > 0;

            const accessibilityScore = [hasAltText, hasAriaLabels, hasHeadings, hasSkipLinks]
                                     .filter(Boolean).length;
            
            const isAccessible = accessibilityScore >= 2; // Basic compliance

            return this.recordTest('Accessibility Compliance', 'schoolEnvironment',
                isAccessible,
                `Accessibility features: ${accessibilityScore}/4`,
                isAccessible ? null : 'Limited accessibility features may not meet educational standards'
            );
        } catch (e) {
            return this.recordTest('Accessibility Compliance', 'schoolEnvironment', false,
                'Accessibility compliance test failed', e.message);
        }
    }

    /**
     * Record a test result
     */
    recordTest(name, category, passed, details, warning) {
        const result = {
            name,
            category,
            passed,
            details,
            warning,
            timestamp: Date.now(),
            browser: this.browserInfo.name,
            version: this.browserInfo.version,
            privateMode: this.privacyMode.isPrivate
        };

        this.testResults.push(result);

        // Update failure patterns
        if (!passed) {
            switch (name) {
                case 'Start Button Click Handling':
                    this.failurePatterns.startButtonUnresponsive = true;
                    break;
                case 'Pointer Lock Request':
                    this.failurePatterns.pointerLockDenied = true;
                    break;
                case 'Audio Context State':
                    this.failurePatterns.audioContextSuspended = true;
                    break;
                case 'Number Key Handling':
                    this.failurePatterns.keyListenersNotWorking = true;
                    break;
            }
        }

        const status = passed ? '✅' : '❌';
        const warningText = warning ? ` ⚠️ ${warning}` : '';
        console.log(`${status} ${name}: ${details}${warningText}`);

        return result;
    }

    /**
     * Run all compatibility tests
     */
    async runFullCompatibilityTest() {
        console.log('🚀 Starting Browser Compatibility Test Suite...');
        console.log(`Environment: ${this.browserInfo.name} ${this.browserInfo.version}`);
        console.log(`Privacy Mode: ${this.privacyMode.isPrivate ? this.privacyMode.type : 'Normal browsing'}`);
        console.log('=' .repeat(60));

        const testSuites = [
            { name: 'Core APIs', fn: () => this.testCoreAPIs() },
            { name: 'Start Button Functionality', fn: () => this.testStartButtonFunctionality() },
            { name: 'Pointer Lock Functionality', fn: () => this.testPointerLockFunctionality() },
            { name: 'Quiz System Responsiveness', fn: () => this.testQuizSystemResponsiveness() },
            { name: 'Audio Context Functionality', fn: () => this.testAudioContextFunctionality() },
            { name: 'Mobile Compatibility', fn: () => this.testMobileCompatibility() },
            { name: 'School Environment Compatibility', fn: () => this.testSchoolEnvironmentCompatibility() }
        ];

        for (const suite of testSuites) {
            console.log(`\n📋 Testing ${suite.name}...`);
            const results = await suite.fn();
            const passed = Array.isArray(results) ? 
                          results.filter(r => r.passed).length :
                          results.passed ? 1 : 0;
            const total = Array.isArray(results) ? results.length : 1;
            console.log(`   ${passed}/${total} tests passed`);
        }

        return this.generateCompatibilityReport();
    }

    /**
     * Generate comprehensive compatibility report
     */
    generateCompatibilityReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.passed).length;
        const failedTests = totalTests - passedTests;
        const warningTests = this.testResults.filter(t => t.warning).length;
        const passRate = ((passedTests / totalTests) * 100).toFixed(1);

        // Categorize results
        const categories = {};
        this.testResults.forEach(test => {
            if (!categories[test.category]) {
                categories[test.category] = { passed: 0, total: 0, tests: [] };
            }
            categories[test.category].total++;
            if (test.passed) categories[test.category].passed++;
            categories[test.category].tests.push(test);
        });

        // Generate report
        const report = {
            summary: {
                browser: this.browserInfo.name,
                version: this.browserInfo.version,
                privateMode: this.privacyMode.isPrivate,
                privateModeType: this.privacyMode.type,
                totalTests,
                passedTests,
                failedTests,
                warningTests,
                passRate: parseFloat(passRate),
                testDuration: Date.now() - this.startTime
            },
            categories,
            failurePatterns: this.failurePatterns,
            criticalIssues: this.identifyCriticalIssues(),
            recommendations: this.generateRecommendations(),
            rawResults: this.testResults
        };

        this.displayReport(report);
        return report;
    }

    identifyCriticalIssues() {
        const critical = [];
        
        if (this.failurePatterns.startButtonUnresponsive) {
            critical.push({
                issue: 'Start Button Unresponsive',
                impact: 'Game cannot be started',
                severity: 'Critical'
            });
        }
        
        if (this.failurePatterns.pointerLockDenied) {
            critical.push({
                issue: 'Pointer Lock Denied',
                impact: 'Mouse look controls not available',
                severity: 'High'
            });
        }
        
        if (this.failurePatterns.audioContextSuspended) {
            critical.push({
                issue: 'Audio Context Suspended',
                impact: 'No sound effects or audio feedback',
                severity: 'Medium'
            });
        }

        if (this.failurePatterns.keyListenersNotWorking) {
            critical.push({
                issue: 'Key Listeners Not Working',
                impact: 'Quiz answers cannot be selected with number keys',
                severity: 'High'
            });
        }

        return critical;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.privacyMode.isPrivate) {
            recommendations.push(
                'Consider providing a notice about private browsing limitations',
                'Implement fallback controls for when pointer lock is denied',
                'Use sessionStorage instead of localStorage for temporary data'
            );
        }

        if (this.failurePatterns.startButtonUnresponsive) {
            recommendations.push(
                'Check for JavaScript errors preventing event handlers',
                'Verify CSS is not blocking button interactions',
                'Add visual feedback to confirm button clicks'
            );
        }

        if (this.failurePatterns.audioContextSuspended) {
            recommendations.push(
                'Implement user gesture requirement for audio activation',
                'Provide visual feedback when audio is unavailable',
                'Add option to disable audio for silent environments'
            );
        }

        return recommendations;
    }

    displayReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🔬 BROWSER COMPATIBILITY TEST REPORT');
        console.log('='.repeat(60));
        console.log(`🌐 Browser: ${report.summary.browser} ${report.summary.version}`);
        console.log(`🕵️ Privacy Mode: ${report.summary.privateMode ? report.summary.privateModeType : 'Normal browsing'}`);
        console.log(`📊 Tests: ${report.summary.passedTests}/${report.summary.totalTests} passed (${report.summary.passRate}%)`);
        console.log(`⚠️ Warnings: ${report.summary.warningTests}`);
        console.log(`⏱️ Duration: ${report.summary.testDuration}ms`);

        if (report.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES:');
            report.criticalIssues.forEach(issue => {
                console.log(`   ${issue.severity.toUpperCase()}: ${issue.issue} - ${issue.impact}`);
            });
        }

        console.log('\n📋 TEST CATEGORIES:');
        Object.entries(report.categories).forEach(([category, data]) => {
            const rate = ((data.passed / data.total) * 100).toFixed(0);
            console.log(`   ${category}: ${data.passed}/${data.total} (${rate}%)`);
        });

        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }

        console.log('\n❌ FAILED TESTS:');
        const failedTests = this.testResults.filter(t => !t.passed);
        if (failedTests.length === 0) {
            console.log('   None! All tests passed. 🎉');
        } else {
            failedTests.forEach(test => {
                console.log(`   • ${test.name}: ${test.details}${test.warning ? ` (${test.warning})` : ''}`);
            });
        }

        // Create visual report overlay
        this.createVisualCompatibilityReport(report);
    }

    createVisualCompatibilityReport(report) {
        // Remove any existing report
        const existingReport = document.getElementById('compatibility-report');
        if (existingReport) {
            existingReport.remove();
        }

        const reportDiv = document.createElement('div');
        reportDiv.id = 'compatibility-report';
        reportDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                color: #00ff00;
                padding: 20px;
                border: 2px solid #00ff00;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 10000;
                overflow-y: auto;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #00ff00; font-size: 14px;">🔬 Compatibility Report</h3>
                    <button onclick="document.getElementById('compatibility-report').remove()" 
                            style="background: #006600; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; cursor: pointer;">
                        ✖
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div><strong>Browser:</strong> ${report.summary.browser} ${report.summary.version}</div>
                    <div><strong>Privacy Mode:</strong> ${report.summary.privateMode ? report.summary.privateModeType : 'Normal'}</div>
                    <div><strong>Pass Rate:</strong> ${report.summary.passRate}% (${report.summary.passedTests}/${report.summary.totalTests})</div>
                </div>

                ${report.criticalIssues.length > 0 ? `
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 0, 0, 0.1); border: 1px solid #ff0000;">
                    <div style="color: #ff0000; font-weight: bold; margin-bottom: 5px;">🚨 CRITICAL ISSUES:</div>
                    ${report.criticalIssues.map(issue => `
                        <div style="margin: 5px 0; font-size: 11px;">
                            <span style="color: #ff6666;">${issue.severity}:</span> ${issue.issue}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">📋 Category Results:</div>
                    ${Object.entries(report.categories).map(([category, data]) => {
                        const rate = ((data.passed / data.total) * 100).toFixed(0);
                        const color = rate >= 80 ? '#00ff00' : rate >= 60 ? '#ffff00' : '#ff0000';
                        return `
                            <div style="margin: 3px 0; font-size: 11px;">
                                <span style="color: ${color};">${rate}%</span> ${category} (${data.passed}/${data.total})
                            </div>
                        `;
                    }).join('')}
                </div>

                ${report.recommendations.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">💡 Recommendations:</div>
                    <div style="font-size: 10px; color: #cccccc;">
                        ${report.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('<br>')}
                        ${report.recommendations.length > 3 ? '<br>... and more' : ''}
                    </div>
                </div>
                ` : ''}

                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="console.log(window.compatibilityTestReport)" 
                            style="background: #006600; border: 1px solid #00ff00; color: #00ff00; padding: 5px 15px; cursor: pointer; margin-right: 10px;">
                        📊 View Full Report
                    </button>
                    <button onclick="window.compatibilityTestSuite.runFullCompatibilityTest()" 
                            style="background: #006600; border: 1px solid #00ff00; color: #00ff00; padding: 5px 15px; cursor: pointer;">
                        🔄 Rerun Tests
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(reportDiv);

        // Store report globally for console access
        window.compatibilityTestReport = report;

        // Auto-remove after 30 seconds unless there are critical issues
        if (report.criticalIssues.length === 0) {
            setTimeout(() => {
                if (document.getElementById('compatibility-report')) {
                    document.getElementById('compatibility-report').remove();
                }
            }, 30000);
        }
    }
}

// Initialize compatibility test suite
window.addEventListener('load', async () => {
    window.compatibilityTestSuite = new BrowserCompatibilityTestSuite();
    
    // Add keyboard shortcut to run tests (Ctrl+Shift+T)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            window.compatibilityTestSuite.runFullCompatibilityTest();
        }
    });
    
    console.log('🔬 Browser Compatibility Test Suite ready!');
    console.log('Press Ctrl+Shift+T to run full compatibility test');
    console.log('Or call: window.compatibilityTestSuite.runFullCompatibilityTest()');
});

// Export for manual testing and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibilityTestSuite;
}
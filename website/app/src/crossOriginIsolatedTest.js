// Test für Cross-Origin-Isolation
if (window.crossOriginIsolated) {
    console.log('✅ Cross-Origin-Isolation ist aktiv');
    
    // Test für SharedArrayBuffer
    try {
      const sab = new SharedArrayBuffer(16);
      console.log('✅ SharedArrayBuffer ist verfügbar');
      
      // Test mit Web Worker
      const worker = new Worker(URL.createObjectURL(new Blob([`
        self.onmessage = function(e) {
          const sab = new SharedArrayBuffer(16);
          Atomics.store(sab, 0, 42);
          self.postMessage(sab);
        };
      `], { type: 'application/javascript' })));
      
      worker.onmessage = function(e) {
        console.log('✅ Web Worker kann SharedArrayBuffer verarbeiten');
        console.log('Wert aus SharedArrayBuffer:', Atomics.load(e.data, 0));
      };
      
      worker.postMessage('start');
    } catch (error) {
      console.error('❌ Fehler beim SharedArrayBuffer-Test:', error);
    }
  } else {
    console.log('❌ Cross-Origin-Isolation ist nicht aktiv');
    console.log('Überprüfen Sie die Header-Konfiguration in setupProxy.js oder Ihrer Produktionsumgebung');
  }
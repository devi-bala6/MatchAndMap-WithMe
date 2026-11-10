import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, 'MatchAndMap_Summary_Sheet.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Starting Edge with remote debugging...');
  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    'http://localhost:3030/project-summary-sheet.html'
  ]);

  // Wait for remote debugging to be ready
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      const list = await res.json();
      const target = list.find(t => t.url.includes('project-summary-sheet.html') || t.type === 'page');
      if (target && target.webSocketDebuggerUrl) {
        wsUrl = target.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // retry
    }
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket debugger URL');
    edgeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to target WS:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const send = (method, params = {}) => {
    const msgId = id++;
    return new Promise((resolve, reject) => {
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise((resolve) => ws.addEventListener('open', resolve));

  console.log('Waiting for page load...');
  await send('Page.enable');
  await new Promise(r => setTimeout(r, 1500));

  console.log('Printing to PDF...');
  const pdfData = await send('Page.printToPDF', {
    landscape: false,
    displayHeaderFooter: false,
    printBackground: true,
    paperWidth: 8.27, // A4 portrait width (inches)
    paperHeight: 11.69, // A4 portrait height (inches)
    marginTop: 0.3,
    marginBottom: 0.3,
    marginLeft: 0.35,
    marginRight: 0.35,
    preferCSSPageSize: true
  });

  const buffer = Buffer.from(pdfData.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully written PDF to:', outputPath);
  console.log('File size:', buffer.length, 'bytes');

  ws.close();
  edgeProcess.kill();
}

main().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

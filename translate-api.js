const fs = require('fs');
const path = require('path');

const replacements = {
  'NextRequest': 'NextRequest', // no change
  'NextResponse': 'NextResponse', // no change
  'request:': 'requisicao:',
  'request)': 'requisicao)',
  'request.': 'requisicao.',
  'body': 'corpo',
  'error': 'erro',
  'params': 'parametros',
  'payload': 'dadosPayload',
  'response': 'resposta',
};

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      const orig = c;
      
      for (const [key, value] of Object.entries(replacements)) {
        if (key === 'error') {
           // careful with console.error and error inside strings
           c = c.replace(/\bcatch \(error\)/g, 'catch (erro)');
           c = c.replace(/console\.error\("Erro:", error\)/g, 'console.error("Erro:", erro)');
           c = c.replace(/console\.error\("Falha no login:", error\)/g, 'console.error("Falha no login:", erro)');
           c = c.replace(/error:/g, 'erro:');
        } else if (key === 'body') {
           c = c.replace(/\bbody\b/g, 'corpo');
        } else if (key === 'params') {
           c = c.replace(/\bparams\b/g, 'parametros');
        } else if (key === 'payload') {
           c = c.replace(/\bpayload\b/g, 'dadosPayload');
        } else {
           c = c.split(key).join(value);
        }
      }
      
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}

walk('app/api');

const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      const orig = c;
      
      c = c.replace(/utils\/session/g, 'utils/sessao')
           .replace(/infra\/database/g, 'infra/bancoDeDados')
           .replace(/models\/store/g, 'models/estado')
           .replace(/"\.\.\/database"/g, '"../bancoDeDados"')
           .replace(/"\.\.\/\.\.\/database"/g, '"../../bancoDeDados"')
           .replace(/"\.\.\/\.\.\/\.\.\/infra\/database"/g, '"../../../../infra/bancoDeDados"');
           
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}

walk('.');

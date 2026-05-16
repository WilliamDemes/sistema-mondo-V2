const fs = require('fs');
const path = require('path');

const replacements = {
  'FormulariosFlutuantesAtividades': 'FormulariosFlutuantesAtividades',
  'GraficoRadarDashboardGeral': 'GraficoRadarDashboardGeral',
  'GraficosClienteUI': 'GraficosClienteUI',
  'GraficosAnaliseFamilia': 'GraficosAnaliseFamilia',
  'GraficoHistoricoFamilia': 'GraficoHistoricoFamilia',
  'MapaLocalizacaoFamilia': 'MapaLocalizacaoFamilia',
  'CalendarioClienteUI': 'CalendarioClienteUI',
  'dadosFalsos': 'dadosFalsos',
};

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx')) {
      let c = fs.readFileSync(p, 'utf8');
      const orig = c;
      
      for (const [key, value] of Object.entries(replacements)) {
         const regex = new RegExp('\\b' + key + '\\b', 'g');
         c = c.replace(regex, value);
      }
      
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}

walk('.');

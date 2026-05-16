const fs = require('fs');
const path = require('path');

const replacements = {
  // common states
  'loading': 'carregando',
  'setLoading': 'setCarregando',
  'baseStats': 'estatisticasBase',
  'setBaseStats': 'setEstatisticasBase',
  'DashboardStats': 'EstatisticasDashboard',
  'showAllCards': 'mostrarTodosCartoes',
  'setShowAllCards': 'setMostrarTodosCartoes',
  'expandedCards': 'cartoesExpandidos',
  'setExpandedCards': 'setCartoesExpandidos',
  'selectedYears': 'anosSelecionados',
  'setSelectedYears': 'setAnosSelecionados',
  'selectedMonths': 'mesesSelecionados',
  'setSelectedMonths': 'setMesesSelecionados',
  'RecentActivity': 'AtividadeRecente',
  'TerritoryData': 'DadosTerritorio',
  'MonthlyData': 'DadosMensais',
  'TopFamily': 'TopFamilia',
  'Activitys': 'Atividades',
  // etc
};

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      // only translate in app/(dashboard)
      if (!p.includes('app\\(dashboard)')) return;

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

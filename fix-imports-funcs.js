const fs = require('fs');
const path = require('path');

const replacements = {
  // imports
  '@/infra/bancoDeDados': '@/infra/bancoDeDados',
  '@/models/estado': '@/models/estado',
  '@/utils/sessao': '@/utils/sessao',
  '../../../utils/sessao': '../../../utils/sessao',
  '../../../../utils/sessao': '../../../../utils/sessao',
  '../../../../infra/bancoDeDados': '../../../../infra/bancoDeDados',
  '../../../infra/bancoDeDados': '../../../infra/bancoDeDados',
  // sessao
  'criptografar': 'criptografar',
  'descriptografar': 'descriptografar',
  // estado functions
  'buscarTodasFamilias': 'buscarTodasFamilias',
  'buscarFamiliaPorId': 'buscarFamiliaPorId',
  'criarFamilia': 'criarFamilia',
  'atualizarFamilia': 'atualizarFamilia',
  'deletarFamilia': 'deletarFamilia',
  'buscarBeneficiariosPorFamilia': 'buscarBeneficiariosPorFamilia',
  'criarBeneficiario': 'criarBeneficiario',
  'deletarBeneficiario': 'deletarBeneficiario',
  'buscarTodosBeneficiarios': 'buscarTodosBeneficiarios',
  'buscarTodasAtividades': 'buscarTodasAtividades',
  'buscarAtividadePorId': 'buscarAtividadePorId',
  'criarAtividade': 'criarAtividade',
  'atualizarAtividade': 'atualizarAtividade',
  'deletarAtividade': 'deletarAtividade',
  'buscarParticipacoesPorFamilia': 'buscarParticipacoesPorFamilia',
  'buscarParticipacoesPorAtividade': 'buscarParticipacoesPorAtividade',
  'buscarTodasParticipacoes': 'buscarTodasParticipacoes',
  'criarParticipacao': 'criarParticipacao',
  'deletarParticipacao': 'deletarParticipacao',
  'buscarEstatisticasDashboard': 'buscarEstatisticasDashboard',
  'usuarioAtual': 'usuarioAtual',
  // Types
  'StatusFamilia': 'StatusFamilia',
  'PapelBeneficiario': 'PapelBeneficiario',
  'TipoAtividade': 'TipoAtividade',
  'FormatoAtividade': 'FormatoAtividade',
  'Familia': 'Familia',
  'Beneficiario': 'Beneficiario',
  'Atividade': 'Atividade',
  'Participacao': 'Participacao'
};

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx')) {
      if (p.includes('estado.ts') || p.includes('sessao.ts') || p.includes('bancoDeDados.ts')) return; // ignore already translated

      let c = fs.readFileSync(p, 'utf8');
      const orig = c;
      
      for (const [key, value] of Object.entries(replacements)) {
        // Simple replace, might need word boundaries for some, but let's be careful.
        // For functions and types, using word boundary \b
        const isPath = key.includes('/');
        if (isPath) {
          c = c.split(key).join(value);
        } else {
          const regex = new RegExp('\\b' + key + '\\b', 'g');
          c = c.replace(regex, value);
        }
      }
      
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}

walk('.');

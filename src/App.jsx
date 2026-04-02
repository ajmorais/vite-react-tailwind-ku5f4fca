import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { 
  Shield, Car, Users, LayoutDashboard, FileText, Wrench, CheckCircle, 
  AlertTriangle, Camera, LogOut, Plus, Trash2, Printer, Info, KeyRound, Edit, Bell, XCircle,
  Eye, Download, ArrowUp, ArrowDown, Terminal, UserMinus, Search, MapPin, Clock, UserPlus, FileSignature, Activity,
  ClipboardList, BarChart2, Crosshair, Gavel
} from 'lucide-react';

// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE (NUVEM)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCPztA_Y8CrotlU9l8WVdZqOAxAlOwIfr8",
  authDomain: "frota3bpm-checklist-24a37.firebaseapp.com",
  databaseURL: "https://frota3bpm-checklist-24a37-default-rtdb.firebaseio.com",
  projectId: "frota3bpm-checklist-24a37",
  storageBucket: "frota3bpm-checklist-24a37.firebasestorage.app",
  messagingSenderId: "413595995326",
  appId: "1:413595995326:web:52c5e94a3513f511c6a2ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pmce-vtr-producao-v2';

// ==========================================
// CONFIGURAÇÕES GERAIS E LINKS
// ==========================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3tdBvWpwYa2P7F8WrsRlVF9qYPS93YHKHbkK2YpWWL2wBcs-bIqDpdoSLiOQ5cGHALg/exec";
const LOGO_URL = "https://lh3.googleusercontent.com/d/1fiDnR5kJfSnH-o2xBEv7DfP6H2hbnPXz";
const PLANILHA_EFETIVO_URL = "https://docs.google.com/spreadsheets/d/1BadMt7OMYLqaKFRgsgQJFYI4JGRhVdNSnq_5N9DPFGU/gviz/tq?tqx=out:json";

const DECLARACAO_SEM_ALTERACAO = "Declaro para os devidos fins que recebi a viatura/equipamento SEM ALTERAÇÕES. Declaro ainda que realizei a devida conferência, procedendo à verificação minuciosa do estado geral, condições de uso, níveis de fluidos e funcionamento (quando aplicável), dos equipamentos obrigatórios e operacionais (rádio, GPS, armamentos, munições, algemas, coletes), bem como documentação e limpeza. Assumo total responsabilidade pelos materiais sob minha cautela durante o período de serviço.";

// ==========================================
// 2. DADOS DO SISTEMA E CONSTANTES
// ==========================================
const CIDADES_SERVICO = ['SOBRAL', 'FORQUILHA', 'GROAÍRAS', 'CARIRÉ', 'MUCAMBO', 'GRAÇA', 'PACUJÁ', 'MASSAPÊ', 'SANTANA DO ACARAÚ', 'MERUOCA', 'ALCÂNTARAS', 'SENADOR SÁ', 'COREAÚ', 'FRECHEIRINHA', 'OUTRA'];
const OPMS = ['3ºBPM', '1ªCIA DO 3ºBPM', '2ªCIA DO 3ºBPM', '3ªCIA DO 3ºBPM', '4ªCIA DO 3ºBPM', 'OUTRA'];
const MODALIDADES = ['VIATURA', 'MOTOCICLETA', 'A PÉ / FIXO'];

const CHECKLIST_CATEGORIES_VTR = {
  'Exterior e Lataria': ['Para-choque Dianteiro', 'Para-choque Traseiro', 'Portas Lado Direito', 'Portas Lado Esquerdo', 'Capô', 'Porta-malas', 'Teto', 'Pintura/Adesivos', 'Retrovisores', 'Estribo'],
  'Vidros': ['Para-brisa', 'Vidros Laterais Direitos', 'Vidros Laterais Esquerdos', 'Vidro Traseiro'],
  'Iluminação e Sinalização': ['Farol Baixo', 'Farol Alto', 'Lanternas Traseiras', 'Setas', 'Luz de Freio', 'Sirene', 'Giroflex/Sinalizador'],
  'Pneus e Equipamentos': ['Pneu Dianteiro Direito', 'Pneu Dianteiro Esquerdo', 'Pneu Traseiro Direito', 'Pneu Traseiro Esquerdo', 'Estepe (Step)', 'Calotas', 'Chave de Roda', 'Macaco', 'Triângulo'],
  'Interior e Cabine': ['Bancos Dianteiros', 'Bancos Traseiros', 'Cintos de Segurança', 'Painel de Instrumentos', 'Ar Condicionado', 'Botões dos Vidros', 'Rádio Comunicador', 'Extintor', 'Tapetes', 'Limpeza Interna'],
  'Mecânica Básica': ['Bateria', 'Nível de Óleo', 'Nível de Água do Radiador', 'Freios', 'Motor (Ruídos/Vazamentos)']
};

const CHECKLIST_CATEGORIES_MOTO = {
  'Estrutura e Carenagem': ['Carenagem Frontal', 'Carenagem Lateral', 'Retrovisores', 'Banco', 'Baú/Bauleto'],
  'Iluminação e Sinalização': ['Farol', 'Lanterna Traseira', 'Setas', 'Luz de Freio', 'Sirene', 'Giroflex'],
  'Pneus e Suspensão': ['Pneu Dianteiro', 'Pneu Traseiro', 'Rodas', 'Amortecedores Dianteiros', 'Amortecedor Traseiro'],
  'Mecânica e Fluidos': ['Bateria', 'Nível de Óleo', 'Freio Dianteiro', 'Freio Traseiro', 'Transmissão (Corrente/Correia)', 'Motor (Ruídos/Vazamentos)'],
  'Equipamentos de Segurança': ['Capacetes', 'Rádio Comunicador']
};

const POSTOS_GRADUACOES = ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST', 'ASP OFICIAL', '2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'];
const TURNOS = ['A', 'B', '24HRS'];
const TIPOS_SERVICO = ['ORDINÁRIO', 'DRSO'];
const PROCEDIMENTOS = ['BO', 'TCO', 'APF', 'BOC', 'INQ', 'OUTROS'];

const ROLES = {
  'operacional': { label: 'OPERACIONAL', weight: 1 },
  'oficial': { label: 'OFICIAL', weight: 2 },
  'oficial_superior': { label: 'OFICIAL SUPERIOR', weight: 3 },
  'dev': { label: 'DESENVOLVEDOR', weight: 4 }
};

const FROTA_INICIAL = [
  '31021','31031','30001','30511','30501','3434','3444','31004','3741','SEG 010',
  'MP 013','31001','31011','3551','3731','3581','3591','3601','3611','3621',
  '3691','3711','R110','3531','3521','3681','3661','3491','COPAC 01','COPAC 02',
  'COPAC 03','COPAC 30','CPC 16','5811','POG 057','21382','12322','3511','3331',
  '3641','3651','BM 037','BM 044','BM 054','TP 024','TE 14','POE 02','31002',
  '31041','3892','3902','3912','3922','3952','3982','3992','3561','3224',
  'POG 31013','31113','POG 31043','31073','3593','3364','3553','3573','3932',
  '3942','3962','3972','POG 040','3951','3294','3931','3201','3563','17881','16432',
  'MP3012','MP3016','MP3017','MP3019','MP3021','MP3013','MP3014','MP3015','MP3018'
];

const MANDATORY_PHOTOS = [
  'Frontal', 'Traseira', 'Lateral Esquerda', 'Lateral Direita',
  'Pneu Dianteiro Direito', 'Pneu Dianteiro Esquerdo',
  'Pneu Traseiro Direito', 'Pneu Traseiro Esquerdo',
  'Estepe', 'Motor', 'Painel', 'Hodômetro'
];

const saveSession = (data) => localStorage.setItem('vtr_prod_v2_session', JSON.stringify(data));
const getSession = () => { try { return JSON.parse(localStorage.getItem('vtr_prod_v2_session')); } catch(e){ return null; } };

const isServiceActive = (c) => {
  if (!c || !c.horaFinal || !c.date) return false;
  const checkDate = new Date(c.date);
  const now = new Date();
  const [hFim, mFim] = c.horaFinal.split(':').map(Number);
  const [hIni, mIni] = (c.horaInicial || "00:00").split(':').map(Number);
  let finalDate = new Date(checkDate);
  finalDate.setHours(hFim, mFim, 0, 0);
  if (hFim < hIni) finalDate.setDate(finalDate.getDate() + 1);
  return now <= finalDate;
};

// Função de Formatação obrigatória de Matrícula (inicia com número)
const formatMatricula = (val) => {
  let cleanVal = val.toUpperCase().replace(/[^A-Z0-9]/g, ''); 
  if (cleanVal === 'D' || cleanVal === 'DE' || cleanVal === 'DEV') return cleanVal;
  if (cleanVal.length > 0 && /^[^0-9]/.test(cleanVal)) {
    cleanVal = cleanVal.replace(/^[^0-9]+/, '');
  }
  return cleanVal;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [viaturas, setViaturas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]); // NOVO ESTADO
  const [usersDb, setUsersDb] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [efetivoPlanilha, setEfetivoPlanilha] = useState([]); 
  
  const [view, setView] = useState('login'); 
  const [printLayout, setPrintLayout] = useState(null);
  const [viewService, setViewService] = useState(null); 
  const [viewOcorrencia, setViewOcorrencia] = useState(null); // NOVO MODAL
  const [toast, setToast] = useState(null); 
  const [loadingDrive, setLoadingDrive] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const handleFirebaseError = (error, contextAction) => {
    console.error(`Erro [${contextAction}]:`, error);
    if (error.code === 'permission-denied') {
      showToast("ERRO DE REGRAS NO FIREBASE: Leia as instruções para atualizar as regras da base de dados.", "error");
    } else {
      showToast(`Erro na Nuvem (${contextAction}): ${error.message}`, "error");
    }
  };

  const registerLog = async (matricula, name, action) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), {
        matricula, name, action, timestamp: new Date().toISOString()
      });
    } catch(e) {}
  };

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) {}
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetch(PLANILHA_EFETIVO_URL)
      .then(res => res.text())
      .then(text => {
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
        if (match && match[1]) {
          const json = JSON.parse(match[1]);
          const rows = json.table.rows.map(r => r.c.map(cell => cell && cell.v != null ? String(cell.v).trim() : ''));
          setEfetivoPlanilha(rows);
        }
      })
      .catch(e => console.error("Erro ao carregar planilha de efetivo em background:", e));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'usuarios'), (snap) => {
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersDb(users);
      
      const session = getSession();
      if (session) {
        const dbUser = users.find(u => u.matricula === session.matricula);
        if (dbUser) {
          if (dbUser.status === 'Inativo') {
            setUserData(null);
            localStorage.removeItem('vtr_prod_v2_session');
            setView('login');
          } else {
            setUserData(dbUser);
            setView(prevView => {
              if (prevView === 'login') {
                return dbUser.role !== 'operacional' ? 'admin_dash' : 'user_check';
              }
              return prevView;
            });
          }
        }
      }
    }, (error) => handleFirebaseError(error, "Leitura de Usuários"));

    const unsubVtr = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'viaturas'), (snap) => {
      const vtrs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setViaturas(vtrs);

      if (vtrs.length === 0) {
        const seedRef = doc(db, 'artifacts', appId, 'public', 'data', 'system_config', 'seed_status');
        getDoc(seedRef).then(seedSnap => {
          if (!seedSnap.exists()) {
             setDoc(seedRef, { seeded: true, date: new Date().toISOString() });
             FROTA_INICIAL.forEach(prefixo => {
                 addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'viaturas'), { prefixo, placa: '', modelo: '', condicao: 'Operante', localInoperante: '' });
             });
          }
        }).catch(e => {});
      }
    }, (error) => handleFirebaseError(error, "Leitura de Viaturas"));

    const unsubCheck = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'servicos'), (snap) => {
      setServicos(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (error) => handleFirebaseError(error, "Leitura de Serviços"));

    const unsubOcorrencias = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'ocorrencias'), (snap) => {
      setOcorrencias(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro)));
    }, (error) => handleFirebaseError(error, "Leitura de Ocorrências"));

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), (snap) => {
      setAccessLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, (error) => handleFirebaseError(error, "Leitura de Logs"));

    return () => { unsubUsers(); unsubVtr(); unsubCheck(); unsubOcorrencias(); unsubLogs(); };
  }, [user]);

  const handleRegister = async (data) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', data.matricula);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) return showToast("Matrícula já cadastrada no sistema!", "error");

      const isFirstUser = usersDb.length === 0; 
      const isDev = data.matricula === 'DEV';

      if (!isDev && !isFirstUser && efetivoPlanilha.length > 0) {
        const foundInSheet = efetivoPlanilha.find(r => r[0] === data.matricula);
        if (!foundInSheet) {
          showToast("Matrícula INVÁLIDA! O seu registo não foi encontrado na base de dados do Batalhão.", "error");
          return false;
        }
      }

      const newUser = {
        matricula: data.matricula,
        posto: data.posto,
        nomeCompleto: data.nomeCompleto.toUpperCase(),
        name: data.nomeGuerra.toUpperCase(), 
        email: data.email.toLowerCase(),
        telefone: data.telefone,
        password: data.password,
        role: isDev ? 'dev' : (isFirstUser ? 'oficial_superior' : 'operacional'),
        status: isDev || isFirstUser ? 'Ativo' : 'Pendente',
        createdAt: new Date().toISOString()
      };

      await setDoc(userDocRef, newUser);
      
      if (isDev) showToast("Acesso ROOT concedido. Perfil Desenvolvedor ativado.", "success");
      else if (isFirstUser) showToast("Cadastro realizado! Perfil OFICIAL SUPERIOR ativado automaticamente.", "success");
      else showToast("CADASTRO REALIZADO. Aguarde aprovação do Oficial/Comando.", "info");
      return true;
    } catch(e) { handleFirebaseError(e, "Cadastro de Usuário"); return false; }
  };

  const handleLogin = async (matricula, password) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    const dbUser = usersDb.find(u => u.matricula === matricula);
    
    if (!dbUser) return showToast("Matrícula não encontrada. Por favor, cadastre-se.", "error");
    if (dbUser.password !== password) return showToast("Senha incorreta.", "error");
    if (dbUser.status === 'Pendente') return showToast("O seu cadastro está pendente. Aguarde a aprovação.", "info");
    if (dbUser.status === 'Inativo') return showToast("A sua conta está inativa. Procure o Oficial.", "error");

    setUserData(dbUser);
    saveSession({ matricula: dbUser.matricula });
    registerLog(dbUser.matricula, dbUser.name, 'LOGIN');
    
    showToast("LOGIN EFETUADO COM SUCESSO.", "success");
    setView(dbUser.role !== 'operacional' ? 'admin_dash' : 'user_check');
  };

  const handleChangePassword = async (matricula, currentPassword, newPassword) => {
    if (!user) return false;
    const dbUser = usersDb.find(u => u.matricula === matricula);
    if (!dbUser) return showToast("Matrícula não encontrada.", "error");
    if (dbUser.password !== currentPassword) return showToast("Senha atual incorreta.", "error");

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matricula), { password: newPassword });
      showToast("SENHA ALTERADA COM SUCESSO! Faça o login com sua nova senha.", "success");
      return true;
    } catch(e) { handleFirebaseError(e, "Alterar Senha"); return false; }
  };

  const logout = () => {
    if (userData) registerLog(userData.matricula, userData.name, 'LOGOUT');
    setUserData(null);
    localStorage.removeItem('vtr_prod_v2_session');
    setView('login');
    showToast("Sessão encerrada.", "info");
  };

  const saveViatura = async (placa, prefixo, modelo, condicao, localInoperante) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'viaturas'), { 
        placa: placa.toUpperCase(), prefixo: prefixo.toUpperCase(), modelo: modelo.toUpperCase(), condicao, localInoperante: localInoperante.toUpperCase() 
      });
      showToast("Viatura adicionada com sucesso!", "success");
    } catch(e) { handleFirebaseError(e, "Adicionar Viatura"); }
  };
  const editViatura = async (id, placa, prefixo, modelo, condicao, localInoperante) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'viaturas', id), { 
        placa: placa.toUpperCase(), prefixo: prefixo.toUpperCase(), modelo: modelo.toUpperCase(), condicao, localInoperante: localInoperante.toUpperCase() 
      });
      showToast("Viatura atualizada!", "success");
    } catch(e) { handleFirebaseError(e, "Editar Viatura"); }
  };
  const deleteViatura = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'viaturas', id)); showToast("Viatura removida.", "info"); } 
    catch(e) { handleFirebaseError(e, "Excluir Viatura"); }
  };

  const updateUserRole = async (matriculaId, newRole) => {
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matriculaId), { role: newRole }); showToast("Perfil atualizado.", "success"); } 
    catch(e) { handleFirebaseError(e, "Atualizar Perfil"); }
  };
  const updateUserStatus = async (matriculaId, newStatus) => {
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matriculaId), { status: newStatus }); showToast("Status atualizado.", "success"); } 
    catch(e) { handleFirebaseError(e, "Atualizar Status"); }
  };
  const updateUserDetails = async (matriculaId, updatedData) => {
    try {
      const dataUpper = { ...updatedData, nomeCompleto: updatedData.nomeCompleto.toUpperCase(), name: updatedData.name.toUpperCase(), email: updatedData.email.toLowerCase() };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matriculaId), dataUpper);
      showToast("Dados do PM atualizados.", "success");
    } catch(e) { handleFirebaseError(e, "Editar Detalhes Usuário"); }
  };
  const deleteUser = async (matriculaId) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matriculaId)); showToast("Usuário excluído do sistema permanentemente.", "success"); } 
    catch(e) { handleFirebaseError(e, "Excluir Usuário"); }
  };
  const generateTempPassword = async (matriculaId) => {
    if (!user) return null;
    try {
      const tempPass = 'PMCE@' + Math.floor(1000 + Math.random() * 9000);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', matriculaId), { password: tempPass });
      return tempPass;
    } catch(e) { handleFirebaseError(e, "Gerar Senha"); return null; }
  };
  const deleteService = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'servicos', id)); showToast("Entrada de Serviço apagada permanentemente.", "success"); setViewService(null); } 
    catch(e) { handleFirebaseError(e, "Apagar Serviço"); }
  };
  const deleteOcorrencia = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ocorrencias', id)); showToast("Ocorrência apagada permanentemente.", "success"); setViewOcorrencia(null); } 
    catch(e) { handleFirebaseError(e, "Apagar Ocorrência"); }
  };
  const clearLogs = async () => {
    try {
      for (const log of accessLogs) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'logs', log.id)); }
      showToast("Histórico de Sessões limpo com sucesso.", "success");
    } catch(e) { handleFirebaseError(e, "Limpar Logs"); }
  };

  const saveService = async (data) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    setLoadingDrive(true);
    const serviceData = { ...data, id: Date.now().toString() };
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'servicos'), serviceData);
      if (APPS_SCRIPT_URL.includes("script.google.com")) {
        fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(serviceData) }).catch(e => {});
      }
      showToast("Entrada de Serviço registada com sucesso na Nuvem!", "success");
      setView('user_hist');
    } catch (error) {
      handleFirebaseError(error, "Salvar Entrada de Serviço");
    } finally {
      setLoadingDrive(false);
    }
  };

  const saveOcorrencia = async (data) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    setLoadingDrive(true);
    const ocData = { ...data, id: Date.now().toString(), dataRegistro: new Date().toISOString() };
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ocorrencias'), ocData);
      showToast("Relatório de Ocorrência Policial registado com sucesso!", "success");
      setView('user_hist_ocorrencia');
    } catch (error) {
      handleFirebaseError(error, "Salvar Ocorrência");
    } finally {
      setLoadingDrive(false);
    }
  };

  if (printLayout) {
    return <PrintView data={printLayout} onClose={() => setPrintLayout(null)} />;
  }

  const isDev = userData?.role === 'dev';
  const isGestor = userData?.role !== 'operacional'; 

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 relative">
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-bold flex items-center space-x-3 animate-fadeIn ${
          toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
        }`}>
          {toast.type === 'error' && <AlertTriangle size={20} />}
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'info' && <Bell size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {loadingDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] px-4">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#004b23] mx-auto mb-4"></div>
            <h3 className="font-bold text-lg text-[#004b23] mb-2">A Processar...</h3>
            <p className="text-sm text-gray-600 font-medium">A registrar os dados na Base de Dados Oficial.</p>
          </div>
        </div>
      )}

      {viewService && (
        <ServiceModal data={viewService} onClose={() => setViewService(null)} isDev={isDev} onDelete={deleteService} />
      )}
      
      {viewOcorrencia && (
        <OcorrenciaModal data={viewOcorrencia} onClose={() => setViewOcorrencia(null)} isDev={isDev} onDelete={deleteOcorrencia} />
      )}

      {view === 'login' && <LoginScreen onLogin={handleLogin} onChangePassword={handleChangePassword} onRegister={handleRegister} showToast={showToast} />}
      
      {userData && view !== 'login' && (
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar userData={userData} view={view} setView={setView} logout={logout} />
          <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
            {view === 'dev_dash' && <DevDashboard logs={accessLogs} onClearLogs={clearLogs} />}
            {view === 'admin_dash' && <AdminDashboard servicos={servicos} viaturas={viaturas} setPrintLayout={setPrintLayout} setViewService={setViewService} />}
            {view === 'admin_equipes' && <AdminEquipesAtivas servicos={servicos} setViewService={setViewService} />}
            {view === 'admin_vtr' && <AdminViaturas viaturas={viaturas} onAdd={saveViatura} onEdit={editViatura} onDelete={deleteViatura} />}
            {view === 'admin_users' && <AdminUsers usersDb={usersDb} onUpdateRole={updateUserRole} onUpdateStatus={updateUserStatus} onUpdateUserDetails={updateUserDetails} onDeleteUser={deleteUser} onGeneratePassword={generateTempPassword} currentUser={userData} isDev={isDev} />}
            
            {view === 'user_check' && <ServiceEntryForm viaturas={viaturas.filter(v => v.condicao !== 'Inoperante')} onSave={saveService} userData={userData} servicos={servicos} usersDb={usersDb} efetivoPlanilha={efetivoPlanilha} setView={setView} showToast={showToast} />}
            {view === 'user_hist' && <UserHistory servicos={isGestor ? servicos : servicos.filter(c => c.equipe?.some(eq => eq.matricula === userData.matricula))} viaturas={viaturas} setPrintLayout={setPrintLayout} setViewService={setViewService} isGestor={isGestor} isDev={isDev} onDeleteService={deleteService} />}
            
            {/* TELA DE PRODUTIVIDADE */}
            {view === 'user_ocorrencia' && <OcorrenciaForm onSave={saveOcorrencia} userData={userData} usersDb={usersDb} efetivoPlanilha={efetivoPlanilha} viaturas={viaturas} setView={setView} />}
            {view === 'user_hist_ocorrencia' && <OcorrenciaHistory ocorrencias={isGestor ? ocorrencias : ocorrencias.filter(c => c.equipe?.some(eq => eq.matricula === userData.matricula))} setPrintLayout={setPrintLayout} setViewOcorrencia={setViewOcorrencia} isGestor={isGestor} isDev={isDev} onDelete={deleteOcorrencia} />}
          </main>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTES DE INTERFACE
// ==========================================

function LoginScreen({ onLogin, onChangePassword, onRegister, showToast }) {
  const [mode, setMode] = useState('login'); 
  const [matricula, setMatricula] = useState('');
  const [pass, setPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const [regData, setRegData] = useState({ posto: '', nomeCompleto: '', nomeGuerra: '', email: '', telefone: '', password: '', confirmPassword: '' });

  const handleMatriculaChange = (val, setterFunction) => {
    setterFunction(formatMatricula(val));
  };

  const buscarPlanilhaEfetivo = async () => {
    if (!matricula) return showToast("Digite a matrícula primeiro.", "error");
    setLoading(true);
    try {
      const response = await fetch(PLANILHA_EFETIVO_URL);
      const text = await response.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
      if (match && match[1]) {
        const json = JSON.parse(match[1]);
        const rows = json.table.rows.map(r => r.c.map(cell => cell && cell.v != null ? String(cell.v).trim() : ''));
        const busca = matricula.trim();
        const found = rows.find(r => r[0] && String(r[0]) === busca);
        if (found) {
           setRegData(prev => ({
             ...prev, posto: found[1] || prev.posto, nomeCompleto: found[2] ? found[2].toUpperCase() : prev.nomeCompleto,
             nomeGuerra: found[3] ? found[3].toUpperCase() : prev.nomeGuerra, email: found[4] ? found[4].toLowerCase() : prev.email
           }));
           showToast("Dados do PM encontrados e preenchidos!", "success");
        } else {
           showToast("Matrícula não encontrada na Planilha Geral.", "info");
        }
      } else { showToast("Erro ao processar o formato da Planilha.", "error"); }
    } catch (e) {
      showToast("Não foi possível aceder à planilha pública.", "error");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') await onLogin(matricula, pass);
    else if (mode === 'change_password') {
      const success = await onChangePassword(matricula, pass, newPass);
      if (success) { setMode('login'); setPass(''); setNewPass(''); }
    } else if (mode === 'register') {
      if (!regData.posto) { showToast("Por favor, selecione o seu Posto/Graduação.", "error"); setLoading(false); return; }
      if (regData.password !== regData.confirmPassword) { alert("A senha e a confirmação não coincidem."); setLoading(false); return; }
      const success = await onRegister({ matricula, ...regData });
      if (success) {
         setMode('login'); setMatricula(''); setPass('');
         setRegData({ posto: '', nomeCompleto: '', nomeGuerra: '', email: '', telefone: '', password: '', confirmPassword: '' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-95 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] p-4">
      <div className={`bg-white p-8 rounded-xl shadow-2xl w-full ${mode === 'register' ? 'max-w-2xl' : 'max-w-md'} border-t-8 border-[#004b23] transition-all duration-300`}>
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_URL} alt="Brasão 3º BPM" className="w-20 h-24 mb-4 object-contain drop-shadow-md" />
          <h1 className="text-2xl font-bold text-[#004b23] text-center">3º Batalhão PMCE</h1>
          <p className="text-gray-500 text-sm font-semibold">
            {mode === 'login' ? 'Entrada de Serviço' : mode === 'register' ? 'Cadastro de PM' : 'Alteração de Senha'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'login' || mode === 'change_password') && (
            <div className="animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Matrícula (Apenas Números)</label>
                <input required type="text" className="mt-1 w-full p-3 border rounded-lg focus:ring-[#004b23] focus:border-[#004b23] uppercase font-mono tracking-widest text-lg" value={matricula} onChange={e => handleMatriculaChange(e.target.value, setMatricula)} placeholder="000000" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700">{mode === 'login' ? 'Senha' : 'Senha Atual'}</label>
                <input required type="password" className="mt-1 w-full p-3 border rounded-lg focus:ring-[#004b23] focus:border-[#004b23]" value={pass} onChange={e => setPass(e.target.value)} placeholder="A sua senha..." />
              </div>
              {mode === 'change_password' && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700">Nova Senha</label>
                  <input required type="password" className="mt-1 w-full p-3 border rounded-lg focus:ring-[#004b23] focus:border-[#004b23]" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Digite a nova senha..." />
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-end bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Matrícula (Apenas Números)</label>
                  <input required type="text" className="w-full p-2 border rounded-lg uppercase font-mono" value={matricula} onChange={e => handleMatriculaChange(e.target.value, setMatricula)} placeholder="000000" />
                </div>
                <button type="button" onClick={buscarPlanilhaEfetivo} disabled={loading || !matricula} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center shadow disabled:opacity-50">
                  <Search size={18} className="mr-2"/> Buscar Cadastro (Planilha)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Posto/Graduação</label>
                  <select required className="mt-1 w-full p-2 border rounded-lg" value={regData.posto} onChange={e => setRegData({...regData, posto: e.target.value})}>
                    <option value="" disabled>SELECIONE...</option>
                    {POSTOS_GRADUACOES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome Completo</label>
                  <input required type="text" className="mt-1 w-full p-2 border rounded-lg uppercase" value={regData.nomeCompleto} onChange={e => setRegData({...regData, nomeCompleto: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Nome de Guerra</label>
                  <input required type="text" className="mt-1 w-full p-2 border rounded-lg uppercase" value={regData.nomeGuerra} onChange={e => setRegData({...regData, nomeGuerra: e.target.value.toUpperCase()})} placeholder="Ex: SILVA" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Telefone Contato</label>
                  <input required type="tel" className="mt-1 w-full p-2 border rounded-lg uppercase" value={regData.telefone} onChange={e => setRegData({...regData, telefone: e.target.value.toUpperCase()})} placeholder="(88) 99999-9999" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">E-mail</label>
                  <input required type="email" className="mt-1 w-full p-2 border rounded-lg lowercase" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Criar Senha</label>
                  <input required type="password" className="mt-1 w-full p-2 border rounded-lg" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Confirmar Senha</label>
                  <input required type="password" className="mt-1 w-full p-2 border rounded-lg" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-[#004b23] text-white font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-lg mt-6 disabled:opacity-50">
            {loading ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR NO SISTEMA' : mode === 'register' ? 'CONCLUIR CADASTRO' : 'SALVAR NOVA SENHA'}
          </button>

          <div className="flex flex-col space-y-2 mt-4 text-center">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => {setMode('register'); setMatricula(''); setPass('');}} className="text-sm text-gray-600 hover:text-[#004b23] font-bold">Não tem acesso? Cadastre-se</button>
                <button type="button" onClick={() => {setMode('change_password'); setPass('');}} className="text-sm text-gray-500 hover:text-[#004b23] underline">Esqueci/Alterar minha senha</button>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" onClick={() => {setMode('login'); setMatricula(''); setPass('');}} className="text-sm text-gray-500 hover:text-[#004b23] font-bold underline">Voltar para a tela de Login</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ userData, view, setView, logout }) {
  const isGestor = userData?.role !== 'operacional';
  const isDev = userData?.role === 'dev';

  const baseItems = [
    { id: 'user_check', icon: <FileSignature size={20}/>, label: 'Entrada de Serviço' },
    { id: 'user_hist', icon: <FileText size={20}/>, label: isGestor ? 'Histórico Geral (VTR)' : 'Meu Histórico (VTR)' },
  ];

  const produtividadeItems = [
    { id: 'user_ocorrencia', icon: <ClipboardList size={20}/>, label: 'Reg. Ocorrência Policial' },
    { id: 'user_hist_ocorrencia', icon: <BarChart2 size={20}/>, label: isGestor ? 'Gestão de Produtividade' : 'Minha Produtividade' },
  ];

  const adminItems = isGestor ? [
    { id: 'admin_dash', icon: <LayoutDashboard size={20}/>, label: 'Panorama Gerencial' },
    { id: 'admin_equipes', icon: <Activity size={20}/>, label: 'Equipes em Serviço' },
    { id: 'admin_vtr', icon: <Car size={20}/>, label: 'Frota (Viaturas)' },
    { id: 'admin_users', icon: <Users size={20}/>, label: 'Efetivo (Usuários)' },
  ] : [];

  const devItems = isDev ? [
    { id: 'dev_dash', icon: <Terminal size={20}/>, label: 'Painel do Desenvolvedor' },
  ] : [];

  const menuItems = [...devItems, ...adminItems, ...baseItems];

  const getRoleLabel = (role) => {
    if (role === 'dev') return 'Desenvolvedor';
    if (role === 'oficial_superior') return 'Oficial Superior';
    if (role === 'oficial') return 'Oficial';
    return 'Operacional';
  };

  return (
    <div className="bg-[#004b23] text-white w-full md:w-64 flex flex-col shadow-xl overflow-y-auto">
      <div className="p-6 text-center border-b border-green-700 flex flex-col items-center">
        <img src={LOGO_URL} alt="Brasão" className="w-16 h-16 mb-2 object-contain drop-shadow-md" />
        <h2 className="font-bold text-lg">3º BPM - PMCE</h2>
        <p className="text-xs text-green-200">Gestão Operacional</p>
      </div>
      
      <div className="p-4 border-b border-green-700 bg-green-900 bg-opacity-50">
        <p className="text-sm">Logado como:</p>
        <p className="font-bold text-[#ffb703]">{userData?.posto} {userData?.name}</p>
        <p className="text-xs font-mono">Mat: {userData?.matricula}</p>
        <p className="text-[10px] uppercase font-bold mt-1 text-green-300 px-2 py-0.5 bg-green-800 rounded inline-block">{getRoleLabel(userData?.role)}</p>
      </div>

      <nav className="flex-1 py-4">
        <div className="px-4 text-xs font-bold text-green-400 uppercase mb-2">Serviço Diário</div>
        {baseItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 px-6 py-2.5 text-left transition text-sm ${view === item.id ? 'bg-[#ffb703] text-green-900 font-bold' : 'hover:bg-green-700'}`}>
            {item.icon} <span>{item.label}</span>
          </button>
        ))}

        <div className="px-4 text-xs font-bold text-green-400 uppercase mt-4 mb-2">Produtividade</div>
        {produtividadeItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 px-6 py-2.5 text-left transition text-sm ${view === item.id ? 'bg-[#ffb703] text-green-900 font-bold' : 'hover:bg-green-700'}`}>
            {item.icon} <span>{item.label}</span>
          </button>
        ))}

        {isGestor && (
          <>
            <div className="px-4 text-xs font-bold text-green-400 uppercase mt-4 mb-2">Administração</div>
            {adminItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 px-6 py-2.5 text-left transition text-sm ${view === item.id ? 'bg-[#ffb703] text-green-900 font-bold' : 'hover:bg-green-700'}`}>
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
          </>
        )}

        {isDev && (
          <>
            <div className="px-4 text-xs font-bold text-green-400 uppercase mt-4 mb-2">Sistema</div>
            {devItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 px-6 py-2.5 text-left transition text-sm ${view === item.id ? 'bg-[#ffb703] text-green-900 font-bold' : 'hover:bg-green-700'}`}>
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <button onClick={logout} className="w-full flex items-center justify-center space-x-2 p-4 bg-red-700 hover:bg-red-800 transition text-white font-semibold">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </div>
  );
}

function DevDashboard({ logs, onClearLogs }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Terminal className="mr-2"/> Painel do Desenvolvedor</h2>
          <p className="text-gray-500 text-sm">Monitoramento de Sessões do Sistema na Nuvem</p>
        </div>
        <button onClick={() => { if(window.confirm('Tem a certeza que deseja limpar todo o histórico de logs?')) onClearLogs() }} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 shadow-sm font-bold text-sm">
          <Trash2 size={16} /> <span>Limpar Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm border-b border-gray-800 flex items-center">
          <Terminal size={16} className="mr-2"/> firebase_cloud_access.log
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0 shadow-sm">
              <tr>
                <th className="p-3">Data/Hora</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Utilizador</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-sans">Nenhum registo de sessão encontrado.</td></tr>}
              {logs.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-gray-700">{l.matricula}</td>
                  <td className="p-3">{l.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded font-bold text-xs ${l.action === 'LOGIN' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {l.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ servicos, viaturas, setPrintLayout, setViewService }) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); 
  const [activeKpiFilter, setActiveKpiFilter] = useState('all'); 
  
  const [sortKey, setSortKey] = useState('prefixo');
  const [sortOrder, setSortOrder] = useState('asc');

  const servicosDoDia = (servicos || []).filter(c => c?.date?.startsWith(filterDate));
  
  const frotaStatus = (viaturas || []).map(v => {
    const connectedService = servicosDoDia.find(c => {
      if (c.vtrId === v.id) return true;
      if (c.motosEquipe && Object.values(c.motosEquipe).some(m => m?.vtrId === v.id)) return true;
      return false;
    });
    
    let isConnected = false;
    if (connectedService) isConnected = isServiceActive(connectedService);

    return {
      ...v,
      status: v.condicao === 'Inoperante' ? 'Inoperante' : (isConnected ? 'Conectada' : 'Desconectada'),
      serviceRef: isConnected ? connectedService : null
    };
  });

  const viaturasBaixadas = frotaStatus.filter(v => v?.status === 'Inoperante').length;
  const viaturasOperantes = frotaStatus.filter(v => v?.status === 'Conectada').length;
  const viaturasParadas = frotaStatus.filter(v => v?.status === 'Desconectada').length;
  const totalFrota = frotaStatus.length;

  const percentageConnected = totalFrota > 0 ? Math.round((viaturasOperantes / totalFrota) * 100) : 0;

  let displayedFrota = [...frotaStatus];
  if (activeKpiFilter === 'operantes') displayedFrota = displayedFrota.filter(v => v.status === 'Conectada');
  if (activeKpiFilter === 'desconectadas') displayedFrota = displayedFrota.filter(v => v.status === 'Desconectada');
  if (activeKpiFilter === 'baixadas') displayedFrota = displayedFrota.filter(v => v.status === 'Inoperante');

  const sortedFrota = displayedFrota.sort((a, b) => {
    let valA = a[sortKey] || '';
    let valB = b[sortKey] || '';
    if (sortKey === 'status') {
      const weight = { 'Conectada': 1, 'Desconectada': 2, 'Inoperante': 3 };
      valA = weight[a.status] || 4;
      valB = weight[b.status] || 4;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredForTable = servicosDoDia.filter(c => {
    if (activeKpiFilter === 'operantes' && !isServiceActive(c)) return false;
    return true;
  });

  const handlePrintPanorama = () => {
    setPrintLayout({
      type: 'panorama',
      data: filteredForTable,
      frotaData: frotaStatus,
      filters: { vtr: 'Todas', date: filterDate }
    });
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panorama Gerencial</h2>
          <p className="text-gray-500 text-sm">Acompanhamento de Frota em tempo real na Nuvem.</p>
        </div>
        <div className="flex space-x-3">
          <input type="date" className="p-2 border rounded-lg bg-white shadow-sm font-bold text-[#004b23]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <button onClick={handlePrintPanorama} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 shadow-sm font-bold">
            <Printer size={18} /> <span className="hidden md:inline">Imprimir Resumo</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
          <span>Taxa de Ocupação da Frota Diária</span>
          <span>{percentageConnected}% Operando</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
          <div className="bg-green-500 h-4 transition-all duration-1000" style={{ width: `${percentageConnected}%` }}></div>
          <div className="bg-red-500 h-4 transition-all duration-1000" style={{ width: `${totalFrota > 0 ? (viaturasBaixadas/totalFrota)*100 : 0}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Operantes ({viaturasOperantes})</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Desconectadas ({viaturasParadas})</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Baixadas ({viaturasBaixadas})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveKpiFilter('all')} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${activeKpiFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-300'}`}>
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total da Frota</p>
          <div className="flex items-center"><Car className="text-blue-600 mr-2"/><span className="text-2xl font-bold">{totalFrota}</span></div>
        </button>
        <button onClick={() => setActiveKpiFilter('operantes')} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${activeKpiFilter === 'operantes' ? 'border-green-600 ring-2 ring-green-200' : 'border-green-300'}`}>
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Viaturas Operando</p>
          <div className="flex items-center"><CheckCircle className="text-green-500 mr-2"/><span className="text-2xl font-bold">{viaturasOperantes}</span></div>
          <p className="text-[10px] text-green-600 mt-1">Conectadas Atualmente</p>
        </button>
        <button onClick={() => setActiveKpiFilter('desconectadas')} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${activeKpiFilter === 'desconectadas' ? 'border-gray-600 ring-2 ring-gray-200' : 'border-gray-300'}`}>
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">VTRs Desconectadas</p>
          <div className="flex items-center"><Car className="text-gray-500 mr-2"/><span className="text-2xl font-bold">{viaturasParadas}</span></div>
          <p className="text-[10px] text-gray-500 mt-1">Livres no Batalhão</p>
        </button>
        <button onClick={() => setActiveKpiFilter('baixadas')} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${activeKpiFilter === 'baixadas' ? 'border-red-600 ring-2 ring-red-200' : 'border-red-300'}`}>
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Viaturas Baixadas</p>
          <div className="flex items-center"><AlertTriangle className="text-red-500 mr-2"/><span className="text-2xl font-bold text-red-600">{viaturasBaixadas}</span></div>
          <p className="text-[10px] text-red-500 mt-1">Inoperantes / Manutenção</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
          <span className="font-bold text-gray-700">Listagem de Veículos ({sortedFrota.length})</span>
          <div className="flex space-x-2 text-xs">
            <button onClick={() => toggleSort('prefixo')} className="flex items-center text-gray-600 hover:text-black font-bold px-2 py-1 bg-white border rounded shadow-sm">
              Prefixo {sortKey==='prefixo' && (sortOrder==='asc'?<ArrowUp size={12}/>:<ArrowDown size={12}/>)}
            </button>
            <button onClick={() => toggleSort('status')} className="flex items-center text-gray-600 hover:text-black font-bold px-2 py-1 bg-white border rounded shadow-sm">
              Status {sortKey==='status' && (sortOrder==='asc'?<ArrowUp size={12}/>:<ArrowDown size={12}/>)}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-b">Veículo</th>
                <th className="p-3 border-b">Modelo / Placa</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Vinculação Ativa (Serviço)</th>
              </tr>
            </thead>
            <tbody>
              {sortedFrota.map(v => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold text-[#004b23]">{v.prefixo}</td>
                  <td className="p-3 text-xs text-gray-600">{v.modelo || 'S/M'} - {v.placa || 'S/P'}</td>
                  <td className="p-3">
                    {v.status === 'Conectada' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center w-max"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Ativa</span>}
                    {v.status === 'Desconectada' && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold flex items-center w-max"><span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span> Desconectada</span>}
                    {v.status === 'Inoperante' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center w-max"><AlertTriangle size={10} className="mr-1" /> Baixada</span>}
                  </td>
                  <td className="p-3">
                    {v.status === 'Conectada' ? (
                      <div>
                        <p className="font-bold text-xs">{v.serviceRef?.equipe?.[0]?.posto} {v.serviceRef?.equipe?.[0]?.nome}</p>
                        <p className="text-[10px] text-gray-500">Área: {v.serviceRef?.areaAtuacao}</p>
                      </div>
                    ) : v.status === 'Inoperante' ? (
                      <span className="text-xs text-red-500 font-bold">{v.localInoperante}</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Disponível no Batalhão</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedFrota.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">Nenhum veículo neste filtro.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminEquipesAtivas({ servicos, setViewService }) {
  const [filterModalidade, setFilterModalidade] = useState('');
  const [filterOpm, setFilterOpm] = useState('');
  const [filterBusca, setFilterBusca] = useState('');
  const [kpiFilter, setKpiFilter] = useState('all');

  const equipesAtivas = (servicos || []).filter(isServiceActive);

  const totalPMs = equipesAtivas.reduce((acc, eq) => acc + (eq.equipe?.filter(m => m.matricula).length || 0), 0);
  const totalVtr = equipesAtivas.filter(e => e.modalidade === 'VIATURA').length;
  const totalMoto = equipesAtivas.filter(e => e.modalidade === 'MOTOCICLETA').length;

  const filteredEquipes = equipesAtivas.filter(c => {
    if (kpiFilter === 'VIATURA' && c.modalidade !== 'VIATURA') return false;
    if (kpiFilter === 'MOTOCICLETA' && c.modalidade !== 'MOTOCICLETA') return false;

    if (filterModalidade && c.modalidade !== filterModalidade) return false;
    if (filterOpm && c.opm !== filterOpm && c.opmOutra !== filterOpm) return false;
    if (filterBusca) {
      const termo = filterBusca.toUpperCase();
      const matchPrefixo = (c.prefixo || '').toUpperCase().includes(termo);
      const matchArea = (c.areaAtuacao || '').toUpperCase().includes(termo);
      const matchMembro = c.equipe?.some(eq => eq.nome.toUpperCase().includes(termo) || eq.matricula.includes(termo));
      if (!matchPrefixo && !matchArea && !matchMembro) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Equipes em Serviço</h2>
          <p className="text-gray-500 text-sm">Controle em tempo real de todas as equipes ativas no turno atual.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setKpiFilter('all')} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${kpiFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-300'}`}>
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Equipes Ativas (Total)</p>
          <div className="flex items-center"><Shield className="text-blue-600 mr-2" size={20}/><span className="text-xl font-bold">{equipesAtivas.length}</span></div>
        </button>
        <button onClick={() => setKpiFilter('all')} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${kpiFilter === 'all' ? 'border-green-600 ring-2 ring-green-200' : 'border-green-300'}`}>
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">PMs Conectados</p>
          <div className="flex items-center"><Users className="text-green-600 mr-2" size={20}/><span className="text-xl font-bold">{totalPMs}</span></div>
        </button>
        <button onClick={() => setKpiFilter('VIATURA')} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${kpiFilter === 'VIATURA' ? 'border-purple-600 ring-2 ring-purple-200' : 'border-purple-300'}`}>
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Patrulhas Auto</p>
          <div className="flex items-center"><Car className="text-purple-600 mr-2" size={20}/><span className="text-xl font-bold">{totalVtr}</span></div>
        </button>
        <button onClick={() => setKpiFilter('MOTOCICLETA')} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col justify-center text-left transition hover:scale-105 ${kpiFilter === 'MOTOCICLETA' ? 'border-orange-600 ring-2 ring-orange-200' : 'border-orange-300'}`}>
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Patrulhas Moto</p>
          <div className="flex items-center"><Activity className="text-orange-600 mr-2" size={20}/><span className="text-xl font-bold">{totalMoto}</span></div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Modalidade</label>
          <select className="p-2 border rounded text-sm w-full uppercase" value={filterModalidade} onChange={e => { setFilterModalidade(e.target.value); setKpiFilter('all'); }}>
            <option value="">Todas</option>
            {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">OPM</label>
          <select className="p-2 border rounded text-sm w-full uppercase" value={filterOpm} onChange={e => setFilterOpm(e.target.value)}>
            <option value="">Todas as OPMs</option>
            {OPMS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase">Buscar (PM, VTR, Área)</label>
          <input type="text" placeholder="Digite para buscar..." className="p-2 border rounded text-sm w-full uppercase" value={filterBusca} onChange={e => setFilterBusca(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipes.map(c => {
           const cmde = c.equipe?.[0];
           
           let vtrDisplay = c.prefixo || c.modalidade;
           if (c.modalidade === 'MOTOCICLETA' && c.motosEquipe) {
             const prefixes = Object.values(c.motosEquipe).map(m => m?.prefixo).filter(Boolean);
             if (prefixes.length > 0) vtrDisplay = prefixes.join(' / ');
           }

           return (
             <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-blue-600 relative hover:shadow-lg transition">
               <div className="p-5">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-bold text-blue-900">{vtrDisplay}</h3>
                     <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">{c.modalidade}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-xs text-gray-800 font-bold block flex items-center justify-end"><Clock size={12} className="mr-1 text-blue-600"/> {c.horaInicial} - {c.horaFinal}</span>
                     <span className="text-[10px] text-green-600 font-bold flex items-center justify-end mt-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span> Em Patrulhamento</span>
                   </div>
                 </div>
                 
                 <div className="mb-4">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Efetivo:</p>
                    <div className="space-y-1">
                      {(c.equipe || []).map((eq, idx) => (
                        <p key={idx} className="text-xs text-gray-700 truncate">
                          <span className="font-bold">{eq.funcao === 'CMDE DA EQUIPE' ? 'CMDE' : eq.funcao}:</span> {eq.posto} {eq.nome}
                        </p>
                      ))}
                    </div>
                 </div>

                 <div className="text-xs text-gray-600 border-t pt-3 flex items-center">
                    <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0"/> 
                    <span className="truncate" title={c.areaAtuacao}>{c.areaAtuacao}</span>
                 </div>
               </div>
               <div className="bg-gray-50 p-2 flex justify-center border-t">
                  <button onClick={() => setViewService(c)} className="w-full text-sm text-blue-700 font-bold hover:text-blue-900 flex items-center justify-center py-1">
                    <Eye size={16} className="mr-2"/> Abrir Ficha Completa
                  </button>
               </div>
             </div>
           )
        })}
        {filteredEquipes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold">Nenhuma equipa ativa no momento.</p>
            <p className="text-sm">As equipas ativas irão aparecer aqui automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminViaturas({ viaturas, onAdd, onEdit, onDelete }) {
  const [placa, setPlaca] = useState('');
  const [prefixo, setPrefixo] = useState('');
  const [modelo, setModelo] = useState('');
  const [condicao, setCondicao] = useState('Operante');
  const [localInoperante, setLocalInoperante] = useState('');
  const [editingVtr, setEditingVtr] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(placa && prefixo && modelo) {
      onAdd(placa.toUpperCase(), prefixo.toUpperCase(), modelo.toUpperCase(), condicao, condicao === 'Inoperante' ? localInoperante.toUpperCase() : '');
      setPlaca(''); setPrefixo(''); setModelo(''); setCondicao('Operante'); setLocalInoperante('');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editingVtr.id, editingVtr.placa.toUpperCase(), editingVtr.prefixo.toUpperCase(), editingVtr.modelo.toUpperCase(), editingVtr.condicao, editingVtr.condicao === 'Inoperante' ? editingVtr.localInoperante.toUpperCase() : '');
    setEditingVtr(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestão de Frota</h2>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-[#004b23]">Cadastrar Nova Viatura / Motocicleta</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div><label className="text-xs text-gray-500">Prefixo</label><input required className="w-full p-2 border rounded uppercase" value={prefixo} onChange={e=>setPrefixo(e.target.value.toUpperCase())} placeholder="Ex: CP-3045"/></div>
          <div><label className="text-xs text-gray-500">Placa</label><input required className="w-full p-2 border rounded uppercase" value={placa} onChange={e=>setPlaca(e.target.value.toUpperCase())} placeholder="Ex: ABC-1234"/></div>
          <div><label className="text-xs text-gray-500">Modelo</label><input required className="w-full p-2 border rounded uppercase" value={modelo} onChange={e=>setModelo(e.target.value.toUpperCase())} placeholder="Ex: Hilux / XRE 300"/></div>
          
          <div>
            <label className="text-xs text-gray-500">Status da Frota</label>
            <select className="w-full p-2 border rounded" value={condicao} onChange={e=>setCondicao(e.target.value)}>
              <option value="Operante">Operante</option>
              <option value="Inoperante">Inoperante / Baixada</option>
            </select>
          </div>
          
          {condicao === 'Inoperante' ? (
            <div>
              <label className="text-xs text-red-500 font-bold">Local (Ex: Oficina)</label>
              <input required className="w-full p-2 border border-red-300 rounded uppercase" value={localInoperante} onChange={e=>setLocalInoperante(e.target.value.toUpperCase())} placeholder="Onde está?"/>
            </div>
          ) : (
             <div></div>
          )}

          <button type="submit" className="bg-[#ffb703] text-[#004b23] font-bold p-2 rounded flex justify-center items-center hover:bg-yellow-500 h-10"><Plus size={20} className="mr-1"/> Adicionar</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm flex items-center border-b border-yellow-100">
          <Info size={16} className="mr-2 min-w-max"/> 
          Atualize a Placa, Modelo ou altere o status para "Inoperante" clicando em Editar (lápis).
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#004b23] text-white">
            <tr><th className="p-3">Prefixo</th><th className="p-3">Placa</th><th className="p-3">Modelo</th><th className="p-3">Status</th><th className="p-3 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {(viaturas || []).map(v => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">{v.prefixo}</td>
                <td className="p-3">{v.placa || <span className="text-gray-400 italic text-xs">Pendente</span>}</td>
                <td className="p-3">{v.modelo || <span className="text-gray-400 italic text-xs">Pendente</span>}</td>
                <td className="p-3">
                  {v.condicao === 'Inoperante' ? 
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Inoperante ({v.localInoperante})</span> : 
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Operante</span>
                  }
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditingVtr({...v})} className="text-[#004b23] hover:bg-green-100 p-2 rounded transition" title="Editar Viatura"><Edit size={18}/></button>
                  <button onClick={() => { if(window.confirm('Excluir registo permanentemente?')) onDelete(v.id) }} className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Excluir"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição de Viatura */}
      {editingVtr && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#004b23] mb-4 border-b pb-2">Editar Frota</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Prefixo</label>
                <input required type="text" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingVtr.prefixo} onChange={e => setEditingVtr({...editingVtr, prefixo: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Placa</label>
                <input type="text" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingVtr.placa} onChange={e => setEditingVtr({...editingVtr, placa: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Modelo</label>
                <input type="text" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingVtr.modelo} onChange={e => setEditingVtr({...editingVtr, modelo: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Status Operacional</label>
                <select className="mt-1 w-full p-2 border rounded focus:ring-[#004b23]" value={editingVtr.condicao || 'Operante'} onChange={e => setEditingVtr({...editingVtr, condicao: e.target.value})}>
                  <option value="Operante">Operante</option>
                  <option value="Inoperante">Inoperante / Baixada</option>
                </select>
              </div>
              {editingVtr.condicao === 'Inoperante' && (
                <div>
                  <label className="block text-xs font-bold text-red-600">Local (Oficina, Pátio, etc.)</label>
                  <input required type="text" className="mt-1 w-full p-2 border border-red-300 rounded focus:ring-red-500 uppercase" value={editingVtr.localInoperante || ''} onChange={e => setEditingVtr({...editingVtr, localInoperante: e.target.value.toUpperCase()})} />
                </div>
              )}
              <div className="flex space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setEditingVtr(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded hover:bg-gray-300 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#ffb703] text-[#004b23] font-bold py-2 rounded hover:bg-yellow-400 transition shadow">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsers({ usersDb, onUpdateRole, onUpdateStatus, onUpdateUserDetails, onDeleteUser, onGeneratePassword, currentUser, isDev }) {
  const [editingUser, setEditingUser] = useState(null);
  const [tempPassData, setTempPassData] = useState(null);

  const currentUserWeight = ROLES[currentUser?.role]?.weight || 0;

  // Filtra os utilizadores para mostrar apenas quem tem nível igual ou inferior
  const visibleUsers = (usersDb || []).filter(u => {
    const userWeight = ROLES[u.role]?.weight || 0;
    return isDev || currentUserWeight >= userWeight;
  });

  const handleGeneratePass = async (u) => {
    const pass = await onGeneratePassword(u.matricula);
    if (pass) setTempPassData({ user: u, pass });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    await onUpdateUserDetails(editingUser.matricula, { 
      posto: editingUser.posto, 
      nomeCompleto: editingUser.nomeCompleto.toUpperCase(), 
      name: editingUser.name.toUpperCase(), 
      email: editingUser.email.toLowerCase(), 
      telefone: editingUser.telefone 
    });
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">Efetivo (Gestão de Usuários)</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm flex items-center border-b border-yellow-100">
          <Info size={24} className="mr-2 min-w-max"/> 
          Sua hierarquia permite gerir apenas utilizadores de nível inferior ao seu (exceto Desenvolvedor, que tem acesso total).
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4">Matrícula</th>
                <th className="p-4">PM</th>
                <th className="p-4">Status</th>
                <th className="p-4">Perfil (Nível)</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(u => {
                const isMe = currentUser && u.matricula === currentUser.matricula;
                const userWeight = ROLES[u.role]?.weight || 0;
                const canEdit = isDev || isMe || (currentUserWeight > userWeight);

                return (
                <tr key={u.matricula} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-600 font-mono">{u.matricula}</td>
                  <td className="p-4">
                    <p className="font-bold">{u.posto} {u.name}</p>
                    <p className="text-xs text-gray-400">{u.nomeCompleto}</p>
                    <p className="text-xs text-gray-400">{u.telefone}</p>
                  </td>
                  <td className="p-4">
                    {isMe || !canEdit ? (
                       <span className={`px-2 py-1 rounded text-xs font-bold ${u.status==='Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {u.status === 'Ativo' ? 'ATIVO' : u.status.toUpperCase()}
                       </span>
                    ) : (
                      <select
                        value={u.status || 'Pendente'}
                        onChange={(e) => onUpdateStatus(u.matricula, e.target.value)}
                        className={`p-1 rounded text-xs font-bold border outline-none cursor-pointer 
                          ${u.status==='Ativo' ? 'bg-green-100 text-green-800 border-green-300' 
                          : u.status==='Inativo' ? 'bg-red-100 text-red-800 border-red-300' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}
                      >
                        <option value="Ativo">ATIVO</option>
                        <option value="Pendente">PENDENTE</option>
                        <option value="Inativo">INATIVO</option>
                      </select>
                    )}
                  </td>
                  <td className="p-4">
                    {isMe || !canEdit ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isMe ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {isMe ? `${ROLES[u.role]?.label} (Você)` : ROLES[u.role]?.label}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateRole(u.matricula, e.target.value)}
                        className={`p-1 rounded text-xs font-bold border outline-none cursor-pointer bg-blue-50 text-blue-800 border-blue-200`}
                      >
                        <option value="operacional">OPERACIONAL</option>
                        {currentUserWeight >= 2 && <option value="oficial">OFICIAL</option>}
                        {currentUserWeight >= 3 && <option value="oficial_superior">OFICIAL SUPERIOR</option>}
                        {isDev && <option value="dev">DESENVOLVEDOR</option>}
                      </select>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2 flex justify-end">
                    {canEdit ? (
                      <>
                        <button onClick={() => setEditingUser({...u})} className="text-[#004b23] hover:bg-green-100 p-2 rounded inline-flex items-center transition" title="Editar Cadastro">
                          <Edit size={18}/>
                        </button>
                        <button onClick={() => handleGeneratePass(u)} className="text-blue-600 hover:bg-blue-100 p-2 rounded inline-flex items-center transition" title="Gerar nova senha provisória">
                          <KeyRound size={18}/>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic flex items-center h-full pt-2"><Shield size={12} className="mr-1"/> Restrito</span>
                    )}
                    
                    {isDev && !isMe && (
                      <button onClick={() => { if(window.confirm(`Tem a certeza que deseja excluir permanentemente o utilizador ${u.name}?`)) onDeleteUser(u.matricula) }} className="text-red-600 hover:bg-red-100 p-2 rounded inline-flex items-center transition ml-2" title="Excluir Usuário">
                        <UserMinus size={18}/>
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Senha Provisória */}
      {tempPassData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <KeyRound size={40} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Senha Provisória Gerada!</h3>
            <p className="text-sm text-gray-600 mb-6">Informe esta senha para <b>{tempPassData.user.posto} {tempPassData.user.name}</b> (Matrícula: {tempPassData.user.matricula}).</p>
            <div className="bg-gray-100 p-4 rounded-lg text-3xl font-mono tracking-widest font-bold text-[#004b23] border-2 border-dashed border-gray-300 mb-6">
              {tempPassData.pass}
            </div>
            <button onClick={() => setTempPassData(null)} className="w-full bg-[#004b23] hover:bg-green-800 text-white font-bold py-3 rounded-lg transition shadow-lg">
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#004b23] mb-4 border-b pb-2">Editar Cadastro de Policial</h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Matrícula (Imutável)</label>
                  <input type="text" disabled className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={editingUser.matricula} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Posto/Graduação</label>
                  <select required className="mt-1 w-full p-2 border rounded focus:ring-[#004b23]" value={editingUser.posto} onChange={e => setEditingUser({...editingUser, posto: e.target.value})}>
                    <option value="" disabled>SELECIONE...</option>
                    {POSTOS_GRADUACOES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Nome Completo</label>
                <input required type="text" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingUser.nomeCompleto} onChange={e => setEditingUser({...editingUser, nomeCompleto: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Nome de Guerra</label>
                  <input required type="text" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Telefone Contato</label>
                  <input required type="tel" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] uppercase" value={editingUser.telefone} onChange={e => setEditingUser({...editingUser, telefone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">E-mail</label>
                <input required type="email" className="mt-1 w-full p-2 border rounded focus:ring-[#004b23] lowercase" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded hover:bg-gray-300 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#ffb703] text-[#004b23] font-bold py-2 rounded hover:bg-yellow-400 transition shadow">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TELA DO USUÁRIO PADRÃO - ENTRADA DE SERVIÇO
// ==========================================

function ServiceEntryForm({ viaturas, onSave, userData, servicos, usersDb, efetivoPlanilha, setView, showToast }) {
  const [step, setStep] = useState(1);
  const [permitirNovo, setPermitirNovo] = useState(false);
  const [conflitoEquipe, setConflitoEquipe] = useState(null); 

  const [formData, setFormData] = useState({
    modalidade: MODALIDADES[0], 
    opm: OPMS[0], 
    opmOutra: '', 
    ht: '', 
    areaAtuacao: '',
    turno: TURNOS[0], 
    tipoServico: TIPOS_SERVICO[0], 
    horaInicial: '', 
    horaFinal: '', 
    equipe: [
      { id: 1, funcao: 'CMDE DA EQUIPE', matricula: userData?.matricula || '', nome: userData?.name || '', nomeCompleto: userData?.nomeCompleto || '', posto: userData?.posto || '', telefone: userData?.telefone || '' },
      { id: 2, funcao: 'MOTORISTA', matricula: '', nome: '', nomeCompleto: '', posto: '', telefone: '' }
    ],
    vtrId: '', prefixo: '', placa: '',
    motosEquipe: {}, 
    kmAtual: '', kmProxima: '', trocaOleo: 'Não',
    itens: {}, 
    outrasAlteracoes: '',
    fotos: {} 
  });

  const checklistJaFeitoHoje = (servicos || []).find(c => {
    return c.matricula === userData?.matricula && isServiceActive(c);
  });

  useEffect(() => {
    const initItens = {};
    const categorias = formData.modalidade === 'MOTOCICLETA' ? CHECKLIST_CATEGORIES_MOTO : CHECKLIST_CATEGORIES_VTR;
    
    if (formData.modalidade !== 'A PÉ / FIXO') {
      Object.values(categorias).flat().forEach(item => { initItens[item] = { status: 'OK', obs: '' }; });
    }
    setFormData(prev => ({ ...prev, itens: initItens, fotos: {}, motosEquipe: {} })); 
  }, [formData.modalidade]);

  const handleMatriculaChange = (id, val) => {
    let cleanVal = formatMatricula(val); 
    
    setFormData(prev => {
      const newEquipe = prev.equipe.map(m => {
        if (m.id === id) {
          let novoNome = '';
          let novoNomeComp = '';
          let novoPosto = '';
          let novoTelefone = m.telefone;
          
          if (cleanVal) {
            const userDB = usersDb.find(u => u.matricula === cleanVal);
            if (userDB) {
              novoNome = userDB.name;
              novoNomeComp = userDB.nomeCompleto;
              novoPosto = userDB.posto;
              novoTelefone = userDB.telefone || novoTelefone;
            } else {
              const userSheet = (efetivoPlanilha || []).find(r => r[0] && String(r[0]).trim() === cleanVal);
              if (userSheet) {
                novoPosto = userSheet[1] || '';
                novoNomeComp = userSheet[2] || '';
                novoNome = userSheet[3] || userSheet[2] || '';
              }
            }
          }

          return { ...m, matricula: cleanVal, nome: novoNome, nomeCompleto: novoNomeComp, posto: novoPosto, telefone: novoTelefone };
        }
        return m;
      });
      return { ...prev, equipe: newEquipe };
    });
  };

  const addPatrulheiro = () => {
    const num = formData.equipe.length + 1;
    setFormData(prev => ({
      ...prev,
      equipe: [...prev.equipe, { id: Date.now(), funcao: `PATRULHEIRO 0${num}`, matricula: '', nome: '', nomeCompleto: '', posto: '', telefone: '' }]
    }));
  };

  const removePatrulheiro = (id) => {
    setFormData(prev => {
      const newMotosEquipe = { ...prev.motosEquipe };
      delete newMotosEquipe[id];
      return { 
        ...prev, 
        equipe: prev.equipe.filter(m => m.id !== id),
        motosEquipe: newMotosEquipe 
      };
    });
  };

  const handleVtrSelect = (e) => {
    const v = (viaturas || []).find(v => v.id === e.target.value);
    if (v) setFormData({ ...formData, vtrId: v.id, prefixo: v.prefixo, placa: v.placa });
  };

  const handleItemChange = (item, field, value) => {
    setFormData({ ...formData, itens: { ...formData.itens, [item]: { ...formData.itens[item], [field]: value } } });
  };

  const handlePhotoUpload = (e, angle) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1200; 
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; } } 
          else { if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; } }

          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          const metadata = { name: file.name, sizeKb: `${((compressedDataUrl.length * 0.75) / 1024).toFixed(2)}`, lastMod: new Date().toISOString() };

          setFormData(prev => ({ ...prev, fotos: { ...prev.fotos, [angle]: { url: compressedDataUrl, metadata } } }));
        };
        img.onerror = () => showToast("Erro ao processar a imagem. Tente outra.", "error");
        img.src = event.target.result;
      };
      reader.onerror = () => showToast("Erro ao ler o arquivo.", "error");
      reader.readAsDataURL(file); 
    } catch (err) {
      showToast("Erro no upload da imagem: " + err.message, "error");
    }
  };

  const validateStep1AndGo = () => {
    if (!formData.horaInicial || !formData.horaFinal) return alert("Preencha as horas iniciais e finais do turno.");
    if (formData.opm === 'OUTRA' && !formData.opmOutra) return alert("Preencha a OPM Outra.");
    setStep(2);
  };

  const validateStep2AndGo = () => {
    const memSemMatricula = formData.equipe.filter(m => !m.matricula);
    if (memSemMatricula.length > 0) return alert("Todas as funções na equipe devem ter uma matrícula preenchida.");
    
    // Impedir avançar se digitou matrículas falsas/inexistentes
    const memInvalidos = formData.equipe.filter(m => !m.nome && m.matricula !== 'DEV');
    if (memInvalidos.length > 0) {
        return alert(`Matrícula(s) não encontrada(s) na base de dados: ${memInvalidos.map(m => m.matricula).join(', ')}. Insira matrículas válidas.`);
    }
    
    const servicosAtivos = (servicos || []).filter(isServiceActive);
    let conflito = null;

    formData.equipe.forEach(m => {
       const servicoConflitante = servicosAtivos.find(serv => serv.equipe?.some(eq => eq.matricula === m.matricula));
       if (servicoConflitante && !permitirNovo) {
         conflito = { pm: m, servicoAnterior: servicoConflitante };
       }
    });

    if (conflito) {
      setConflitoEquipe(conflito);
      return;
    }

    if (formData.modalidade === 'A PÉ / FIXO') setStep(4); 
    else setStep(3);
  };

  const getRequiredPhotos = () => {
    if (formData.modalidade === 'A PÉ / FIXO') {
      return ['Efetivo no Local'];
    } else if (formData.modalidade === 'MOTOCICLETA') {
      return []; 
    } else {
      return MANDATORY_PHOTOS; 
    }
  };

  const submitForm = () => {
    const requiredPhotos = getRequiredPhotos();
    const uploadedAngles = Object.keys(formData.fotos || {});
    
    if (uploadedAngles.length < requiredPhotos.length) {
      const missing = requiredPhotos.filter(a => !uploadedAngles.includes(a));
      return alert(`ATENÇÃO: É obrigatório enviar todas as fotos exigidas para esta modalidade.\n\nFaltam:\n- ${missing.join('\n- ')}`);
    }

    if (formData.modalidade === 'VIATURA' && (!formData.vtrId || !formData.kmAtual)) {
      return alert("Preencha o Prefixo da Viatura e o KM Atual");
    }

    if (formData.modalidade === 'MOTOCICLETA') {
      const semMoto = formData.equipe.filter(m => !formData.motosEquipe[m.id]?.vtrId);
      if (semMoto.length > 0) return alert(`Selecione uma moto para cada componente da equipa.`);
      if (!formData.kmAtual) return alert("Preencha o KM Atual.");
    }

    onSave({
      ...formData,
      opm: formData.opm === 'OUTRA' ? formData.opmOutra : formData.opm,
      userId: userData?.matricula,
      matricula: userData?.matricula, 
      posto: userData?.posto,
      userName: userData?.name,
      date: new Date().toISOString(),
      trocaRegistrada: permitirNovo, 
      conflitoAudit: permitirNovo && conflitoEquipe ? `Comandante transferiu PM ${conflitoEquipe.pm.posto} ${conflitoEquipe.pm.nome} (${conflitoEquipe.pm.matricula}) do serviço ativo ${conflitoEquipe.servicoAnterior.prefixo || conflitoEquipe.servicoAnterior.modalidade}` : null
    });
  };

  if (checklistJaFeitoHoje && !permitirNovo) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border-t-4 border-blue-500 text-center animate-fadeIn">
        <Car size={60} className="text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Serviço em Andamento</h2>
        <p className="text-gray-600 mb-4">
          Você já iniciou um serviço na equipa conectada à VTR/Modalidade <b className="text-lg text-[#004b23]">{checklistJaFeitoHoje.prefixo || checklistJaFeitoHoje.modalidade}</b> até às {checklistJaFeitoHoje.horaFinal}.
        </p>
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6 border border-blue-200">
          Deseja desconectar desta viatura para assumir uma nova? 
          <br/><br/>
          <span className="text-xs text-red-600 font-bold">Atenção: Esta ação ficará registrada no sistema para fins de auditoria do Comando.</span>
        </div>
        <div className="flex justify-center space-x-4">
          <button onClick={() => setPermitirNovo(true)} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow transition">SIM, ASSUMIR NOVO SERVIÇO</button>
          <button onClick={() => setView('user_hist')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 shadow transition">NÃO, VOLTAR</button>
        </div>
      </div>
    );
  }

  if (conflitoEquipe && !permitirNovo) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border-t-4 border-orange-500 text-center animate-fadeIn">
        <Users size={60} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Atenção: Transferência de Equipe!</h2>
        <p className="text-gray-600 mb-4">
          O PM <b>{conflitoEquipe.pm.posto} {conflitoEquipe.pm.nome || conflitoEquipe.pm.matricula}</b> já está relacionado noutra Entrada de Serviço ativa (<b className="text-[#004b23]">{conflitoEquipe.servicoAnterior.prefixo || conflitoEquipe.servicoAnterior.modalidade}</b>).
        </p>
        <div className="bg-orange-50 text-orange-800 p-4 rounded-lg text-sm mb-6 border border-orange-200 text-left">
          <strong>Regras do Comando:</strong> Confirma que este PM foi transferido para a sua equipa para este turno?
          <br/><br/>
          Se avançar, o PM passará a constar na sua equipa e esta alteração ficará registada no painel de Auditoria do Comando.
        </div>
        <div className="flex justify-center space-x-4">
          <button onClick={() => { setPermitirNovo(true); setConflitoEquipe(null); if(formData.modalidade==='A PÉ / FIXO') setStep(4); else setStep(3); }} className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 shadow transition">SIM, CONFIRMAR TRANSFERÊNCIA</button>
          <button onClick={() => { setConflitoEquipe(null); setStep(2); }} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 shadow transition">NÃO, VOLTAR E CORRIGIR</button>
        </div>
      </div>
    );
  }

  const temAlteracao = formData.modalidade !== 'A PÉ / FIXO' && Object.values(formData.itens || {}).some(i => i?.status === 'Alterado');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#004b23] text-white p-6 rounded-t-xl flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">Nova Entrada de Serviço</h2>
          <p className="text-green-200 text-sm">Preencha com rigor as configurações do seu turno e patrulha.</p>
        </div>
        <Shield size={40} className="text-[#ffb703] opacity-80" />
      </div>

      <div className="bg-white p-6 shadow-md rounded-b-xl border border-gray-200">
        
        <div className="flex border-b mb-6 pb-4 overflow-x-auto text-sm">
          {['1. Serviço', '2. Equipe', '3. Veículo', '4. Fotos/Conclusão'].map((s, i) => {
             if (s === '3. Veículo' && formData.modalidade === 'A PÉ / FIXO') return null;
             const realIndex = i + 1;
             return (
              <button key={i} onClick={() => setStep(realIndex)} disabled={step < realIndex} className={`px-4 py-2 font-bold whitespace-nowrap ${step === realIndex ? 'text-[#004b23] border-b-4 border-[#ffb703]' : 'text-gray-400'}`}>
                {s}
              </button>
             );
          })}
        </div>

        {/* STEP 1: DADOS INICIAIS */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Configurações Gerais da Patrulha</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modalidade</label>
                  <select className="w-full p-2 border border-gray-300 rounded bg-white font-bold text-[#004b23]" value={formData.modalidade} onChange={e=>setFormData({...formData, modalidade: e.target.value})}>
                    {MODALIDADES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OPM do Serviço</label>
                  <select className="w-full p-2 border border-gray-300 rounded bg-white" value={formData.opm} onChange={e=>setFormData({...formData, opm: e.target.value})}>
                    {OPMS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {formData.opm === 'OUTRA' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OPM Outra</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded bg-white uppercase" value={formData.opmOutra} onChange={e=>setFormData({...formData, opmOutra: e.target.value.toUpperCase()})} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº do HT</label>
                  <input type="text" placeholder="Rádio Móvel/Fixo..." className="w-full p-2 border border-gray-300 rounded bg-white uppercase" value={formData.ht} onChange={e=>setFormData({...formData, ht: e.target.value.toUpperCase()})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center"><MapPin size={14} className="mr-1"/> Área de Atuação</label>
                  <input type="text" required placeholder="Relacione os bairros ou área de operação..." className="w-full p-2 border border-gray-300 rounded bg-white uppercase" value={formData.areaAtuacao} onChange={e=>setFormData({...formData, areaAtuacao: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turno & Tipo de Serviço</label>
                  <div className="flex space-x-2">
                    <select className="w-1/3 p-2 border border-gray-300 rounded bg-white" value={formData.turno} onChange={e=>setFormData({...formData, turno: e.target.value})}>
                      {TURNOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select className="w-2/3 p-2 border border-gray-300 rounded bg-white" value={formData.tipoServico} onChange={e=>setFormData({...formData, tipoServico: e.target.value})}>
                      {TIPOS_SERVICO.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-blue-50 p-6 rounded-lg border-2 border-blue-500 mb-6 mt-4 relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center shadow">
                <Clock size={14} className="mr-1"/> Duração do Turno
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 uppercase mb-1">Hora Inicial</label>
                <input type="time" required className="w-full p-3 border-2 border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-600 font-bold text-xl text-blue-900 text-center" value={formData.horaInicial} onChange={e=>setFormData({...formData, horaInicial: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 uppercase mb-1">Hora Final (Término)</label>
                <input type="time" required className="w-full p-3 border-2 border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-600 font-bold text-xl text-blue-900 text-center" value={formData.horaFinal} onChange={e=>setFormData({...formData, horaFinal: e.target.value})} />
                <p className="text-[10px] text-blue-700 mt-1 font-bold text-center">O sistema irá desconectar a equipa automaticamente após esta hora.</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={validateStep1AndGo} className="bg-[#004b23] text-white px-6 py-2 rounded font-bold hover:bg-green-800 shadow flex items-center">Avançar para Equipe <ArrowUp size={18} className="ml-1 rotate-90"/></button>
            </div>
          </div>
        )}

        {/* STEP 2: EQUIPE */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200 flex items-start">
              <Users size={20} className="mr-2 mt-0.5 flex-shrink-0"/>
              <p>Preencha as matrículas. O sistema completará o nome automaticamente. <br/><b>Nota:</b> O {formData.modalidade==='MOTOCICLETA'?'Piloto 1 / ' : ''}CMDE deve ser o principal responsável.</p>
            </div>

            {formData.equipe.map((membro, index) => (
              <div key={membro.id} className="bg-gray-50 border p-4 rounded-lg relative">
                <h4 className="text-[#004b23] font-bold mb-3 border-b pb-1 text-sm">{membro.funcao}</h4>
                {index > 1 && (
                  <button onClick={() => removePatrulheiro(membro.id)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Matrícula</label>
                    <input type="text" required placeholder="000000" className="w-full p-2 border rounded font-mono uppercase bg-white focus:ring-2 focus:ring-[#004b23]" value={membro.matricula} onChange={e => handleMatriculaChange(membro.id, e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Policial (Auto-preenchimento)</label>
                    {membro.nome ? (
                      <input type="text" readOnly className="w-full p-2 border rounded bg-gray-200 text-[#004b23] font-bold uppercase" value={`${membro.posto} ${membro.nome}`} />
                    ) : (
                      <div className="w-full p-2 border-2 border-dashed border-orange-400 bg-orange-50 text-orange-700 rounded font-bold flex items-center text-sm" style={{ height: '42px' }}>
                         <Search size={16} className="mr-2 animate-pulse" /> Aguardando Matrícula...
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone {index===0 ? '(Obrigatório)' : ''}</label>
                    <input type="tel" required={index===0} className="w-full p-2 border rounded uppercase bg-white focus:ring-2 focus:ring-[#004b23]" value={membro.telefone || ''} onChange={e => {
                       const val = e.target.value;
                       setFormData(prev => ({ ...prev, equipe: prev.equipe.map(x => x.id === membro.id ? {...x, telefone: val} : x) }))
                    }} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addPatrulheiro} className="w-full py-3 border-2 border-dashed border-[#004b23] text-[#004b23] font-bold rounded-lg hover:bg-green-50 transition flex items-center justify-center">
               <UserPlus size={18} className="mr-2"/> Adicionar Componente (Patrulheiro)
            </button>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-2 rounded font-bold border hover:bg-gray-50">⬅ Voltar</button>
              <button onClick={validateStep2AndGo} className="bg-[#004b23] text-white px-6 py-2 rounded font-bold hover:bg-green-800 shadow">Confirmar Equipe ➔</button>
            </div>
          </div>
        )}

        {/* STEP 3: VEÍCULO / INSPECÃO (Ignorado se A Pé) */}
        {step === 3 && formData.modalidade !== 'A PÉ / FIXO' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Seleção da Frota</h3>
              
              {formData.modalidade === 'MOTOCICLETA' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 border border-blue-200">
                    Selecione a motocicleta correspondente a cada membro da equipe.
                  </div>
                  {formData.equipe.map(membro => (
                    <div key={membro.id}>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Moto do {membro.funcao} ({membro.nome})</label>
                      <select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#004b23] font-bold"
                        value={formData.motosEquipe?.[membro.id]?.vtrId || ''}
                        onChange={(e) => {
                          const v = viaturas.find(vtr => vtr.id === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            motosEquipe: {
                              ...prev.motosEquipe,
                              [membro.id]: v ? { vtrId: v.id, prefixo: v.prefixo, placa: v.placa } : null
                            }
                          }));
                        }}
                      >
                        <option value="">-- Selecione a Moto --</option>
                        {(viaturas || []).filter(v => v.condicao !== 'Inoperante').map(v => <option key={v.id} value={v.id}>{v.prefixo} - {v.placa || 'S/ Placa'}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Prefixo Principal da {formData.modalidade}</label>
                  <select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#004b23] font-bold text-lg" value={formData.vtrId} onChange={handleVtrSelect}>
                    <option value="">-- Selecione o Prefixo --</option>
                    {(viaturas || []).filter(v => v.condicao !== 'Inoperante').map(v => <option key={v.id} value={v.id}>{v.prefixo} - {v.placa || 'S/ Placa'}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM Atual {formData.modalidade==='MOTOCICLETA' && '(Moto Piloto 1)'}</label>
                  <input type="number" className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#004b23]" value={formData.kmAtual} onChange={e=>setFormData({...formData, kmAtual: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM Próx. Troca Óleo</label>
                  <input type="number" className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#004b23]" value={formData.kmProxima} onChange={e=>setFormData({...formData, kmProxima: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Necessita Troca Imediata?</label>
                  <select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#004b23]" value={formData.trocaOleo} onChange={e=>setFormData({...formData, trocaOleo: e.target.value})}>
                    <option>Não</option><option>Sim</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="font-bold text-gray-700 mb-2 border-b pb-2"><Wrench className="inline mr-2"/> Inspeção Mecânica / Visual</h3>
              {Object.entries(formData.modalidade === 'MOTOCICLETA' ? CHECKLIST_CATEGORIES_MOTO : CHECKLIST_CATEGORIES_VTR).map(([categoria, itens]) => (
                <div key={categoria} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 border-b font-bold text-gray-700 uppercase text-xs">{categoria}</div>
                  <div className="p-3 space-y-3">
                    {itens.map(item => (
                      <div key={item} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <span className="font-semibold text-gray-800 text-sm md:w-1/3 mb-2 md:mb-0">{item}</span>
                        <div className="flex space-x-2 md:w-1/3">
                          <label className={`flex-1 text-center py-1 rounded cursor-pointer border text-sm font-bold transition ${formData.itens[item]?.status === 'OK' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white text-gray-500'}`}>
                            <input type="radio" name={item} className="hidden" checked={formData.itens[item]?.status === 'OK'} onChange={() => handleItemChange(item, 'status', 'OK')} /> OK
                          </label>
                          <label className={`flex-1 text-center py-1 rounded cursor-pointer border text-sm font-bold transition ${formData.itens[item]?.status === 'Alterado' ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white text-gray-500'}`}>
                            <input type="radio" name={item} className="hidden" checked={formData.itens[item]?.status === 'Alterado'} onChange={() => handleItemChange(item, 'status', 'Alterado')} /> Alterado
                          </label>
                        </div>
                        <div className="md:w-1/3 mt-2 md:mt-0 md:pl-2">
                          {formData.itens[item]?.status === 'Alterado' && (
                            <input type="text" placeholder="Avaria..." className="w-full p-1.5 border border-red-300 rounded focus:ring-red-500 text-xs uppercase" value={formData.itens[item]?.obs} onChange={(e) => handleItemChange(item, 'obs', e.target.value.toUpperCase())} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="text-gray-600 px-6 py-2 rounded font-bold border hover:bg-gray-50">⬅ Voltar</button>
              <button onClick={() => setStep(4)} className="bg-[#004b23] text-white px-6 py-2 rounded font-bold hover:bg-green-800 shadow">Fotos e Finalizar ➔</button>
            </div>
          </div>
        )}

        {/* STEP 4: FOTOS E CONCLUSÃO */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            
            {formData.modalidade === 'MOTOCICLETA' ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 text-center font-bold">
                <CheckCircle className="inline mr-2"/>
                Não há exigência de registo fotográfico para a modalidade MOTOCICLETA.
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 flex items-center mb-2"><Camera className="mr-2"/> Evidências Fotográficas ({formData.modalidade})</h3>
                <p className="text-sm text-blue-800 mb-6">Pode tirar a fotografia na hora ou anexar um arquivo clicando nos quadros abaixo.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(formData.modalidade === 'A PÉ / FIXO' ? ['Efetivo no Local'] : MANDATORY_PHOTOS).map(angle => {
                    const foto = formData.fotos[angle];
                    return (
                      <div key={angle} className="relative h-40 rounded-lg border-2 border-dashed border-[#004b23] bg-white flex flex-col items-center justify-center overflow-hidden group shadow-sm transition hover:bg-green-50">
                        {foto ? (
                          <>
                            <img src={foto.url} alt={angle} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition p-2">
                              <label className="bg-[#ffb703] text-[#004b23] px-3 py-2 rounded cursor-pointer font-bold text-xs shadow flex items-center">
                                <Camera size={14} className="mr-1"/> Refazer Foto
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, angle)} />
                              </label>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-[#004b23] bg-opacity-90 text-white font-semibold text-[10px] text-center p-1 truncate px-1">
                              <CheckCircle size={10} className="inline mr-1 text-[#ffb703]"/> {angle}
                            </div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-500 hover:text-[#004b23] transition p-2 text-center">
                            <Plus size={32} className="mb-2 opacity-50"/>
                            <span className="text-[10px] font-bold leading-tight px-1">{angle}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, angle)} />
                          </label>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {temAlteracao && formData.modalidade !== 'A PÉ / FIXO' ? (
               <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
                 <label className="block text-sm font-bold text-orange-800 mb-2">OUTRAS ALTERAÇÕES CONSTATADAS NÃO LISTADAS ACIMA:</label>
                 <textarea className="w-full p-3 border rounded-lg focus:ring-orange-500 bg-white uppercase" rows="3" value={formData.outrasAlteracoes || ''} onChange={e => setFormData({...formData, outrasAlteracoes: e.target.value.toUpperCase()})}></textarea>
               </div>
            ) : (
               <div className="bg-gray-100 p-4 rounded-lg text-justify text-[11px] text-gray-600 mt-4 leading-relaxed font-medium italic border-l-4 border-green-500">
                 {DECLARACAO_SEM_ALTERACAO}
               </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg text-center mt-6 border shadow-sm">
              <p className="text-gray-700 mb-4 font-bold text-sm">Ao Assumir o Serviço, o CMDE certifica digitalmente que a Equipa está ciente e concorda com os dados desta inspeção e termo de responsabilidade.</p>
              <button onClick={submitForm} className="bg-[#ffb703] text-[#004b23] text-xl font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-yellow-400 w-full md:w-auto flex items-center justify-center mx-auto transition-transform hover:scale-105">
                <Shield className="mr-2"/> ASSUMIR E ENVIAR SERVIÇO
              </button>
            </div>
            
            <div className="flex justify-start mt-6">
              <button onClick={() => setStep(formData.modalidade === 'A PÉ / FIXO' ? 2 : 3)} className="text-gray-600 px-6 py-2 rounded font-bold border hover:bg-gray-50">⬅ Voltar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserHistory({ servicos, viaturas, setPrintLayout, setViewService, isGestor, isDev, onDeleteService }) {
  const [filterDataIni, setFilterDataIni] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterPrefixo, setFilterPrefixo] = useState('');
  const [filterMotorista, setFilterMotorista] = useState('');

  const filteredServices = (servicos || []).filter(c => {
    const d = c.date ? c.date.split('T')[0] : '';
    if (filterDataIni && d < filterDataIni) return false;
    if (filterDataFim && d > filterDataFim) return false;
    if (filterPrefixo) {
      if (c.modalidade === 'MOTOCICLETA') {
        const hasMoto = Object.values(c.motosEquipe || {}).some(m => m?.prefixo === filterPrefixo);
        if (!hasMoto) return false;
      } else {
        if (c.prefixo !== filterPrefixo) return false;
      }
    }
    if (filterMotorista) {
       const matMatch = c.equipe?.some(eq => eq.matricula.includes(filterMotorista));
       const nomeMatch = c.equipe?.some(eq => (eq.nome||'').toUpperCase().includes(filterMotorista));
       if (!matMatch && !nomeMatch) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Data', 'Turno', 'OPM', 'Modalidade', 'Prefixo(s)', 'Equipe (Posto-Nome-Matricula)', 'Area', 'Hora Inicial', 'Hora Final', 'Avarias', 'Auditoria'];
    const rows = filteredServices.map(c => {
      const avarias = Object.values(c.itens || {}).filter(i => i.status === 'Alterado').length;
      
      const equipeStr = c.equipe?.map(e => `${e.posto} ${e.nome} (${e.matricula})`).join(' | ');
      
      const prefixoFormatado = c.modalidade === 'MOTOCICLETA'
        ? Object.values(c.motosEquipe || {}).map(m => m?.prefixo).filter(Boolean).join(', ')
        : (c.prefixo || c.modalidade);

      const d = c.date ? new Date(c.date).toLocaleDateString() : '';
      const auditoria = c.trocaRegistrada ? (c.conflitoAudit || `Transferência Automática`) : 'Normal';
      
      return [
        `"${d}"`,
        `"${c.turno || ''}"`,
        `"${c.opm || ''}"`,
        `"${c.modalidade || ''}"`,
        `"${prefixoFormatado}"`,
        `"${equipeStr}"`,
        `"${c.areaAtuacao || ''}"`,
        `"${c.horaInicial || ''}"`,
        `"${c.horaFinal || ''}"`,
        `"${avarias}"`,
        `"${auditoria}"`
      ].join(';');
    });
    
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Historico_EntradaServico_VTR.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">{isGestor ? 'Histórico Geral de Entradas de Serviço' : 'Meu Histórico de Serviço'}</h2>
        <button onClick={exportCSV} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 shadow-sm text-sm font-bold">
          <Download size={18} /> <span>Exportar CSV (Excel)</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Data Inicial</label>
          <input type="date" className="p-2 border rounded text-sm w-full" value={filterDataIni} onChange={e => setFilterDataIni(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Data Final</label>
          <input type="date" className="p-2 border rounded text-sm w-full" value={filterDataFim} onChange={e => setFilterDataFim(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Viatura / Modalidade</label>
          <select className="p-2 border rounded text-sm w-full uppercase" value={filterPrefixo} onChange={e => setFilterPrefixo(e.target.value.toUpperCase())}>
            <option value="">Todas</option>
            {Array.from(new Set((viaturas || []).map(v => v.prefixo))).sort().map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {isGestor && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Procurar PM na Equipe</label>
            <input type="text" placeholder="Nome ou Matrícula..." className="p-2 border rounded text-sm w-full uppercase" value={filterMotorista} onChange={e => setFilterMotorista(e.target.value.toUpperCase())} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(c => {
           const avarias = Object.values(c?.itens || {}).filter(i => i?.status === 'Alterado').length;
           const cmde = c.equipe?.[0];
           
           let vtrDisplay = c.prefixo || c.modalidade;
           if (c.modalidade === 'MOTOCICLETA' && c.motosEquipe) {
             const prefixes = Object.values(c.motosEquipe).map(m => m?.prefixo).filter(Boolean);
             if (prefixes.length > 0) vtrDisplay = prefixes.join(' / ');
           }

           return (
             <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-[#004b23] relative">
               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="text-xl font-bold text-[#004b23] truncate max-w-[150px]" title={vtrDisplay}>{vtrDisplay}</h3>
                     <p className="text-[10px] text-gray-500 uppercase font-bold">{c.modalidade}</p>
                   </div>
                   <div className="text-right">
                     <span className="text-xs text-gray-800 font-bold block">{c.date ? new Date(c.date).toLocaleDateString() : '--'}</span>
                     <span className="text-[10px] text-gray-500">{c.horaInicial} - {c.horaFinal}</span>
                   </div>
                 </div>
                 
                 <div className="my-3 bg-gray-50 p-2 rounded border border-gray-100">
                   <p className="text-gray-800 text-xs font-bold truncate">CMDE: {cmde?.posto} {cmde?.nome || c.userName}</p>
                   <p className="text-gray-500 text-[10px] truncate w-full" title={c.areaAtuacao}>Área: {c.areaAtuacao}</p>
                 </div>

                 {c.trocaRegistrada && <span className="text-[9px] bg-orange-100 text-orange-800 px-2 py-1 rounded block mb-2 w-max border border-orange-200 truncate max-w-full" title={c.conflitoAudit}>Auditoria: {c.conflitoAudit}</span>}
                 
                 {c.modalidade !== 'A PÉ / FIXO' && (
                    <div className="flex space-x-2 mt-2">
                      {avarias === 0 ? 
                        <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">Sem Avarias</span> :
                        <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-bold">{avarias} Avarias</span>
                      }
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">{c.kmAtual} KM</span>
                    </div>
                 )}
               </div>
               <div className="bg-gray-50 p-3 border-t flex justify-end space-x-2 items-center">
                  {isDev && (
                    <button onClick={() => { if(window.confirm('Tem a certeza que deseja apagar este registo permanentemente?')) onDeleteService(c.id) }} className="text-red-500 hover:bg-red-100 p-1.5 rounded mr-auto" title="Apagar Permanentemente">
                      <Trash2 size={16}/>
                    </button>
                  )}
                  <button onClick={() => setViewService(c)} className="text-sm flex items-center bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 shadow-sm font-semibold">
                    <Eye size={14} className="mr-1"/> Visualizar
                  </button>
                  <button onClick={() => setPrintLayout({ type: 'checklist', data: c })} className="text-sm flex items-center bg-[#004b23] text-white px-3 py-1 rounded hover:bg-green-800 shadow-sm font-semibold">
                    <Printer size={14} className="mr-1"/> PDF
                  </button>
               </div>
             </div>
           )
        })}
        {filteredServices.length === 0 && <p className="text-gray-500">Nenhum serviço encontrado com estes filtros.</p>}
      </div>
    </div>
  );
}

// ==========================================
// MODAL PARA VISUALIZAR CHECKLIST NO SISTEMA
// ==========================================
function ServiceModal({ data, onClose, isDev, onDelete }) {
  if (!data) return null;
  const avarias = Object.entries(data.itens || {}).filter(([k,v]) => v?.status === 'Alterado');

  let vtrDisplay = data.prefixo || data.modalidade;
  if (data.modalidade === 'MOTOCICLETA' && data.motosEquipe) {
    const prefixes = Object.values(data.motosEquipe).map(m => m?.prefixo).filter(Boolean);
    if (prefixes.length > 0) vtrDisplay = prefixes.join(' / ');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 pt-10 pb-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden animate-fadeIn">
        <div className="bg-[#004b23] text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center"><FileText className="mr-2"/> Entrada de Serviço - {vtrDisplay}</h2>
          <div className="flex space-x-3">
            {isDev && (
              <button onClick={() => { if(window.confirm('Apagar Serviço?')) onDelete(data.id) }} className="hover:bg-red-600 bg-red-500 p-1.5 rounded transition shadow-sm text-white" title="Apagar Registro"><Trash2 size={18}/></button>
            )}
            <button onClick={onClose} className="hover:bg-green-800 p-1.5 rounded transition"><XCircle size={24}/></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
             <h3 className="font-bold text-blue-900 mb-2 uppercase border-b border-blue-200 pb-1">Composição da Equipe</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(data.equipe || []).map((eq, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-blue-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-blue-600 font-bold block">{eq.funcao}</span>
                      <span className="font-bold text-gray-800 text-xs">{eq.posto} {eq.nome}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Mat: {eq.matricula}</span>
                  </div>
                ))}
             </div>
             {data.trocaRegistrada && (
                <div className="mt-3 p-2 bg-orange-100 text-orange-800 text-xs rounded font-bold border border-orange-300">
                  <AlertTriangle size={14} className="inline mr-1 mb-0.5"/> 
                  Auditoria de Transferência: {data.conflitoAudit || 'Comandante requisitou PMs de outro serviço ativo.'}
                </div>
             )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div><span className="block text-xs text-gray-500 uppercase">Data/Registro</span><strong className="text-gray-800">{data.date ? new Date(data.date).toLocaleString() : '--'}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">Modalidade</span><strong className="text-gray-800">{data.modalidade}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">OPM</span><strong className="text-gray-800">{data.opm}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">Rádio HT</span><strong className="text-gray-800">{data.ht || 'N/I'}</strong></div>
            
            <div className="md:col-span-2"><span className="block text-xs text-gray-500 uppercase">Área de Atuação</span><strong className="text-gray-800">{data.areaAtuacao}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">Turno / Tipo</span><strong className="text-gray-800">{data.turno} - {data.tipoServico}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">Horário</span><strong className="text-blue-700 bg-blue-100 px-2 rounded">{data.horaInicial} às {data.horaFinal}</strong></div>
            
            {data.modalidade !== 'A PÉ / FIXO' && (
              <>
                <div className="md:col-span-2"><span className="block text-xs text-gray-500 uppercase">Veículo(s)</span><strong className="text-gray-800">{vtrDisplay}</strong></div>
                <div><span className="block text-xs text-gray-500 uppercase">KM Atual</span><strong className="text-gray-800">{data.kmAtual}</strong></div>
                <div><span className="block text-xs text-gray-500 uppercase">Troca de Óleo?</span><strong className="text-gray-800">{data.trocaOleo} (Próx: {data.kmProxima})</strong></div>
              </>
            )}
          </div>

          {data.modalidade !== 'A PÉ / FIXO' && (
            <div>
              <h3 className="font-bold text-lg border-b pb-1 mb-3 text-gray-800">Situação da Inspeção Veicular</h3>
              {avarias.length === 0 ? (
                <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200">
                  <CheckCircle className="inline mr-2"/> Veículo(s) sem alterações mecânicas/visuais registadas.
                </div>
              ) : (
                <div className="space-y-2">
                  {avarias.map(([item, info]) => (
                    <div key={item} className="bg-red-50 border border-red-200 p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center">
                      <strong className="text-red-800">{item}</strong>
                      <span className="text-red-600 bg-white px-2 py-1 rounded text-xs border border-red-100 mt-2 md:mt-0">Obs: {info.obs || 'S/ Obs'}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {data.outrasAlteracoes && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                  <strong className="text-orange-800 uppercase text-xs block mb-1">Outras Alterações Constatadas (Texto Livre):</strong>
                  <p className="text-gray-800">{data.outrasAlteracoes}</p>
                </div>
              )}
            </div>
          )}

          {data.fotos && Object.keys(data.fotos).length > 0 && (
            <div>
              <h3 className="font-bold text-lg border-b pb-1 mb-3 text-gray-800">Fotografias Anexadas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(data.fotos).map(angle => {
                  const foto = data.fotos[angle];
                  if(!foto) return null;
                  return (
                    <div key={angle} className="border rounded bg-gray-50 overflow-hidden">
                      <img src={foto.url} alt={angle} className="w-full h-32 object-cover" />
                      <div className="p-2 text-center text-xs font-bold text-gray-700 bg-gray-200">{angle}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ASSINATURA MODAL */}
          <div className="mt-16 text-center break-inside-avoid">
             <div className="w-64 border-t border-black mx-auto mt-8 pt-2">
                <p className="font-bold uppercase text-sm">{data.equipe?.[0]?.posto} {data.equipe?.[0]?.nomeCompleto || data.equipe?.[0]?.nome || data.userName}</p>
                <p className="text-xs uppercase font-mono">Matrícula: {data.equipe?.[0]?.matricula || data.matricula}</p>
                <p className="text-[10px] font-bold mt-1 text-gray-600 uppercase">Comandante da Equipe</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// TELA DE PRODUTIVIDADE (FORMULÁRIO DE OCORRÊNCIA)
// ==========================================

function OcorrenciaForm({ userData, usersDb, efetivoPlanilha, viaturas, onSave, setView }) {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    dataOcorrencia: new Date().toISOString().split('T')[0],
    horaInicial: '', 
    horaFinal: '', 
    turno: TURNOS[0],
    local: '', 
    coordenadas: '', 
    municipio: CIDADES_SERVICO[0], 
    municipioOutro: '',
    tipoPoliciamento: MODALIDADES[0], 
    vtrId: '', 
    prefixo: '', 
    ht: '',
    equipe: [
      { id: 1, funcao: 'COMANDANTE', matricula: userData?.matricula || '', nome: userData?.name || '', nomeCompleto: userData?.nomeCompleto || '', posto: userData?.posto || '' },
      { id: 2, funcao: 'MOTORISTA', matricula: '', nome: '', nomeCompleto: '', posto: '' },
      { id: 3, funcao: 'PATRULHEIRO 03', matricula: '', nome: '', nomeCompleto: '', posto: '' },
      { id: 4, funcao: 'PATRULHEIRO', matricula: '', nome: '', nomeCompleto: '', posto: '' }
    ],
    apoio: '', 
    natureza: '', 
    narrativa: '', 
    materialApresentado: '', 
    veiculos: '', 
    armas: '', 
    entorpecentes: '', 
    valores: '',
    envolvidos: '', 
    suspeitos: '', 
    procedimento: PROCEDIMENTOS[0], 
    procedimentoOutro: '',
    capitulacao: '', 
    situacaoConduzido: 'LIBERADO', 
    delegado: '', 
    escrivao: '', 
    comentarios: ''
  });

  const handleMatriculaChange = (id, val) => {
    let cleanVal = formatMatricula(val); 
    setFormData(prev => {
      const newEquipe = prev.equipe.map(m => {
        if (m.id === id) {
          let novoNome = ''; let novoNomeComp = ''; let novoPosto = '';
          if (cleanVal) {
            const userDB = usersDb.find(u => u.matricula === cleanVal);
            if (userDB) { novoNome = userDB.name; novoNomeComp = userDB.nomeCompleto; novoPosto = userDB.posto; } 
            else {
              const userSheet = (efetivoPlanilha || []).find(r => r[0] && String(r[0]).trim() === cleanVal);
              if (userSheet) { novoPosto = userSheet[1] || ''; novoNomeComp = userSheet[2] || ''; novoNome = userSheet[3] || userSheet[2] || ''; }
            }
          }
          return { ...m, matricula: cleanVal, nome: novoNome, nomeCompleto: novoNomeComp, posto: novoPosto };
        }
        return m;
      });
      return { ...prev, equipe: newEquipe };
    });
  };

  const addPatrulheiro = () => {
    const num = formData.equipe.length + 1;
    setFormData(prev => ({
      ...prev,
      equipe: [...prev.equipe, { id: Date.now(), funcao: `PATRULHEIRO 0${num}`, matricula: '', nome: '', nomeCompleto: '', posto: '' }]
    }));
  };

  const removePatrulheiro = (id) => {
    setFormData(prev => ({ ...prev, equipe: prev.equipe.filter(m => m.id !== id) }));
  };

  const handleVtrSelect = (e) => {
    const v = (viaturas || []).find(v => v.id === e.target.value);
    if (v) setFormData({ ...formData, vtrId: v.id, prefixo: v.prefixo });
  };

  const validateStep1AndGo = () => {
    if (!formData.dataOcorrencia || !formData.horaInicial || !formData.horaFinal) return alert("Preencha Data e Horários.");
    if (!formData.local || !formData.natureza) return alert("Preencha o Local e a Natureza da Ocorrência.");
    
    const memInvalidos = formData.equipe.filter(m => m.matricula && !m.nome && m.matricula !== 'DEV');
    if (memInvalidos.length > 0) {
        return alert(`Matrícula(s) não encontrada(s) na base de dados: ${memInvalidos.map(m => m.matricula).join(', ')}. Insira matrículas válidas ou deixe o campo em branco.`);
    }
    
    setStep(2);
  };

  const submitForm = () => {
    if (!formData.narrativa) return alert("A Narrativa da Ocorrência é obrigatória.");
    
    onSave({
      ...formData,
      municipio: formData.municipio === 'OUTRA' ? formData.municipioOutro : formData.municipio,
      procedimento: formData.procedimento === 'OUTROS' ? formData.procedimentoOutro : formData.procedimento,
      userId: userData?.matricula,
      userName: userData?.name,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-indigo-900 text-white p-6 rounded-t-xl flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">PMCE - Relatório de Ocorrência Policial</h2>
          <p className="text-indigo-200 text-sm">Registo oficial de Produtividade Operacional.</p>
        </div>
        <ClipboardList size={40} className="text-[#ffb703] opacity-80" />
      </div>

      <div className="bg-white p-6 shadow-md rounded-b-xl border border-gray-200">
        <div className="flex border-b mb-6 pb-4 overflow-x-auto text-sm">
          {['1. Dados Básicos', '2. Fatos e Desfechos'].map((s, i) => {
             const realIndex = i + 1;
             return (
              <button key={i} onClick={() => setStep(realIndex)} disabled={step < realIndex} className={`px-4 py-2 font-bold whitespace-nowrap ${step === realIndex ? 'text-indigo-900 border-b-4 border-[#ffb703]' : 'text-gray-400'}`}>
                {s}
              </button>
             );
          })}
        </div>

        {/* STEP 1: DADOS BÁSICOS */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">01. Data</label>
                <input type="date" required className="w-full p-2 border rounded font-bold text-indigo-900" value={formData.dataOcorrencia} onChange={e=>setFormData({...formData, dataOcorrencia: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">02. Hora Inicial</label>
                <input type="time" required className="w-full p-2 border rounded font-bold text-indigo-900" value={formData.horaInicial} onChange={e=>setFormData({...formData, horaInicial: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">03. Hora Final</label>
                <input type="time" required className="w-full p-2 border rounded font-bold text-indigo-900" value={formData.horaFinal} onChange={e=>setFormData({...formData, horaFinal: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">04. Turno</label>
                <select className="w-full p-2 border rounded font-bold" value={formData.turno} onChange={e=>setFormData({...formData, turno: e.target.value})}>
                  {TURNOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">05. Local (Endereço Completo)</label>
                <input type="text" required placeholder="Rua, Número, Bairro..." className="w-full p-2 border rounded uppercase" value={formData.local} onChange={e=>setFormData({...formData, local: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">06. Coordenadas</label>
                  <input type="text" placeholder="Lat / Long" className="w-full p-2 border rounded" value={formData.coordenadas} onChange={e=>setFormData({...formData, coordenadas: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">07. Município</label>
                  <select className="w-full p-2 border rounded uppercase" value={formData.municipio} onChange={e=>setFormData({...formData, municipio: e.target.value})}>
                    {CIDADES_SERVICO.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {formData.municipio === 'OUTRA' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qual Município?</label>
                <input type="text" required className="w-full p-2 border rounded uppercase border-indigo-300" value={formData.municipioOutro} onChange={e=>setFormData({...formData, municipioOutro: e.target.value.toUpperCase()})} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div>
                <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">08. Tipo Policiamento</label>
                <select className="w-full p-2 border border-indigo-200 rounded bg-white" value={formData.tipoPoliciamento} onChange={e=>setFormData({...formData, tipoPoliciamento: e.target.value})}>
                  {MODALIDADES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">09. VTR (Prefixo)</label>
                <select className="w-full p-2 border border-indigo-200 rounded bg-white" value={formData.vtrId} onChange={handleVtrSelect}>
                  <option value="">-- Selecione (Opcional) --</option>
                  {(viaturas || []).map(v => <option key={v.id} value={v.id}>{v.prefixo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">10. HT(s)</label>
                <input type="text" placeholder="Rádio..." className="w-full p-2 border border-indigo-200 rounded bg-white uppercase" value={formData.ht} onChange={e=>setFormData({...formData, ht: e.target.value.toUpperCase()})} />
              </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2 border-b pb-1">Composição da Equipe (11 a 14)</label>
               {formData.equipe.map((membro, index) => (
                  <div key={membro.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{membro.funcao}</label>
                      <input type="text" placeholder="Matrícula" className="w-full p-2 border rounded font-mono uppercase" value={membro.matricula} onChange={e => handleMatriculaChange(membro.id, e.target.value)} />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <input type="text" readOnly className="w-full p-2 border rounded bg-gray-100 text-gray-600 uppercase text-sm" value={membro.nome ? `${membro.posto} ${membro.nome}` : ''} placeholder="Nome Auto-preenchido..." />
                      {index > 3 && (
                        <button onClick={() => removePatrulheiro(membro.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                      )}
                    </div>
                  </div>
               ))}
               <button onClick={addPatrulheiro} className="text-indigo-600 font-bold text-xs flex items-center hover:underline mt-2"><Plus size={14} className="mr-1"/> Adicionar mais Patrulheiros</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">15. Composições no Apoio</label>
              <input type="text" placeholder="Ex: CP-3045, RAIO 01..." className="w-full p-2 border rounded uppercase" value={formData.apoio} onChange={e=>setFormData({...formData, apoio: e.target.value.toUpperCase()})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">16. Natureza da Ocorrência (Principal)</label>
              <input type="text" required placeholder="Ex: Tráfico de Drogas, Porte Ilegal de Arma, Homicídio..." className="w-full p-3 border-2 border-indigo-200 rounded uppercase font-bold text-indigo-900 focus:ring-indigo-500" value={formData.natureza} onChange={e=>setFormData({...formData, natureza: e.target.value.toUpperCase()})} />
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={validateStep1AndGo} className="bg-indigo-900 text-white px-6 py-2 rounded font-bold hover:bg-indigo-800 shadow flex items-center">Avançar <ArrowUp size={18} className="ml-1 rotate-90"/></button>
            </div>
          </div>
        )}

        {/* STEP 2: FATOS E DESFECHOS */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">17. Narrativa da Ocorrência</label>
              <textarea required rows="6" placeholder="Relate os fatos de forma clara e objetiva..." className="w-full p-3 border rounded uppercase bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500" value={formData.narrativa} onChange={e=>setFormData({...formData, narrativa: e.target.value.toUpperCase()})}></textarea>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-4">
              <h3 className="font-bold text-orange-900 border-b border-orange-200 pb-1 flex items-center"><Crosshair size={18} className="mr-2"/> Apreensões e Materiais</h3>
              
              <div>
                <label className="block text-xs font-bold text-orange-800 uppercase mb-1">18. Material Apresentado (Geral)</label>
                <input type="text" className="w-full p-2 border rounded uppercase" value={formData.materialApresentado} onChange={e=>setFormData({...formData, materialApresentado: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-800 uppercase mb-1">19. Veículo(s) [Marca/Modelo/Cor/Placa]</label>
                <input type="text" className="w-full p-2 border rounded uppercase" value={formData.veiculos} onChange={e=>setFormData({...formData, veiculos: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-800 uppercase mb-1">20. Arma(s) [Tipo/Marca/Calibre/Numeração/Munições]</label>
                <input type="text" placeholder="Ex: 01 REVÓLVER TAURUS CAL 38..." className="w-full p-2 border rounded uppercase" value={formData.armas} onChange={e=>setFormData({...formData, armas: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-1">21. Entorpecente(s) [Tipo/Qtd(g)]</label>
                  <input type="text" placeholder="Ex: MACONHA 50g, COCAÍNA 10g..." className="w-full p-2 border rounded uppercase" value={formData.entorpecentes} onChange={e=>setFormData({...formData, entorpecentes: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-1">22. Valores Apreendidos (R$)</label>
                  <input type="text" placeholder="R$ 1.500,00" className="w-full p-2 border rounded uppercase font-bold text-green-700" value={formData.valores} onChange={e=>setFormData({...formData, valores: e.target.value.toUpperCase()})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">23. Envolvido(s) / Vítimas</label>
                <textarea rows="3" placeholder="Nome, Idade, CPF..." className="w-full p-2 border rounded uppercase" value={formData.envolvidos} onChange={e=>setFormData({...formData, envolvidos: e.target.value.toUpperCase()})}></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">24. Suspeito(s) / Conduzidos</label>
                <textarea rows="3" placeholder="Nome, Idade, CPF, Alcunha..." className="w-full p-2 border rounded uppercase" value={formData.suspeitos} onChange={e=>setFormData({...formData, suspeitos: e.target.value.toUpperCase()})}></textarea>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 flex items-center"><Gavel size={18} className="mr-2"/> Desfecho e Procedimentos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">25. Tipo do Procedimento</label>
                  <select className="w-full p-2 border rounded uppercase font-bold text-indigo-900" value={formData.procedimento} onChange={e=>setFormData({...formData, procedimento: e.target.value})}>
                    {PROCEDIMENTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  {formData.procedimento === 'OUTROS' && (
                    <input type="text" placeholder="Qual?" className="w-full p-2 border rounded mt-2 uppercase" value={formData.procedimentoOutro} onChange={e=>setFormData({...formData, procedimentoOutro: e.target.value.toUpperCase()})} />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">26. Capitulação Legal (Artigos)</label>
                  <input type="text" placeholder="Ex: Art. 33 da Lei 11.343/06 (Tráfico)" className="w-full p-2 border rounded uppercase" value={formData.capitulacao} onChange={e=>setFormData({...formData, capitulacao: e.target.value.toUpperCase()})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">27. Situação do Conduzido</label>
                  <select className="w-full p-2 border rounded uppercase" value={formData.situacaoConduzido} onChange={e=>setFormData({...formData, situacaoConduzido: e.target.value})}>
                    <option>LIBERADO</option><option>PRESO / APREENDIDO</option><option>NÃO HOUVE CONDUZIDO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">28. Delegado(a)</label>
                  <input type="text" className="w-full p-2 border rounded uppercase" value={formData.delegado} onChange={e=>setFormData({...formData, delegado: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">29. Escrivão(ã)</label>
                  <input type="text" className="w-full p-2 border rounded uppercase" value={formData.escrivao} onChange={e=>setFormData({...formData, escrivao: e.target.value.toUpperCase()})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">30. Comentários Adicionais</label>
                <input type="text" className="w-full p-2 border rounded uppercase" value={formData.comentarios} onChange={e=>setFormData({...formData, comentarios: e.target.value.toUpperCase()})} />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-2 rounded font-bold border hover:bg-gray-50">⬅ Voltar</button>
              <button onClick={submitForm} className="bg-indigo-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-800 shadow-lg text-lg flex items-center">
                <CheckCircle className="mr-2"/> SALVAR OCORRÊNCIA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OcorrenciaHistory({ ocorrencias, setPrintLayout, setViewOcorrencia, isGestor, isDev, onDelete }) {
  const [filterDataIni, setFilterDataIni] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterNatureza, setFilterNatureza] = useState('');
  const [filterPolicial, setFilterPolicial] = useState('');

  const filteredOcs = (ocorrencias || []).filter(c => {
    if (filterDataIni && c.dataOcorrencia < filterDataIni) return false;
    if (filterDataFim && c.dataOcorrencia > filterDataFim) return false;
    if (filterNatureza && !(c.natureza || '').includes(filterNatureza)) return false;
    if (filterPolicial) {
       const hasPM = c.equipe?.some(eq => eq.matricula.includes(filterPolicial) || (eq.nome||'').toUpperCase().includes(filterPolicial));
       if (!hasPM) return false;
    }
    return true;
  });

  // KPIs
  const totalArmas = filteredOcs.filter(c => c.armas && c.armas.length > 3).length;
  const totalDrogas = filteredOcs.filter(c => c.entorpecentes && c.entorpecentes.length > 3).length;
  const totalProcedimentos = filteredOcs.filter(c => c.procedimento !== 'OUTROS' && c.procedimento !== '').length;

  const exportCSV = () => {
    // Exportando os 30 campos exatos
    const headers = [
      'ID', '01-Data', '02-HoraIni', '03-HoraFim', '04-Turno', '05-Local', '06-Coordenadas', '07-Municipio', 
      '08-Policiamento', '09-VTR', '10-HT', 'Equipe Completa (Posto-Nome-Mat)', '15-Apoio', '16-Natureza', '17-Narrativa', 
      '18-Material', '19-Veiculos', '20-Armas', '21-Drogas', '22-Valores', '23-Envolvidos', '24-Suspeitos',
      '25-Procedimento', '26-Capitulacao', '27-SitConduzido', '28-Delegado', '29-Escrivao', '30-Comentarios'
    ];
    
    const rows = filteredOcs.map(c => {
      const equipeStr = c.equipe?.map(e => `${e.funcao}: ${e.posto} ${e.nome} (${e.matricula})`).join(' | ');
      
      const fields = [
        c.id, c.dataOcorrencia, c.horaInicial, c.horaFinal, c.turno, c.local, c.coordenadas, c.municipio,
        c.tipoPoliciamento, c.prefixo, c.ht, equipeStr, c.apoio, c.natureza, c.narrativa,
        c.materialApresentado, c.veiculos, c.armas, c.entorpecentes, c.valores, c.envolvidos, c.suspeitos,
        c.procedimento, c.capitulacao, c.situacaoConduzido, c.delegado, c.escrivao, c.comentarios
      ];
      
      return fields.map(f => `"${(f || '').replace(/"/g, '""')}"`).join(';');
    });
    
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Produtividade_Ocorrencias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">{isGestor ? 'Gestão de Produtividade' : 'Minha Produtividade'}</h2>
          <p className="text-gray-500 text-sm">Histórico de Ocorrências Policiais Registradas.</p>
        </div>
        <button onClick={exportCSV} className="bg-indigo-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-800 shadow-sm text-sm font-bold">
          <Download size={18} /> <span>Exportar Relatório (Excel)</span>
        </button>
      </div>

      {isGestor && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-600 flex flex-col justify-center">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Total Ocorrências</p>
            <div className="flex items-center"><ClipboardList className="text-indigo-600 mr-2" size={20}/><span className="text-2xl font-bold">{filteredOcs.length}</span></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex flex-col justify-center">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Apreensão de Armas</p>
            <div className="flex items-center"><Crosshair className="text-orange-500 mr-2" size={20}/><span className="text-2xl font-bold">{totalArmas}</span></div>
            <p className="text-[9px] text-gray-400 mt-1">Ocorrências com armas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col justify-center">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Apreensão Drogas</p>
            <div className="flex items-center"><AlertTriangle className="text-red-500 mr-2" size={20}/><span className="text-2xl font-bold">{totalDrogas}</span></div>
            <p className="text-[9px] text-gray-400 mt-1">Ocorrências com tráfico</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Procedimentos (BO/TCO/APF)</p>
            <div className="flex items-center"><Gavel className="text-blue-600 mr-2" size={20}/><span className="text-2xl font-bold">{totalProcedimentos}</span></div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Data Inicial</label>
          <input type="date" className="p-2 border rounded text-sm w-full" value={filterDataIni} onChange={e => setFilterDataIni(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Data Final</label>
          <input type="date" className="p-2 border rounded text-sm w-full" value={filterDataFim} onChange={e => setFilterDataFim(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase">Buscar Natureza</label>
          <input type="text" placeholder="Ex: TRÁFICO..." className="p-2 border rounded text-sm w-full uppercase" value={filterNatureza} onChange={e => setFilterNatureza(e.target.value.toUpperCase())} />
        </div>
        {isGestor && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase">Procurar PM</label>
            <input type="text" placeholder="Nome ou Matrícula..." className="p-2 border rounded text-sm w-full uppercase" value={filterPolicial} onChange={e => setFilterPolicial(e.target.value.toUpperCase())} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOcs.map(c => {
           const cmde = c.equipe?.[0];
           const hasApreensao = (c.armas && c.armas.length>2) || (c.entorpecentes && c.entorpecentes.length>2);

           return (
             <div key={c.id} className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-indigo-700 relative">
               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                   <div className="w-2/3">
                     <h3 className="text-lg font-bold text-indigo-900 truncate" title={c.natureza}>{c.natureza}</h3>
                     <p className="text-[10px] text-gray-500 uppercase font-bold">{c.municipio} • {c.procedimento}</p>
                   </div>
                   <div className="text-right w-1/3">
                     <span className="text-xs text-gray-800 font-bold block">{c.dataOcorrencia ? c.dataOcorrencia.split('-').reverse().join('/') : '--'}</span>
                     <span className="text-[10px] text-gray-500">{c.horaInicial}</span>
                   </div>
                 </div>
                 
                 <div className="my-3 bg-gray-50 p-2 rounded border border-gray-100">
                   <p className="text-gray-800 text-xs font-bold truncate">CMDE: {cmde?.posto} {cmde?.nome}</p>
                   <p className="text-gray-500 text-[10px] truncate" title={c.local}>Local: {c.local}</p>
                 </div>

                 {hasApreensao && <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase inline-block mb-1 border border-red-200">Com Apreensões Relevantes</span>}
               </div>
               <div className="bg-gray-50 p-3 border-t flex justify-end space-x-2 items-center">
                  {isDev && (
                    <button onClick={() => { if(window.confirm('Apagar Ocorrência permanentemente?')) onDelete(c.id) }} className="text-red-500 hover:bg-red-100 p-1.5 rounded mr-auto" title="Apagar">
                      <Trash2 size={16}/>
                    </button>
                  )}
                  <button onClick={() => setViewOcorrencia(c)} className="text-sm flex items-center bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 shadow-sm font-semibold text-indigo-900">
                    <Eye size={14} className="mr-1"/> Detalhes
                  </button>
                  <button onClick={() => setPrintLayout({ type: 'ocorrencia', data: c })} className="text-sm flex items-center bg-indigo-900 text-white px-3 py-1 rounded hover:bg-indigo-800 shadow-sm font-semibold">
                    <Printer size={14} className="mr-1"/> Imprimir ROP
                  </button>
               </div>
             </div>
           )
        })}
        {filteredOcs.length === 0 && <p className="text-gray-500">Nenhuma ocorrência encontrada.</p>}
      </div>
    </div>
  );
}

function OcorrenciaModal({ data, onClose, isDev, onDelete }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 pt-10 pb-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden animate-fadeIn">
        <div className="bg-indigo-900 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center"><ClipboardList className="mr-2"/> ROP - {data.natureza}</h2>
          <div className="flex space-x-3">
            {isDev && <button onClick={() => { if(window.confirm('Apagar?')) onDelete(data.id) }} className="hover:bg-red-600 bg-red-500 p-1.5 rounded transition shadow-sm text-white"><Trash2 size={18}/></button>}
            <button onClick={onClose} className="hover:bg-indigo-800 p-1.5 rounded transition"><XCircle size={24}/></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div><span className="block text-xs text-gray-500 uppercase">01. Data</span><strong className="text-gray-800">{data.dataOcorrencia?.split('-').reverse().join('/')}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">02/03. Horário</span><strong className="text-gray-800">{data.horaInicial} às {data.horaFinal}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">04. Turno</span><strong className="text-gray-800">{data.turno}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">07. Município</span><strong className="text-gray-800">{data.municipio}</strong></div>
            
            <div className="md:col-span-2"><span className="block text-xs text-gray-500 uppercase">05. Local</span><strong className="text-gray-800">{data.local}</strong></div>
            <div className="md:col-span-2"><span className="block text-xs text-gray-500 uppercase">06. Coordenadas</span><strong className="text-gray-800">{data.coordenadas || 'N/I'}</strong></div>
            
            <div><span className="block text-xs text-gray-500 uppercase">08. Tipo Policiamento</span><strong className="text-gray-800">{data.tipoPoliciamento}</strong></div>
            <div><span className="block text-xs text-gray-500 uppercase">09. VTR</span><strong className="text-gray-800">{data.prefixo || 'N/I'}</strong></div>
            <div className="md:col-span-2"><span className="block text-xs text-gray-500 uppercase">10. HT / 15. Apoio</span><strong className="text-gray-800">HT: {data.ht || '-'} | Apoio: {data.apoio || '-'}</strong></div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
             <h3 className="font-bold text-blue-900 mb-2 uppercase border-b border-blue-200 pb-1">Composição da Equipe (11 a 14)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(data.equipe || []).map((eq, i) => {
                  if(!eq.matricula) return null;
                  return (
                    <div key={i} className="bg-white p-2 rounded border border-blue-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold block">{eq.funcao}</span>
                        <span className="font-bold text-gray-800 text-xs">{eq.posto} {eq.nomeCompleto || eq.nome}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Mat: {eq.matricula}</span>
                    </div>
                  )
                })}
             </div>
          </div>

          <div>
             <h3 className="font-bold text-lg border-b pb-1 mb-3 text-gray-800">17. Narrativa da Ocorrência</h3>
             <div className="bg-gray-50 p-4 rounded border text-gray-700 text-justify whitespace-pre-wrap leading-relaxed">
               {data.narrativa}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-orange-50 p-4 rounded border border-orange-200">
               <h4 className="font-bold text-orange-900 mb-2 border-b border-orange-200 pb-1">Apreensões</h4>
               <ul className="text-sm space-y-2">
                 <li><strong className="text-orange-800">18. Material:</strong> {data.materialApresentado || '-'}</li>
                 <li><strong className="text-orange-800">19. Veículos:</strong> {data.veiculos || '-'}</li>
                 <li><strong className="text-orange-800">20. Armas:</strong> {data.armas || '-'}</li>
                 <li><strong className="text-orange-800">21. Drogas:</strong> {data.entorpecentes || '-'}</li>
                 <li><strong className="text-orange-800">22. Valores:</strong> <span className="text-green-700 font-bold">{data.valores || '-'}</span></li>
               </ul>
             </div>
             
             <div className="bg-gray-50 p-4 rounded border border-gray-200">
               <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Envolvidos</h4>
               <div className="space-y-2">
                 <div><strong className="text-gray-600 block text-xs">23. Vítimas/Envolvidos:</strong> <p>{data.envolvidos || '-'}</p></div>
                 <div><strong className="text-gray-600 block text-xs">24. Suspeitos/Conduzidos:</strong> <p>{data.suspeitos || '-'}</p></div>
               </div>
             </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
             <h4 className="font-bold text-indigo-900 mb-2 border-b border-indigo-200 pb-1">Desfecho e Procedimentos (25 a 30)</h4>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div><strong className="text-indigo-800 block text-xs">25. Procedimento:</strong> {data.procedimento}</div>
               <div><strong className="text-indigo-800 block text-xs">27. Situação Conduzido:</strong> {data.situacaoConduzido}</div>
               <div className="col-span-2"><strong className="text-indigo-800 block text-xs">26. Capitulação Legal:</strong> {data.capitulacao || '-'}</div>
               <div><strong className="text-indigo-800 block text-xs">28. Delegado:</strong> {data.delegado || '-'}</div>
               <div><strong className="text-indigo-800 block text-xs">29. Escrivão:</strong> {data.escrivao || '-'}</div>
               <div className="col-span-2"><strong className="text-indigo-800 block text-xs">30. Comentários:</strong> {data.comentarios || '-'}</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// ==========================================
// MÓDULO DE IMPRESSÃO (PDF VIEWER)
// ==========================================

function PrintView({ data, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(timer);
  }, []);

  const { type, data: docData, filters, frotaData } = data;

  if (type === 'ocorrencia') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-500 overflow-auto print:bg-white flex flex-col text-sm">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden shadow-lg sticky top-0">
          <div className="flex items-center"><Info className="text-yellow-400 mr-2"/> <span>Salvar como PDF no navegador.</span></div>
          <div className="space-x-4">
            <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500">Imprimir Novamente</button>
            <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-500">Fechar</button>
          </div>
        </div>

        <div className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto my-8 print:my-0 shadow-2xl print:shadow-none p-10 font-sans text-gray-900 leading-tight print:p-0">
          <div className="border-b-4 border-gray-800 pb-4 mb-6 flex items-center justify-between">
            <img src={LOGO_URL} alt="Brasão PMCE" className="w-20 h-24 object-contain" />
            <div className="text-center flex-1">
              <h1 className="font-bold text-xl uppercase tracking-wider">Governo do Estado do Ceará</h1>
              <h2 className="font-bold text-lg uppercase">Polícia Militar do Ceará</h2>
              <h3 className="font-bold text-md uppercase text-gray-600">3º Batalhão Policial Militar</h3>
              <h4 className="mt-2 text-white font-bold bg-gray-800 inline-block px-4 py-1.5 rounded uppercase tracking-widest">PMCE - Relatório de Ocorrência Policial</h4>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-x-4 gap-y-3 mb-6 border border-gray-400 p-4 bg-gray-50 text-xs">
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">01. Data</span>{docData.dataOcorrencia?.split('-').reverse().join('/')}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">02. Hora Inicial</span>{docData.horaInicial}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">03. Hora Final</span>{docData.horaFinal}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">04. Turno</span>{docData.turno}</div>
             
             <div className="col-span-2"><span className="font-bold text-gray-500 uppercase block text-[9px]">05. Local</span>{docData.local}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">06. Coordenadas</span>{docData.coordenadas || '-'}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">07. M da Ocorrência</span>{docData.municipio}</div>
             
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">08. Tipo de Policiamento</span>{docData.tipoPoliciamento}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">09. VTR</span>{docData.prefixo || '-'}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">10. HT(S)</span>{docData.ht || '-'}</div>
             <div><span className="font-bold text-gray-500 uppercase block text-[9px]">15. Composições Apoio</span>{docData.apoio || '-'}</div>
          </div>

          <div className="mb-4">
            <span className="font-bold text-gray-500 uppercase block text-[9px] mb-1">Composição da Equipe (11 a 14)</span>
            <div className="border border-gray-400 p-2 grid grid-cols-2 gap-2 text-xs">
              {(docData.equipe || []).map((eq, i) => {
                if(!eq.matricula) return null;
                return (
                  <div key={i}><span className="font-bold">{eq.funcao}:</span> {eq.posto} {eq.nomeCompleto || eq.nome} (Mat: {eq.matricula})</div>
                )
              })}
            </div>
          </div>

          <div className="mb-6">
            <span className="font-bold text-gray-500 uppercase block text-[9px] mb-1">16. Natureza da Ocorrência</span>
            <div className="font-bold text-sm uppercase p-2 border border-gray-400 bg-gray-100">{docData.natureza}</div>
          </div>

          <div className="mb-6">
            <span className="font-bold text-gray-500 uppercase block text-[9px] mb-1">17. Narrativa da Ocorrência</span>
            <div className="p-3 border border-gray-400 text-justify text-xs whitespace-pre-wrap leading-relaxed min-h-[100px]">{docData.narrativa}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-400 p-3 text-xs">
              <span className="font-bold text-gray-500 uppercase block text-[9px] mb-2 border-b border-gray-300 pb-1">Apreensões e Materiais</span>
              <p className="mb-1"><strong>18. Material:</strong> {docData.materialApresentado || '-'}</p>
              <p className="mb-1"><strong>19. Veículos:</strong> {docData.veiculos || '-'}</p>
              <p className="mb-1"><strong>20. Armas:</strong> {docData.armas || '-'}</p>
              <p className="mb-1"><strong>21. Entorpecentes:</strong> {docData.entorpecentes || '-'}</p>
              <p><strong>22. Valores:</strong> {docData.valores || '-'}</p>
            </div>
            <div className="border border-gray-400 p-3 text-xs">
              <span className="font-bold text-gray-500 uppercase block text-[9px] mb-2 border-b border-gray-300 pb-1">Qualificação das Partes</span>
              <p className="mb-2"><strong>23. Envolvidos/Vítimas:</strong><br/> {docData.envolvidos || '-'}</p>
              <p><strong>24. Suspeitos/Conduzidos:</strong><br/> {docData.suspeitos || '-'}</p>
            </div>
          </div>

          <div className="border border-gray-400 p-3 bg-gray-50 text-xs mb-10">
             <div className="grid grid-cols-3 gap-y-3">
                <div><span className="font-bold text-gray-500 uppercase block text-[9px]">25. Procedimento</span>{docData.procedimento}</div>
                <div className="col-span-2"><span className="font-bold text-gray-500 uppercase block text-[9px]">26. Capitulação Legal</span>{docData.capitulacao || '-'}</div>
                <div><span className="font-bold text-gray-500 uppercase block text-[9px]">27. Sit. do Conduzido</span>{docData.situacaoConduzido}</div>
                <div><span className="font-bold text-gray-500 uppercase block text-[9px]">28. Delegado(a)</span>{docData.delegado || '-'}</div>
                <div><span className="font-bold text-gray-500 uppercase block text-[9px]">29. Escrivão(ã)</span>{docData.escrivao || '-'}</div>
                <div className="col-span-3"><span className="font-bold text-gray-500 uppercase block text-[9px]">30. Comentários Adicionais</span>{docData.comentarios || '-'}</div>
             </div>
          </div>

          {/* ASSINATURA */}
          <div className="mt-16 text-center break-inside-avoid">
             <div className="w-80 border-t border-black mx-auto mt-8 pt-2">
                <p className="font-bold uppercase text-sm">{docData.equipe?.[0]?.posto} {docData.equipe?.[0]?.nomeCompleto || docData.equipe?.[0]?.nome || docData.userName}</p>
                <p className="text-xs uppercase font-mono">Mat: {docData.equipe?.[0]?.matricula || docData.matricula}</p>
                <p className="text-[10px] font-bold mt-1 text-gray-600 uppercase">Policial Relator / Comandante da Equipe</p>
             </div>
          </div>

        </div>
      </div>
    );
  }

  // RETORNO PADRÃO PARA OS OUTROS RELATÓRIOS (Checklist / Panorama)
  const isOficina = type === 'oficina';
  const isPanorama = type === 'panorama';
  const qtdAvarias = docData && docData.itens ? Object.values(docData.itens).filter(it => it?.status === 'Alterado').length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-gray-500 overflow-auto print:bg-white flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden shadow-lg sticky top-0">
        <div className="flex items-center">
          <Info className="text-yellow-400 mr-2"/> 
          <span>Use a opção <b>"Salvar como PDF"</b> na janela de impressão do seu navegador. Aguarde as fotos carregarem.</span>
        </div>
        <div className="space-x-4">
          <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500">Imprimir Novamente</button>
          <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-500">Fechar</button>
        </div>
      </div>

      <div className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto my-8 print:my-0 shadow-2xl print:shadow-none p-10 font-sans text-gray-900 leading-tight print:p-0">
        
        {/* CABEÇALHO PADRÃO PMCE */}
        <div className="border-b-4 border-[#004b23] pb-4 mb-6 flex items-center justify-between">
          <img src={LOGO_URL} alt="Brasão PMCE" className="w-20 h-24 object-contain" />
          <div className="text-center flex-1">
            <h1 className="font-bold text-xl uppercase tracking-wider">Governo do Estado do Ceará</h1>
            <h2 className="font-bold text-lg uppercase text-[#004b23]">Polícia Militar do Ceará</h2>
            <h3 className="font-bold text-md uppercase text-gray-600">3º Batalhão Policial Militar</h3>
            {isOficina && <h4 className="mt-2 text-red-700 font-bold bg-red-100 inline-block px-3 py-1 rounded">RELATÓRIO DE MANUTENÇÃO / OFICINA</h4>}
            {type === 'checklist' && <h4 className="mt-2 text-[#004b23] font-bold bg-green-100 inline-block px-3 py-1 rounded">ENTRADA DE SERVIÇO</h4>}
            {isPanorama && <h4 className="mt-2 text-blue-700 font-bold bg-blue-100 inline-block px-3 py-1 rounded">PANORAMA GERENCIAL DA FROTA</h4>}
          </div>
        </div>

        {/* CONTEÚDO PANORAMA */}
        {isPanorama && (
           <div>
             <div className="bg-gray-100 p-4 mb-6 rounded text-sm flex justify-between">
                <p><b>Data do Filtro:</b> {filters?.date?.split('-').reverse().join('/')}</p>
                <p><b>Filtro Viatura:</b> {filters?.vtr || 'Todas'}</p>
                <p><b>Total Viaturas Cadastradas:</b> {frotaData?.length || 0}</p>
             </div>
             
             <div className="mb-8">
               <h3 className="text-lg font-bold border-b-2 border-blue-600 mb-4 pb-1">STATUS DE CONEXÃO DA FROTA</h3>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-bold text-green-700 bg-green-100 p-2 rounded mb-2">🟢 Operantes / Conectadas</h4>
                    <ul className="text-xs space-y-1">
                      {(frotaData || []).filter(v => v?.status === 'Conectada').map(v => (
                        <li key={v.id} className="border-b pb-1">{v.prefixo} <span className="text-gray-500">- CMDE: {v.serviceRef?.equipe?.[0]?.nome?.split(' ')[0]}</span></li>
                      ))}
                      {(frotaData || []).filter(v => v?.status === 'Conectada').length === 0 && <p className="text-gray-500 italic">Nenhuma viatura operante registrada.</p>}
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-700 bg-gray-200 p-2 rounded mb-2">🔴 Desconectadas (Sem Checklist)</h4>
                    <ul className="text-xs space-y-1 text-gray-500">
                      {(frotaData || []).filter(v => v?.status === 'Desconectada').map(v => (
                        <li key={v.id} className="border-b pb-1">{v.prefixo} ({v.modelo || 'S/ Modelo'})</li>
                      ))}
                      {(frotaData || []).filter(v => v?.status === 'Desconectada').length === 0 && <p className="text-green-600 font-bold">100% da frota operante e inspecionada.</p>}
                    </ul>
                 </div>
               </div>
             </div>

             <h3 className="text-lg font-bold border-b-2 border-gray-600 mb-4 pb-1">DETALHAMENTO DOS SERVIÇOS ATIVOS</h3>
             <table className="w-full text-[10px] border-collapse border border-gray-300">
               <thead className="bg-[#004b23] text-white">
                 <tr>
                   <th className="border p-2">Hora</th>
                   <th className="border p-2">Mod/VTR</th>
                   <th className="border p-2">Comandante</th>
                   <th className="border p-2">Área / Serviço</th>
                   <th className="border p-2">Avarias</th>
                 </tr>
               </thead>
               <tbody>
                 {(docData || []).map((c, i) => {
                   const avarias = Object.values(c?.itens || {}).filter(it => it?.status === 'Alterado').length;
                   
                   let vtrDisplay = c.prefixo || c.modalidade;
                   if (c.modalidade === 'MOTOCICLETA' && c.motosEquipe) {
                     const prefixes = Object.values(c.motosEquipe).map(m => m?.prefixo).filter(Boolean);
                     if (prefixes.length > 0) vtrDisplay = prefixes.join(' / ');
                   }

                   return (
                     <tr key={i} className="text-center">
                       <td className="border p-2 font-mono">{c?.date ? new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</td>
                       <td className="border p-2 font-bold max-w-[100px] truncate">{vtrDisplay}</td>
                       <td className="border p-2">{c.equipe?.[0]?.posto} {c.equipe?.[0]?.nome}</td>
                       <td className="border p-2 truncate max-w-[100px]">{c.areaAtuacao}</td>
                       <td className="border p-2 text-red-600 font-bold">{avarias > 0 ? avarias : '-'}</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        )}

        {/* CONTEÚDO CHECKLIST / OFICINA */}
        {(type === 'checklist' || isOficina) && docData && (
          <div>
            
            <div className="mb-4">
              <h3 className="font-bold text-sm bg-gray-200 p-1 px-2 border-l-4 border-gray-600 uppercase mb-2">Composição da Equipe</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(docData.equipe || []).map((eq, i) => (
                  <div key={i} className="border p-1.5 flex justify-between">
                    <span className="font-bold text-gray-600 w-24 truncate">{eq.funcao}:</span>
                    <span className="font-bold">{eq.posto} {eq.nome} (Mat: {eq.matricula})</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="font-bold text-sm bg-gray-200 p-1 px-2 border-l-4 border-[#004b23] uppercase mb-2 mt-4">Dados do Policiamento</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 border border-gray-300 p-3 bg-gray-50 text-[10px]">
              <div><span className="text-gray-500 uppercase block">Modalidade</span><strong className="text-sm">{docData.modalidade}</strong></div>
              
              <div>
                <span className="text-gray-500 uppercase block">Veículo(s)</span>
                <strong className="text-sm">
                  {docData.modalidade === 'MOTOCICLETA' 
                    ? Object.values(docData.motosEquipe || {}).map(m => m?.prefixo).filter(Boolean).join(' / ')
                    : (docData.prefixo || 'N/A')}
                </strong>
              </div>

              <div><span className="text-gray-500 uppercase block">Data/Registro Base</span><strong className="text-sm">{docData.date ? new Date(docData.date).toLocaleString() : '--/--/----'}</strong></div>
              <div><span className="text-gray-500 uppercase block">Cidade / OPM</span><strong className="text-sm">{docData.cidade} - {docData.opm}</strong></div>
              <div className="col-span-2"><span className="text-gray-500 uppercase block">Área de Atuação</span><strong className="text-sm">{docData.areaAtuacao}</strong></div>
              <div><span className="text-gray-500 uppercase block">Turno / Horário</span><strong className="text-sm">{docData.turno} ({docData.horaInicial} às {docData.horaFinal})</strong></div>
              <div><span className="text-gray-500 uppercase block">Tipo de Serviço</span><strong className="text-sm">{docData.tipoServico} (HT: {docData.ht || 'N/I'})</strong></div>
              
              {docData.modalidade !== 'A PÉ / FIXO' && (
                 <div className="col-span-2 border-t pt-2 mt-1"><span className="text-gray-500 uppercase block">KM Atual / Troca Óleo</span><strong className="text-sm">{docData.kmAtual} (Próxima Troca: {docData.kmProxima || 'N/I'})</strong></div>
              )}
              
              {docData.trocaRegistrada && (
                <div className="col-span-2 border-t pt-2 mt-1 bg-purple-50 p-2 rounded">
                  <span className="text-purple-600 text-[10px] uppercase block font-bold">Auditoria de Troca de Viatura</span>
                  <strong className="text-sm text-purple-800">{docData.conflitoAudit || 'O motorista estava conectado em outra VTR e realizou a troca neste horário.'}</strong>
                </div>
              )}
            </div>

            {isOficina ? (
              <div>
                <h3 className="text-lg font-bold border-b-2 border-red-500 text-red-700 mb-4 pb-1">ITENS COM ALTERAÇÃO PARA CONSERTO</h3>
                <ul className="space-y-3">
                  {Object.entries(docData.itens || {}).filter(([k,v]) => v?.status === 'Alterado').map(([item, dados]) => (
                    <li key={item} className="bg-red-50 border border-red-200 p-3 rounded">
                      <strong className="text-red-800">{item}</strong>
                      <p className="text-gray-700 mt-1">Obs: {dados.obs || 'Nenhuma observação informada.'}</p>
                    </li>
                  ))}
                  {qtdAvarias === 0 && !docData.outrasAlteracoes && (
                    <p className="text-green-700 font-bold p-4 bg-green-50 text-center border">Nenhuma avaria registrada nesta viatura.</p>
                  )}
                </ul>

                {docData.outrasAlteracoes && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-300 rounded">
                    <strong className="text-orange-800 block mb-2 uppercase text-xs">Outras Alterações Constatadas:</strong>
                    <p className="text-sm text-gray-800">{docData.outrasAlteracoes}</p>
                  </div>
                )}
              </div>
            ) : (
              docData.modalidade !== 'A PÉ / FIXO' && (
                <div className="columns-2 gap-6 text-[9px]">
                  {Object.entries(docData.modalidade === 'MOTOCICLETA' ? CHECKLIST_CATEGORIES_MOTO : CHECKLIST_CATEGORIES_VTR).map(([cat, itemsCat]) => (
                    <div key={cat} className="mb-4 break-inside-avoid">
                      <h4 className="bg-gray-200 font-bold p-1 border-l-4 border-[#004b23] mb-1 uppercase">{cat}</h4>
                      <ul>
                        {itemsCat.map(item => {
                          const info = (docData.itens || {})[item];
                          if(!info) return null;
                          return (
                            <li key={item} className="flex justify-between border-b border-gray-100 py-0.5">
                              <span>{item}</span>
                              <span className={`font-bold ${info.status==='Alterado'?'text-red-600':'text-green-700'}`}>
                                {info.status} {info.status==='Alterado' && `(${info.obs})`}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            )}

            {!isOficina && (
              <>
                {docData.outrasAlteracoes && docData.modalidade !== 'A PÉ / FIXO' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 text-xs">
                    <strong className="text-orange-800 uppercase block mb-1">Outras Alterações Registradas:</strong>
                    <p className="text-gray-800">{docData.outrasAlteracoes}</p>
                  </div>
                )}

                {docData.fotos && Object.keys(docData.fotos).length > 0 && (
                  <div className="mt-8 break-before-page">
                    <h3 className="text-lg font-bold border-b-2 border-[#004b23] mb-4 pb-1">REGISTROS FOTOGRÁFICOS</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.keys(docData.fotos).map((angle) => {
                        const f = docData.fotos[angle];
                        if (!f) return null;
                        return (
                          <div key={angle} className="border border-gray-200 p-1 bg-white break-inside-avoid">
                            <img src={f.url} alt={angle} className="w-full h-24 object-cover mb-1 rounded-sm border border-gray-100"/>
                            <div className="bg-gray-100 text-gray-800 text-center font-bold text-[8px] py-1 mb-1 truncate px-1 rounded-sm">{angle.toUpperCase()}</div>
                            <p className="text-[7px] text-gray-500 leading-tight text-center">
                              {f.metadata?.sizeKb || '?'} KB<br/>
                              {f.metadata?.lastMod ? new Date(f.metadata.lastMod).toLocaleString() : '--'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ASSINATURA E DECLARAÇÃO */}
            <div className="mt-16 text-center break-inside-avoid">
               {!isOficina && qtdAvarias === 0 && (
                 <div className="text-[10px] text-justify text-gray-600 mb-10 leading-relaxed italic border-t border-b border-gray-200 py-4 px-2">
                   {DECLARACAO_SEM_ALTERACAO}
                 </div>
               )}
               
               <div className="w-64 border-t border-black mx-auto mt-8 pt-2">
                  <p className="font-bold uppercase text-sm">{docData.equipe?.[0]?.posto} {docData.equipe?.[0]?.nomeCompleto || docData.equipe?.[0]?.nome || docData.userName}</p>
                  <p className="text-xs uppercase font-mono">Matrícula: {docData.equipe?.[0]?.matricula || docData.matricula}</p>
                  <p className="text-[10px] font-bold mt-1 text-gray-600 uppercase">Comandante da Equipe</p>
               </div>
            </div>
          </div>
        )}

        <div className="mt-10 pt-4 border-t text-center text-[10px] text-gray-400 print:absolute print:bottom-4 print:left-0 print:right-0">
          Documento gerado digitalmente pelo Sistema de Gestão de Frota - 3º BPM / PMCE
        </div>
      </div>
    </div>
  );
}
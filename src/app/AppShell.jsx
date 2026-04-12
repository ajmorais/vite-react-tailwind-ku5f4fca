import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, db, appId } from '../config/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Shield, Car, Users, LayoutDashboard, FileText, Wrench, CheckCircle, AlertTriangle, Camera, LogOut, Plus, Trash2, Printer, Info, KeyRound, Edit, Bell, XCircle, Eye, Download, ArrowUp, ArrowDown, Terminal, UserMinus, Search, MapPin, Clock, UserPlus, FileSignature, Activity, ClipboardList, BarChart2, Crosshair, Gavel, Paperclip, Briefcase, ShieldAlert, Package, Calendar } from 'lucide-react';
import { APPS_SCRIPT_URL, LOGO_URL, PLANILHA_EFETIVO_URL, DECLARACAO_SEM_ALTERACAO, CIDADES_SERVICO, OPMS, OPMS_VTR, MODALIDADES, CATEGORIAS_MATERIAL, CHECKLIST_CATEGORIES_VTR, CHECKLIST_CATEGORIES_MOTO, POSTOS_GRADUACOES, TURNOS, TURNO_DURATION_RULES, TIPOS_SERVICO, PROCEDIMENTOS, NATUREZAS_OCORRENCIA, AREAS_POR_OPM, ROLES, SCREEN_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS, MANDATORY_PHOTOS, VTR_USAGE_STORAGE_KEY } from '../config/constants';
import { parseDateAndTimeLocal, formatDateTimeBR, calculateServiceSchedule, parseCoordinates, buildGeoHotspotKey, ensureLeafletAssets, getAreaOptionsByOpm, getAreaOptionByLabel, buildAreaAtuacao, sanitizeNumericInput, getNumericValue, isBulkMaterial, getMaterialAvailableQuantity, buildMaterialDisplayName, getMaterialStatusLabel, buildFleetSelectionEntries, getVehicleTypeLabel, buildFleetCardTree, getVehicleUsageMap, registerVehicleUsage, getVehicleUsageScore, getServiceDisplayLabel, getServiceDestinationLabel, formatAuditorIdentity, getServiceAuditLines, isServiceHiddenFromActiveBoard, enrichActiveServicesWithAudit, normalizeRolePermissions, getRolePermissions, roleHasAccess, getDefaultViewForRole, saveSession, getSession, isServiceActive, normalizeMatricula, formatMatricula, matriculasMatch, calculateOccurrenceDuration, getServiceDurationHours, getServicePmCount, normalizeLookupText, inferMunicipioServico, getServiceReferenceWindow, isServiceActiveAt, buildServiceSnapshot, buildCurrentFleetConnections, buildPoliceWorkSummary, getServiceDefaultTeam, getOccurrenceDefaultTeam } from '../rules';
import LoginScreen from '../components/common/LoginScreen';
import Sidebar from '../components/common/Sidebar';
import Toast from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';
import PrintView from '../components/common/PrintView';
import DevDashboard from '../components/dev/DevDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminEquipesAtivas from '../components/admin/AdminEquipesAtivas';
import AdminViaturas from '../components/admin/AdminViaturas';
import AdminUsers from '../components/admin/AdminUsers';
import ServiceEntryForm from '../components/operational/ServiceEntryForm';
import UserHistory from '../components/operational/UserHistory';
import AreaMapScreen from '../components/operational/AreaMapScreen';
import ServiceModal from '../components/modals/ServiceModal';
import OcorrenciaForm from '../components/productivity/OcorrenciaForm';
import OcorrenciaHistory from '../components/productivity/OcorrenciaHistory';
import OcorrenciaModal from '../components/modals/OcorrenciaModal';
import UserCautelaForm from '../components/reserve/UserCautelaForm';
import ArmeiroDashboard from '../components/reserve/ArmeiroDashboard';

export default export default function AppShell() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [viaturas, setViaturas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]); 
  const [materiais, setMateriais] = useState([]);
  const [cautelas, setCautelas] = useState([]);
  const [usersDb, setUsersDb] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [efetivoPlanilha, setEfetivoPlanilha] = useState([]); 
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  
  const [view, setView] = useState('login'); 
  const [printLayout, setPrintLayout] = useState(null);
  const [viewService, setViewService] = useState(null); 
  const [viewOcorrencia, setViewOcorrencia] = useState(null); 
  const [toast, setToast] = useState(null); 
  const [loadingDrive, setLoadingDrive] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  // SISTEMA DE LOGOUT POR OCIOSIDADE (10 MINUTOS)
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (userData) {
        timeoutId = setTimeout(() => {
          if (userData) registerLog(userData.matricula, userData.name, 'LOGOUT_POR_INATIVIDADE');
          setUserData(null);
          localStorage.removeItem('vtr_prod_v2_session');
          setView('login');
          showToast("Sessão encerrada automaticamente após 10 minutos de inatividade.", "info");
        }, 10 * 60 * 1000); // 10 minutos
      }
    };

    if (userData) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
      resetTimer(); 
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [userData]);

  const handleFirebaseError = (error, contextAction) => {
    console.error(`Erro [${contextAction}]:`, error);
    if (error.code === 'permission-denied') {
      showToast("ERRO DE REGRAS NO FIREBASE.", "error");
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
      const users = snap.docs.map(d => ({ ...d.data(), id: d.id }));
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
                return getDefaultViewForRole(dbUser.role, rolePermissions);
              }
              return prevView;
            });
          }
        }
      }
    }, (error) => handleFirebaseError(error, "Leitura de Usuários"));

    const unsubVtr = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'viaturas'), (snap) => {
      const vtrs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setViaturas(vtrs);
    }, (error) => handleFirebaseError(error, "Leitura de Viaturas"));

    const unsubCheck = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'servicos'), (snap) => {
      setServicos(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (error) => handleFirebaseError(error, "Leitura de Serviços"));

    const unsubOcorrencias = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'ocorrencias'), (snap) => {
      setOcorrencias(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro)));
    }, (error) => handleFirebaseError(error, "Leitura de Ocorrências"));

    const unsubMateriais = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'materiais'), (snap) => {
      setMateriais(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (error) => handleFirebaseError(error, "Leitura de Materiais"));

    const unsubCautelas = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'cautelas'), (snap) => {
      setCautelas(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.dataRetirada) - new Date(a.dataRetirada)));
    }, (error) => handleFirebaseError(error, "Leitura de Cautelas"));

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), (snap) => {
      setAccessLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, (error) => handleFirebaseError(error, "Leitura de Logs"));

    const permissionsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'configuracoes', 'permissoes_perfil');
    const unsubPermissions = onSnapshot(permissionsDocRef, async (snap) => {
      if (snap.exists()) {
        setRolePermissions(normalizeRolePermissions(snap.data()?.roles || {}));
      } else {
        const defaults = normalizeRolePermissions(DEFAULT_ROLE_PERMISSIONS);
        setRolePermissions(defaults);
        try {
          await setDoc(permissionsDocRef, { roles: defaults, updatedAt: new Date().toISOString(), updatedBy: 'SISTEMA' });
        } catch (error) {
          handleFirebaseError(error, "Inicializar Permissões");
        }
      }
    }, (error) => handleFirebaseError(error, "Leitura de Permissões"));

    return () => { unsubUsers(); unsubVtr(); unsubCheck(); unsubOcorrencias(); unsubMateriais(); unsubCautelas(); unsubLogs(); unsubPermissions(); };
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
    const dbUser = usersDb.find(u => matriculasMatch(u.matricula, matricula));
    
    if (!dbUser) return showToast("Matrícula não encontrada. Por favor, cadastre-se.", "error");
    if (dbUser.password !== password) return showToast("Senha incorreta.", "error");
    if (dbUser.status === 'Pendente') return showToast("O seu cadastro está pendente. Aguarde a aprovação.", "info");
    if (dbUser.status === 'Inativo') return showToast("A sua conta está inativa. Procure o Oficial.", "error");

    setUserData(dbUser);
    saveSession({ matricula: dbUser.matricula });
    registerLog(dbUser.matricula, dbUser.name, 'LOGIN');
    
    showToast("LOGIN EFETUADO COM SUCESSO.", "success");
    setView(getDefaultViewForRole(dbUser.role, rolePermissions));
  };

  const handleChangePassword = async (matricula, currentPassword, newPassword) => {
    if (!user) return false;
    const dbUser = usersDb.find(u => matriculasMatch(u.matricula, matricula));
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

  const saveViatura = async (placa, prefixo, modelo, condicao, localInoperante, tipoVeiculo, opmOrigem) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'viaturas'), { 
        placa: placa.toUpperCase(), prefixo: prefixo.toUpperCase(), modelo: modelo.toUpperCase(), 
        condicao, localInoperante: localInoperante.toUpperCase(), tipoVeiculo, opmOrigem 
      });
      showToast("Viatura adicionada com sucesso!", "success");
    } catch(e) { handleFirebaseError(e, "Adicionar Viatura"); }
  };

  const editViatura = async (id, placa, prefixo, modelo, condicao, localInoperante, tipoVeiculo, opmOrigem) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'viaturas', id), { 
        placa: (placa || '').toUpperCase(), 
        prefixo: (prefixo || '').toUpperCase(), 
        modelo: (modelo || '').toUpperCase(), 
        condicao: condicao || 'Operante', 
        localInoperante: (localInoperante || '').toUpperCase(), 
        tipoVeiculo: tipoVeiculo || 'CARRO', 
        opmOrigem: opmOrigem || OPMS_VTR[0] 
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
  const baixarEquipe = async (id, motivo) => {
    try {
      const motivoFinal = String(motivo || '').trim();
      if (!motivoFinal) {
        showToast('Informe o motivo da baixa da equipe.', 'error');
        return false;
      }

      const servicoRef = doc(db, 'artifacts', appId, 'public', 'data', 'servicos', id);
      const servicoSnap = await getDoc(servicoRef);
      const servicoAtual = servicoSnap.exists() ? servicoSnap.data() : {};
      const dadosBaixa = userData ? {
        matricula: userData.matricula,
        nome: userData.name,
        posto: userData.posto,
        role: userData.role
      } : null;
      const linhaAuditoria = `Equipe baixada por ${formatAuditorIdentity(dadosBaixa)}. Motivo: ${motivoFinal.toUpperCase()}.`;
      const auditoriaHistorico = Array.from(new Set([...(Array.isArray(servicoAtual?.auditoriaHistorico) ? servicoAtual.auditoriaHistorico : []), linhaAuditoria].filter(Boolean)));

      await updateDoc(servicoRef, {
        equipeBaixada: true,
        motivoBaixa: motivoFinal.toUpperCase(),
        dataBaixa: new Date().toISOString(),
        baixadaPor: dadosBaixa,
        auditoriaHistorico,
        baixaLiberouNovaEntrada: true
      });
      showToast('Equipe baixada com sucesso. Nova entrada de serviço liberada para os membros da equipe.', 'success');
      return true;
    } catch(e) {
      handleFirebaseError(e, 'Baixar Equipe');
      return false;
    }
  };
  const deleteOcorrencia = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ocorrencias', id)); showToast("Ocorrência apagada permanentemente.", "success"); setViewOcorrencia(null); } 
    catch(e) { handleFirebaseError(e, "Apagar Ocorrência"); }
  };
  const deleteCautelaHistory = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cautelas', id));
      showToast("Movimentação apagada permanentemente do histórico geral.", "success");
    } catch(e) { handleFirebaseError(e, "Apagar Movimentação da Cautela"); }
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
      setView(roleHasAccess(userData?.role, 'user_hist', rolePermissions) ? 'user_hist' : getDefaultViewForRole(userData?.role, rolePermissions));
    } catch (error) { handleFirebaseError(error, "Salvar Entrada de Serviço"); } finally { setLoadingDrive(false); }
  };

  const saveOcorrencia = async (data) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    setLoadingDrive(true);
    const ocData = { ...data, id: Date.now().toString(), dataRegistro: new Date().toISOString() };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ocorrencias'), ocData);
      showToast("Relatório de Ocorrência Policial registado com sucesso!", "success");
      setView(roleHasAccess(userData?.role, 'user_hist_ocorrencia', rolePermissions) ? 'user_hist_ocorrencia' : getDefaultViewForRole(userData?.role, rolePermissions));
    } catch (error) { handleFirebaseError(error, "Salvar Ocorrência"); } finally { setLoadingDrive(false); }
  };

  const saveMaterial = async (data) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    try {
      const quantidadeTotal = Math.max(1, getNumericValue(data?.quantidadeTotal ?? data?.quantidade, 1));
      const materialPayload = {
        ...data,
        quantidadeTotal,
        quantidadeDisponivel: isBulkMaterial({ ...data, quantidadeTotal }) ? Math.max(0, getNumericValue(data?.quantidadeDisponivel ?? quantidadeTotal, quantidadeTotal)) : 1,
        controleQuantidade: isBulkMaterial({ ...data, quantidadeTotal }),
      };
      materialPayload.status = materialPayload.controleQuantidade
        ? (materialPayload.quantidadeDisponivel > 0 ? 'Disponível' : 'Sem saldo')
        : (materialPayload.status || 'Disponível');

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'materiais'), materialPayload);
      showToast("Material cadastrado no Inventário!", "success");
    } catch (error) { handleFirebaseError(error, "Salvar Material"); }
  };

  const editMaterial = async (id, updatedData) => {
    try {
      const quantidadeTotal = Math.max(1, getNumericValue(updatedData?.quantidadeTotal ?? updatedData?.quantidade, 1));
      const existingMaterial = materiais.find(item => item.id === id) || {};
      const usedQuantity = Math.max(0, getNumericValue(existingMaterial.quantidadeTotal, isBulkMaterial(existingMaterial) ? 1 : 1) - getNumericValue(existingMaterial.quantidadeDisponivel, getMaterialAvailableQuantity(existingMaterial)));
      const controleQuantidade = isBulkMaterial({ ...updatedData, quantidadeTotal });
      const quantidadeDisponivel = controleQuantidade
        ? Math.max(0, quantidadeTotal - usedQuantity)
        : (updatedData.status === 'Cautelado' ? 0 : 1);

      const payload = {
        ...updatedData,
        quantidadeTotal,
        quantidadeDisponivel,
        controleQuantidade,
      };
      payload.status = controleQuantidade
        ? (payload.quantidadeDisponivel > 0 ? 'Disponível' : 'Sem saldo')
        : (updatedData.status || 'Disponível');

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materiais', id), payload);
      showToast("Material atualizado com sucesso!", "success");
    } catch(e) { handleFirebaseError(e, "Editar Material"); }
  };

  const deleteMaterial = async (id) => {
    try { 
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materiais', id)); 
      showToast("Material removido do inventário.", "info"); 
    } catch(e) { handleFirebaseError(e, "Excluir Material"); }
  };

  const saveCautela = async (data, itensSelecionados) => {
    if (!user) return showToast("Aguarde a conexão com o servidor...", "info");
    setLoadingDrive(true);
    try {
      const novaCautela = {
        ...data,
        status: 'Pendente',
        dataRegistro: new Date().toISOString(),
        itensSolicitados: itensSelecionados.map(item => ({
          id: item.id,
          categoria: item.categoria || '',
          tipo: item.tipo || '',
          marca: item.marca || '',
          modelo: item.modelo || '',
          calibre: item.calibre || '',
          numeroSerie: item.numeroSerie || '',
          lote: item.lote || '',
          quantidadeSolicitada: Math.max(1, getNumericValue(item.quantidadeSolicitada, 1)),
          controleQuantidade: isBulkMaterial(item)
        }))
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cautelas'), novaCautela);
      showToast("Solicitação enviada. Aguarde a aprovação do armeiro responsável.", "success");
      setView('user_check');
    } catch (error) { handleFirebaseError(error, "Salvar Cautela"); } finally { setLoadingDrive(false); }
  };

  const approveCautela = async (cautelaId, dadosArmeiro = null) => {
    try {
      const cautelaRef = doc(db, 'artifacts', appId, 'public', 'data', 'cautelas', cautelaId);
      const cautelaSnap = await getDoc(cautelaRef);
      if (!cautelaSnap.exists()) {
        showToast("Solicitação de cautela não encontrada.", "error");
        return;
      }

      const cautelaData = cautelaSnap.data();
      const itensSolicitados = cautelaData.itensSolicitados || [];

      for (const item of itensSolicitados) {
        const materialRef = doc(db, 'artifacts', appId, 'public', 'data', 'materiais', item.id);
        const materialSnap = await getDoc(materialRef);
        if (!materialSnap.exists()) {
          showToast(`Material não encontrado para aprovação: ${item.tipo || item.id}.`, "error");
          return;
        }

        const materialAtual = materialSnap.data();
        const qtdSolicitada = Math.max(1, getNumericValue(item.quantidadeSolicitada, 1));

        if (isBulkMaterial(materialAtual)) {
          const disponivel = getMaterialAvailableQuantity(materialAtual);
          if (qtdSolicitada > disponivel) {
            showToast(`Saldo insuficiente para ${buildMaterialDisplayName(materialAtual)}. Disponível: ${disponivel}.`, "error");
            return;
          }
        } else if (materialAtual.status !== 'Disponível') {
          showToast(`O item ${buildMaterialDisplayName(materialAtual)} não está disponível para cautela.`, "error");
          return;
        }
      }

      for (const item of itensSolicitados) {
        const materialRef = doc(db, 'artifacts', appId, 'public', 'data', 'materiais', item.id);
        const materialSnap = await getDoc(materialRef);
        const materialAtual = materialSnap.data();
        const qtdSolicitada = Math.max(1, getNumericValue(item.quantidadeSolicitada, 1));

        if (isBulkMaterial(materialAtual)) {
          const saldoAtual = getMaterialAvailableQuantity(materialAtual);
          const novoSaldo = Math.max(0, saldoAtual - qtdSolicitada);
          await updateDoc(materialRef, {
            quantidadeDisponivel: novoSaldo,
            status: materialAtual.status === 'Baixado' ? 'Baixado' : (novoSaldo > 0 ? 'Disponível' : 'Sem saldo')
          });
        } else {
          await updateDoc(materialRef, { status: 'Cautelado' });
        }
      }

      await updateDoc(cautelaRef, {
        status: 'Ativa',
        dataAprovacao: new Date().toISOString(),
        armeiroAprovador: dadosArmeiro || null,
        dataRetirada: cautelaData.dataRetirada || new Date().toISOString().split('T')[0]
      });

      showToast("Cautela aprovada com sucesso.", "success");
    } catch (error) { handleFirebaseError(error, "Aprovar Cautela"); }
  };

  const rejectCautela = async (cautelaId, motivo = '', dadosArmeiro = null) => {
    try {
      const motivoFinal = String(motivo || '').trim();
      if (!motivoFinal) {
        showToast("Informe o motivo da rejeição.", "error");
        return;
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cautelas', cautelaId), {
        status: 'Rejeitada',
        motivoRejeicao: motivoFinal,
        dataRejeicao: new Date().toISOString(),
        armeiroRevisor: dadosArmeiro || null
      });
      showToast("Solicitação rejeitada com sucesso.", "info");
    } catch(error) { handleFirebaseError(error, "Rejeitar Cautela"); }
  };

  const devolverCautela = async (cautelaId, itensId, observacaoDevolucao = '', dadosArmeiro = null) => {
    try {
      const cautelaRef = doc(db, 'artifacts', appId, 'public', 'data', 'cautelas', cautelaId);
      const cautelaSnap = await getDoc(cautelaRef);
      const cautelaData = cautelaSnap.exists() ? cautelaSnap.data() : null;
      const itensSolicitados = cautelaData?.itensSolicitados || [];

      const updateData = { 
        status: 'Devolvida', 
        dataDevolucao: new Date().toISOString(),
        observacaoDevolucao 
      };
      if (dadosArmeiro) updateData.armeiroRecebedor = dadosArmeiro;

      await updateDoc(cautelaRef, updateData);
      for (const item of itensSolicitados) {
        const materialRef = doc(db, 'artifacts', appId, 'public', 'data', 'materiais', item.id);
        const materialSnap = await getDoc(materialRef);
        if (!materialSnap.exists()) continue;
        const materialAtual = materialSnap.data();
        const qtdSolicitada = Math.max(1, getNumericValue(item.quantidadeSolicitada, 1));

        if (isBulkMaterial(materialAtual)) {
          const saldoAtual = getMaterialAvailableQuantity(materialAtual);
          const novoSaldo = saldoAtual + qtdSolicitada;
          await updateDoc(materialRef, {
            quantidadeDisponivel: novoSaldo,
            status: materialAtual.status === 'Baixado' ? 'Baixado' : 'Disponível'
          });
        } else {
          await updateDoc(materialRef, { status: 'Disponível' });
        }
      }
      showToast("Cautela devolvida e itens liberados para o Inventário!", "success");
    } catch(error) { handleFirebaseError(error, "Devolver Cautela"); }
  };

  const saveRolePermissions = async (updatedPermissions, updatedByUser = null) => {
    if (!userData || userData.role !== 'dev') {
      showToast("Apenas o Desenvolvedor pode alterar permissões por perfil.", "error");
      return false;
    }

    try {
      const normalized = normalizeRolePermissions(updatedPermissions);
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'configuracoes', 'permissoes_perfil'),
        {
          roles: normalized,
          updatedAt: new Date().toISOString(),
          updatedBy: `${updatedByUser?.posto || ''} ${updatedByUser?.name || 'DESENVOLVEDOR'}`.trim()
        }
      );
      showToast("Permissões dos perfis atualizadas com sucesso.", "success");
      return true;
    } catch (error) {
      handleFirebaseError(error, "Salvar Permissões de Perfis");
      return false;
    }
  };

  useEffect(() => {
    if (!userData || view === 'login') return;
    if (roleHasAccess(userData.role, view, rolePermissions)) return;

    const fallbackView = getDefaultViewForRole(userData.role, rolePermissions);
    if (fallbackView && fallbackView !== view) {
      showToast("Sua visualização atual foi ajustada conforme as permissões do perfil.", "info");
      setView(fallbackView);
    }
  }, [userData, view, rolePermissions]);

  if (printLayout) {
    return <PrintView data={printLayout} onClose={() => setPrintLayout(null)} />;
  }

  const role = userData?.role;
  const userWeight = ROLES[role]?.weight || 1;
  const isGestorProdutividade = role === 'administrativo' || userWeight >= 3;
  const isGestorFrota = role === 'adm_p4' || userWeight >= 3;
  const isArmeiro = role === 'armeiro' || userWeight >= 3;
  const isAdmin = userWeight >= 3;
  const isDev = userWeight === 5;
  const canDeleteVtr = userWeight >= 3;
  const canAccessView = (screen) => roleHasAccess(role, screen, rolePermissions);
  const safeSetView = (nextView) => {
    if (!userData || nextView === 'login' || roleHasAccess(userData.role, nextView, rolePermissions)) {
      setView(nextView);
    } else {
      showToast("Acesso não liberado para o seu perfil.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 relative">
      <Toast toast={toast} />

      <LoadingOverlay show={loadingDrive} />

      {viewService && (
        <ServiceModal data={viewService} onClose={() => setViewService(null)} isDev={isDev} onDelete={deleteService} />
      )}
      
      {viewOcorrencia && (
        <OcorrenciaModal data={viewOcorrencia} onClose={() => setViewOcorrencia(null)} isDev={isDev} onDelete={deleteOcorrencia} />
      )}

      {view === 'login' && <LoginScreen onLogin={handleLogin} onChangePassword={handleChangePassword} onRegister={handleRegister} showToast={showToast} />}
      
      {userData && view !== 'login' && (
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar userData={userData} view={view} setView={safeSetView} logout={logout} rolePermissions={rolePermissions} />
          <main className="flex-1 p-2 md:p-6 w-full overflow-x-hidden">
            {view === 'dev_dash' && canAccessView('dev_dash') && <DevDashboard logs={accessLogs} onClearLogs={clearLogs} rolePermissions={rolePermissions} onSaveRolePermissions={saveRolePermissions} currentUser={userData} />}
            {view === 'admin_dash' && canAccessView('admin_dash') && <AdminDashboard servicos={servicos} viaturas={viaturas} setPrintLayout={setPrintLayout} setViewService={setViewService} />}
            {view === 'admin_equipes' && canAccessView('admin_equipes') && <AdminEquipesAtivas servicos={servicos} setViewService={setViewService} onBaixarEquipe={baixarEquipe} userData={userData} userWeight={userWeight} />}
            {view === 'admin_vtr' && canAccessView('admin_vtr') && <AdminViaturas viaturas={viaturas} onAdd={saveViatura} onEdit={editViatura} onDelete={deleteViatura} canDelete={canDeleteVtr} />}
            {view === 'admin_users' && canAccessView('admin_users') && <AdminUsers usersDb={usersDb} onUpdateRole={updateUserRole} onUpdateStatus={updateUserStatus} onUpdateUserDetails={updateUserDetails} onDeleteUser={deleteUser} onGeneratePassword={generateTempPassword} currentUser={userData} isDev={isDev} />}
            
            {view === 'user_check' && canAccessView('user_check') && <ServiceEntryForm viaturas={viaturas.filter(v => v.condicao !== 'Inoperante')} onSave={saveService} userData={userData} servicos={servicos} usersDb={usersDb} efetivoPlanilha={efetivoPlanilha} setView={safeSetView} showToast={showToast} />}
            {view === 'user_hist' && canAccessView('user_hist') && <UserHistory servicos={isGestorFrota ? servicos : servicos.filter(c => c.equipe?.some(eq => eq.matricula === userData.matricula))} viaturas={viaturas} setPrintLayout={setPrintLayout} setViewService={setViewService} isGestor={isGestorFrota} isDev={isDev} onDeleteService={deleteService} />}
            {view === 'user_area_map' && canAccessView('user_area_map') && <AreaMapScreen />}
            
            {view === 'user_ocorrencia' && canAccessView('user_ocorrencia') && <OcorrenciaForm onSave={saveOcorrencia} userData={userData} usersDb={usersDb} efetivoPlanilha={efetivoPlanilha} viaturas={viaturas} setView={safeSetView} showToast={showToast} />}
            {view === 'user_hist_ocorrencia' && canAccessView('user_hist_ocorrencia') && <OcorrenciaHistory ocorrencias={isGestorProdutividade ? ocorrencias : ocorrencias.filter(c => c.equipe?.some(eq => eq.matricula === userData.matricula))} setPrintLayout={setPrintLayout} setViewOcorrencia={setViewOcorrencia} isGestor={isGestorProdutividade} isDev={isDev} onDelete={deleteOcorrencia} />}
          
            {view === 'user_cautela' && canAccessView('user_cautela') && <UserCautelaForm materiais={materiais} usersDb={usersDb} onSave={saveCautela} userData={userData} setView={safeSetView} showToast={showToast} />}
            {view === 'armeiro_dash' && canAccessView('armeiro_dash') && <ArmeiroDashboard materiais={materiais} cautelas={cautelas} onAddMaterial={saveMaterial} onEditMaterial={editMaterial} onDeleteMaterial={deleteMaterial} onDeleteCautelaHistory={deleteCautelaHistory} onApproveCautela={approveCautela} onRejectCautela={rejectCautela} onDevolver={devolverCautela} showToast={showToast} isDev={isDev} userData={userData} />}
          </main>
        </div>
      )}
    </div>
  );
}

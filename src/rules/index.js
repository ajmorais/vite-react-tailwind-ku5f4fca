export const parseDateAndTimeLocal = (dateInput, timeInput) => {
  if (!dateInput || !timeInput) return null;
  const [year, month, day] = String(dateInput).split('-').map(Number);
  const [hour, minute] = String(timeInput).split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

export const formatDateTimeBR = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return '';
  return dateValue.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateServiceSchedule = ({ turno, horaInicial, horaFinal, dataBase = null } = {}) => {
  if (!turno || !horaInicial || !horaFinal) return { valid: false, message: 'Informe turno, hora inicial e hora final.' };
  const allowedDurations = TURNO_DURATION_RULES[turno] || [];
  if (allowedDurations.length === 0) return { valid: false, message: 'Turno inválido.' };

  const referenceDate = dataBase instanceof Date ? new Date(dataBase) : new Date();
  const baseDateStr = new Date(referenceDate.getTime() - referenceDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const start = parseDateAndTimeLocal(baseDateStr, horaInicial);
  if (!start) return { valid: false, message: 'Hora inicial inválida.' };

  const [endHour, endMinute] = String(horaFinal).split(':').map(Number);
  if (![endHour, endMinute].every(Number.isFinite)) return { valid: false, message: 'Hora final inválida.' };

  const candidates = [];
  for (let dayOffset = 0; dayOffset <= 3; dayOffset += 1) {
    const endCandidate = new Date(start);
    endCandidate.setDate(endCandidate.getDate() + dayOffset);
    endCandidate.setHours(endHour, endMinute, 0, 0);
    const diffHours = (endCandidate.getTime() - start.getTime()) / 3600000;
    if (diffHours > 0) candidates.push({ end: endCandidate, diffHours });
  }

  const validCandidate = candidates.find(candidate => allowedDurations.includes(candidate.diffHours));
  if (!validCandidate) {
    const allowedLabel = allowedDurations.join(', ');
    return {
      valid: false,
      message: `Horário inválido para o turno ${turno}. Durações aceitas: ${allowedLabel} hora(s).`
    };
  }

  return {
    valid: true,
    durationHours: validCandidate.diffHours,
    start,
    end: validCandidate.end,
    endDateLabel: formatDateTimeBR(validCandidate.end)
  };
};

export const parseCoordinates = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const normalized = raw.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  const parts = normalized.split(/[;,/]|\s+/).map(item => item.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const lat = Number(parts[0].replace(',', '.'));
  const lng = Number(parts[1].replace(',', '.'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
};

export const buildGeoHotspotKey = ({ lat, lng } = {}) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
};

export const ensureLeafletAssets = (() => {
  let promise = null;
  return () => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (window.L) return Promise.resolve(window.L);
    if (promise) return promise;

    promise = new Promise((resolve, reject) => {
      const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      if (![...document.querySelectorAll('link')].some(link => link.href === cssHref)) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = cssHref;
        document.head.appendChild(css);
      }

      const scriptSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      const existingScript = [...document.querySelectorAll('script')].find(script => script.src === scriptSrc);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L));
        existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar o Leaflet.')));
        return;
      }

      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Falha ao carregar o Leaflet.'));
      document.body.appendChild(script);
    });

    return promise;
  };
})();

export const getAreaOptionsByOpm = (opm) => {
  return (AREAS_POR_OPM[opm] || []).map((entry) => {
    const [areaBruta, bairrosBrutos = ''] = entry.split(':');
    return {
      label: (areaBruta || '').trim(),
      bairros: bairrosBrutos.split(',').map(b => b.trim()).filter(Boolean)
    };
  });
};

export const getAreaOptionByLabel = (opm, areaSelecionada) => {
  return getAreaOptionsByOpm(opm).find(area => area.label === areaSelecionada) || null;
};

export const buildAreaAtuacao = (opm, areaSelecionada, bairrosSelecionados = [], areaDigitada = '') => {
  if (!AREAS_POR_OPM[opm]) return (areaDigitada || '').trim();
  if (!areaSelecionada || areaSelecionada === 'OUTRA') return (areaDigitada || '').trim();

  const areaObj = getAreaOptionByLabel(opm, areaSelecionada);
  if (!areaObj) return '';

  const bairrosFinal = (bairrosSelecionados || []).filter(Boolean);
  return bairrosFinal.length > 0
    ? `${areaSelecionada}: ${bairrosFinal.join(', ')}`
    : areaSelecionada;
};

export const sanitizeNumericInput = (value = '') => String(value || '').replace(/\D/g, '');

export const getNumericValue = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const isBulkMaterial = (material = {}) => {
  return material?.categoria === 'Munição' || getNumericValue(material?.quantidadeTotal ?? material?.quantidade, 1) > 1 || material?.controleQuantidade === true;
};

export const getMaterialAvailableQuantity = (material = {}) => {
  if (!material) return 0;
  if (isBulkMaterial(material)) {
    return Math.max(0, getNumericValue(material.quantidadeDisponivel ?? material.quantidadeTotal ?? material.quantidade, 0));
  }
  return material.status === 'Disponível' ? 1 : 0;
};

export const buildMaterialDisplayName = (material = {}, quantidade = null) => {
  const base = `${material.categoria || 'Material'}: ${material.tipo || ''} ${material.marca || ''} ${material.modelo || ''}`.replace(/\s+/g, ' ').trim();
  const serialInfo = material.numeroSerie ? `NS: ${material.numeroSerie}` : (material.lote ? `Lote: ${material.lote}` : '');
  const qtyInfo = quantidade ? `Qtd: ${quantidade}` : '';
  return [base, serialInfo, qtyInfo].filter(Boolean).join(' - ');
};

export const getMaterialStatusLabel = (material = {}) => {
  if (isBulkMaterial(material)) {
    const disponivel = getMaterialAvailableQuantity(material);
    if (material.status === 'Baixado') return 'Baixado';
    if (material.status === 'Manutenção') return 'Manutenção';
    return disponivel > 0 ? 'Disponível' : 'Sem saldo';
  }
  return material.status || 'Disponível';
};

export const buildFleetSelectionEntries = (vehicles = []) => {
  const typeOrder = ['CARRO', 'MOTO'];
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const typeA = (a.tipoVeiculo || 'CARRO').toUpperCase();
    const typeB = (b.tipoVeiculo || 'CARRO').toUpperCase();
    const typeIndexA = typeOrder.includes(typeA) ? typeOrder.indexOf(typeA) : typeOrder.length;
    const typeIndexB = typeOrder.includes(typeB) ? typeOrder.indexOf(typeB) : typeOrder.length;
    if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
    const modeloA = (a.modelo || '').toUpperCase();
    const modeloB = (b.modelo || '').toUpperCase();
    if (modeloA !== modeloB) return modeloA.localeCompare(modeloB, 'pt-BR');
    const prefixoA = (a.prefixo || '').toUpperCase();
    const prefixoB = (b.prefixo || '').toUpperCase();
    if (prefixoA !== prefixoB) return prefixoA.localeCompare(prefixoB, 'pt-BR');
    return ((a.placa || '').toUpperCase()).localeCompare((b.placa || '').toUpperCase(), 'pt-BR');
  });

  const grouped = sortedVehicles.reduce((acc, vehicle) => {
    const tipo = (vehicle.tipoVeiculo || 'CARRO').toUpperCase();
    const modelo = (vehicle.modelo || 'SEM MODELO').toUpperCase();
    acc[tipo] = acc[tipo] || {};
    acc[tipo][modelo] = acc[tipo][modelo] || [];
    acc[tipo][modelo].push(vehicle);
    return acc;
  }, {});

  const entries = [];
  Object.keys(grouped)
    .sort((a, b) => {
      const ia = typeOrder.includes(a) ? typeOrder.indexOf(a) : typeOrder.length;
      const ib = typeOrder.includes(b) ? typeOrder.indexOf(b) : typeOrder.length;
      return ia - ib || a.localeCompare(b, 'pt-BR');
    })
    .forEach((tipo) => {
      entries.push({ kind: 'type', key: `type-${tipo}`, label: `──────── ${tipo} ────────` });
      Object.keys(grouped[tipo]).sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach((modelo) => {
        entries.push({ kind: 'model', key: `model-${tipo}-${modelo}`, label: `• ${modelo}` });
        grouped[tipo][modelo].forEach((vehicle) => {
          entries.push({
            kind: 'vehicle',
            key: vehicle.id,
            value: vehicle.id,
            label: `${vehicle.prefixo || 'S/PREFIXO'} - ${vehicle.placa || 'S/ PLACA'}`
          });
        });
      });
    });


  return entries;
};

export const getVehicleTypeLabel = (tipo = 'CARRO') => (String(tipo || 'CARRO').toUpperCase() === 'MOTO' ? 'MOTO' : 'CARRO');

export const buildFleetCardTree = (vehicles = []) => {
  const grouped = [...vehicles]
    .sort((a, b) => {
      const tipoA = getVehicleTypeLabel(a.tipoVeiculo);
      const tipoB = getVehicleTypeLabel(b.tipoVeiculo);
      if (tipoA !== tipoB) return tipoA.localeCompare(tipoB, 'pt-BR');
      const modeloA = (a.modelo || 'SEM MODELO').toUpperCase();
      const modeloB = (b.modelo || 'SEM MODELO').toUpperCase();
      if (modeloA !== modeloB) return modeloA.localeCompare(modeloB, 'pt-BR');
      const prefixoA = (a.prefixo || '').toUpperCase();
      const prefixoB = (b.prefixo || '').toUpperCase();
      if (prefixoA !== prefixoB) return prefixoA.localeCompare(prefixoB, 'pt-BR');
      return (a.placa || '').toUpperCase().localeCompare((b.placa || '').toUpperCase(), 'pt-BR');
    })
    .reduce((acc, vehicle) => {
      const tipo = getVehicleTypeLabel(vehicle.tipoVeiculo);
      const modelo = (vehicle.modelo || 'SEM MODELO').toUpperCase();
      acc[tipo] = acc[tipo] || {};
      acc[tipo][modelo] = acc[tipo][modelo] || [];
      acc[tipo][modelo].push(vehicle);
      return acc;
    }, {});

  return ['CARRO', 'MOTO']
    .filter(tipo => grouped[tipo])
    .map(tipo => ({
      tipo,
      modelos: Object.keys(grouped[tipo])
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map(modelo => ({
          modelo,
          vehicles: grouped[tipo][modelo]
        }))
    }));
};

export const getVehicleUsageMap = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(VTR_USAGE_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

export const registerVehicleUsage = (vehicle = {}) => {
  if (!vehicle?.id) return;
  try {
    const usage = getVehicleUsageMap();
    const currentModelKey = `${getVehicleTypeLabel(vehicle.tipoVeiculo)}::${(vehicle.modelo || 'SEM MODELO').toUpperCase()}`;
    const currentVehicleKey = `VTR::${vehicle.id}`;
    usage[currentModelKey] = (Number(usage[currentModelKey]) || 0) + 1;
    usage[currentVehicleKey] = (Number(usage[currentVehicleKey]) || 0) + 1;
    localStorage.setItem(VTR_USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {}
};

export const getVehicleUsageScore = (vehicle = {}) => {
  const usage = getVehicleUsageMap();
  const modelKey = `${getVehicleTypeLabel(vehicle.tipoVeiculo)}::${(vehicle.modelo || 'SEM MODELO').toUpperCase()}`;
  const vehicleKey = `VTR::${vehicle.id}`;
  return {
    model: Number(usage[modelKey]) || 0,
    vehicle: Number(usage[vehicleKey]) || 0,
  };
};

export const getServiceDisplayLabel = (servico = {}) => {
  if (servico?.modalidade === 'MOTOPATRULHAMENTO' && servico?.motosEquipe) {
    const prefixes = Object.values(servico.motosEquipe).map(m => m?.prefixo).filter(Boolean);
    if (prefixes.length > 0) return prefixes.join(' / ');
  }
  return servico?.prefixo || servico?.modalidade || 'OUTRO SERVIÇO';
};

export const getServiceDestinationLabel = (servico = {}) => {
  const base = getServiceDisplayLabel(servico);
  const area = (servico?.areaAtuacao || '').trim();
  return area ? `${base} + ${area}` : base;
};

export const formatAuditorIdentity = (pessoa = {}) => {
  const posto = (pessoa?.posto || '').trim();
  const matricula = (pessoa?.matricula || '').trim();
  const nome = (pessoa?.nome || pessoa?.name || '').trim();
  return [posto, matricula, nome].filter(Boolean).join(' - ');
};

export const getServiceAuditLines = (servico = {}) => {
  const linhas = [];
  if (Array.isArray(servico?.auditoriaHistorico)) {
    servico.auditoriaHistorico.forEach(linha => {
      const texto = String(linha || '').trim();
      if (texto) linhas.push(texto);
    });
  }
  if (servico?.equipeBaixada && servico?.motivoBaixa) {
    const linhaBaixa = `Equipe baixada por ${formatAuditorIdentity(servico.baixadaPor)}. Motivo: ${servico.motivoBaixa}.`;
    if (!linhas.includes(linhaBaixa)) linhas.unshift(linhaBaixa);
  }
  if (servico?.conflitoAudit) linhas.unshift(servico.conflitoAudit);
  return Array.from(new Set(linhas.filter(Boolean)));
};

export const isServiceHiddenFromActiveBoard = (servico = {}, latestByPm = new Map()) => {
  if (!servico || servico.equipeBaixada) return true;
  const equipe = Array.isArray(servico.equipe) ? servico.equipe.filter(pm => pm?.matricula) : [];
  if (equipe.length === 0) return true;
  return equipe.every(pm => latestByPm.get(pm.matricula) && latestByPm.get(pm.matricula) !== servico.id);
};

export const enrichActiveServicesWithAudit = (servicos = []) => {
  const ativos = [...(servicos || [])]
    .filter(isServiceActive)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const latestByPm = new Map();
  ativos.forEach(servico => {
    (servico.equipe || []).forEach(pm => {
      if (!pm?.matricula) return;
      if (!latestByPm.has(pm.matricula)) latestByPm.set(pm.matricula, servico.id);
    });
  });

  return ativos
    .map(servico => {
      const auditoriaLinhas = [];
      (servico.equipe || []).forEach(pm => {
        if (!pm?.matricula) return;
        const destinoId = latestByPm.get(pm.matricula);
        if (destinoId && destinoId !== servico.id) {
          const destino = ativos.find(item => item.id === destinoId);
          auditoriaLinhas.push(`PM ${pm.posto} ${pm.nome || pm.matricula} (${pm.matricula}) remanejado para ${getServiceDestinationLabel(destino)}.`);
        }
      });
      getServiceAuditLines(servico).forEach(linha => auditoriaLinhas.unshift(linha));

      const pmsAtuais = (servico.equipe || []).filter(pm => pm?.matricula && latestByPm.get(pm.matricula) === servico.id);
      const pmsRemanejados = (servico.equipe || []).filter(pm => pm?.matricula && latestByPm.get(pm.matricula) !== servico.id);

      return {
        ...servico,
        auditoriaLinhas: Array.from(new Set(auditoriaLinhas)).filter(Boolean),
        pmsAtuais,
        pmsRemanejados,
        ocultarEmEquipesAtivas: isServiceHiddenFromActiveBoard(servico, latestByPm)
      };
    })
    .filter(servico => !servico.ocultarEmEquipesAtivas);
};

export const normalizeRolePermissions = (permissionsMap = {}) => {
  const validScreens = new Set(Object.keys(SCREEN_DEFINITIONS));
  return Object.keys(ROLES).reduce((acc, roleKey) => {
    const roleScreens = Array.isArray(permissionsMap?.[roleKey]) ? permissionsMap[roleKey] : DEFAULT_ROLE_PERMISSIONS[roleKey];
    acc[roleKey] = [...new Set((roleScreens || []).filter(screen => validScreens.has(screen)))];
    return acc;
  }, {});
};

export const getRolePermissions = (role, permissionsMap = DEFAULT_ROLE_PERMISSIONS) => {
  if (!role) return [];
  const normalized = normalizeRolePermissions(permissionsMap);
  return normalized[role] || [];
};

export const roleHasAccess = (role, screen, permissionsMap = DEFAULT_ROLE_PERMISSIONS) => {
  if (!role || !screen) return false;
  return getRolePermissions(role, permissionsMap).includes(screen);
};

export const getDefaultViewForRole = (role, permissionsMap = DEFAULT_ROLE_PERMISSIONS) => {
  const preferredByRole = {
    administrativo: ['user_hist_ocorrencia', 'user_ocorrencia'],
    adm_p4: ['admin_vtr', 'user_check', 'user_hist'],
    fiscal_policiamento: ['admin_equipes', 'admin_dash', 'user_check'],
    oficial_p4: ['admin_dash', 'admin_equipes', 'user_check'],
    oficial_p3: ['admin_dash', 'admin_equipes', 'user_check'],
    oficial: ['admin_dash', 'admin_equipes', 'user_check'],
    oficial_superior: ['admin_dash', 'admin_equipes', 'user_check'],
    dev: ['dev_dash', 'admin_dash', 'user_check'],
    operacional: ['user_check', 'user_area_map'],
    armeiro: ['user_check', 'armeiro_dash']
  };

  const allowed = getRolePermissions(role, permissionsMap);
  const preferred = preferredByRole[role] || ['user_check'];

  return preferred.find(screen => allowed.includes(screen))
    || allowed[0]
    || 'login';
};

export const saveSession = (data) => localStorage.setItem('vtr_prod_v2_session', JSON.stringify(data));

export const getSession = () => { try { return JSON.parse(localStorage.getItem('vtr_prod_v2_session')); } catch(e){ return null; } };

export const isServiceActive = (c) => {
  if (!c || c.equipeBaixada || !c.date) return false;
  const now = new Date();

  if (c.dataPrevistaTermino) {
    const endDate = new Date(c.dataPrevistaTermino);
    return !Number.isNaN(endDate.getTime()) && now <= endDate;
  }

  if (!c.horaFinal) return false;
  const checkDate = new Date(c.date);
  const [hFim, mFim] = c.horaFinal.split(':').map(Number);
  const [hIni, mIni] = (c.horaInicial || '00:00').split(':').map(Number);
  let finalDate = new Date(checkDate);
  finalDate.setHours(hFim, mFim, 0, 0);
  if (hFim < hIni || (hFim === hIni && mFim <= mIni)) finalDate.setDate(finalDate.getDate() + 1);
  return now <= finalDate;
};

export const normalizeMatricula = (val, { allowDev = true } = {}) => {
  const cleanVal = String(val || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (allowDev && cleanVal === 'DEV') return cleanVal;
  const match = cleanVal.match(/^(\d+)([A-Z]?)$/);
  return match ? `${match[1]}${match[2] || ''}` : cleanVal;
};

export const formatMatricula = (val) => normalizeMatricula(val);

export const matriculasMatch = (a, b) => normalizeMatricula(a) === normalizeMatricula(b);

export const calculateOccurrenceDuration = ({ dataOcorrencia, horaInicial, horaFinal } = {}) => {
  if (!dataOcorrencia || !horaInicial || !horaFinal) return { valid: false, message: 'Informe data, hora inicial e hora final.' };
  const start = parseDateAndTimeLocal(dataOcorrencia, horaInicial);
  const endBase = parseDateAndTimeLocal(dataOcorrencia, horaFinal);
  if (!start || !endBase) return { valid: false, message: 'Horário inválido.' };
  let end = new Date(endBase);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (totalMinutes <= 0) return { valid: false, message: 'A duração da ocorrência deve ser positiva.' };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    valid: true,
    start,
    end,
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(2)),
    hours,
    minutes,
    label: `${hours}h${String(minutes).padStart(2, '0')}min`,
    endDateLabel: formatDateTimeBR(end)
  };
};

export const getServiceDurationHours = (servico = {}) => {
  if (Number.isFinite(Number(servico?.duracaoHorasServico))) return Number(servico.duracaoHorasServico);
  const startBase = servico?.date ? new Date(servico.date) : new Date();
  const schedule = calculateServiceSchedule({
    turno: servico?.turno,
    horaInicial: servico?.horaInicial,
    horaFinal: servico?.horaFinal,
    dataBase: startBase
  });
  if (schedule.valid && Number.isFinite(schedule.durationHours)) return Number(schedule.durationHours);

  if (servico?.horaInicial && servico?.horaFinal) {
    const baseDate = servico?.date ? new Date(servico.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const start = parseDateAndTimeLocal(baseDate, servico.horaInicial);
    const endBase = parseDateAndTimeLocal(baseDate, servico.horaFinal);
    if (start && endBase) {
      let end = new Date(endBase);
      if (end <= start) end.setDate(end.getDate() + 1);
      const diff = (end - start) / 3600000;
      if (diff > 0) return Number(diff.toFixed(2));
    }
  }
  return 0;
};

export const getServicePmCount = (servico = {}) => Array.isArray(servico?.pmsAtuais)
  ? servico.pmsAtuais.length
  : (Array.isArray(servico?.equipe) ? servico.equipe.filter(pm => pm?.matricula || pm?.nome).length : 0);

export const normalizeLookupText = (value = '') => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

export const inferMunicipioServico = (servico = {}) => {
  const pool = normalizeLookupText([servico?.municipio, servico?.cidade, servico?.areaAtuacao, servico?.opm, servico?.opmOutra].filter(Boolean).join(' '));
  if (!pool) return 'N/I';
  if (pool.includes('1CIA DO 3BPM') || pool.includes('4CIA DO 3BPM') || pool.includes('SOBRAL')) return 'SOBRAL';
  for (const cidade of CIDADES_SERVICO.filter(c => c !== 'OUTRA')) {
    if (pool.includes(normalizeLookupText(cidade))) return cidade;
  }
  return 'N/I';
};

export const getServiceReferenceWindow = (servico = {}) => {
  const baseDate = servico?.date ? new Date(servico.date) : null;
  if (!baseDate || !servico?.horaInicial || !servico?.horaFinal) return null;
  const baseDay = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const start = parseDateAndTimeLocal(baseDay, servico.horaInicial);
  const schedule = calculateServiceSchedule({ turno: servico?.turno, horaInicial: servico?.horaInicial, horaFinal: servico?.horaFinal, dataBase: baseDate });
  const end = schedule.valid && schedule.end ? new Date(schedule.end) : (() => {
    const endBase = parseDateAndTimeLocal(baseDay, servico.horaFinal);
    if (!start || !endBase) return null;
    const endTmp = new Date(endBase);
    if (endTmp.getTime() <= start.getTime()) endTmp.setDate(endTmp.getDate() + 1);
    return endTmp;
  })();
  if (!start || !end) return null;
  return { start, end };
};

export const isServiceActiveAt = (servico = {}, referenceDate = new Date()) => {
  if (!servico || !referenceDate) return false;
  const window = getServiceReferenceWindow(servico);
  if (!window) return false;
  const ref = new Date(referenceDate);
  if (ref < window.start || ref > window.end) return false;
  if (servico?.equipeBaixada) {
    const baixaDate = servico?.dataBaixa ? new Date(servico.dataBaixa) : null;
    if (baixaDate && baixaDate <= ref) return false;
  }
  return true;
};

export const buildServiceSnapshot = (servicos = [], referenceDate = new Date()) => {
  const ativos = [...(servicos || [])]
    .filter(servico => isServiceActiveAt(servico, referenceDate))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const latestByPm = new Map();
  ativos.forEach(servico => {
    (servico.equipe || []).forEach(pm => {
      if (!pm?.matricula) return;
      if (!latestByPm.has(pm.matricula)) latestByPm.set(pm.matricula, servico.id);
    });
  });

  return ativos
    .map(servico => {
      const auditoriaLinhas = [];
      (servico.equipe || []).forEach(pm => {
        if (!pm?.matricula) return;
        const destinoId = latestByPm.get(pm.matricula);
        if (destinoId && destinoId !== servico.id) {
          const destino = ativos.find(item => item.id === destinoId);
          auditoriaLinhas.push(`PM ${pm.posto} ${pm.nome || pm.matricula} (${pm.matricula}) remanejado para ${getServiceDestinationLabel(destino)}.`);
        }
      });
      getServiceAuditLines(servico).forEach(linha => auditoriaLinhas.unshift(linha));

      const pmsAtuais = (servico.equipe || []).filter(pm => pm?.matricula && latestByPm.get(pm.matricula) === servico.id);
      const pmsRemanejados = (servico.equipe || []).filter(pm => pm?.matricula && latestByPm.get(pm.matricula) !== servico.id);

      return {
        ...servico,
        auditoriaLinhas: Array.from(new Set(auditoriaLinhas)).filter(Boolean),
        pmsAtuais,
        pmsRemanejados,
        ocultarEmEquipesAtivas: isServiceHiddenFromActiveBoard(servico, latestByPm),
      };
    })
    .filter(servico => !servico.ocultarEmEquipesAtivas);
};

export const buildCurrentFleetConnections = (servicos = []) => {
  const ativos = enrichActiveServicesWithAudit(servicos || []);
  const connectedIds = new Map();
  ativos.forEach(servico => {
    if (servico?.modalidade === 'MOTOPATRULHAMENTO') {
      Object.values(servico?.motosEquipe || {}).forEach(moto => {
        if (moto?.vtrId) connectedIds.set(moto.vtrId, servico);
      });
    } else if (servico?.vtrId) {
      connectedIds.set(servico.vtrId, servico);
    }
  });
  return connectedIds;
};

export const buildPoliceWorkSummary = (servicos = []) => {
  const map = new Map();
  (servicos || []).forEach(servico => {
    const horas = getServiceDurationHours(servico);
    const turno = servico?.turno || '-';
    (servico?.equipe || []).forEach(pm => {
      if (!pm?.matricula && !pm?.nome) return;
      const key = normalizeMatricula(pm?.matricula || `${pm?.posto || ''}-${pm?.nome || ''}`) || `${pm?.posto || ''}-${pm?.nome || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          posto: pm?.posto || '',
          matricula: pm?.matricula || '',
          nome: pm?.nome || '',
          nomeCompleto: pm?.nomeCompleto || pm?.nome || '',
          horasTrabalhadas: 0,
          turnosTrabalhados: 0,
          servicos: [],
          modalidades: {},
          turnos: {},
        });
      }
      const current = map.get(key);
      current.horasTrabalhadas += horas;
      current.turnosTrabalhados += 1;
      current.turnos[turno] = (current.turnos[turno] || 0) + 1;
      const modalidade = servico?.modalidade || 'OUTRA';
      current.modalidades[modalidade] = (current.modalidades[modalidade] || 0) + 1;
      current.servicos.push(servico);
    });
  });
  return Array.from(map.values()).map(item => ({
    ...item,
    horasTrabalhadas: Number(item.horasTrabalhadas.toFixed(2)),
    turnosResumo: Object.entries(item.turnos).map(([k,v]) => `${k}: ${v}`).join(' | '),
    modalidadesResumo: Object.entries(item.modalidades).map(([k,v]) => `${k}: ${v}`).join(' | '),
  })).sort((a,b) => b.horasTrabalhadas - a.horasTrabalhadas || b.turnosTrabalhados - a.turnosTrabalhados || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
};

export const getServiceDefaultTeam = (modalidade, userData = {}) => {
  const baseCommander = { id: 1, funcao: 'CMDE DA EQUIPE', matricula: userData?.matricula || '', nome: userData?.name || '', nomeCompleto: userData?.nomeCompleto || '', posto: userData?.posto || '', telefone: userData?.telefone || '' };
  if (modalidade === 'POSTO FIXO' || modalidade === 'A PÉ') return [baseCommander];
  return [
    baseCommander,
    { id: 2, funcao: 'MOTORISTA', matricula: '', nome: '', nomeCompleto: '', posto: '', telefone: '' }
  ];
};

export const getOccurrenceDefaultTeam = (tipoPoliciamento, userData = {}) => {
  const base = [
    { id: 1, funcao: 'COMANDANTE', matricula: userData?.matricula || '', nome: userData?.name || '', nomeCompleto: userData?.nomeCompleto || '', posto: userData?.posto || '' },
  ];
  if (tipoPoliciamento === 'POSTO FIXO' || tipoPoliciamento === 'A PÉ') {
    return [
      ...base,
      { id: 2, funcao: 'PATRULHEIRO 02', matricula: '', nome: '', nomeCompleto: '', posto: '' },
      { id: 3, funcao: 'PATRULHEIRO 03', matricula: '', nome: '', nomeCompleto: '', posto: '' },
      { id: 4, funcao: 'PATRULHEIRO 04', matricula: '', nome: '', nomeCompleto: '', posto: '' }
    ];
  }
  return [
    ...base,
    { id: 2, funcao: 'MOTORISTA', matricula: '', nome: '', nomeCompleto: '', posto: '' },
    { id: 3, funcao: 'PATRULHEIRO 03', matricula: '', nome: '', nomeCompleto: '', posto: '' },
    { id: 4, funcao: 'PATRULHEIRO 04', matricula: '', nome: '', nomeCompleto: '', posto: '' }
  ];
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Shield, Car, Users, LayoutDashboard, FileText, Wrench, CheckCircle, AlertTriangle, Camera, LogOut, Plus, Trash2, Printer, Info, KeyRound, Edit, Bell, XCircle, Eye, Download, ArrowUp, ArrowDown, Terminal, UserMinus, Search, MapPin, Clock, UserPlus, FileSignature, Activity, ClipboardList, BarChart2, Crosshair, Gavel, Paperclip, Briefcase, ShieldAlert, Package, Calendar } from 'lucide-react';
import { APPS_SCRIPT_URL, LOGO_URL, PLANILHA_EFETIVO_URL, DECLARACAO_SEM_ALTERACAO, CIDADES_SERVICO, OPMS, OPMS_VTR, MODALIDADES, CATEGORIAS_MATERIAL, CHECKLIST_CATEGORIES_VTR, CHECKLIST_CATEGORIES_MOTO, POSTOS_GRADUACOES, TURNOS, TURNO_DURATION_RULES, TIPOS_SERVICO, PROCEDIMENTOS, NATUREZAS_OCORRENCIA, AREAS_POR_OPM, ROLES, SCREEN_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS, MANDATORY_PHOTOS, VTR_USAGE_STORAGE_KEY } from '../../config/constants';
import { parseDateAndTimeLocal, formatDateTimeBR, calculateServiceSchedule, parseCoordinates, buildGeoHotspotKey, ensureLeafletAssets, getAreaOptionsByOpm, getAreaOptionByLabel, buildAreaAtuacao, sanitizeNumericInput, getNumericValue, isBulkMaterial, getMaterialAvailableQuantity, buildMaterialDisplayName, getMaterialStatusLabel, buildFleetSelectionEntries, getVehicleTypeLabel, buildFleetCardTree, getVehicleUsageMap, registerVehicleUsage, getVehicleUsageScore, getServiceDisplayLabel, getServiceDestinationLabel, formatAuditorIdentity, getServiceAuditLines, isServiceHiddenFromActiveBoard, enrichActiveServicesWithAudit, normalizeRolePermissions, getRolePermissions, roleHasAccess, getDefaultViewForRole, saveSession, getSession, isServiceActive, normalizeMatricula, formatMatricula, matriculasMatch, calculateOccurrenceDuration, getServiceDurationHours, getServicePmCount, normalizeLookupText, inferMunicipioServico, getServiceReferenceWindow, isServiceActiveAt, buildServiceSnapshot, buildCurrentFleetConnections, buildPoliceWorkSummary, getServiceDefaultTeam, getOccurrenceDefaultTeam } from '../../rules';

export default function AreaMapScreen() {
  const ciaCards = [
    { key: '1ªCIA DO 3ºBPM', titulo: '1ª CIA do 3º BPM', subtitulo: 'Sobral - áreas urbanas e zona rural 1', cor: 'border-emerald-500 bg-emerald-50' },
    { key: '2ªCIA DO 3ºBPM', titulo: '2ª CIA do 3º BPM', subtitulo: 'Municípios da região norte 1', cor: 'border-blue-500 bg-blue-50' },
    { key: '3ªCIA DO 3ºBPM', titulo: '3ª CIA do 3º BPM', subtitulo: 'Municípios da região norte 2', cor: 'border-amber-500 bg-amber-50' },
    { key: '4ªCIA DO 3ºBPM', titulo: '4ª CIA do 3º BPM', subtitulo: 'Sobral - áreas urbanas e zona rural 2', cor: 'border-fuchsia-500 bg-fuchsia-50' },
  ];

  const totalTerritorios = ciaCards.reduce((acc, item) => acc + (AREAS_POR_OPM[item.key]?.length || 0), 0);
  const municipios2cia = (AREAS_POR_OPM['2ªCIA DO 3ºBPM'] || []).length;
  const municipios3cia = (AREAS_POR_OPM['3ªCIA DO 3ºBPM'] || []).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Mapa de Áreas</h2>
        <p className="text-sm text-gray-500">Consulta rápida e didática das áreas, bairros e municípios vinculados à 1ª, 2ª, 3ª e 4ª CIA do 3º BPM.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-l-4 border-[#004b23] p-4"><p className="text-[11px] uppercase font-black text-gray-500">Companhias mapeadas</p><p className="text-3xl font-black text-[#004b23] mt-2">4</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-l-4 border-cyan-500 p-4"><p className="text-[11px] uppercase font-black text-gray-500">Territórios cadastrados</p><p className="text-3xl font-black text-cyan-700 mt-2">{totalTerritorios}</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-l-4 border-blue-500 p-4"><p className="text-[11px] uppercase font-black text-gray-500">Municípios da 2ª CIA</p><p className="text-3xl font-black text-blue-700 mt-2">{municipios2cia}</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-l-4 border-amber-500 p-4"><p className="text-[11px] uppercase font-black text-gray-500">Municípios da 3ª CIA</p><p className="text-3xl font-black text-amber-700 mt-2">{municipios3cia}</p></div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-5">
        <p className="text-xs md:text-sm font-semibold text-gray-600">Resumo operacional:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">1ª CIA = Sobral</span>
          <span className="inline-flex items-center rounded-full bg-fuchsia-100 text-fuchsia-800 px-3 py-1 text-xs font-bold">4ª CIA = Sobral</span>
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold">2ª CIA = municípios da região</span>
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold">3ª CIA = municípios da região</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        {ciaCards.map(card => {
          const territorios = AREAS_POR_OPM[card.key] || [];
          const isSobral = card.key === '1ªCIA DO 3ºBPM' || card.key === '4ªCIA DO 3ºBPM';
          return (
            <div key={card.key} className={`rounded-2xl border shadow-sm p-4 md:p-5 ${card.cor}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900">{card.titulo}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{card.subtitulo}</p>
                </div>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-gray-700 border">{territorios.length} registro(s)</span>
              </div>

              {isSobral ? (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-white p-3">
                    <p className="text-[11px] uppercase font-black text-gray-500">Município de referência</p>
                    <p className="text-base md:text-lg font-black text-[#004b23] mt-1">SOBRAL</p>
                  </div>
                  <div className="space-y-2">
                    {territorios.map((territorio, index) => {
                      const [titulo, detalhes = ''] = String(territorio).split(':');
                      return (
                        <div key={index} className="rounded-xl border bg-white p-3 shadow-sm">
                          <p className="text-sm font-black text-gray-800">{titulo.trim()}</p>
                          <p className="text-xs text-gray-600 mt-1">{detalhes.trim() || 'Sem detalhamento adicional.'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-3 shadow-sm">
                  <p className="text-[11px] uppercase font-black text-gray-500 mb-2">Municípios atendidos</p>
                  <div className="flex flex-wrap gap-2">
                    {territorios.map((municipio, index) => (
                      <span key={index} className="inline-flex items-center rounded-full border bg-gray-50 px-3 py-1 text-xs font-bold text-gray-800">
                        {municipio}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { initializeFirebase, ensureAuthenticated } from './firebaseConfig';
import { StorageService } from './storageService';
import {
  Plot,
  SoilAnalysis,
  HarvestRecord,
  Produto,
  PontoVenda,
  PrecoNegociado,
  SaidaVenda,
} from '../types';

export type SyncStatus = 'online' | 'offline_cache' | 'not_configured' | 'syncing';

export const SYNC_PROTOCOL_VERSION = 5;

export class SyncService {
  private static unsubscribers: Unsubscribe[] = [];
  private static statusListeners: ((status: SyncStatus) => void)[] = [];
  private static currentStatus: SyncStatus = 'not_configured';
  private static isClearing = false;

  static getStatus(): SyncStatus {
    const { isReady } = initializeFirebase();
    if (!isReady) return 'not_configured';
    if (!navigator.onLine) return 'offline_cache';
    return this.currentStatus === 'not_configured' ? 'online' : this.currentStatus;
  }

  static onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private static notifyStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  /**
   * Inicia sincronização bidirecional em tempo real para todas as entidades
   */
  static async startRealtimeSync(onDataUpdated: () => void): Promise<boolean> {
    this.stopRealtimeSync();

    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) {
      this.notifyStatus('not_configured');
      return false;
    }

    StorageService.setSyncHook(
      (col, ent) => {
        if (!this.isClearing) {
          this.pushEntity(col, ent);
        }
      },
      (col, id) => {
        if (!this.isClearing) {
          this.deleteEntity(col, id);
        }
      }
    );

    // Autenticação opcional em segundo plano (não bloqueante para leitura/escrita)
    ensureAuthenticated().catch(() => {});

    this.notifyStatus(navigator.onLine ? 'online' : 'offline_cache');

    const handleOnline = () => this.notifyStatus('online');
    const handleOffline = () => this.notifyStatus('offline_cache');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carga proativa inicial imediata via getDocs (renderização instantânea na abertura)
    Promise.allSettled([
      getDocs(collection(db, 'recreio_plots')),
      getDocs(collection(db, 'recreio_analyses')),
      getDocs(collection(db, 'recreio_harvests')),
      getDocs(collection(db, 'recreio_produtos')),
      getDocs(collection(db, 'recreio_pdvs')),
      getDocs(collection(db, 'recreio_precos')),
      getDocs(collection(db, 'recreio_saidas')),
    ]).then(([plotsRes, analysesRes, harvestsRes, produtosRes, pdvsRes, precosRes, saidasRes]) => {
      if (this.isClearing) return;
      let hasUpdates = false;

      if (plotsRes.status === 'fulfilled') {
        const remotePlots: Plot[] = [];
        plotsRes.value.forEach((d) => remotePlots.push(d.data() as Plot));
        StorageService.savePlots(remotePlots, true);
        hasUpdates = true;
      }

      if (analysesRes.status === 'fulfilled') {
        const remoteAnalyses: SoilAnalysis[] = [];
        analysesRes.value.forEach((d) => remoteAnalyses.push(d.data() as SoilAnalysis));
        StorageService.saveAnalyses(remoteAnalyses, true);
        hasUpdates = true;
      }

      if (harvestsRes.status === 'fulfilled') {
        const remoteHarvests: HarvestRecord[] = [];
        harvestsRes.value.forEach((d) => remoteHarvests.push(d.data() as HarvestRecord));
        StorageService.saveHarvests(remoteHarvests, true);
        hasUpdates = true;
      }

      if (produtosRes.status === 'fulfilled') {
        const remoteProdutos: Produto[] = [];
        produtosRes.value.forEach((d) => remoteProdutos.push(d.data() as Produto));
        StorageService.saveProdutos(remoteProdutos, true);
        hasUpdates = true;
      }

      if (pdvsRes.status === 'fulfilled') {
        const remotePdvs: PontoVenda[] = [];
        pdvsRes.value.forEach((d) => remotePdvs.push(d.data() as PontoVenda));
        StorageService.savePontosVenda(remotePdvs, true);
        hasUpdates = true;
      }

      if (precosRes.status === 'fulfilled') {
        const remotePrecos: PrecoNegociado[] = [];
        precosRes.value.forEach((d) => remotePrecos.push(d.data() as PrecoNegociado));
        StorageService.savePrecosNegociados(remotePrecos, true);
        hasUpdates = true;
      }

      if (saidasRes.status === 'fulfilled') {
        const remoteSaidas: SaidaVenda[] = [];
        saidasRes.value.forEach((d) => remoteSaidas.push(d.data() as SaidaVenda));
        StorageService.saveSaidas(remoteSaidas, true);
        hasUpdates = true;
      }

      if (hasUpdates) {
        onDataUpdated();
      }
    }).catch((err) => {
      console.warn('[SyncService] Erro na busca proativa inicial:', err);
    });

    // 0. Listener de Controle e Reset Global da Nuvem
    const unsubMeta = onSnapshot(
      doc(db, 'recreio_meta', 'sync_control'),
      (snapshot) => {
        if (this.isClearing) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          const remoteResetAt = Number(data?.lastResetAt || 0);
          const localSeen = Number(localStorage.getItem('recreio_last_reset_seen') || 0);
          if (remoteResetAt > localSeen) {
            localStorage.setItem('recreio_last_reset_seen', String(remoteResetAt));
            StorageService.clearAllData();
            onDataUpdated();
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot sync_control:', err)
    );

    // 1. Plots (Talhões)
    const unsubPlots = onSnapshot(
      collection(db, 'recreio_plots'),
      (snapshot) => {
        if (this.isClearing) return;
        const remotePlots: Plot[] = [];
        snapshot.forEach((d) => remotePlots.push(d.data() as Plot));
        StorageService.savePlots(remotePlots, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot plots:', err)
    );

    // 2. Análises de Solo
    const unsubAnalyses = onSnapshot(
      collection(db, 'recreio_analyses'),
      (snapshot) => {
        if (this.isClearing) return;
        const remoteAnalyses: SoilAnalysis[] = [];
        snapshot.forEach((d) => remoteAnalyses.push(d.data() as SoilAnalysis));
        StorageService.saveAnalyses(remoteAnalyses, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot analyses:', err)
    );

    // 3. Colheitas
    const unsubHarvests = onSnapshot(
      collection(db, 'recreio_harvests'),
      (snapshot) => {
        if (this.isClearing) return;
        const remoteHarvests: HarvestRecord[] = [];
        snapshot.forEach((d) => remoteHarvests.push(d.data() as HarvestRecord));
        StorageService.saveHarvests(remoteHarvests, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot harvests:', err)
    );

    // 4. Produtos (Cafés, Tomates, Uvas, Vinhos)
    const unsubProdutos = onSnapshot(
      collection(db, 'recreio_produtos'),
      (snapshot) => {
        if (this.isClearing) return;
        const remoteProdutos: Produto[] = [];
        snapshot.forEach((d) => remoteProdutos.push(d.data() as Produto));
        StorageService.saveProdutos(remoteProdutos, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot produtos:', err)
    );

    // 5. Pontos de Venda
    const unsubPdvs = onSnapshot(
      collection(db, 'recreio_pdvs'),
      (snapshot) => {
        if (this.isClearing) return;
        const remotePdvs: PontoVenda[] = [];
        snapshot.forEach((d) => remotePdvs.push(d.data() as PontoVenda));
        StorageService.savePontosVenda(remotePdvs, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot pdvs:', err)
    );

    // 6. Preços Negociados
    const unsubPrecos = onSnapshot(
      collection(db, 'recreio_precos'),
      (snapshot) => {
        if (this.isClearing) return;
        const remotePrecos: PrecoNegociado[] = [];
        snapshot.forEach((d) => remotePrecos.push(d.data() as PrecoNegociado));
        StorageService.savePrecosNegociados(remotePrecos, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot precos:', err)
    );

    // 7. Saídas e Entregas
    const unsubSaidas = onSnapshot(
      collection(db, 'recreio_saidas'),
      (snapshot) => {
        if (this.isClearing) return;
        const remoteSaidas: SaidaVenda[] = [];
        snapshot.forEach((d) => remoteSaidas.push(d.data() as SaidaVenda));
        StorageService.saveSaidas(remoteSaidas, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot saidas:', err)
    );

    this.unsubscribers = [
      unsubMeta,
      unsubPlots,
      unsubAnalyses,
      unsubHarvests,
      unsubProdutos,
      unsubPdvs,
      unsubPrecos,
      unsubSaidas,
      () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      },
    ];

    return true;
  }

  static stopRealtimeSync(): void {
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
    this.unsubscribers = [];
  }

  /**
   * Salva uma entidade no Firestore com protocolo v5 e clientTimestamp em tempo real
   */
  static async pushEntity<T extends { id: string }>(
    collectionName: string,
    entity: T
  ): Promise<void> {
    if (this.isClearing) return;
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) return;

    try {
      const docRef = doc(db, collectionName, entity.id);
      const clientTimestamp = Date.now();
      await setDoc(docRef, {
        ...entity,
        syncVersion: SYNC_PROTOCOL_VERSION,
        clientTimestamp,
      }, { merge: true });
    } catch (err) {
      console.warn(`[SyncService] Erro ao salvar ${collectionName}/${entity.id}:`, err);
    }
  }

  /**
   * Remove uma entidade no Firestore
   */
  static async deleteEntity(collectionName: string, id: string): Promise<void> {
    if (this.isClearing) return;
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) return;

    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.warn(`[SyncService] Erro ao deletar ${collectionName}/${id}:`, err);
    }
  }

  /**
   * Carrega todos os dados do localStorage local para o Cloud Firestore com timestamps válidos
   */
  static async uploadLocalDataToCloud(): Promise<{ success: boolean; message: string }> {
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) {
      return { success: false, message: 'Firebase não está configurado.' };
    }

    try {
      this.notifyStatus('syncing');
      ensureAuthenticated().catch(() => {});
      const batch = writeBatch(db);
      const clientTimestamp = Date.now();

      // Plots
      const plots = StorageService.getPlots();
      plots.forEach((p) => {
        batch.set(doc(db, 'recreio_plots', p.id), {
          ...p,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // Analyses
      const analyses = StorageService.getAnalyses();
      analyses.forEach((a) => {
        batch.set(doc(db, 'recreio_analyses', a.id), {
          ...a,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // Harvests
      const harvests = StorageService.getHarvests();
      harvests.forEach((h) => {
        batch.set(doc(db, 'recreio_harvests', h.id), {
          ...h,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // Produtos
      const produtos = StorageService.getProdutos();
      produtos.forEach((prod) => {
        batch.set(doc(db, 'recreio_produtos', prod.id), {
          ...prod,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // PDVs
      const pdvs = StorageService.getPontosVenda();
      pdvs.forEach((pdv) => {
        batch.set(doc(db, 'recreio_pdvs', pdv.id), {
          ...pdv,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // Preços
      const precos = StorageService.getPrecosNegociados();
      precos.forEach((pr) => {
        const id = `${pr.pontoVendaId}_${pr.produtoId}`;
        batch.set(doc(db, 'recreio_precos', id), {
          ...pr,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      // Saídas
      const saidas = StorageService.getSaidas();
      saidas.forEach((s) => {
        batch.set(doc(db, 'recreio_saidas', s.id), {
          ...s,
          syncVersion: SYNC_PROTOCOL_VERSION,
          clientTimestamp,
        }, { merge: true });
      });

      await batch.commit();
      this.notifyStatus('online');
      return {
        success: true,
        message: 'Todos os registros locais foram sincronizados com sucesso na Nuvem!',
      };
    } catch (err: any) {
      this.notifyStatus(navigator.onLine ? 'online' : 'offline_cache');
      return {
        success: false,
        message: `Falha na sincronização: ${err?.message || 'Erro desconhecido'}`,
      };
    }
  }

  /**
   * Remove todos os dados de todas as coleções na nuvem (Firestore) e propaga broadcast de zeramento
   */
  static async clearCloudData(): Promise<{ success: boolean; message: string }> {
    this.isClearing = true;
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) {
      this.isClearing = false;
      return { success: false, message: 'Firebase não está configurado.' };
    }

    const collectionsToClear = [
      'recreio_plots',
      'recreio_analyses',
      'recreio_harvests',
      'recreio_produtos',
      'recreio_pdvs',
      'recreio_precos',
      'recreio_saidas',
    ];

    try {
      this.notifyStatus('syncing');

      // 1. Emitir marcador de reset no canal de controle recreio_meta para limpar simultaneamente todos os outros clientes
      const resetTimestamp = Date.now();
      localStorage.setItem('recreio_last_reset_seen', String(resetTimestamp));
      try {
        await setDoc(doc(db, 'recreio_meta', 'sync_control'), {
          lastResetAt: resetTimestamp,
          syncVersion: SYNC_PROTOCOL_VERSION,
          updatedAt: new Date().toISOString(),
        });
      } catch (errMeta) {
        console.warn('[SyncService] Aviso ao atualizar sync_control:', errMeta);
      }

      // 2. Apagar todos os documentos de todas as coleções na nuvem
      for (const colName of collectionsToClear) {
        const snap = await getDocs(collection(db, colName));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
        }
      }

      this.notifyStatus(navigator.onLine ? 'online' : 'offline_cache');
      return {
        success: true,
        message: 'Todos os dados foram completamente removidos da nuvem!',
      };
    } catch (err: any) {
      this.notifyStatus(navigator.onLine ? 'online' : 'offline_cache');
      console.error('[SyncService] Erro ao limpar nuvem:', err);
      return {
        success: false,
        message: `Falha ao limpar nuvem: ${err?.message || 'Erro de conexão'}`,
      };
    } finally {
      // Pequeno timeout para garantir que eventos locais em trânsito não re-enviem dados
      setTimeout(() => {
        this.isClearing = false;
      }, 1500);
    }
  }
}

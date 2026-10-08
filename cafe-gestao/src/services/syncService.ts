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
  RecommendationPlan,
  Produto,
  PontoVenda,
  PrecoNegociado,
  SaidaVenda,
  ParametrosAgronomicos,
} from '../types';

export type SyncStatus = 'online' | 'offline_cache' | 'not_configured' | 'syncing';

export class SyncService {
  private static unsubscribers: Unsubscribe[] = [];
  private static statusListeners: ((status: SyncStatus) => void)[] = [];
  private static currentStatus: SyncStatus = 'not_configured';

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
        this.pushEntity(col, ent);
      },
      (col, id) => {
        this.deleteEntity(col, id);
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

    // 1. Plots (Talhões)
    const unsubPlots = onSnapshot(
      collection(db, 'recreio_plots'),
      (snapshot) => {
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
        const remoteSaidas: SaidaVenda[] = [];
        snapshot.forEach((d) => remoteSaidas.push(d.data() as SaidaVenda));
        StorageService.saveSaidas(remoteSaidas, true);
        onDataUpdated();
      },
      (err) => console.warn('[Sync] Erro snapshot saidas:', err)
    );

    this.unsubscribers = [
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
   * Salva uma entidade no Firestore (com suporte nativo a offline no campo)
   */
  static async pushEntity<T extends { id: string }>(
    collectionName: string,
    entity: T
  ): Promise<void> {
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) return;

    try {
      const docRef = doc(db, collectionName, entity.id);
      await setDoc(docRef, entity, { merge: true });
    } catch (err) {
      console.warn(`[SyncService] Erro ao salvar ${collectionName}/${entity.id}:`, err);
    }
  }

  /**
   * Remove uma entidade no Firestore
   */
  static async deleteEntity(collectionName: string, id: string): Promise<void> {
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) return;

    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.warn(`[SyncService] Erro ao deletar ${collectionName}/${id}:`, err);
    }
  }

  /**
   * Carrega todos os dados do localStorage local para o Cloud Firestore
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

      // Plots
      const plots = StorageService.getPlots();
      plots.forEach((p) => {
        batch.set(doc(db, 'recreio_plots', p.id), p, { merge: true });
      });

      // Analyses
      const analyses = StorageService.getAnalyses();
      analyses.forEach((a) => {
        batch.set(doc(db, 'recreio_analyses', a.id), a, { merge: true });
      });

      // Harvests
      const harvests = StorageService.getHarvests();
      harvests.forEach((h) => {
        batch.set(doc(db, 'recreio_harvests', h.id), h, { merge: true });
      });

      // Produtos
      const produtos = StorageService.getProdutos();
      produtos.forEach((prod) => {
        batch.set(doc(db, 'recreio_produtos', prod.id), prod, { merge: true });
      });

      // PDVs
      const pdvs = StorageService.getPontosVenda();
      pdvs.forEach((pdv) => {
        batch.set(doc(db, 'recreio_pdvs', pdv.id), pdv, { merge: true });
      });

      // Preços
      const precos = StorageService.getPrecosNegociados();
      precos.forEach((pr) => {
        const id = `${pr.pontoVendaId}_${pr.produtoId}`;
        batch.set(doc(db, 'recreio_precos', id), pr, { merge: true });
      });

      // Saídas
      const saidas = StorageService.getSaidas();
      saidas.forEach((s) => {
        batch.set(doc(db, 'recreio_saidas', s.id), s, { merge: true });
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
   * Remove todos os dados de todas as coleções na nuvem (Firestore)
   */
  static async clearCloudData(): Promise<{ success: boolean; message: string }> {
    const { db, isReady } = initializeFirebase();
    if (!isReady || !db) {
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
    }
  }
}


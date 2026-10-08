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

    StorageService.setSyncHook((col, ent) => {
      this.pushEntity(col, ent);
    });

    try {
      await ensureAuthenticated();
    } catch (e) {
      console.warn('[SyncService] Autenticação em modo offline:', e);
    }

    this.notifyStatus(navigator.onLine ? 'online' : 'offline_cache');

    const handleOnline = () => this.notifyStatus('online');
    const handleOffline = () => this.notifyStatus('offline_cache');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 1. Plots (Talhões)
    const unsubPlots = onSnapshot(
      collection(db, 'recreio_plots'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remotePlots: Plot[] = [];
          snapshot.forEach((d) => remotePlots.push(d.data() as Plot));
          StorageService.savePlots(remotePlots, true);
          onDataUpdated();
        } else {
          // Se nuvem estiver vazia e houver dados locais, sobe os dados locais automaticamente
          const local = StorageService.getPlots();
          if (local.length > 0) {
            local.forEach((p) => this.pushEntity('recreio_plots', p));
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot plots:', err)
    );

    // 2. Análises de Solo
    const unsubAnalyses = onSnapshot(
      collection(db, 'recreio_analyses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteAnalyses: SoilAnalysis[] = [];
          snapshot.forEach((d) => remoteAnalyses.push(d.data() as SoilAnalysis));
          StorageService.saveAnalyses(remoteAnalyses, true);
          onDataUpdated();
        } else {
          const local = StorageService.getAnalyses();
          if (local.length > 0) {
            local.forEach((a) => this.pushEntity('recreio_analyses', a));
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot analyses:', err)
    );

    // 3. Colheitas
    const unsubHarvests = onSnapshot(
      collection(db, 'recreio_harvests'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteHarvests: HarvestRecord[] = [];
          snapshot.forEach((d) => remoteHarvests.push(d.data() as HarvestRecord));
          StorageService.saveHarvests(remoteHarvests, true);
          onDataUpdated();
        } else {
          const local = StorageService.getHarvests();
          if (local.length > 0) {
            local.forEach((h) => this.pushEntity('recreio_harvests', h));
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot harvests:', err)
    );

    // 4. Produtos (Cafés, Tomates, Uvas, Vinhos)
    const unsubProdutos = onSnapshot(
      collection(db, 'recreio_produtos'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteProdutos: Produto[] = [];
          snapshot.forEach((d) => remoteProdutos.push(d.data() as Produto));
          StorageService.saveProdutos(remoteProdutos, true);
          onDataUpdated();
        } else {
          const local = StorageService.getProdutos();
          if (local.length > 0) {
            local.forEach((p) => this.pushEntity('recreio_produtos', p));
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot produtos:', err)
    );

    // 5. Pontos de Venda
    const unsubPdvs = onSnapshot(
      collection(db, 'recreio_pdvs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remotePdvs: PontoVenda[] = [];
          snapshot.forEach((d) => remotePdvs.push(d.data() as PontoVenda));
          StorageService.savePontosVenda(remotePdvs, true);
          onDataUpdated();
        } else {
          const local = StorageService.getPontosVenda();
          if (local.length > 0) {
            local.forEach((p) => this.pushEntity('recreio_pdvs', p));
          }
        }
      },
      (err) => console.warn('[Sync] Erro snapshot pdvs:', err)
    );

    // 6. Preços Negociados
    const unsubPrecos = onSnapshot(
      collection(db, 'recreio_precos'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remotePrecos: PrecoNegociado[] = [];
          snapshot.forEach((d) => remotePrecos.push(d.data() as PrecoNegociado));
          StorageService.savePrecosNegociados(remotePrecos, true);
          onDataUpdated();
        }
      },
      (err) => console.warn('[Sync] Erro snapshot precos:', err)
    );

    // 7. Saídas e Entregas
    const unsubSaidas = onSnapshot(
      collection(db, 'recreio_saidas'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteSaidas: SaidaVenda[] = [];
          snapshot.forEach((d) => remoteSaidas.push(d.data() as SaidaVenda));
          StorageService.saveSaidas(remoteSaidas, true);
          onDataUpdated();
        } else {
          const local = StorageService.getSaidas();
          if (local.length > 0) {
            local.forEach((s) => this.pushEntity('recreio_saidas', s));
          }
        }
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
      await ensureAuthenticated();
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
}

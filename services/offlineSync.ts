import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedMutation {
  id: string;
  mutationKey: string;
  variables: any;
  retryCount: number;
  timestamp: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  userId?: string;
}

const MUTATION_QUEUE_KEY = 'offline-mutation-queue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

class OfflineSyncService {
  private isOnline: boolean = true;
  private mutationQueue: QueuedMutation[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.initializeNetworkListener();
    this.loadMutationQueue();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        console.log('Back online - processing queued mutations');
        this.processQueue();
      }
    });
  }

  private async loadMutationQueue() {
    try {
      const stored = await AsyncStorage.getItem(MUTATION_QUEUE_KEY);
      if (stored) {
        this.mutationQueue = JSON.parse(stored);
        console.log(`Loaded ${this.mutationQueue.length} queued mutations`);
      }
    } catch (error) {
      console.error('Failed to load mutation queue:', error);
    }
  }

  private async saveMutationQueue() {
    try {
      await AsyncStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(this.mutationQueue));
    } catch (error) {
      console.error('Failed to save mutation queue:', error);
    }
  }

  async queueMutation(
    mutationKey: string,
    variables: any,
    type: QueuedMutation['type'],
    entity: string,
    userId?: string
  ) {
    const mutation: QueuedMutation = {
      id: `${mutationKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mutationKey,
      variables,
      retryCount: 0,
      timestamp: Date.now(),
      type,
      entity,
      userId,
    };

    this.mutationQueue.push(mutation);
    await this.saveMutationQueue();
    
    console.log(`Queued mutation: ${mutationKey}`, mutation);

    // If online, try to process immediately
    if (this.isOnline) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || !this.isOnline || this.mutationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`Processing ${this.mutationQueue.length} queued mutations`);

    const mutationsToProcess = [...this.mutationQueue];
    const successfulMutations: string[] = [];

    for (const mutation of mutationsToProcess) {
      try {
        await this.executeMutation(mutation);
        successfulMutations.push(mutation.id);
        console.log(`Successfully executed mutation: ${mutation.mutationKey}`);
      } catch (error) {
        console.error(`Failed to execute mutation ${mutation.mutationKey}:`, error);
        
        // Increment retry count
        mutation.retryCount++;
        
        // If max retries reached, remove from queue
        if (mutation.retryCount >= MAX_RETRY_ATTEMPTS) {
          console.error(`Max retries reached for mutation ${mutation.mutationKey}, removing from queue`);
          successfulMutations.push(mutation.id);
        } else {
          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * mutation.retryCount));
        }
      }
    }

    // Remove successful mutations from queue
    this.mutationQueue = this.mutationQueue.filter(m => !successfulMutations.includes(m.id));
    await this.saveMutationQueue();

    this.isProcessingQueue = false;
    
    console.log(`Queue processing complete. ${this.mutationQueue.length} mutations remaining`);
  }

  private async executeMutation(mutation: QueuedMutation) {
    switch (mutation.mutationKey) {
      default:
        throw new Error(`Unknown mutation key: ${mutation.mutationKey}`);
    }
  }

  // Here an example of a mutation
  // private async executeAddComment(variables: any) {
  //   const { addComment } = await import('@/services/supabase');
  //   const result = await addComment(variables.userId, variables.spotId, variables.content);
  //   if (result.error) throw result.error;
    
  //   // Invalidate comments for this spot
  //   queryClient.invalidateQueries({ queryKey: ['spots', variables.spotId, 'comments'] });
  //   return result;
  // }

  // Public methods
  getQueuedMutationsCount(): number {
    return this.mutationQueue.length;
  }

  getQueuedMutations(): QueuedMutation[] {
    return [...this.mutationQueue];
  }

  async clearQueue() {
    this.mutationQueue = [];
    await this.saveMutationQueue();
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  async forceSync() {
    if (this.isOnline) {
      await this.processQueue();
    }
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();

// Helper function to queue mutations
export const queueMutation = (
  mutationKey: string,
  variables: any,
  type: QueuedMutation['type'],
  entity: string,
  userId?: string
) => {
  return offlineSyncService.queueMutation(mutationKey, variables, type, entity, userId);
};

// Helper function to check if online
export const isOnline = () => offlineSyncService.isNetworkOnline(); 
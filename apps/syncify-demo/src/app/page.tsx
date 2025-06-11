'use client';

import {
  BranchSynchronizerImp,
  generateUUID,
  InMemoryWorkspace,
  restoreTestCommand,
  restoreTestState,
  StorageServiceBasedRemoteFetcher,
  TestState,
} from '@syncify/core';
import { useBranchSynchronizedWorkspace } from '@syncify/react/index';
import { SynchronizedWorkspaceView } from '../components/synchronized-workspace-view';
import { RestStorageService } from '../utils/rest-storage-service';

const id = generateUUID();
const storageService = new RestStorageService(id);
const remoteFetcher = new StorageServiceBasedRemoteFetcher(
  storageService,
  restoreTestCommand,
  restoreTestState
);
const branchSynchronizer = new BranchSynchronizerImp(
  remoteFetcher,
  restoreTestCommand,
  restoreTestState
);

export default function Home() {
  const synchronizedWorkspace = useBranchSynchronizedWorkspace(
    branchSynchronizer,
    InMemoryWorkspace.makeNew(new TestState(0)),
    1
  );

  switch (synchronizedWorkspace.status) {
    case 'Loading':
    case 'Initial':
    case 'Never-Connected':
      return <span>Loading</span>;
    case 'Disconnected-Synced':
      return <span>Disconnected (Synced)</span>;
    case 'Disconnected-Conflict':
      return <span>Disconnected (Conflict)</span>;
    case 'Synced':
      return <SynchronizedWorkspaceView state={synchronizedWorkspace} />;
    case 'Conflict':
      return <span>Conflict</span>;
  }
}

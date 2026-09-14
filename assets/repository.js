import {readState,writeState,backup,KEY} from './storage.js';

// The UI depends only on this async contract. A cloud adapter must enforce
// account isolation and expectedRevision atomically on its server.
export class LocalRepository {
  constructor(storage){this.storage=storage;this.mode='local';}
  async load(){return readState(this.storage);}
  async save(state,{expectedRevision}={}){
    const commit=()=>{
      const current=readState(this.storage);
      if(current.revision!==expectedRevision)throw Error('Data er ændret i en anden fane. Eksportér dine ændringer og genindlæs.');
      const next={...state,revision:current.revision+1,updatedAt:new Date().toISOString()};
      writeState(this.storage,next);return next.revision;
    };
    // Web Locks serialize cooperating tabs where supported. The revision check
    // remains best-effort on browsers without Web Locks; this is not cloud sync.
    return typeof window!=='undefined'&&globalThis.navigator?.locks?globalThis.navigator.locks.request(KEY,commit):commit();
  }
  async export(state){return backup(this.storage,state);}
  async legacy(){return this.storage.getItem('styrke_v4');}
}
export function createRepository(){return new LocalRepository(window.localStorage);}

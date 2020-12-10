import { writable } from 'svelte/store';
import templates from './types-db.js'

function createStore() {
  const { subscribe, set, update } = writable( templates.db );

  const setCurrentPDAC = ( id ) => {
    update( s => {
      const k = Object.keys( s.pdacs );
      if ( k.indexOf( id ) != -1 ) {
        console.log('[store-db.js] 💾 current pdac set to:', id)
        s.current_pdac = id;
      } else {
        console.log('[store-db.js] ❌  no pdac to set as current, setting to null');
        s.current_pdac = null;
      }
      return s;
    });
  }



  const load = () => {
    console.log('[store-db.js] 💾 loading database...')
    return promiseIpc
      .send('getDB')
      .then((db, e) => {
          const j = JSON.parse(db);
          console.log('[store-db.js] ✅💾 loaded db:', j)
          j.state = 1;
          set( j );
      })
      .catch((err) => {
        console.log('[store-db.js] ❌💾 error loading db:', err.message)
      })
  }

  const save = () => {

    console.log('[store-db.js] 💾 saving database...')
    let store;
    update( s => store = s );
    return promiseIpc
      .send('setDB', store)
      .then((db, e) => {
        console.log('[store-db.js] ✅💾 saved db:', db)
        load();
      })
      .catch((err) => {
        console.log('[store-db.js] ❌💾 error saving db:', err.message)
      })
  }


  const neuPDAC = ( neu ) => {
    console.log('[store-db.js] 🆕 creating new pdac...', name)
    update( s => {
      s.pdacs[neu.hostname] = neu;
      return s;
    });
    save();
  }

  const removePDAC = ( key ) => {

    console.log('[store-db.js] 🛑 deleting pdac...', key)
    update( s => {
      if (s.current_pdac == key) s.current_pdac = null;
      delete s.pdacs[key];
      return s;
    })
    return saveLoad();
  }

  const saveLoad = () => {
    return new Promise( (resolve, reject) => {

      save().then( () => {
        load().then( () => {
          setTimeout( resolve, 200);
        }).catch( err => {
          reject( err );
        })
      }).catch( err => {
        reject( err );
      });
    });
  }
  return {
    subscribe,
    set,
    update,


    load,
    save,
    neuPDAC,
    setCurrentPDAC,
    removePDAC
  };
}

export const db = createStore();

export const mega = writable( {
  config: {
    dests: []
  }
} ) 
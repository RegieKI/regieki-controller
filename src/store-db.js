import { writable } from 'svelte/store';
import templates from './types-db.js'

function createStore() {
  const { subscribe, set, update } = writable( templates.db );

  const setCurrentThing = ( id ) => {
    update( s => {
      const k = Object.keys( s.things );
      if ( k.indexOf( id ) != -1 ) {
        console.log('[store-db.js] 💾 current thing set to:', id)
        s.current_thing = id;
      } else {
        console.log('[store-db.js] ❌  no thing to set as current, setting to null');
        s.current_thing = null;
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


  const neuThing = ( name ) => {
    console.log('[store-db.js] 🆕 creating new thing...', name)
    update( s => {
      const id = name.toLowerCase().replace(/ /g, '-');
      s.things[id] = templates.thing;
      s.things[id].name = id;
      return s;
    });
    save();
  }

  const removeThing = ( key ) => {

    console.log('[store-db.js] 🛑 deleting thing...', key)
    update( s => {
      if (s.current_thing == key) s.current_thing = null;
      delete s.things[key];
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
    neuThing,
    setCurrentThing,
    removeThing
  };
}

export const db = createStore();
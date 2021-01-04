import { combineReducers } from 'redux';
import authReducers from './authReducers'

//combinatore dei reducers, non necessario visto che ci sono solo i reducers per l'autenticazione
//ma in caso se ne vogliano usare altri andrebbero uniti qui

export default combineReducers({
    auth: authReducers
});
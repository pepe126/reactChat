import { LOGIN, SIGNUP, LOGOUT, CHECK_USER } from '../actions/types';

const initialState = {
    user: {}
}

export default function (state = initialState, action) {
    switch(action.type){
        case LOGIN:
            return{
                ...state,
                user: action.payload
            }
        case LOGOUT:
            return{
                ...state,
                user: action.payload
            }
        case SIGNUP:
            return{
                ...state,
                user: action.payload
            }
        case CHECK_USER:
            return{
                ...state,
                user: action.payload
            }
        default:
            return state;
    }
}
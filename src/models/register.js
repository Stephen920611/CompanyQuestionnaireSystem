import {
    fakeRegister,
    fetchAllArea,
    sendCode,
    userRegist,
    forgetUser,
} from '@/services/register/register';
import {setAuthority} from '@/utils/authority';
import {reloadAuthorized} from '@/utils/Authorized';

export default {
    namespace: 'register',

    state: {
        status: undefined,
    },

    effects: {
        * submit({payload}, {call, put}) {
            const response = yield call(fakeRegister, payload);
            yield put({
                type: 'registerHandle',
                payload: response,
            });
        },

        //查询所有县市区
        * fetchAllAreaAction({params, resolve, reject}, {call, put}) {
            try {
                const response = yield call(fetchAllArea);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        },

        //发送验证码
        * sendCodeAction({params, resolve, reject}, {call, put}) {
            try {
                const response = yield call(sendCode, params);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        },

        //用户注册
        * userRegistAction({params, resolve, reject}, {call, put}) {
            try {
                const response = yield call(userRegist, params);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        },

        //重置密码
        * forgetUserAction({params, resolve, reject}, {call, put}) {
            try {
                const response = yield call(forgetUser, params);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        },
    },

    reducers: {
        registerHandle(state, {payload}) {
            setAuthority('user');
            reloadAuthorized();
            return {
                ...state,
                status: payload.status,
            };
        },
    },
};

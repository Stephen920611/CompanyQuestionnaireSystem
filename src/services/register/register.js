/**
 * @description
 * @Version Created by Stephen on 2019/8/12.
 * @Author Stephen
 * @license dongfangdianzi
 */
import EnumAPI from './../../constants/EnumAPI';
import request from '@/utils/request';
import {postJSON, post, get, del} from './../../utils/core/requestTj';
import T from './../../utils/T';

//查询所有县市区
export async function fetchAllArea(params = {}) {
    return get(EnumAPI.fetchAllArea, params);
}

//发送验证码
export async function sendCode(params = {}) {
    return get(EnumAPI.sendCode, params);
}

//用户注册
export async function userRegist(params = {}) {
    return postJSON(EnumAPI.userRegist, params);
}

//重置密码
export async function forgetUser(params = {}) {
    return postJSON(EnumAPI.forgetUser, params);
}

//退出登录
export async function logout(params = {}) {
    return postJSON(EnumAPI.logout, params,{}, false,false,false);
}






export async function fakeRegister(params) {
    return request('/api/register', {
        method: 'POST',
        data: params,
    });
}
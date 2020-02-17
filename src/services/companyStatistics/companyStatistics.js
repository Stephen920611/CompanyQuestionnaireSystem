/**
 * @description
 * @Version Created by Stephen on 2019/8/12.
 * @Author Stephen
 * @license dongfangdianzi
 */
import EnumAPI from './../../constants/EnumAPI';
import {postJSON, post, get,put,del} from './../../utils/core/requestTj';
import T from './../../utils/T';

//统计查询
export async function fetchCompanyStatistics(params = {}) {
    return post(EnumAPI.fetchCompanyStatistics, params);
}

//删除企业填报
export async function deleteCompanyInfo(id) {
    return del(EnumAPI.deleteCompanyInfo(id));
}
//新增saveCompanyInfo
export async function saveCompanyInfo(params={}) {
    return postJSON(EnumAPI.saveCompanyInfo,params);
}
//同步
export async function updateCompanyInfo(params={}) {
    return put(EnumAPI.updateCompanyInfo,params);
}

//获取详情接口fetchCompanyDetailById
export async function fetchCompanyDetailById(id) {
    return get(EnumAPI.fetchCompanyDetailById(id));
}

//获取重点人员统计数据
export async function fetchCompanyPersonNumber(params = {}) {
    return post(EnumAPI.fetchCompanyPersonNumber, params);
}

//获取树接口
export async function fetchTreeNode(params = {}) {
    return post(EnumAPI.fetchTreeNode, params);
}

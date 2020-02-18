import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import styles from './CompanyPaperDetail.less';
import T from './../../utils/T';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CustomBreadcrumb from '@/templates/ToolComponents/CustomBreadcrumb';

import {
    Row,
    Col,
    Card,
    Button,
} from 'antd';

/* eslint react/no-multi-comp:0 */
@connect(({companyStatistics, loading}) => ({
    companyStatistics,
    fetchStatus: loading.effects['companyStatistics/fetchCompanyDetailByIdAction'],
}))
class CompanyPaperDetail extends PureComponent {
    constructor() {
        super();
        this.state = {
            activities: {},
            currentInfo: {},
            member: {
                paperBasic:{},
                questionArray:[]
            },
            touch: [],
            industryId: 3
            //    1复工企业  2 商超  3快递外卖 4酒店
        }
    }

    componentDidMount() {
        const {dispatch, location} = this.props;
        let self = this;
        //验证是否刷新页面
        T.auth.returnSpecialMainPage(location, '/companyStatistics');
        if (location.hasOwnProperty("params") && location["params"].hasOwnProperty("data")) {
            /*self.setState({
                industryId: location["params"]["data"]['industryId']
            });*/
            console.log(location["params"]["data"]);
            let loginInfo = T.auth.getLoginInfo();
            let userId = loginInfo.data.user.id;
            new Promise((resolve, reject) => {
                dispatch({
                    type: 'companyStatistics/fetchCompanyDetailByIdAction',
                    params: {
                        userId:userId,
                        id:location["params"]["data"]["id"]
                    },
                    resolve,
                    reject,
                });
            }).then(response => {
                console.log('11111', response.data);

                if (response.code === 0) {
                    self.setState({
                        // activities: T.lodash.isUndefined(activities[0]) ? {} : activities[0],
                        // currentInfo: T.lodash.isUndefined(currnets[0]) ? {} : currnets[0],
                        member: response.data,
                        // touch: T.lodash.isUndefined(touch[0]) ? {} : touch[0],
                    })
                } else {
                    T.prompt.error(response.msg);
                }
            });
        }
    }
    renderQuestion = (data) => {
        const {
            fetchStatus,
        } = this.props;
        const {
            formItemLayout,
            formItemHalf,
        } = this.state;
        let self = this;
        let checkVal = '';
        return (
            data.map((item, idx) => {
                item.operationList.map((val,index)=>{
                    if(val.isCheck){
                        checkVal = val.index;
                    }
                });
                    return (
                        <Row className={styles.detailTitle}>
                            <Col span={24} className={styles.detailBtns}>
                                    <span>{(idx+1) +'、'+ item.questionContent + ':  '}</span>
                                {
                                    item.operationList.map( (val,idx) => {
                                        if(val.isCheck){
                                            return (
                                                <span key={idx} value={val.index}>{val.value}</span>
                                            )
                                        }
                                    })
                                }
                            </Col>
                        </Row>
                    )

            })
        )
    };

    render() {
        const {fetchStatus, location} = this.props;
        const {
            activities,
            currentInfo,
            member,
            touch,
            industryId
        } = this.state;
        const {paperBasic,questionArray} = member;
        const breadcrumbDetail = [
            {
                linkTo: '/companyStatistics',
                name: '企业调查问卷管理',
            },
            {
                name: '查看企业问卷详情',
            },
        ];
        let apiHref = `${window.ENV.apiDomain}/word/download-evaluate?id=${location.hasOwnProperty("params") ? location["params"].hasOwnProperty('data') ? location["params"]["data"]["id"] : '' : ''}`;

        return (
            <PageHeaderWrapper
                title={"查看企业问卷详情"}
                isSpecialBreadcrumb={true}
                breadcrumbName={<CustomBreadcrumb dataSource={breadcrumbDetail}/>}
            >
                <div>
                    <div className={styles.detailItem}>

                        <div className={styles.detailTitleName}>
                            一、基本信息
                        </div>
                        <Card
                            style={{marginBottom: 20}}
                            loading={fetchStatus}
                        >
                            <Row className={styles.detailTitle}>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>单位全称：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('companyName') ? paperBasic.companyName : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>注册地址：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('addressName') ? paperBasic.addressName : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>填报人：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('reportUser') ? paperBasic.reportUser : '---'
                                        }
                                    </span>
                                </Col>
                            </Row>
                            <Row className={styles.detailTitle}>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>联系电话：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('phoneNumber') ? paperBasic.phoneNumber : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>在册职工数：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('registeredNum') ? paperBasic.registeredNum : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>其中非烟台籍人数：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('registeredNonlocalNum') ? paperBasic.registeredNonlocalNum : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>其中湖北籍人数：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('registeredHubeiNum') ? paperBasic.registeredHubeiNum : '---'
                                        }
                                    </span>
                                </Col>
                            </Row>
                            <Row className={styles.detailTitle}>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>目前在岗人数：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('onguardNum') ? paperBasic.onguardNum : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>其中非烟台籍人数：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('onguardNonlocalNum') ? paperBasic.onguardNonlocalNum : '---'
                                        }
                                    </span>
                                </Col>
                                <Col span={6} className={styles.detailBtns}>
                                    <span>可用于集中隔离员工的房间数量：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('quarantineRoomNum') ? paperBasic.quarantineRoomNum : '---'
                                        }
                                    </span>
                                </Col>
                            </Row>

                        </Card>
                        <div className={styles.detailTitleName}>
                            二、问卷内容
                        </div>
                        <Card
                            style={{marginBottom: 20}}
                            loading={fetchStatus}
                        >
                            {this.renderQuestion(questionArray)}

                        </Card>
                        <div className={styles.detailTitleName}>
                            二、对疫情防控工作的意见建议
                        </div>
                        <Card
                            style={{marginBottom: 20}}
                            loading={fetchStatus}
                        >
                            <Row className={styles.detailTitle}>

                                <Col span={24} className={styles.detailBtns}>
                                    <span>存在的问题及整改要求：</span>
                                    <span>
                                        {
                                            paperBasic.hasOwnProperty('propose') ? paperBasic.propose : '---'
                                        }
                                    </span>
                                </Col>
                            </Row>

                        </Card>
                        {/*<div className={styles.detailTitleName}>
                            <Button
                                style={{marginLeft: 16}}
                                type="primary"
                            >
                                <a href={apiHref} target="_blank" >下载</a>
                            </Button>
                        </div>*/}
                    </div>
                </div>
            </PageHeaderWrapper>
        );
    }
}

export default CompanyPaperDetail;

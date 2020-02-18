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
            member: {},
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
            new Promise((resolve, reject) => {
                dispatch({
                    type: 'companyStatistics/fetchCompanyDetailByIdAction',
                    id: location["params"]["data"]["id"],
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

    render() {
        const {fetchStatus, location} = this.props;
        const {
            activities,
            currentInfo,
            member,
            touch,
            industryId
        } = this.state;
        const breadcrumbDetail = [
            {
                linkTo: '/companyStatistics',
                name: '开工企业评定管理',
            },
            {
                name: '查看开工企业评定详情',
            },
        ];
        let apiHref = `${window.ENV.apiDomain}/word/download-evaluate?id=${location.hasOwnProperty("params") ? location["params"].hasOwnProperty('data') ? location["params"]["data"]["id"] : '' : ''}`;

        return (
            <PageHeaderWrapper
                title={"查看开工企业评定详情"}
                isSpecialBreadcrumb={true}
                breadcrumbName={<CustomBreadcrumb dataSource={breadcrumbDetail}/>}
            >
                <div>
                    <div className={styles.detailItem}>
                        <div className={styles.detailTitleName}>
                            企业基本信息
                        </div>
                        <Card style={{marginBottom: 20}}
                              loading={fetchStatus}
                        >
                            <Row className={styles.detailTitle}>
                                <Col span={6}>
                                    <span>企业名称：</span>
                                    <span>
                                        {
                                            member.hasOwnProperty('companyName') ? member.companyName : '---'
                                        }
                                    </span>
                                </Col>
                            </Row>
                            <Row className={styles.detailTitle}>
                                <Col span={6}>
                                    <span>评定等级：</span>
                                    <span>
                                        {member.hasOwnProperty('evaluateLevel') ? member.evaluateLevel : '---'}
                                    </span>
                                </Col>
                            </Row>
                            <Row className={styles.detailTitle}>
                                <Col span={6}>
                                    <span>存在的问题及整改要求：</span>
                                    <span>
                                        {member.hasOwnProperty('evaluateContent') ? member.evaluateContent : '---'}
                                    </span>
                                </Col>
                            </Row>
                        </Card>
                        <div className={styles.detailTitleName}>
                            <Button
                                style={{marginLeft: 16}}
                                type="primary"
                            >
                                <a href={apiHref} target="_blank" >下载</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </PageHeaderWrapper>
        );
    }
}

export default CompanyPaperDetail;

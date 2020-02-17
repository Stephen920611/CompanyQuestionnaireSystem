import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import styles from './CompanyStatisticsEdit.less';
import T from './../../utils/T';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CustomBreadcrumb from '@/templates/ToolComponents/CustomBreadcrumb';
// import CustomBreadcrumb from '@/tempAddInfoListlates/ToolComponents/CustomBreadcrumb';

import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Radio,
} from 'antd';

const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;

/* eslint react/no-multi-comp:0 */
@connect(({companyStatistics, checkRecord, loading}) => ({
    companyStatistics,
    checkRecord,
    fetchStatus: loading.effects['companyStatistics/fetchCompanyPersonNumberAction'],
}))
@Form.create()
class CompanyStatisticsEdit extends PureComponent {
    constructor() {
        super();
        this.state = {
            formItemLayout: {
                labelCol: {
                    xs: {span: 24},
                    sm: {span: 6},
                },
                wrapperCol: {
                    xs: {span: 24},
                    sm: {span: 16},
                    md: {span: 16},
                },
            },
            formItemHalf: {
                labelCol: {
                    xs: {span: 24},
                    sm: {span: 12},
                },
                wrapperCol: {
                    xs: {span: 24},
                    sm: {span: 12},
                    md: {span: 12},
                },
            },
            submitFormLayout: {
                wrapperCol: {
                    xs: {span: 24, offset: 0},
                    sm: {span: 24, offset: 0},
                },
            },
            baseInfoSelect: [],     //被调查人基本情况
            bodyConditionSelect: [],     //身体状况
            activities: {},
            currentInfo: {},
            member: {},
            touch: [],
            isCreate: true,


        }
    }

    componentDidMount() {
        const {dispatch, location} = this.props;

        let self = this;
        //验证是否刷新页面
        T.auth.returnSpecialMainPage(location, '/companyStatistics');
        //获取重点人员统计
        /*new Promise((resolve, reject) => {
            dispatch({
                type: 'companyStatistics/fetchCompanyPersonNumberAction',
                params: {
                    type: 'BASE_INFO'
                },
                resolve,
                reject,
            });
        }).then(response => {
            if (response.code === 0) {
                self.setState({
                    baseInfoSelect: response.data
                })
            } else {
                T.prompt.error(response.msg);
            }
        });*/

        if (location.hasOwnProperty("params") && location["params"].hasOwnProperty("data") && location["params"].hasOwnProperty("status")) {
            this.setState({
                isCreate: location["params"]["status"],
            })

            //查看详情
            /*new Promise((resolve, reject) => {
                dispatch({
                    type: 'companyStatistics/fetchCompanyDetailByIdAction',
                    id: location["params"]["data"]["id"],
                    resolve,
                    reject,
                });
            }).then(response => {
                if (response.code === 0) {
                    const {currnets, member, touch, activities} = response.data;

                    let formValue = {
                        area: member.area,	//县市区名字
                        name: member.name,
                        age: member.age,
                        phoneNum: member.phoneNum,
                        baseInfo: member.baseInfo,

                        backTime: T.lodash.isUndefined(activities[0]) ? '' : (activities[0].backTime === null || activities[0].backTime === '') ? null : T.moment( new Date(activities[0].backTime).getTime()),

                        isTouchSuspect: T.lodash.isUndefined(touch[0]) ? '' : touch[0].isTouchSuspect,	  //是否
                        suspectPoint: T.lodash.isUndefined(touch[0]) ? '' : touch[0].suspectPoint,

                        seekTime: T.lodash.isUndefined(currnets[0]) ? '' : (currnets[0].seekTime === null || currnets[0].seekTime === '') ? null : T.moment( new Date(currnets[0].seekTime).getTime()),
                        controlTime: T.lodash.isUndefined(currnets[0]) ? '' : (currnets[0].controlTime === null || currnets[0].controlTime === '') ? null : T.moment( new Date(currnets[0].controlTime).getTime()),
                    };

                    self.props.form.setFieldsValue(formValue);
                } else {
                    T.prompt.error(response.msg);
                }
            });*/
        }
    }

    //提交功能
    onSubmitData = (e) => {
        let self = this;
        const {dispatch, form, location} = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let loginInfo = T.auth.getLoginInfo();
                let userId = loginInfo.data.id;
                console.log(values, 'values');
                let params = {
                    companyId: 0,
                    companyName: T.lodash.isUndefined(values.companyName) ? '' : values.companyName,
                    createTime: "2020-02-17T03:23:23.495Z",
                    evaluateContent: T.lodash.isUndefined(values.evaluateContent) ? '' : values.evaluateContent,
                    evaluateLevel: T.lodash.isUndefined(values.evaluateLevel) ? '' : values.evaluateLevel,
                    id: isCreate ? 0 : location["params"]["data"]["id"],
                    updateTime: "2020-02-17T03:23:23.495Z",
                    userId: 0
                };
                new Promise((resolve, reject) => {
                    dispatch({
                        type: 'companyStatistics/addInfoAction',
                        params,
                        resolve,
                        reject,
                    });
                }).then(response => {
                    if (response.code === 0) {
                        T.prompt.success("更新成功");
                        self.resetForm();
                        router.push({
                            pathname: '/addInfo',
                        });
                    } else {
                        T.prompt.error(response.msg);
                    }
                });
            }
        })
    };

    //验证年龄
    checkAge = (rule, value, callback) => {
        // const { getFieldValue } = this.props.form;
        let reg = /^(?:[0-9][0-9]?|1[01][0-9]|200)$/;//年龄是0-200之间有
        if (!reg.test(value) && value !== null) {
            callback("年龄输入不合法！");
            return;
        }
        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
        callback()
    };

    //重置功能
    resetForm = () => {
        this.props.form.resetFields();
    };

    //渲染不同的下拉框
    renderSelect = (dataSource, isArea = false) => {
        let loginInfo = T.auth.getLoginInfo();
        return (
            dataSource.map((item, idx) => {
                return (
                    <Option key={idx} value={item.name}
                            disabled={isArea ? loginInfo.data.area === item.name ? false : true : false}>
                        {item.name}
                    </Option>
                )
            })
        )
    };

    render() {
        const {
            fetchStatus,
            form: {getFieldDecorator, getFieldValue},
        } = this.props;
        const {
            activities,
            currentInfo,
            member,
            touch,
            formItemLayout,
            formItemHalf,
            submitFormLayout,
            bodyConditionSelect,
            baseInfoSelect,
            isCreate,
        } = this.state;
        let loginInfo = T.auth.getLoginInfo();

        let areaSelect = [
            {
                id: "GA001",
                key: "GA001",
                name: "芝罘区",
                pId: "GA",
                title: "芝罘区",
            },
            {
                id: "GA002",
                key: "GA002",
                name: "福山区",
                pId: "GA",
                value: "福山区",
            },
            {
                id: "GA003",
                key: "GA003",
                name: "莱山区",
                pId: "GA",
                value: "莱山区",
            },
            {
                id: "GA004",
                key: "GA004",
                name: "牟平区",
                pId: "GA",
                value: "牟平区",
            },
            {
                id: "GA005",
                key: "GA005",
                name: "海阳市",
                pId: "GA",
                value: "海阳市",
            },
            {
                id: "GA006",
                key: "GA006",
                name: "莱阳市",
                pId: "GA",
                value: "莱阳市",
            },
            {
                id: "GA007",
                key: "GA007",
                name: "栖霞市",
                pId: "GA",
                value: "栖霞市",
            },
            {
                id: "GA008",
                key: "GA008",
                name: "蓬莱市",
                pId: "GA",
                value: "蓬莱市",
            },
            {
                id: "GA009",
                key: "GA009",
                name: "长岛县",
                pId: "GA",
                value: "长岛县",
            },
            {
                id: "GA010",
                key: "GA010",
                name: "龙口市",
                pId: "GA",
                value: "龙口市",
            },
            {
                id: "GA011",
                key: "GA011",
                name: "招远市",
                pId: "GA",
                value: "招远市",
            },
            {
                id: "GA012",
                key: "GA012",
                name: "莱州市",
                pId: "GA",
                value: "莱州市",
            },
            {
                id: "GA013",
                key: "GA013",
                name: "开发区",
                pId: "GA",
                value: "开发区",
            },
            {
                id: "GA014",
                key: "GA014",
                name: "高新区",
                pId: "GA",
                value: "高新区",
            },
            {
                id: "GA015",
                key: "GA015",
                name: "保税港区",
                pId: "GA",
                value: "保税港区",
            },
            {
                id: "GA016",
                key: "GA016",
                name: "昆嵛山保护区",
                pId: "GA",
                value: "昆嵛山保护区",
            },
        ];

        const breadcrumbDetail = [
            {
                linkTo: '/companyStatistics',
                name: '开工企业评定管理',
            },
            {
                name: isCreate ? '新建企业评定' : '编辑企业评定',
            },
        ];

        return (
            <PageHeaderWrapper
                title={isCreate ? '新建企业评定' : '编辑企业评定'}
                isSpecialBreadcrumb={true}
                breadcrumbName={<CustomBreadcrumb dataSource={breadcrumbDetail}/>}
            >
                <div>
                    <div className={styles.detailItem}>
                        <Form
                            onSubmit={this.onSubmitData}
                            hideRequiredMark
                        >
                            <Card
                                style={{marginBottom: 20}}
                                loading={fetchStatus}
                            >
                                <Row className={styles.detailTitle}>
                                    <Col span={8} className={styles.detailBtns}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='企业名称：'
                                        >
                                            {getFieldDecorator('companyName', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入企业名称",
                                                        },
                                                    ],
                                                }
                                            )(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入企业名称"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row className={styles.detailTitle}>
                                    <Col span={8} className={styles.detailBtns}>
                                        <Form.Item
                                            label='评定等级'
                                        >
                                            {getFieldDecorator('evaluateLevel', {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: '请选择评定等级'
                                                    },
                                                ],
                                                // initialValue: T.moment(new Date().getTime()-24*60*60*1000),
                                            })(
                                                <Radio.Group>
                                                    <Radio value={"A"}>A</Radio>
                                                    <Radio value={"B"}>B</Radio>
                                                    <Radio value={"C"}>C</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row className={styles.detailTitle}>
                                    <Col span={24}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='存在的问题及整改要求：'
                                        >
                                            {getFieldDecorator('evaluateContent', {}
                                            )(
                                                <TextArea
                                                    placeholder="请填写存在的问题及整改要求"
                                                    autoSize={{minRows: 3, maxRows: 6}}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <div>
                                        注：A级为合格，企业防控措施到位，可以继续生产经营；B级为基本合格，但存在问题需限期整改，整改不到位的予以关停；C级为不合格，企业须停业整顿，待整改完成、评定合格后方可复工。
                                    </div>
                                </Row>

                            </Card>
                            <FormItem {...submitFormLayout}
                                      style={{marginTop: 32, paddingBottom: 24, textAlign: 'center'}}>
                                <Button
                                    style={{marginLeft: 16}}
                                    type="primary"
                                    htmlType="submit"
                                    // loading={savingStatus}
                                >
                                    保存
                                </Button>
                                <Button
                                    style={{marginLeft: 8}}
                                    type="primary"
                                    onClick={this.resetForm}
                                >
                                    清空
                                </Button>
                            </FormItem>
                        </Form>

                    </div>
                </div>
            </PageHeaderWrapper>
        );
    }
}

export default CompanyStatisticsEdit;

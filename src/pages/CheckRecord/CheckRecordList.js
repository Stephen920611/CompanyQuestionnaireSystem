import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import styles from './CheckRecordList.less';
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
import CheckRecordDetail from "./CheckRecordDetail";

const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;

/* eslint react/no-multi-comp:0 */
@connect(({checkRecord, loading}) => ({
    checkRecord,
    fetchStatus: loading.effects['checkRecord/fetchPaperAction'],
}))
@Form.create()
class CheckRecordList extends PureComponent {
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
            question: {
                paperBasic: {},
                questionArray: []
            },
            isDownLoad: false,      //是否可让下载，只有保存成功后返回id才能下载，否则不能下载

        }
    }

    componentDidMount() {
        const {dispatch, location} = this.props;

        let self = this;
        let loginInfo = T.auth.getLoginInfo();
        let userId = loginInfo.data.user.id;
        new Promise((resolve, reject) => {
            dispatch({
                type: 'checkRecord/fetchPaperAction',
                params: {
                    userId:userId,
                },
                resolve,
                reject,
            });
        }).then(response => {
            if (response.code === 0) {
                self.setState({
                    question: response.data
                })
            } else {
                T.prompt.error(response.msg);
            }
        });


    }

    //提交功能
    onSubmitData = (e) => {
        let self = this;
        const {dispatch, form, location} = this.props;
        const {question} = this.state;
        const {paperBasic, questionArray} = question;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let loginInfo = T.auth.getLoginInfo();
                let userId = loginInfo.data.user.id;
                let answerAry = [];
                questionArray.map((item, index) => {
                    let name = 'question' + (index + 1);
                    if(!T.lodash.isUndefined(values[name])&&values[name]!==''){
                        answerAry.push({
                            questionId: index + 1,
                            checkIndex: values[name]
                        })
                    }

                });

                let sendParams = {
                    // paperAnswerStr:{
                        paperBasic:{
                            id:0,
                            userId: userId,
                            // userId: 4,
                            // area: values.area,	//县市区名字
                            companyName: T.lodash.isUndefined(values.companyName) ? '' : values.companyName,
                            addressName: T.lodash.isUndefined(values.addressName) ? '' : values.addressName,
                            phoneNumber: T.lodash.isUndefined(values.phoneNumber) ? '' : values.phoneNumber,
                            reportUser: T.lodash.isUndefined(values.reportUser) ? '' : values.reportUser,
                            registeredNum: T.lodash.isUndefined(values.registeredNum) ? '' : values.registeredNum,
                            registeredNonlocalNum: T.lodash.isUndefined(values.registeredNonlocalNum) ? '' : values.registeredNonlocalNum,
                            registeredHubeiNum: T.lodash.isUndefined(values.registeredHubeiNum) ? '' : values.registeredHubeiNum,
                            onguardNum: T.lodash.isUndefined(values.onguardNum) ? '' : values.onguardNum,
                            onguardNonlocalNum: T.lodash.isUndefined(values.onguardNonlocalNum) ? '' : values.onguardNonlocalNum,
                            quarantineRoomNum: T.lodash.isUndefined(values.quarantineRoomNum) ? '' : values.quarantineRoomNum,
                            propose: T.lodash.isUndefined(values.propose) ? '' : values.propose,
                            // companyId: T.lodash.isUndefined(values.companyId) ? '' : values.companyId,
                            companyId: loginInfo.data.user.companyId,
                            createTime: T.moment(new Date().getTime()),
                            updateTime: T.moment(new Date().getTime())
                        },
                        answerAry:answerAry,
                    // }
                };
                let params = {
                    paperAnswerStr:JSON.stringify(sendParams)
                };
                new Promise((resolve, reject) => {
                    dispatch({
                        type: 'checkRecord/savePaperAction',
                        params,
                        resolve,
                        reject,
                    });
                }).then(response => {
                    if (response.code === 0) {
                        T.prompt.success("更新成功");
                        // self.resetForm();
                        
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
    renderQuestion = (data) => {
        const {
            fetchStatus,
            form: {getFieldDecorator, getFieldValue},
        } = this.props;
        const {
            formItemLayout,
            formItemHalf,
        } = this.state;
        return (
            data.map((item, idx) => {
                return (
                    <Row className={styles.detailTitle}>
                        <Col span={24}>
                            <Form.Item
                                {...formItemLayout}
                                label={item.questionContent}
                            >
                                {getFieldDecorator('question' + item.id, {
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择",
                                        },
                                    ],
                                    }
                                )(
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                )
            })
        )
    }

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
            question,
            isDownLoad,
        } = this.state;
        const {paperBasic, questionArray} = question;
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

        let apiHref = `${window.ENV.apiDomain}/word/download-paper?userId=${loginInfo.data.user.id}&id=${1}`;

        return (
            <PageHeaderWrapper
                title={'企业问卷调查'}
                isSpecialBreadcrumb={true}
                // breadcrumbName={<CustomBreadcrumb dataSource={breadcrumbDetail}/>}
            >
                <div>
                    <div className={styles.detailItem}>
                        <Form
                            onSubmit={this.onSubmitData}
                            hideRequiredMark
                        >
                            <div className={styles.detailTitleName}>
                                一、基本信息
                            </div>
                            <Card
                                style={{marginBottom: 20}}
                                loading={fetchStatus}
                            >
                                <Row className={styles.detailTitle}>
                                    {/* <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='县市区：'
                                        >
                                            {getFieldDecorator('area', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请选择县市区",
                                                        },
                                                    ],
                                                    initialValue: T.auth.getLoginInfo().data.area
                                                }
                                            )(
                                                <Select
                                                    // onChange={this.onChangeConnectionUrl.bind(this, "dataOrigin", "connectionUrl")}
                                                    // onSelect={this.selectDataSource.bind(this, 'FTP')}
                                                    getPopupContainer={triggerNode => triggerNode.parentNode}
                                                    placeholder="请选择县市区"
                                                >
                                                    {
                                                        this.renderSelect(areaSelect, true)
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>*/}
                                    <Col span={6} className={styles.detailBtns}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='单位全称：'
                                        >
                                            {getFieldDecorator('companyName', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入单位全称",
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
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='注册地址：'
                                        >
                                            {getFieldDecorator('addressName', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入注册地址",
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入注册地址"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/*<Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='所属县市区：'
                                        >
                                            {getFieldDecorator('areaNum', {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: "请输入所属县市区",
                                                    },
                                                    // {
                                                    //     validator: this.checkAge
                                                    // }
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入所属县市区"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>*/}
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='填报人：'
                                        >
                                            {getFieldDecorator('reportName', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入填报人",
                                                    },
                                                    // {
                                                    //     validator: this.checkAge
                                                    // }
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入填报人"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='联系电话：'
                                        >
                                            {getFieldDecorator('phoneNumber', {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: "请输入联系电话",
                                                    },
                                                    // {
                                                    //     validator: this.checkAge
                                                    // }
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入联系电话"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='在册职工数：'
                                        >
                                            {getFieldDecorator('registeredNum', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入在册职工数",
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入在册职工数"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='其中非烟台籍人数：'
                                        >
                                            {getFieldDecorator('registeredNonlocalNum', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入非烟台籍人数",
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入非烟台籍人数"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='其中湖北籍人数：'
                                        >
                                            {getFieldDecorator('registeredHubeiNum', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入湖北籍人数",
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入在册职工数"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/*<Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='填报人：'
                                        >
                                            {getFieldDecorator('gender', {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: "请选择填报人",
                                                        },
                                                    ],
                                                }
                                            )(
                                                <Radio.Group >
                                                    <Radio value={"男"}>男</Radio>
                                                    <Radio value={"女"}>女</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </Col>*/}
                                </Row>
                                <Row className={styles.detailTitle}>
                                    <Col span={6}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='目前在岗人数：'
                                        >
                                            {getFieldDecorator('onguardNum', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入目前在岗人数",
                                                        },
                                                    ],
                                                }
                                            )(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入目前在岗人数"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={6} className={styles.detailBtns}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='其中非烟台籍人数：'
                                        >
                                            {getFieldDecorator('onguardNonlocalNum', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入非烟台籍人数",
                                                        },
                                                    ],
                                                }
                                            )(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入非烟台籍人数"
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={6} className={styles.detailBtns}>
                                        <Form.Item
                                            {...formItemLayout}
                                            label='可用于集中隔离员工的房间数量：'
                                        >
                                            {getFieldDecorator('quarantineRoomNum', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入可用于集中隔离员工的房间数量",
                                                        },
                                                    ],
                                                }
                                            )(
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="请输入可用于集中隔离员工的房间数量"
                                                />
                                            )}
                                        </Form.Item>
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
                            <FormItem
                                {...submitFormLayout}
                                style={{marginTop: 32, paddingBottom: 24, textAlign: 'center'}}
                            >
                                <Button
                                    style={{marginLeft: 16}}
                                    type="primary"
                                    htmlType="submit"
                                    // loading={savingStatus}
                                >
                                    保存
                                </Button>
                                <Button
                                    type="primary"
                                    style={{marginLeft: 16}}
                                    disabled={!isDownLoad}
                                >
                                    <a href={apiHref} target="_blank" >下载</a>
                                </Button>
                                <Button
                                    style={{marginLeft: 16}}
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

export default CheckRecordList;

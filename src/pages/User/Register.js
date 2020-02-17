import React, {Component} from 'react';
import {connect} from 'dva';
import {formatMessage, FormattedMessage} from 'umi-plugin-react/locale';
import Link from 'umi/link';
import router from 'umi/router';
import {Form, Input, Button, Modal, Select, Row, Col, Popover, Progress} from 'antd';
import styles from './Register.less';
import T from './../../utils/T';

const FormItem = Form.Item;
const {Option} = Select;
const InputGroup = Input.Group;

const passwordStatusMap = {
    ok: (
        <div className={styles.success}>
            <FormattedMessage id="validation.password.strength.strong"/>
        </div>
    ),
    pass: (
        <div className={styles.warning}>
            <FormattedMessage id="validation.password.strength.medium"/>
        </div>
    ),
    poor: (
        <div className={styles.error}>
            <FormattedMessage id="validation.password.strength.short"/>
        </div>
    ),
};

const passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    poor: 'exception',
};

@connect(({register, loading}) => ({
    register,
    submitting: loading.effects['register/submit'],
}))
@Form.create()
class Register extends Component {
    state = {
        count: 0,
        confirmDirty: false,
        visible: false,
        help: '',
        prefix: '86',
        userTypeSelect: [
            // {
            //     name: "市级管理员",
            //     value: 0,
            // },
            // {
            //     name: "区县级管理员",
            //     value: 1,
            // },
            {
                name: "企业用户",
                value: 2,
            },
        ],     //用户类型
        citySelect: [],     //县市区
        codeBack: "",     //验证码
    };

    componentDidMount() {
        const {form, register} = this.props;
        // const account = form.getFieldValue('mail');
        // console.log(account,'account');
        // if (register.status === 'ok') {
        //     router.push({
        //         pathname: '/user/register-result',
        //         state: {
        //             account,
        //         },
        //     });
        // }

        const {dispatch, location} = this.props;
        let self = this;
        //获取县市区
        new Promise((resolve, reject) => {
            dispatch({
                type: 'register/fetchAllAreaAction',
                params: {},
                resolve,
                reject,
            });
        }).then(response => {
            if (response.code === 0) {
                let endData = response.data.map( (val) => {
                    return {
                        ...val,
                        value: val.id
                    }
                });
                self.setState({
                    citySelect: endData
                })
            } else {
                T.prompt.error(response.msg);
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    //获取验证码
    onGetCaptcha = () => {
        const {dispatch, location, form} = this.props;
        let self = this;
        form.validateFields(["phone"], (err, values) => {
            if (!err) {
                //每180s验证一次
                let count = 179;
                this.setState({count});
                this.interval = setInterval(() => {
                    count -= 1;
                    this.setState({count});
                    if (count === 0) {
                        clearInterval(this.interval);
                    }
                }, 1000);

                //获取验证码
                new Promise((resolve, reject) => {
                    dispatch({
                        type: 'register/sendCodeAction',
                        params: {
                            phone: values.phone
                        },
                        resolve,
                        reject,
                    });
                }).then(response => {
                    if (response.code === 0) {
                        form.setFieldsValue({
                            captcha: response.msg,
                        });
                        self.setState({
                            codeBack: response.msg
                        })
                    } else {
                        T.prompt.error(response.msg);
                    }
                });
            }else {
                T.prompt.error(err.phone.errors[0].message);
            }
        });
    };

    //注册功能
    handleSubmit = e => {
        e.preventDefault();
        const {form, dispatch} = this.props;

        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //获取验证码
                new Promise((resolve, reject) => {
                    dispatch({
                        type: 'register/userRegistAction',
                        params: {
                            "areaId": values.location,
                            "captcha": values.captcha,
                            "companyName": values.companyName,
                            "password": values.password,
                            "role": 2,
                            "username": values.phone,
                        },
                        resolve,
                        reject,
                    });
                }).then(response => {
                    if (response.code === 0) {
                        T.prompt.success('注册成功，请登录');
                        router.push({
                            pathname: "/user/login"
                        });
                    } else {
                        T.prompt.error(response.msg);
                    }
                });
            }
        });
    };

    getPasswordStatus = () => {
        const {form} = this.props;
        const value = form.getFieldValue('password');
        if (value && value.length > 9) {
            return 'ok';
        }
        if (value && value.length > 5) {
            return 'pass';
        }
        return 'poor';
    };

    handleConfirmBlur = e => {
        const {value} = e.target;
        const {confirmDirty} = this.state;
        this.setState({confirmDirty: confirmDirty || !!value});
    };

    checkConfirm = (rule, value, callback) => {
        const {form} = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback(formatMessage({id: 'validation.password.twice'}));
        } else {
            callback();
        }
    };

    checkPassword = (rule, value, callback) => {
        const {visible, confirmDirty} = this.state;
        if (!value) {
            this.setState({
                help: formatMessage({id: 'validation.password.required'}),
                visible: !!value,
            });
            callback('error');
        } else {
            this.setState({
                help: '',
            });
            if (!visible) {
                this.setState({
                    visible: !!value,
                });
            }
            if (value.length < 6) {
                callback('error');
            } else {
                const {form} = this.props;
                if (value && confirmDirty) {
                    form.validateFields(['confirm'], {force: true});
                }
                callback();
            }
        }
    };

    changePrefix = value => {
        this.setState({
            prefix: value,
        });
    };

    //渲染不同的下拉框
    renderSelect = (dataSource) => {
        if (dataSource.length > 0) {
            return (
                dataSource.map((item, idx) => {
                    return (
                        <Option key={item.value} value={item.value}>
                            {item.name}
                        </Option>
                    )
                })
            )
        }
    };

    renderPasswordProgress = () => {
        const {form} = this.props;
        const value = form.getFieldValue('password');
        const passwordStatus = this.getPasswordStatus();
        return value && value.length ? (
            <div className={styles[`progress-${passwordStatus}`]}>
                <Progress
                    status={passwordProgressMap[passwordStatus]}
                    className={styles.progress}
                    strokeWidth={6}
                    percent={value.length * 10 > 100 ? 100 : value.length * 10}
                    showInfo={false}
                />
            </div>
        ) : null;
    };

    render() {
        const {form, submitting} = this.props;
        const {getFieldDecorator} = form;
        const {
            count,
            prefix,
            help,
            visible,
            userTypeSelect,
            citySelect
        } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };
        return (
            <div className={styles.main}>
                {/*<h3>*/}
                {/*用户注册*/}
                {/*</h3>*/}
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <FormItem label="用户类型">
                        {getFieldDecorator('userType', {
                            initialValue: 2,
                            rules: [
                                {
                                    required: true,
                                    message: "请选择用户类型",
                                },
                            ],
                        })(
                            <Select
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                                {
                                    this.renderSelect(userTypeSelect)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="县市区">
                        {getFieldDecorator('location', {
                            initialValue: 1,
                            rules: [
                                {
                                    required: true,
                                    message: "请选择县市区",
                                },
                            ],
                        })(
                            <Select
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                                {
                                    this.renderSelect(citySelect)
                                }
                            </Select>
                        )}
                    </FormItem>
                   {/* <FormItem label="行业">
                        {getFieldDecorator('trade', {
                            rules: [
                                {
                                    required: true,
                                    message: formatMessage({id: 'validation.email.required'}),
                                },
                                {
                                    type: 'email',
                                    message: formatMessage({id: 'validation.email.wrong-format'}),
                                },
                            ],
                        })(
                            <Select
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                                {
                                    this.renderSelect(citySelect)
                                }
                            </Select>
                        )}
                    </FormItem>*/}
                    <FormItem label="企业名称">
                        {getFieldDecorator('companyName', {
                            rules: [
                                {
                                    required: true,
                                    message: "请输入企业注册完整名称",
                                },
                            ],
                        })(
                            <Input size="large" placeholder={"写企业注册完整名称"}/>
                        )}
                    </FormItem>
                    {/*<FormItem>
            {getFieldDecorator('mail', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'validation.email.required' }),
                },
                {
                  type: 'email',
                  message: formatMessage({ id: 'validation.email.wrong-format' }),
                },
              ],
            })(
              <Input size="large" placeholder={formatMessage({ id: 'form.email.placeholder' })} />
            )}
          </FormItem>*/}
                    <FormItem label="手机号">
                        <InputGroup compact>
                            {/*<Select*/}
                            {/*size="large"*/}
                            {/*value={prefix}*/}
                            {/*onChange={this.changePrefix}*/}
                            {/*style={{ width: '20%' }}*/}
                            {/*>*/}
                            {/*<Option value="86">+86</Option>*/}
                            {/*<Option value="87">+87</Option>*/}
                            {/*</Select>*/}
                            {getFieldDecorator('phone', {
                                rules: [
                                    {
                                        required: true,
                                        message: formatMessage({id: 'validation.phone-number.required'}),
                                    },
                                    {
                                        pattern: /^\d{11}$/,
                                        message: formatMessage({id: 'validation.phone-number.wrong-format'}),
                                    },
                                ],
                            })(
                                <Input
                                    size="large"
                                    style={{width: '100%'}}
                                    placeholder={formatMessage({id: 'form.phone-number.placeholder'})}
                                />
                            )}
                        </InputGroup>
                    </FormItem>
                    <FormItem help={help} label="密码">
                        <Popover
                            getPopupContainer={node => node.parentNode}
                            content={
                                <div style={{padding: '4px 0'}}>
                                    {passwordStatusMap[this.getPasswordStatus()]}
                                    {this.renderPasswordProgress()}
                                    <div style={{marginTop: 10}}>
                                        <FormattedMessage id="validation.password.strength.msg"/>
                                    </div>
                                </div>
                            }
                            overlayStyle={{width: 240}}
                            placement="right"
                            visible={visible}
                        >
                            {getFieldDecorator('password', {
                                rules: [
                                    {
                                        required: true,
                                        message: "请输入密码",
                                    },
                                    {
                                        validator: this.checkPassword,
                                    },
                                ],
                            })(
                                <Input
                                    size="large"
                                    type="password"
                                    placeholder={formatMessage({id: 'form.password.placeholder'})}
                                />
                            )}
                        </Popover>
                    </FormItem>
                    <FormItem label="确认密码">
                        {getFieldDecorator('confirm', {
                            rules: [
                                {
                                    required: true,
                                    message: formatMessage({id: 'validation.confirm-password.required'}),
                                },
                                {
                                    validator: this.checkConfirm,
                                },
                            ],
                        })(
                            <Input
                                size="large"
                                type="password"
                                placeholder={formatMessage({id: 'form.confirm-password.placeholder'})}
                            />
                        )}
                    </FormItem>
                    <FormItem label="验证码">
                        <Row gutter={8} offset={6}>
                            <Col span={16}>
                                {getFieldDecorator('captcha', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: 'validation.verification-code.required'}),
                                        },
                                    ],
                                })(
                                    <Input
                                        size="large"
                                        placeholder={formatMessage({id: 'form.verification-code.placeholder'})}
                                    />
                                )}
                            </Col>
                            <Col span={8}>
                                <Button
                                    size="large"
                                    disabled={count}
                                    className={styles.getCaptcha}
                                    onClick={this.onGetCaptcha}
                                >
                                    {count
                                        ? `${count} s`
                                        : formatMessage({id: 'app.register.get-verification-code'})}
                                </Button>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button
                            size="large"
                            loading={submitting}
                            className={styles.submit}
                            type="primary"
                            htmlType="submit"
                        >
                            <FormattedMessage id="app.register.register"/>
                        </Button>
                        <Link className={styles.login} to="/User/Login">
                            <FormattedMessage id="app.register.sign-in"/>
                        </Link>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

export default Register;

import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {formatMessage, FormattedMessage} from 'umi-plugin-react/locale';
import T from './../../utils/T';
import router from 'umi/router';
import {
    EnumQuickRegisterParams,
} from './../../constants/dataSync/EnumSyncConfigModal';
import {EnumDataSyncPageInfo} from './../../constants/EnumPageInfo';
import {EnumDataSourceStatus} from './../../constants/dataSync/EnumSyncCommon';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    Icon,
    Button,
    Tooltip,
    InputNumber,
    DatePicker,
    Radio,
    Tree,
    Spin,
    Table,
    Divider,
    Popconfirm,
    TreeSelect,
    Collapse,
} from 'antd';

const {TreeNode, DirectoryTree} = Tree;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;
const {Panel} = Collapse;
const { Column, ColumnGroup } = Table;

import styles from './TotalStatistics.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper'; // @ 表示相对于源文件根目录

/* eslint react/no-multi-comp:0 */
@connect(({totalStatistics, loading}) => ({
    totalStatistics,
    fetchStatInfoStatus: loading.effects['totalStatistics/fetchTotalStatisticsInfoAction'],
    fetchTreeStatus: loading.effects['totalStatistics/fetchTreeNodeAction'],
}))
// class TotalStatistics
@Form.create()
class TotalStatistics extends PureComponent {
    state = {
        currentPage: EnumDataSyncPageInfo.defaultPage,//分页
        selectRows: [], //选择的数据列
        selectedKey: 'GA',//树节点默认选中的值
        selectTreeKey: [],  //树选择的key值
        expandTreeKey: [],  //树展开的key值
        selectedArea: '烟台市',//树节点默认选中的地区名字，用来后台获取参数
        clickTree: [],  //点击的当前树
        tableData: [],  //表格数据
        treeNewData: [],
        autoExpandParent: true,     //是否自动展开
        sendParams:{},
        deadline:'2020-02-16'
    };

    componentDidMount() {
        const {dispatch, location} = this.props;

        // this.fetchDataList();
        this.fetchTreeData();
    }

    fetchTreeData = () => {
        let loginInfo = T.auth.getLoginInfo();
        let self = this;
        const {dispatch} = this.props;
        new Promise((resolve, reject) => {
            dispatch({
                type: 'totalStatistics/fetchTreeNodeAction',
                userId: loginInfo.data.user.id,
                resolve,
                reject,
            });
        }).then(response => {
            if (response.code === 0) {
                self.setState({
                    treeNewData: response.data,
                    selectTreeKey: response.data.length > 0 ? response.data[0].hasOwnProperty('code') ? [response.data[0].code] : [] : [],
                    expandTreeKey: response.data.length > 0 ? response.data[0].hasOwnProperty('code') ? [response.data[0].code] : [] : [],

                }, () => {
                    self.fetchDataList(response.data)
                });
            } else {
                T.prompt.error(response.msg);
            }
        });
    };

    //获取当前页数数据
    fetchDataList = (eventData) => {
        const {dispatch, form} = this.props;
        const {currentPage, selectedArea} = this.state;
        let self = this;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let loginInfo = T.auth.getLoginInfo();

                let params = {
                    // current: currentPage,
                    // size: EnumDataSyncPageInfo.defaultPageSize,
                    userId: loginInfo.data.user.id,
                    areaId: eventData.type === 'area' ? eventData.backId : eventData.type === 'industry' ? eventData.industryParentId: '' ,
                    industryId: eventData.type === 'industry' ? eventData.backId : '',
                    companyId: eventData.type === 'company' ? eventData.backId : '',
                    startDay: T.lodash.isUndefined(values.startDate) ? '' : values.startDate === null ?  '' : T.helper.dateFormat(values.startDate,'YYYY-MM-DD'),      //开始时间
                    endDay: T.lodash.isUndefined(values.endDate) ? '' : values.endDate === null ?  '' : T.helper.dateFormat(values.endDate,'YYYY-MM-DD'),      //开始时间
                };
                // console.log(params,'params');
                this.setState({
                    sendParams:params
                });
                new Promise((resolve, reject) => {
                    dispatch({
                        type: 'totalStatistics/fetchTotalStatisticsInfoAction',
                        params,
                        resolve,
                        reject,
                    });
                }).then(response => {
                    if (response.code === 0) {
                        let endData = response.data.map( (val,idx) => {
                            return {
                                ...val,
                                key: idx + 1,
                                index: idx + 1,
                            }
                        });
                        self.setState({
                            tableData: endData,
                        })
                    } else {
                        T.prompt.error(response.msg);
                    }
                });
            }
        });
    };

    handleMapChange(e, fieldName, key) {
        const {tableData} = this.state;
        const newData = tableData.map(item => ({...item}));
        const target = this.getRowByKey(key, newData);
        if (target) {
            target[fieldName] = e.target.value;
            this.setState({tableData: newData});
        }
    };

    getRowByKey(key, newData) {
        const {dataSource} = this.state;
        return (newData || dataSource).filter(item => item.key === key)[0];
    }

    handleKeyPress(e,fieldName,key){
        const {dataSource} = this.state;
        const newData = dataSource.map(item => ({...item}));
        const target = this.getRowByKey(key, newData);
        if (target) {
            if(fieldName==='isolatedTotalNum'){
                target['isolatedTotalNumEdit'] = false;
                target['isolatedTotalNumFirst'] = false;
            }else{
                target['atHomeTotalNumEdit'] = false;
                target['atHomeTotalNumFirst'] = false;
            }

            this.setState({dataSource: newData});
        }
    }

    showEdit(e,fieldName, key) {
        const {dataSource} = this.state;
        const newData = dataSource.map(item => ({...item}));
        const target = this.getRowByKey(key, newData);
        if (target) {
            if(fieldName==='isolatedTotalNum'){
                target['isolatedTotalNumEdit'] = true;
                // target['isolatedTotalNumFirst'] = false;
            }else{
                target['atHomeTotalNumEdit'] = true;
                // target['atHomeTotalNumFirst'] = false;
            }
            // target['edit'] = true;
            this.setState({dataSource: newData});
        }
    };

    //重置表单
    resetDataSource = () => {
        const {clickTree} = this.state;
        this.props.form.setFieldsValue({
            startDate: T.moment(new Date().getTime()),
            endDate: T.moment(new Date().getTime()),
        });
        // this.props.form.resetFields();
        this.fetchDataList(clickTree);
    };

    //树选择
    onSelect = (keys, event) => {
        //点击选中事件，属性可以打印查看
        const eventData = event.node.props;
        let self = this;
        this.setState({
            selectTreeKey: keys,
            selectedArea: eventData.name,
            clickTree: eventData,
        }, () => {
            self.fetchDataList(eventData)
        });
    };

    //渲染树节点
    /**
     *
     * @param data
     * @param industryParentId 点击行业时，行业父节点县市区ID必传 ，为了更好地拿数据，所以要做这个
     * @returns {Array|*}
     */
    renderTreeNodes = (data, industryParentId = '') => {
        return data.map(item => {
            if (item.nodes) {
                return (
                    <TreeNode
                        {...item}
                        dataRef={item}
                        name={item.text}
                        title={item.text}
                        key={item.code}
                        id={item.code}
                        backId={item.id}
                        pId={item.parentCode}
                        industryParentId={industryParentId}
                    >
                        {this.renderTreeNodes(item.nodes, item.id)}
                    </TreeNode>
                );
            }
            return <TreeNode
                {...item}
                dataRef={item}
                name={item.text}
                title={item.text}
                key={item.code}
                id={item.code}
                backId={item.id}
                isLeaf
                pId={item.parentCode}
            />;
        });
    };

    // //渲染select树节点
    // renderSelectTreeNodes = data => {
    //     return data.map(item => {
    //         if (item.children) {
    //             return (
    //                 <TreeSelect.TreeNode {...item} dataRef={item} title={item.name} value={item.name} key={item.id}>
    //                     {this.renderSelectTreeNodes(item.children)}
    //                 </TreeSelect.TreeNode>
    //             );
    //         }
    //         return <TreeSelect.TreeNode {...item} dataRef={item} title={item.name} value={item.name} key={item.id}
    //                                     isLeaf/>;
    //     });
    // };

    //查询
    searchDataSource = (e) => {
        const {clickTree} = this.state;
        const {dispatch, form} = this.props;
        e.preventDefault();
        this.fetchDataList(clickTree);
    };

    //导出
    exportData = (e) => {
        e.preventDefault();
        // const {selectRows} = this.state;
        // if (selectRows.length > 0) {
        //     let ids = selectRows.map(val => {
        //         return val.id
        //     });
        //     let key = ids.join(',');
        //     this.removeData(key);
        // } else {
        //     T.prompt.error("请选择需要删除的行");
        // }
    };

    //树选择
    onTreeChange = (e, node) => {
        this.setState({
            selectedKey: node.props.id,
        });
    };

    /**
     * 展开树操作
     * @param {array} expandedKeys
     */
    onExpand = expandedKeys => {
        this.setState({
            autoExpandParent: false,
        });
        this.setState({
            expandTreeKey: expandedKeys
        });
    };

    render() {
        const {
            fetchTreeStatus,
            fetchStatInfoStatus,
            form: {getFieldDecorator, getFieldValue, getFieldsValue},
        } = this.props;
        const {
            treeNewData,
            currentPage,
            selectedKey,
            tableData,
            selectedArea,
            autoExpandParent,
            selectTreeKey,
            expandTreeKey,
            sendParams,
            deadline,
        } = this.state;

        const columns = [
            {
                title: '县市区',
                dataIndex: 'areaName',
                // width: '8%',
            },
            {
                title: '开复工企业(项目)数量',
                dataIndex: 'industryName',
                // width: '8%',
            },
            {
                title: '完成摸排企业(项目)数量',
                dataIndex: 'companyName',
                // width: '8%',
            },
            {
                title: '符合开复工条件企业(项目)数量',
                dataIndex: 'memberNum',
                // width: '8%',
            },
            {
                title: '复工人数',
                dataIndex: 'backNum',
                // width: '8%',
            },
            {
                title: '完成摸排人数',
                dataIndex: 'touchSuspectNum',
                // width: '12%',
            },
            {
                title: '本次摸排中累计发现',
                children: [
                    {
                        title: '1月30日之后抵烟人员',
                        dataIndex: 'touchIntimateNum',
                        // colSpan:4,
                        // width: '12%',
                    },
                    {
                        title: '与确诊、疑似病例有过密切接触的人数',
                        dataIndex: 'touchInfectorNum',
                        // width: '12%',
                    },
                    {
                        title: '与密切接触者有过共同生活、工作、学习、聚会的人数',
                        dataIndex: 'bodyAbnormalNum3',
                        // width: '8%',
                    },
                    {
                        title: '与重点疫区人员有过接触的人数',
                        dataIndex: 'bodyAbnormalNum4',
                        // width: '8%',
                    },
                    {
                        title: '身体状况异常的人数',
                        dataIndex: 'bodyAbnormalNum5',
                        // width: '8%',
                    },
                ],
            },
            {
                title: '本次摸排中累计',
                children: [
                    {
                        title: '居家隔离人数',
                        dataIndex: 'bodyAbnormalNum6',
                        // width: '8%',
                    },
                    {
                        title: '集中隔离人数',
                        dataIndex: 'bodyAbnormalNum7',
                        // width: '8%',
                    },
                    {
                        title: '送医人数',
                        dataIndex: 'bodyAbnormalNum8',
                        // width: '8%',
                    },
                ],
            },
        ];
        const rowSelection = {
            //多选所选择的key值
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectRows: selectedRows
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };
        let loginInfo = T.auth.getLoginInfo();
        //获取表单的value
        let formTimeValue = getFieldsValue();

        let formStart = T.lodash.isUndefined(formTimeValue.startDate) ? '' : formTimeValue.startDate === null ?  '' : T.helper.dateFormat(formTimeValue.startDate,'YYYY-MM-DD');
        let formEnd = T.lodash.isUndefined(formTimeValue.endDate) ? '' : formTimeValue.endDate === null ?  '' : T.helper.dateFormat(formTimeValue.endDate,'YYYY-MM-DD');

        // let apiHref = window.ENV.apiDomain + "/stat/export-stat-info?area=" + (T.auth.isAdmin() ? selectedArea === "烟台市" ? '' : selectedArea : loginInfo.data.area) + "&start=" + formStart + "&end=" + formEnd;
        let apiHref = window.ENV.apiDomain + "/stat/export-stat-info?userId=" + loginInfo.data.user.id+"&areaId=" + sendParams.areaId + "&industryId=" + sendParams.industryId + "&companyId=" + sendParams.companyId  + "&startDay=" + formStart + "&endDay=" + formEnd;
        return (
            <PageHeaderWrapper
                title="行业健康信息填报统计"
                isSpecialBreadcrumb={true}
            >
                <Row gutter={24}>
                    <Col xl={6} lg={6} md={6} sm={24} xs={24}>
                        <Card
                            title="资源列表"
                            bordered={false}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {
                                fetchTreeStatus ? <Spin/> :
                                    <DirectoryTree
                                        multiple
                                        defaultExpandAll={true}
                                        onSelect={this.onSelect}
                                        onExpand={this.onExpand}
                                        selectedKeys={selectTreeKey}
                                        expandedKeys={expandTreeKey}
                                        autoExpandParent={autoExpandParent}
                                    >
                                        {this.renderTreeNodes(treeNewData)}
                                    </DirectoryTree>
                            }
                        </Card>
                    </Col>
                    <Col xl={18} lg={18} md={18} sm={24} xs={24} className={styles.dataSourceTableList}>
                        <Form layout="inline" onSubmit={this.searchDataSource}>
                            <Row className={`${styles.dataSourceTitle} ${styles.tableListForms}`}
                                 style={{marginBottom: 10}}>
                                <Col xl={6} lg={6} md={6} sm={6} xs={24}>
                                    <Form.Item
                                        label='起始时间'
                                    >
                                        {getFieldDecorator('startDate', {
                                            // rules: [
                                            //     {
                                            //         // required: true,
                                            //         // message:'请选择查询时间'
                                            //     },
                                            // ],
                                            initialValue: T.moment(new Date().getTime()),
                                        })(
                                            <DatePicker allowClear={false}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col xl={6} lg={6} md={6} sm={6} xs={24}>
                                    <Form.Item
                                        label='结束时间'
                                    >
                                        {getFieldDecorator('endDate', {
                                            // rules: [
                                            //     {
                                            //         // required: true,
                                            //         // message:'请选择查询时间'
                                            //     },
                                            // ],
                                            // initialValue: T.moment(new Date().getTime()-24*60*60*1000),
                                            initialValue: T.moment(new Date().getTime()),
                                        })(
                                            <DatePicker allowClear={false}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col xl={6} lg={8} md={8} sm={8} xs={24} style={{textAlign: 'left'}}>
                                    <Form.Item className={styles.searchBtnWrapper}>
                                        <Button htmlType="submit" style={{marginRight: 10}}>
                                            查询
                                        </Button>
                                        <Button onClick={this.resetDataSource} type="primary" style={{marginRight: 10}}>
                                            重置
                                        </Button>
                                        <Button type="primary">
                                            <a href={apiHref} target="_blank" >导出</a>
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>

                        </Form>
                        <Row className={`${styles.dataSourceTitle} ${styles.tableListForms}`}
                             style={{marginBottom: 10}}>
                            统计结果
                        </Row>
                        <Row>
                            <Card bordered={false}
                                  className={styles.tableContext}
                            >
                                <Table
                                    loading={fetchStatInfoStatus}
                                    columns={columns}
                                    dataSource={tableData}
                                    // rowSelection={rowSelection}
                                    pagination={false}
                                    bordered
                                    scroll={{ y: 480 }}
                                    title={() => '第四轮大摸排情况统计表（截止' + deadline + '）'}
                                    // rowClassName={record => (record.editable ? styles.editable : '')}
                                >

                                </Table>
                            </Card>
                        </Row>

                    </Col>
                </Row>
            </PageHeaderWrapper>
        );
    }
}

export default TotalStatistics;

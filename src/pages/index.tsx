import {
	ProForm,
	ProCard,
	ProFormSelect,
	ProTable,
	ProFormList,
	ProFormGroup,
	ProFormText,
} from "@ant-design/pro-components";
import { Alert, Button, Col, Form, Row } from "antd";
import { useState } from "react";
import { randomString, attrNameList, attrValueList } from "./utils";
import styles from "./index.less";
import type { ProColumns } from "@ant-design/pro-components";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";

const originColumns: ProColumns<any>[] = [
	{
		title: "销售价",
		dataIndex: "oprice",
		valueType: "digit",
		fieldProps: {
			addonAfter: "元",
			min: 0,
		},
	},
	{
		title: "成本价",
		dataIndex: "cprice",
		valueType: "digit",
		fieldProps: {
			addonAfter: "元",
			min: 0,
		},
	},
	{
		title: "库存",
		dataIndex: "stock",
		valueType: "digit",
		fieldProps: {
			min: 0,
		},
	},
];

export default function HomePage() {
	const [form] = Form.useForm();
	const [editableForm] = Form.useForm();
	const [formValues, setFormValues] = useState<any>(null);
	const [skuKeyList, setSkuKeyList] = useState<any[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [activeColumns, setActiveColumns] = useState<any[]>([]);
	const [alertVisile, setAlertVisile] = useState({
		show: false,
		msg: "",
	});

	const editableKeys = dataSource.map((item) => item?.id);

	console.log(dataSource);

	const columns = [...activeColumns, ...originColumns];

	// 根据所选规格生成排列组合数据
	const createSkuData = (v?: any, inputKeyList?: any[]) => {
		const values = v || form?.getFieldsValue();
		const keyList = inputKeyList || skuKeyList;
		const skuList = keyList.map((key, index) => {
			const formAttrName = `attrName_${key}`;
			const formAttrValue = `attrValue_${key}`;
			const attrName = values[formAttrName];
			let attrValue: any[] = values[formAttrValue] || [];
			attrValue = attrValue.map((item) => {
				return {
					...item,
					chileren: [],
				};
			});
			return {
				attrName,
				attrValue,
			};
		});
		// console.log("skuList", skuList);
		const skuMatrix = skuList.map((sku, index) => {
			const { attrValue } = sku;
			return attrValue;
		});
		// console.log("skuMatrix", skuMatrix);
		let i = skuMatrix.length - 1;
		while (i >= 1) {
			const itemArr = skuMatrix[i];
			const prevItemArr = skuMatrix[i - 1];
			prevItemArr.forEach((item: any) => {
				item.chileren = itemArr;
			});
			i--;
		}
		const skuTree = skuMatrix[0] || [];
		// console.log("skuTree", skuTree);
		const skuData: any[] = [];
		function recursion(node: any, path: any[]) {
			const { chileren, ...restNode } = node;
			path.push(restNode);
			if (Array.isArray(chileren) && chileren.length > 0) {
				chileren.forEach((item: any) => {
					recursion(item, [...path]);
				});
			} else {
				skuData.push(path);
			}
		}
		skuTree.forEach((node: any) => {
			recursion(node, []);
		});
		console.log("skuData", skuData);
		return skuData;
	};

	// 添加规格项
	const handleAddSkuItem = async () => {
		await form.validateFields();
		const key = `new_${randomString(20)}`;
		const currentIndex = skuKeyList.length;
		setSkuKeyList([...skuKeyList, key]);
		setActiveColumns([
			...activeColumns,
			{
				title: "#",
				dataIndex: `#${currentIndex}`,
				editable: false,
				render: (_: any, record: any) => {
					const { skuList } = record;
					return (
						(Array.isArray(skuList) && skuList[currentIndex]?.label) || "-"
					);
				},
			},
		]);
		if (dataSource.length === 0) {
			const dataId = randomString(20);
			setDataSource([
				{
					id: dataId,
					oprice: undefined,
					cprice: undefined,
					stock: undefined,
					skuList: [],
				},
			]);
		}
	};

	// 选择规格名
	const handleSelectAttrName = (item: any, index: number) => {
		const copyActiveColumns = [...activeColumns];
		copyActiveColumns[index].title = item.label;
		copyActiveColumns[index].dataIndex = item.value;
		setActiveColumns(copyActiveColumns);
	};

	// 删除规格项
	const handleDeleteSkuItem = (index: number) => {
		let copyActiveColumns = [...activeColumns];
		copyActiveColumns.splice(index, 1);
		copyActiveColumns = copyActiveColumns.map((item, i) => {
			return {
				...item,
				dataIndex: `#${i}`,
				render: (_: any, record: any) => {
					const { skuList } = record;
					return (Array.isArray(skuList) && skuList[i]?.label) || "-";
				},
			};
		});
		setActiveColumns(copyActiveColumns);
		const copySkuKeyList = [...skuKeyList];
		copySkuKeyList.splice(index, 1);
		setSkuKeyList(copySkuKeyList);
		if (copySkuKeyList.length === 0) {
			setDataSource([]);
		} else {
			const formAttrName = `attrName_${skuKeyList[index]}`;
			const formAttrValue = `attrValue_${skuKeyList[index]}`;
			const values = form?.getFieldsValue();
			delete values[formAttrName];
			delete values[formAttrValue];
			const skuData = createSkuData(values, copySkuKeyList);
			let copyDataSource = [...dataSource];
			copyDataSource.map((item) => {
				let itemSkuList: any[] = item?.skuList || [];
				itemSkuList = itemSkuList.splice(index, 1);
				return {
					...item,
					skuList: itemSkuList,
				};
			});
			copyDataSource = skuData.map((skuList: any[]) => {
				return copyDataSource.find((dataSourceItem) => {
					const dataSourceSkuList: any[] = dataSourceItem?.skuList || [];
					return (
						dataSourceSkuList.length === skuList.length &&
						skuList.every((it, l) => it?.value === dataSourceSkuList[l]?.value)
					);
				});
			});
			setDataSource(copyDataSource);
		}
	};

	// 添加规格值
	const handleAddAttrValue = (item: any, index: number) => {
		const skuData = createSkuData();
		let startIndex = -1;
		setDataSource(
			skuData.map((skuList: any[], i) => {
				const beforeSkuList = skuList.filter((it) => it.value !== item.value);
				const oldItem = dataSource.find((dataSourceItem, j) => {
					const dataSourceSkuList: any[] = dataSourceItem.skuList || [];
					if (dataSourceSkuList.length === 0) {
						return true;
					} else {
						const isSame =
							beforeSkuList.length === dataSourceSkuList.length &&
							beforeSkuList.every(
								(it, l) => it?.value === dataSourceSkuList[l]?.value
							);
						const tempStartIndex = startIndex;
						startIndex = j;
						return j > tempStartIndex && isSame;
					}
				});
				return {
					...oldItem,
					id: oldItem?.id || randomString(20),
					skuList,
				};
			})
		);
	};

	// 删除规格值
	const handleDeleteAttrValue = (item: any, index: number) => {
		const skuData = createSkuData();
		let newDataSource = [];
		if (skuData.length === 0) {
			newDataSource = dataSource.map((item) => {
				return {
					...item,
					skuList: [],
				};
			});
		} else {
			let startIndex = -1;
			newDataSource = skuData.map((skuList: any[], i) => {
				const oldItem = dataSource.find((dataSourceItem, j) => {
					const dataSourceSkuList: any[] = dataSourceItem.skuList || [];
					if (dataSourceSkuList.length === 0) {
						const tempStartIndex = startIndex;
						startIndex = j;
						return j > tempStartIndex;
					} else {
						const isSame =
							skuList.length === dataSourceSkuList.length &&
							skuList.every(
								(it, l) => it?.value === dataSourceSkuList[l]?.value
							);
						const tempStartIndex = startIndex;
						startIndex = j;
						return j > tempStartIndex && isSame;
					}
				});
				return {
					...oldItem,
					skuList,
				};
			});
		}
		if (newDataSource.length === 0) {
			const dataId = randomString(20);
			setDataSource([
				{
					id: dataId,
					oprice: undefined,
					cprice: undefined,
					stock: undefined,
				},
			]);
		} else {
			setDataSource(newDataSource);
		}
	};

	// 校验表格数据
	const validateFieldsTableData = async () => {
		await form.validateFields();
		if (dataSource.length === 0) {
			const msg = "请至少添加一个规格";
			setAlertVisile({
				show: true,
				msg,
			});
			return Promise.reject(msg);
		}
		function isEmpty(value: any) {
			return typeof value === "undefined" || value === "";
		}
		let hasEmpty = dataSource.some((item) => {
			const { oprice, cprice, stock, skuList } = item;
			return (
				!Array.isArray(skuList) ||
				skuList.length === 0 ||
				skuList.length !== skuKeyList.length ||
				isEmpty(oprice) ||
				isEmpty(cprice) ||
				isEmpty(stock)
			);
		});
		if (hasEmpty) {
			const msg = "请添加规格值、销售价、成本价、库存";
			setAlertVisile({
				show: true,
				msg,
			});
			return Promise.reject(msg);
		}
		setAlertVisile({
			show: false,
			msg: "",
		});
		return Promise.resolve(true);
	};

	return (
		<ProCard>
			<ProForm
				form={form}
				layout="horizontal"
				onValuesChange={(changeValues, allValues) => {
					console.log('onValuesChange', allValues);
					setFormValues(allValues)
				}}
				labelCol={{
					span: 4,
				}}
				wrapperCol={{
					span: 16,
				}}
				submitter={false}
			>
				{/* 规格项列表 */}
				{skuKeyList.map((key, index) => {
					const formAttrName = `attrName_${key}`;
					const formAttrValue = `attrValue_${key}`;
					return (
						<div key={key} className={styles.attrCard}>
							<ProFormSelect
								label="规格名"
								name={formAttrName}
								allowClear={false}
								fieldProps={{
									labelInValue: true,
									onSelect: (item) => handleSelectAttrName(item, index),
									onChange: () => {
										const values = form.getFieldsValue();
										console.log(values)
										form?.resetFields([formAttrValue]);
									},
								}}
								initialValue={undefined}
								request={async () =>
									attrNameList.map((item) => ({
										label: item.label,
										value: item.value,
									}))
								}
								style={{
									width: 200
								}}
								rules={[
									{
										required: true,
										message: "请选择规格名",
									},
								]}
							/>
							<ProForm.Item
								isListField
								label="规格值"
								wrapperCol={{
									span: 16,
								}}
							>
								<ProFormList
									name={formAttrValue}
									creatorButtonProps={{
										creatorButtonText: "添加",
										icon: false,
										type: "link",
										style: { width: "unset" },
									}}
									min={1}
									initialValue={[
										{
											value: undefined
										}
									]}
									onAfterRemove={(a, b) => {
										console.log(a, b)
									}}
									copyIconProps={false}
									deleteIconProps={{ tooltipText: "删除" }}
									itemRender={({ listDom, action }) => (
										<div
											style={{
												display: "inline-flex",
												marginInlineEnd: 25,
											}}
										>
											{listDom}
											{action}
										</div>
									)}
								>
									<ProFormSelect
										name={["value"]}
										fieldProps={{
											allowClear: false,
											labelInValue: true,
											onSelect: (item) => handleAddAttrValue(item, index),
											onDeselect: (item) => handleDeleteAttrValue(item, index),
										}}
										params={{
											attrNameValue: formValues?.[formAttrName]?.value
										}}
										request={async (params) => {
											return attrValueList(params?.attrNameValue);
										}}
										style={{
											width: 200
										}}
										rules={[
											{
												required: true,
												message: "请选择规格值",
											},
										]}
									/>
								</ProFormList>
							</ProForm.Item>
							<Button
								type="primary"
								danger
								className={styles.deleteAttr}
								onClick={() => handleDeleteSkuItem(index)}
							>
								删除规格项
							</Button>
						</div>
					);
				})}
				{/* 添加规格项 按钮 */}
				<ProForm.Item label="" wrapperCol={{ span: 24 }}>
					<Button
						type="dashed"
						icon={<PlusOutlined />}
						style={{ width: "100%" }}
						onClick={handleAddSkuItem}
					>
						添加规格项
					</Button>
				</ProForm.Item>
			</ProForm>
			{/* SKU 表格 */}
			<ProTable
				rowKey="id"
				dataSource={dataSource}
				columns={columns}
				search={false}
				options={false}
				pagination={false}
				editable={{
					type: "multiple",
					editableKeys,
					form: editableForm,
					onValuesChange: (record, recordList) => {
						setDataSource(recordList);
					},
				}}
			/>
			{/* 校验提示 */}
			{alertVisile.show && (
				<Alert message={alertVisile.msg} type="error" showIcon />
			)}
			{/* 提交按钮 */}
			<Row style={{ marginTop: 16 }}>
				<Col offset={6}>
					<Button
						type="primary"
						onClick={async () => {
							await validateFieldsTableData();
						}}
					>
						提交
					</Button>
				</Col>
			</Row>
		</ProCard>
	);
}

import {
	ProForm,
	ProFormDependency,
	ProFormList,
	ProFormText,
	ProCard,
	ProFormSelect,
	ProTable,
} from "@ant-design/pro-components";
import { Alert, Button, Col, Form, Row, Space } from "antd";
import type { ProFormInstance } from "@ant-design/pro-components";
import { useRef, useState } from "react";
import { randomString, attrNameList, attrValueList } from "./utils";
import styles from "./index.less";
import type { ProColumns } from "@ant-design/pro-components";

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
	const formRef = useRef<ProFormInstance>();
	const [form] = Form.useForm();
	const [editableForm] = Form.useForm();
	const [skuKeyList, setSkuKeyList] = useState<any[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [activeColumns, setActiveColumns] = useState<any[]>([]);
	const editableFormValuesRef = useRef<any>({});
	const [alertVisile, setAlertVisile] = useState({
		show: false,
		msg: "",
	});

	const editableKeys = dataSource.map((item) => item.id);

	const columns = [...activeColumns, ...originColumns];

	// console.log(columns)
	// console.log(dataSource)

	// 添加规格项
	const handleAddSkuItem = () => {
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
          return Array.isArray(skuList) && skuList[currentIndex]?.label || '-';
        }
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
		const copyActiveColumns = [...activeColumns];
		copyActiveColumns.splice(index, 1);
		setActiveColumns(copyActiveColumns);
		const copySkuKeyList = [...skuKeyList];
		copySkuKeyList.splice(index, 1);
		setSkuKeyList(copySkuKeyList);
		if (copySkuKeyList.length === 0) {
			setDataSource([]);
		}
	};

  const createSkuData = () => {
    const values = form?.getFieldsValue();
    const skuList = skuKeyList.map((key, index) => {
			const formAttrName = `attrName_${key}`;
			const formAttrValue = `attrValue_${key}`;
			return {
				attrName: values[formAttrName],
				attrValue: values[formAttrValue] || [],
			};
		});
		console.log("skuList", skuList);
    const skuMatrix = skuList.map((sku, index) => {
			const { attrValue } = sku;
			return attrValue;
		});
		console.log("skuMatrix", skuMatrix);
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
		console.log("skuTree", skuTree);
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
  }

	// 添加规格值
	const handleAddAttrValue = (item: any, index: number) => {
    console.log('handleAddAttrValue', item, index)
    const skuData = createSkuData();
    setDataSource(skuData.map((skuList, index) => {
      return {
        ...dataSource[index],
        skuList,
      }
    }));
	};

	// 删除规格值
	const handleDeleteAttrValue = (item: any, index: number) => {};

	const createSkuList = (values: any, skuKeyList: any[]) => {
		const skuList = skuKeyList.map((key, index) => {
			const formAttrName = `attrName_${key}`;
			const formAttrValue = `attrValue_${key}`;
			return {
				attrName: values[formAttrName],
				attrValue: values[formAttrValue] || [],
			};
		});
		console.log("skuList", skuList);
		const newActiveColumns: ProColumns<any>[] = [];
		skuList.forEach((sku) => {
			if (sku?.attrName) {
				newActiveColumns.push({
					title: sku.attrName.label,
					dataIndex: `attrName_${sku.attrName.value}`,
					editable: false,
				});
			}
		});
		console.log("newActiveColumns", newActiveColumns);
		setActiveColumns(newActiveColumns);
		const skuMatrix = skuList.map((sku, index) => {
			const { attrValue } = sku;
			return attrValue;
		});
		console.log("skuMatrix", skuMatrix);
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
		console.log("skuTree", skuTree);
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
		const editableValues = editableFormValuesRef.current;
		console.log("editableValues", editableValues);
		const newDataSource = skuData.map((item: any[], i) => {
			let obj: any = {
				oprice: undefined,
				cprice: undefined,
				stock: undefined,
			};
			let keyArr: any[] = [];
			let attrList: any[] = [];
			item.forEach((sku: any, j) => {
				let { dataIndex, title } = newActiveColumns[j];
				dataIndex = String(dataIndex);
				const [_, attrId] = dataIndex.split("_");
				attrList.push({
					attrName: title,
					attrNameId: Number(attrId),
					attrValue: sku.label,
					attrValueId: Number(sku.value),
				});
				keyArr.push(skuKeyList[j]);
				obj = {
					...obj,
					[dataIndex]: sku.label,
					attrList,
				};
			});
			let key = `${keyArr.join("-")}_SkuRowKey_${JSON.stringify(attrList)}`;
			obj.key = key;
			let oldItemObj = editableValues[key];
			if (oldItemObj) {
				obj = {
					...obj,
					...oldItemObj,
				};
			}
			return obj;
		});
		console.log("newDataSource", newDataSource);
		setDataSource(newDataSource);
	};

	// 校验表格数据
	const validateFieldsTableData = async () => {
		if (dataSource.length === 0) {
			setAlertVisile({
				show: true,
				msg: "请至少添加一个规格",
			});
			return Promise.reject(false);
		}
		function isEmpty(value: any) {
			return typeof value === "undefined" || value === "";
		}
		let hasEmpty = dataSource.some((item) => {
			const { oprice, cprice, stock } = item;
			return isEmpty(oprice) || isEmpty(cprice) || isEmpty(stock);
		});
		if (hasEmpty) {
			setAlertVisile({
				show: true,
				msg: "请填写销售价、成本价、库存",
			});
			return Promise.reject(false);
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
				formRef={formRef}
				form={form}
				layout="horizontal"
				onValuesChange={(changeValues, allValues) => {}}
				labelCol={{
					span: 6,
				}}
				wrapperCol={{
					span: 6,
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
										formRef.current?.resetFields([formAttrValue]);
									},
								}}
								request={async () =>
									attrNameList.map((item) => ({
										label: item.label,
										value: item.value,
									}))
								}
							/>
							<ProFormSelect
								label="规格项"
								name={formAttrValue}
								dependencies={[formAttrName]}
								mode="multiple"
								fieldProps={{
									labelInValue: true,
									onSelect: (item) => handleAddAttrValue(item, index),
									onDeselect: (item) => handleDeleteAttrValue(item, index),
								}}
								request={async (params) => {
									const attrNameValue = params[formAttrName]?.value;
									return attrValueList(attrNameValue);
								}}
							/>
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
				<ProForm.Item label="" wrapperCol={{ offset: 6 }}>
					<Button type="primary" onClick={handleAddSkuItem}>
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
						console.log("recordList", recordList);
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

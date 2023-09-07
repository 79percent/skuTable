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
    width: 140,
    valueType: "digit",
    fieldProps: {
      addonAfter: "元",
      min: 0,
    },
  },
  {
    title: "成本价",
    dataIndex: "cprice",
    width: 140,
    valueType: "digit",
    fieldProps: {
      addonAfter: "元",
      min: 0,
    },
  },
  {
    title: "库存",
    dataIndex: "stock",
    width: 140,
    valueType: "digit",
    fieldProps: {
      min: 0,
    },
  },
  {
    title: "操作",
    dataIndex: "operate",
    width: 100,
    editable: false,
    render: () => {
      return (
        <Space>
          <Button type="link" style={{ padding: 0 }}>
            上架
          </Button>
          <Button type="link" danger style={{ padding: 0 }}>
            下架
          </Button>
        </Space>
      );
    },
  },
];

export default function HomePage() {
  const formRef = useRef<ProFormInstance>();
  const [editableForm] = Form.useForm();
  const [skuKeyList, setSkuKeyList] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [activeColumns, setActiveColumns] = useState<any[]>([]);
  const editableFormValuesRef = useRef<any>({});
  const [alertVisile, setAlertVisile] = useState({
    show: false,
    msg: "",
  });

  const editableKeys = dataSource.map((item) => item.key);

  // 添加规格项

  // 删除规格项

  // 添加规格值

  // 删除规格值

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
        layout="horizontal"
        onValuesChange={(changeValues, allValues) => {
          // 修改规格名时 清空规格项
          for (const key in changeValues) {
            if (Object.prototype.hasOwnProperty.call(changeValues, key)) {
              if (key.includes(`attrName`)) {
                const [_, attrKey] = key.split("_");
                const formAttrValue = `attrValue_${attrKey}`;
                formRef.current?.resetFields([formAttrValue]);
              }
            }
          }
          // 根据表单数据生成skuList
          createSkuList(allValues, skuKeyList);
        }}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 6,
        }}
        submitter={false}
      >
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
                onClick={() => {
                  const copy = [...skuKeyList];
                  copy.splice(index, 1);
                  const values = formRef.current?.getFieldsValue();
                  delete values[formAttrName];
                  delete values[formAttrValue];
                  const editableValues = editableFormValuesRef.current;
                  for (const rowKey in editableValues) {
                    if (
                      Object.prototype.hasOwnProperty.call(
                        editableValues,
                        rowKey
                      )
                    ) {
                      if (rowKey.includes(key)) {
                        delete editableValues[rowKey];
                      }
                    }
                  }
                  setSkuKeyList(copy);
                  createSkuList(values, copy);
                }}
              >
                删除规格项
              </Button>
            </div>
          );
        })}
        <ProForm.Item label="" wrapperCol={{ offset: 6 }}>
          <Button
            type="primary"
            onClick={() => {
              setSkuKeyList([...skuKeyList, randomString(20)]);
            }}
          >
            添加规格项
          </Button>
        </ProForm.Item>
      </ProForm>
      <ProTable
        rowKey="key"
        dataSource={dataSource}
        columns={[...activeColumns, ...originColumns]}
        search={false}
        options={false}
        pagination={false}
        editable={{
          type: "multiple",
          editableKeys,
          form: editableForm,
          onValuesChange: (record, recordList) => {
            console.log("recordList", recordList);
            editableFormValuesRef.current = {
              ...editableFormValuesRef.current,
              ...editableForm.getFieldsValue(),
            };
            setDataSource(recordList);
          },
        }}
      />
      <Row style={{ marginBottom: 16 }}>
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
      {alertVisile.show && (
        <Alert message={alertVisile.msg} type="error" showIcon />
      )}
    </ProCard>
  );
}

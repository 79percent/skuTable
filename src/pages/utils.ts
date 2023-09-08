export const randomString = (len: number) => {
  let str = '';
  const temp = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
  for (let index = 0; index < len; index++) {
    const randomNum = Math.floor(Math.random() * temp.length);
    str += temp[randomNum];
  }
  return str;
}

export const attrNameList = [
  {
    label: '型号',
    value: 0,   
    attrValue: [
      {
        label: 'iPhone 12',
        value: 10
      },
      {
        label: 'iPhone 13',
        value: 11
      },
      {
        label: 'iPhone 14',
        value: 12
      },
    ] 
  },
  {
    label: '颜色',
    value: 1,
    attrValue: [
      {
        label: '黑色',
        value: 13
      },
      {
        label: '红色',
        value: 14
      },
      {
        label: '蓝色',
        value: 15
      },
    ]
  },
  {
    label: '内存',
    value: 2,    
    attrValue: [
      {
        label: '32G',
        value: 16
      },
      {
        label: '64G',
        value: 17
      },
      {
        label: '128G',
        value: 18,
      },
    ]
  },
  
]

export const attrValueList = async (attrNameValue: any) => {
  const findItem = attrNameList.find((item) => (item.value === attrNameValue));
  return findItem?.attrValue || [];
}